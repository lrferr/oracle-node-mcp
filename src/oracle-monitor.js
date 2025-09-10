import oracledb from 'oracledb';
import { Logger } from './logger.js';
import { ConnectionManager } from './connection-manager.js';

export class OracleMonitor {
  constructor(connectionManager = null) {
    this.logger = new Logger();
    this.connectionManager = connectionManager || new ConnectionManager();
    
    // Manter compatibilidade com configuração antiga
    this.connectionConfig = {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`
    };
  }

  async getConnection(connectionName = null) {
    try {
      // Se temos um ConnectionManager, usar ele
      if (this.connectionManager) {
        return await this.connectionManager.getConnection(connectionName);
      }
      
      // Fallback para configuração antiga
      const connection = await oracledb.getConnection(this.connectionConfig);
      return connection;
    } catch (error) {
      this.logger.error('Erro ao conectar com Oracle:', error);
      throw new Error(`Falha na conexão: ${error.message}`);
    }
  }

  async checkDatabaseHealth(options = {}) {
    const {
      checkConnections = true,
      checkTablespaces = true,
      checkPerformance = true,
      connectionName = null
    } = options;

    let connection;
    let results = [];

    try {
      connection = await this.getConnection(connectionName);
      
      if (checkConnections) {
        const connections = await this.checkConnections(connection);
        results.push(`### Conexões Ativas\n${connections}`);
      }

      if (checkTablespaces) {
        const tablespaces = await this.checkTablespaces(connection);
        results.push(`### Status dos Tablespaces\n${tablespaces}`);
      }

      if (checkPerformance) {
        const performance = await this.checkPerformance(connection);
        results.push(`### Métricas de Performance\n${performance}`);
      }

      return results.join('\n\n');
    } catch (error) {
      this.logger.error('Erro ao verificar saúde do banco:', error);
      return `❌ Erro ao verificar saúde do banco: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async checkConnections(connection) {
    const query = `
      SELECT 
        COUNT(*) as total_connections,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_connections,
        COUNT(CASE WHEN status = 'INACTIVE' THEN 1 END) as inactive_connections
      FROM v$session 
      WHERE username IS NOT NULL
    `;

    const result = await connection.execute(query);
    const row = result.rows[0];
    
    return `- Total de Conexões: ${row[0]}
- Conexões Ativas: ${row[1]}
- Conexões Inativas: ${row[2]}`;
  }

  async checkTablespaces(connection) {
    const query = `
      SELECT 
        tablespace_name,
        ROUND(bytes/1024/1024, 2) as size_mb,
        ROUND(maxbytes/1024/1024, 2) as max_size_mb,
        ROUND((bytes/maxbytes)*100, 2) as percent_used
      FROM dba_data_files 
      WHERE tablespace_name IN (
        SELECT tablespace_name FROM dba_tablespaces 
        WHERE status = 'ONLINE'
      )
      ORDER BY percent_used DESC
    `;

    const result = await connection.execute(query);
    let output = '';
    
    for (const row of result.rows) {
      const status = row[3] > 80 ? '⚠️' : row[3] > 60 ? '⚡' : '✅';
      output += `${status} ${row[0]}: ${row[1]}MB / ${row[2]}MB (${row[3]}%)\n`;
    }

    return output || 'Nenhum tablespace encontrado';
  }

  async checkPerformance(connection) {
    const queries = [
      {
        name: 'Buffer Cache Hit Ratio',
        query: `SELECT ROUND((1 - (physical_reads / (db_block_gets + consistent_gets))) * 100, 2) as hit_ratio 
                FROM v$buffer_pool_statistics WHERE name = 'DEFAULT'`
      },
      {
        name: 'Library Cache Hit Ratio',
        query: `SELECT ROUND((1 - (reloads / (pins + reloads))) * 100, 2) as hit_ratio 
                FROM v$librarycache WHERE namespace = 'SQL AREA'`
      },
      {
        name: 'Sessões com Problemas',
        query: `SELECT COUNT(*) as problem_sessions 
                FROM v$session s, v$session_wait w 
                WHERE s.sid = w.sid AND w.wait_class != 'Idle'`
      }
    ];

    let output = '';
    for (const q of queries) {
      try {
        const result = await connection.execute(q.query);
        const value = result.rows[0][0];
        output += `- ${q.name}: ${value}\n`;
      } catch (error) {
        output += `- ${q.name}: Erro ao obter métrica\n`;
      }
    }

    return output;
  }

  async monitorSchemaChanges(options = {}) {
    const { schemas = ['HR', 'SCOTT', 'SYSTEM'] } = options;
    let connection;

    try {
      connection = await this.getConnection();
      const results = [];

      for (const schema of schemas) {
        const changes = await this.getSchemaChanges(connection, schema);
        if (changes) {
          results.push(`### Mudanças no Esquema ${schema}\n${changes}`);
        }
      }

      if (results.length === 0) {
        return '✅ Nenhuma mudança detectada nos esquemas monitorados';
      }

      return results.join('\n\n');
    } catch (error) {
      this.logger.error('Erro ao monitorar mudanças:', error);
      return `❌ Erro ao monitorar mudanças: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getSchemaChanges(connection, schema) {
    const query = `
      SELECT 
        object_name,
        object_type,
        status,
        created,
        last_ddl_time
      FROM dba_objects 
      WHERE owner = UPPER(:schema)
        AND last_ddl_time > SYSDATE - 1
      ORDER BY last_ddl_time DESC
    `;

    try {
      const result = await connection.execute(query, { schema });
      
      if (result.rows.length === 0) {
        return null;
      }

      let output = '';
      for (const row of result.rows) {
        const status = row[2] === 'VALID' ? '✅' : '❌';
        output += `${status} ${row[1]} ${row[0]} - ${row[4]}\n`;
      }

      return output;
    } catch (error) {
      return `Erro ao verificar esquema ${schema}: ${error.message}`;
    }
  }

  async checkSensitiveTables(options = {}) {
    const { 
      tables = process.env.SENSITIVE_TABLES?.split(',') || ['USERS', 'ACCOUNTS'],
      checkDataChanges = true 
    } = options;

    let connection;

    try {
      connection = await this.getConnection();
      const results = [];

      for (const table of tables) {
        const changes = await this.getTableChanges(connection, table, checkDataChanges);
        if (changes) {
          results.push(`### Tabela ${table}\n${changes}`);
        }
      }

      if (results.length === 0) {
        return '✅ Nenhuma mudança detectada nas tabelas sensíveis';
      }

      return results.join('\n\n');
    } catch (error) {
      this.logger.error('Erro ao verificar tabelas sensíveis:', error);
      return `❌ Erro ao verificar tabelas sensíveis: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getTableChanges(connection, table, checkDataChanges) {
    const queries = [
      {
        name: 'Estrutura da Tabela',
        query: `SELECT column_name, data_type, nullable 
                FROM dba_tab_columns 
                WHERE table_name = UPPER(:table) 
                ORDER BY column_id`
      }
    ];

    if (checkDataChanges) {
      queries.push({
        name: 'Últimas Modificações',
        query: `SELECT COUNT(*) as total_rows 
                FROM dba_tables 
                WHERE table_name = UPPER(:table)`
      });
    }

    let output = '';
    for (const q of queries) {
      try {
        const result = await connection.execute(q.query, { table });
        
        if (q.name === 'Estrutura da Tabela') {
          output += '**Estrutura:**\n';
          for (const row of result.rows) {
            output += `- ${row[0]} (${row[1]}) ${row[2] === 'Y' ? 'NULL' : 'NOT NULL'}\n`;
          }
        } else {
          output += `**${q.name}:** ${result.rows[0][0]}\n`;
        }
      } catch (error) {
        output += `**${q.name}:** Erro - ${error.message}\n`;
      }
    }

    return output;
  }

  async executeSafeQuery(query) {
    // Validar se é uma query SELECT
    const trimmedQuery = query.trim().toUpperCase();
    if (!trimmedQuery.startsWith('SELECT')) {
      throw new Error('Apenas queries SELECT são permitidas por segurança');
    }

    // Verificar palavras perigosas
    const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE'];
    for (const keyword of dangerousKeywords) {
      if (trimmedQuery.includes(keyword)) {
        throw new Error(`Palavra-chave perigosa detectada: ${keyword}`);
      }
    }

    let connection;

    try {
      connection = await this.getConnection();
      const result = await connection.execute(query);

      if (result.rows.length === 0) {
        return 'Nenhum resultado encontrado';
      }

      // Formatar resultado como tabela
      let output = '| ' + result.metaData.map(col => col.name).join(' | ') + ' |\n';
      output += '| ' + result.metaData.map(() => '---').join(' | ') + ' |\n';
      
      for (const row of result.rows) {
        output += '| ' + row.map(cell => cell || '').join(' | ') + ' |\n';
      }

      return output;
    } catch (error) {
      this.logger.error('Erro ao executar query:', error);
      throw new Error(`Erro na execução: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getDatabaseInfo(options = {}) {
    const { includeUsers = false, includeTablespaces = true } = options;
    let connection;

    try {
      connection = await this.getConnection();
      const results = [];

      // Informações básicas do banco
      const basicInfo = await this.getBasicInfo(connection);
      results.push(`### Informações Básicas\n${basicInfo}`);

      if (includeTablespaces) {
        const tablespaces = await this.getTablespacesInfo(connection);
        results.push(`### Tablespaces\n${tablespaces}`);
      }

      if (includeUsers) {
        const users = await this.getUsersInfo(connection);
        results.push(`### Usuários\n${users}`);
      }

      return results.join('\n\n');
    } catch (error) {
      this.logger.error('Erro ao obter informações do banco:', error);
      return `❌ Erro ao obter informações: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getBasicInfo(connection) {
    const query = `
      SELECT 
        instance_name,
        host_name,
        version,
        status,
        database_status
      FROM v$instance
    `;

    const result = await connection.execute(query);
    const row = result.rows[0];

    return `- **Instância:** ${row[0]}
- **Host:** ${row[1]}
- **Versão:** ${row[2]}
- **Status:** ${row[3]}
- **Status do Banco:** ${row[4]}`;
  }

  async getTablespacesInfo(connection) {
    const query = `
      SELECT 
        tablespace_name,
        status,
        contents,
        ROUND(bytes/1024/1024, 2) as size_mb
      FROM dba_tablespaces
      ORDER BY tablespace_name
    `;

    const result = await connection.execute(query);
    let output = '';

    for (const row of result.rows) {
      const status = row[1] === 'ONLINE' ? '✅' : '❌';
      output += `${status} **${row[0]}** - ${row[2]} (${row[3]}MB)\n`;
    }

    return output || 'Nenhum tablespace encontrado';
  }

  async getUsersInfo(connection) {
    const query = `
      SELECT 
        username,
        account_status,
        created,
        default_tablespace
      FROM dba_users 
      WHERE username NOT IN ('SYS', 'SYSTEM', 'OUTLN', 'DIP', 'TSMSYS')
      ORDER BY username
    `;

    const result = await connection.execute(query);
    let output = '';

    for (const row of result.rows) {
      const status = row[1] === 'OPEN' ? '✅' : '❌';
      output += `${status} **${row[0]}** - ${row[1]} (${row[3]})\n`;
    }

    return output || 'Nenhum usuário encontrado';
  }

  // Novas funcionalidades para metadados e administração

  async getTableInfo(options = {}) {
    const { tableName, schema = 'HR', includeConstraints = true, includeIndexes = true } = options;
    let connection;

    try {
      connection = await this.getConnection();
      const results = [];

      // Informações básicas da tabela
      const basicInfo = await this.getTableBasicInfo(connection, tableName, schema);
      results.push(`### Informações Básicas\n${basicInfo}`);

      // Colunas da tabela
      const columns = await this.getTableColumns(connection, tableName, schema);
      results.push(`### Colunas\n${columns}`);

      if (includeConstraints) {
        const constraints = await this.getTableConstraints(connection, tableName, schema);
        results.push(`### Constraints\n${constraints}`);
      }

      if (includeIndexes) {
        const indexes = await this.getTableIndexes(connection, tableName, schema);
        results.push(`### Índices\n${indexes}`);
      }

      return results.join('\n\n');
    } catch (error) {
      this.logger.error('Erro ao obter informações da tabela:', error);
      return `❌ Erro ao obter informações: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getTableBasicInfo(connection, tableName, schema) {
    const query = `
      SELECT 
        table_name,
        tablespace_name,
        num_rows,
        blocks,
        avg_row_len,
        last_analyzed
      FROM dba_tables 
      WHERE table_name = UPPER(:tableName) 
        AND owner = UPPER(:schema)
    `;

    try {
      const result = await connection.execute(query, { tableName, schema });
      
      if (result.rows.length === 0) {
        return `Tabela ${tableName} não encontrada no esquema ${schema}`;
      }

      const row = result.rows[0];
      return `- **Nome:** ${row[0]}
- **Tablespace:** ${row[1]}
- **Linhas:** ${row[2] || 'N/A'}
- **Blocos:** ${row[3] || 'N/A'}
- **Tamanho Médio da Linha:** ${row[4] || 'N/A'} bytes
- **Última Análise:** ${row[5] || 'Nunca'}`;
    } catch (error) {
      return `Erro ao obter informações básicas: ${error.message}`;
    }
  }

  async getTableColumns(connection, tableName, schema) {
    const query = `
      SELECT 
        column_name,
        data_type,
        data_length,
        data_precision,
        data_scale,
        nullable,
        data_default
      FROM dba_tab_columns 
      WHERE table_name = UPPER(:tableName) 
        AND owner = UPPER(:schema)
      ORDER BY column_id
    `;

    try {
      const result = await connection.execute(query, { tableName, schema });
      
      if (result.rows.length === 0) {
        return 'Nenhuma coluna encontrada';
      }

      let output = '';
      for (const row of result.rows) {
        const nullable = row[5] === 'Y' ? 'NULL' : 'NOT NULL';
        const precision = row[3] ? `(${row[3]}${row[4] ? ',' + row[4] : ''})` : '';
        const defaultValue = row[6] ? ` DEFAULT ${row[6]}` : '';
        
        output += `- **${row[0]}** ${row[1]}${precision} ${nullable}${defaultValue}\n`;
      }

      return output;
    } catch (error) {
      return `Erro ao obter colunas: ${error.message}`;
    }
  }

  async getTableConstraints(connection, tableName, schema) {
    const query = `
      SELECT 
        constraint_name,
        constraint_type,
        search_condition,
        r_owner,
        r_constraint_name
      FROM dba_constraints 
      WHERE table_name = UPPER(:tableName) 
        AND owner = UPPER(:schema)
      ORDER BY constraint_type, constraint_name
    `;

    try {
      const result = await connection.execute(query, { tableName, schema });
      
      if (result.rows.length === 0) {
        return 'Nenhuma constraint encontrada';
      }

      let output = '';
      for (const row of result.rows) {
        const type = this.getConstraintTypeDescription(row[1]);
        let constraintInfo = `- **${row[0]}** (${type})`;
        
        if (row[2]) {
          constraintInfo += `: ${row[2]}`;
        }
        
        if (row[3] && row[4]) {
          constraintInfo += ` → ${row[3]}.${row[4]}`;
        }
        
        output += constraintInfo + '\n';
      }

      return output;
    } catch (error) {
      return `Erro ao obter constraints: ${error.message}`;
    }
  }

  getConstraintTypeDescription(type) {
    const types = {
      'P': 'PRIMARY KEY',
      'R': 'FOREIGN KEY',
      'U': 'UNIQUE',
      'C': 'CHECK',
      'O': 'READ ONLY',
      'V': 'VIEW CHECK',
      'F': 'REF'
    };
    return types[type] || type;
  }

  async getTableIndexes(connection, tableName, schema) {
    const query = `
      SELECT 
        index_name,
        index_type,
        uniqueness,
        status,
        num_rows,
        last_analyzed
      FROM dba_indexes 
      WHERE table_name = UPPER(:tableName) 
        AND table_owner = UPPER(:schema)
      ORDER BY index_name
    `;

    try {
      const result = await connection.execute(query, { tableName, schema });
      
      if (result.rows.length === 0) {
        return 'Nenhum índice encontrado';
      }

      let output = '';
      for (const row of result.rows) {
        const status = row[3] === 'VALID' ? '✅' : '❌';
        const uniqueness = row[2] === 'UNIQUE' ? 'UNIQUE' : 'NON-UNIQUE';
        
        output += `${status} **${row[0]}** (${row[1]}, ${uniqueness})\n`;
        if (row[4]) {
          output += `  - Linhas: ${row[4]}, Última análise: ${row[5] || 'Nunca'}\n`;
        }
      }

      return output;
    } catch (error) {
      return `Erro ao obter índices: ${error.message}`;
    }
  }

  async getConstraints(options = {}) {
    const { tableName, schema = 'HR', constraintType = 'ALL' } = options;
    let connection;

    try {
      connection = await this.getConnection();
      
      let whereClause = `WHERE owner = UPPER(:schema)`;
      const params = { schema };
      
      if (tableName) {
        whereClause += ` AND table_name = UPPER(:tableName)`;
        params.tableName = tableName;
      }
      
      if (constraintType !== 'ALL') {
        const typeMap = {
          'PRIMARY KEY': 'P',
          'FOREIGN KEY': 'R',
          'UNIQUE': 'U',
          'CHECK': 'C',
          'NOT NULL': 'C'
        };
        
        if (typeMap[constraintType]) {
          whereClause += ` AND constraint_type = :constraintType`;
          params.constraintType = typeMap[constraintType];
        }
      }

      const query = `
        SELECT 
          table_name,
          constraint_name,
          constraint_type,
          search_condition,
          r_owner,
          r_constraint_name
        FROM dba_constraints 
        ${whereClause}
        ORDER BY table_name, constraint_type, constraint_name
      `;

      const result = await connection.execute(query, params);
      
      if (result.rows.length === 0) {
        return 'Nenhuma constraint encontrada';
      }

      let output = '';
      let currentTable = '';
      
      for (const row of result.rows) {
        if (row[0] !== currentTable) {
          currentTable = row[0];
          output += `\n### Tabela ${currentTable}\n`;
        }
        
        const type = this.getConstraintTypeDescription(row[2]);
        let constraintInfo = `- **${row[1]}** (${type})`;
        
        if (row[3]) {
          constraintInfo += `: ${row[3]}`;
        }
        
        if (row[4] && row[5]) {
          constraintInfo += ` → ${row[4]}.${row[5]}`;
        }
        
        output += constraintInfo + '\n';
      }

      return output;
    } catch (error) {
      this.logger.error('Erro ao obter constraints:', error);
      return `❌ Erro ao obter constraints: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getForeignKeys(options = {}) {
    const { tableName, schema = 'HR', showReferenced = true } = options;
    let connection;

    try {
      connection = await this.getConnection();
      
      let whereClause = `WHERE a.owner = UPPER(:schema)`;
      const params = { schema };
      
      if (tableName) {
        whereClause += ` AND a.table_name = UPPER(:tableName)`;
        params.tableName = tableName;
      }

      const query = `
        SELECT 
          a.table_name,
          a.constraint_name,
          a.r_owner,
          a.r_constraint_name,
          b.table_name as ref_table_name,
          c.column_name,
          d.column_name as ref_column_name
        FROM dba_constraints a
        LEFT JOIN dba_constraints b ON a.r_owner = b.owner AND a.r_constraint_name = b.constraint_name
        LEFT JOIN dba_cons_columns c ON a.owner = c.owner AND a.constraint_name = c.constraint_name
        LEFT JOIN dba_cons_columns d ON a.r_owner = d.owner AND a.r_constraint_name = d.constraint_name
        ${whereClause}
          AND a.constraint_type = 'R'
        ORDER BY a.table_name, a.constraint_name, c.position
      `;

      const result = await connection.execute(query, params);
      
      if (result.rows.length === 0) {
        return 'Nenhuma chave estrangeira encontrada';
      }

      let output = '';
      let currentTable = '';
      let currentConstraint = '';
      
      for (const row of result.rows) {
        if (row[0] !== currentTable) {
          currentTable = row[0];
          output += `\n### Tabela ${currentTable}\n`;
        }
        
        if (row[1] !== currentConstraint) {
          currentConstraint = row[1];
          const refTable = showReferenced ? ` → ${row[2]}.${row[4]}` : '';
          output += `\n**${row[1]}**${refTable}:\n`;
        }
        
        output += `  - ${row[5]} → ${row[6]}\n`;
      }

      return output;
    } catch (error) {
      this.logger.error('Erro ao obter chaves estrangeiras:', error);
      return `❌ Erro ao obter chaves estrangeiras: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getIndexes(options = {}) {
    const { tableName, schema = 'HR', includeStats = false } = options;
    let connection;

    try {
      connection = await this.getConnection();
      
      let whereClause = `WHERE table_owner = UPPER(:schema)`;
      const params = { schema };
      
      if (tableName) {
        whereClause += ` AND table_name = UPPER(:tableName)`;
        params.tableName = tableName;
      }

      let selectFields = `
        index_name,
        table_name,
        index_type,
        uniqueness,
        status,
        tablespace_name
      `;
      
      if (includeStats) {
        selectFields += `, num_rows, last_analyzed, leaf_blocks, distinct_keys`;
      }

      const query = `
        SELECT ${selectFields}
        FROM dba_indexes 
        ${whereClause}
        ORDER BY table_name, index_name
      `;

      const result = await connection.execute(query, params);
      
      if (result.rows.length === 0) {
        return 'Nenhum índice encontrado';
      }

      let output = '';
      let currentTable = '';
      
      for (const row of result.rows) {
        if (row[1] !== currentTable) {
          currentTable = row[1];
          output += `\n### Tabela ${currentTable}\n`;
        }
        
        const status = row[4] === 'VALID' ? '✅' : '❌';
        const uniqueness = row[3] === 'UNIQUE' ? 'UNIQUE' : 'NON-UNIQUE';
        
        output += `${status} **${row[0]}** (${row[2]}, ${uniqueness})\n`;
        output += `  - Tablespace: ${row[5]}\n`;
        
        if (includeStats && row[6]) {
          output += `  - Linhas: ${row[6]}, Última análise: ${row[7] || 'Nunca'}\n`;
          if (row[8]) output += `  - Blocos folha: ${row[8]}\n`;
          if (row[9]) output += `  - Chaves distintas: ${row[9]}\n`;
        }
      }

      return output;
    } catch (error) {
      this.logger.error('Erro ao obter índices:', error);
      return `❌ Erro ao obter índices: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getSequences(options = {}) {
    const { schema = 'HR', includeValues = true } = options;
    let connection;

    try {
      connection = await this.getConnection();
      
      let selectFields = `
        sequence_name,
        min_value,
        max_value,
        increment_by,
        cycle_flag,
        order_flag,
        cache_size
      `;
      
      if (includeValues) {
        selectFields += `, last_number`;
      }

      const query = `
        SELECT ${selectFields}
        FROM dba_sequences 
        WHERE sequence_owner = UPPER(:schema)
        ORDER BY sequence_name
      `;

      const result = await connection.execute(query, { schema });
      
      if (result.rows.length === 0) {
        return 'Nenhuma sequence encontrada';
      }

      let output = '';
      for (const row of result.rows) {
        output += `### ${row[0]}\n`;
        output += `- **Min:** ${row[1]}, **Max:** ${row[2]}\n`;
        output += `- **Incremento:** ${row[3]}\n`;
        output += `- **Ciclo:** ${row[4] === 'Y' ? 'Sim' : 'Não'}\n`;
        output += `- **Ordem:** ${row[5] === 'Y' ? 'Sim' : 'Não'}\n`;
        output += `- **Cache:** ${row[6]}\n`;
        
        if (includeValues && row[7]) {
          output += `- **Próximo Valor:** ${row[7]}\n`;
        }
        
        output += '\n';
      }

      return output;
    } catch (error) {
      this.logger.error('Erro ao obter sequences:', error);
      return `❌ Erro ao obter sequences: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getTriggers(options = {}) {
    const { tableName, schema = 'HR', includeCode = false } = options;
    let connection;

    try {
      connection = await this.getConnection();
      
      let whereClause = `WHERE owner = UPPER(:schema)`;
      const params = { schema };
      
      if (tableName) {
        whereClause += ` AND table_name = UPPER(:tableName)`;
        params.tableName = tableName;
      }

      let selectFields = `
        trigger_name,
        table_name,
        trigger_type,
        triggering_event,
        status,
        when_clause
      `;
      
      if (includeCode) {
        selectFields += `, trigger_body`;
      }

      const query = `
        SELECT ${selectFields}
        FROM dba_triggers 
        ${whereClause}
        ORDER BY table_name, trigger_name
      `;

      const result = await connection.execute(query, params);
      
      if (result.rows.length === 0) {
        return 'Nenhum trigger encontrado';
      }

      let output = '';
      let currentTable = '';
      
      for (const row of result.rows) {
        if (row[1] !== currentTable) {
          currentTable = row[1];
          output += `\n### Tabela ${currentTable}\n`;
        }
        
        const status = row[4] === 'ENABLED' ? '✅' : '❌';
        
        output += `${status} **${row[0]}** (${row[2]}, ${row[3]})\n`;
        
        if (row[5]) {
          output += `  - Condição: ${row[5]}\n`;
        }
        
        if (includeCode && row[6]) {
          output += `  - Código:\n\`\`\`sql\n${row[6]}\n\`\`\`\n`;
        }
      }

      return output;
    } catch (error) {
      this.logger.error('Erro ao obter triggers:', error);
      return `❌ Erro ao obter triggers: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getUsersPrivileges(options = {}) {
    const { user, includeRoles = true, includeSystemPrivs = false } = options;
    let connection;

    try {
      connection = await this.getConnection();
      const results = [];

      // Informações básicas dos usuários
      const usersInfo = await this.getUsersBasicInfo(connection, user);
      results.push(`### Usuários\n${usersInfo}`);

      if (includeRoles) {
        const rolesInfo = await this.getUsersRoles(connection, user);
        results.push(`### Roles\n${rolesInfo}`);
      }

      if (includeSystemPrivs) {
        const systemPrivs = await this.getSystemPrivileges(connection, user);
        results.push(`### Privilégios de Sistema\n${systemPrivs}`);
      }

      return results.join('\n\n');
    } catch (error) {
      this.logger.error('Erro ao obter usuários e privilégios:', error);
      return `❌ Erro ao obter usuários e privilégios: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getUsersBasicInfo(connection, user) {
    let whereClause = `WHERE username NOT IN ('SYS', 'SYSTEM', 'OUTLN', 'DIP', 'TSMSYS')`;
    const params = {};
    
    if (user) {
      whereClause += ` AND username = UPPER(:user)`;
      params.user = user;
    }

    const query = `
      SELECT 
        username,
        account_status,
        created,
        default_tablespace,
        temporary_tablespace,
        profile
      FROM dba_users 
      ${whereClause}
      ORDER BY username
    `;

    try {
      const result = await connection.execute(query, params);
      
      if (result.rows.length === 0) {
        return 'Nenhum usuário encontrado';
      }

      let output = '';
      for (const row of result.rows) {
        const status = row[1] === 'OPEN' ? '✅' : '❌';
        output += `${status} **${row[0]}**\n`;
        output += `  - Status: ${row[1]}\n`;
        output += `  - Criado: ${row[2]}\n`;
        output += `  - Tablespace Padrão: ${row[3]}\n`;
        output += `  - Tablespace Temporário: ${row[4]}\n`;
        output += `  - Profile: ${row[5]}\n\n`;
      }

      return output;
    } catch (error) {
      return `Erro ao obter informações dos usuários: ${error.message}`;
    }
  }

  async getUsersRoles(connection, user) {
    let whereClause = `WHERE grantee NOT IN ('SYS', 'SYSTEM')`;
    const params = {};
    
    if (user) {
      whereClause += ` AND grantee = UPPER(:user)`;
      params.user = user;
    }

    const query = `
      SELECT 
        grantee,
        granted_role,
        admin_option,
        default_role
      FROM dba_role_privs 
      ${whereClause}
      ORDER BY grantee, granted_role
    `;

    try {
      const result = await connection.execute(query, params);
      
      if (result.rows.length === 0) {
        return 'Nenhum role encontrado';
      }

      let output = '';
      let currentUser = '';
      
      for (const row of result.rows) {
        if (row[0] !== currentUser) {
          currentUser = row[0];
          output += `\n**${row[0]}:**\n`;
        }
        
        const admin = row[2] === 'YES' ? ' (ADMIN)' : '';
        const defaultRole = row[3] === 'YES' ? ' (DEFAULT)' : '';
        
        output += `  - ${row[1]}${admin}${defaultRole}\n`;
      }

      return output;
    } catch (error) {
      return `Erro ao obter roles: ${error.message}`;
    }
  }

  async getSystemPrivileges(connection, user) {
    let whereClause = `WHERE grantee NOT IN ('SYS', 'SYSTEM')`;
    const params = {};
    
    if (user) {
      whereClause += ` AND grantee = UPPER(:user)`;
      params.user = user;
    }

    const query = `
      SELECT 
        grantee,
        privilege,
        admin_option
      FROM dba_sys_privs 
      ${whereClause}
      ORDER BY grantee, privilege
    `;

    try {
      const result = await connection.execute(query, params);
      
      if (result.rows.length === 0) {
        return 'Nenhum privilégio de sistema encontrado';
      }

      let output = '';
      let currentUser = '';
      
      for (const row of result.rows) {
        if (row[0] !== currentUser) {
          currentUser = row[0];
          output += `\n**${row[0]}:**\n`;
        }
        
        const admin = row[2] === 'YES' ? ' (ADMIN)' : '';
        output += `  - ${row[1]}${admin}\n`;
      }

      return output;
    } catch (error) {
      return `Erro ao obter privilégios de sistema: ${error.message}`;
    }
  }

  async getTableDependencies(options = {}) {
    const { tableName, schema = 'HR', dependencyType = 'ALL' } = options;
    let connection;

    try {
      connection = await this.getConnection();
      const results = [];

      if (dependencyType === 'ALL' || dependencyType === 'DEPENDENTS') {
        const dependents = await this.getTableDependents(connection, tableName, schema);
        results.push(`### Objetos que Dependem de ${tableName}\n${dependents}`);
      }

      if (dependencyType === 'ALL' || dependencyType === 'REFERENCES') {
        const references = await this.getTableReferences(connection, tableName, schema);
        results.push(`### Objetos Referenciados por ${tableName}\n${references}`);
      }

      return results.join('\n\n');
    } catch (error) {
      this.logger.error('Erro ao obter dependências da tabela:', error);
      return `❌ Erro ao obter dependências: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async getTableDependents(connection, tableName, schema) {
    const query = `
      SELECT 
        referenced_name,
        referenced_type,
        referenced_owner,
        name,
        type,
        owner
      FROM dba_dependencies 
      WHERE referenced_name = UPPER(:tableName) 
        AND referenced_owner = UPPER(:schema)
        AND referenced_type = 'TABLE'
      ORDER BY type, name
    `;

    try {
      const result = await connection.execute(query, { tableName, schema });
      
      if (result.rows.length === 0) {
        return 'Nenhum objeto depende desta tabela';
      }

      let output = '';
      for (const row of result.rows) {
        output += `- **${row[3]}** (${row[4]}) - ${row[5]}\n`;
      }

      return output;
    } catch (error) {
      return `Erro ao obter dependentes: ${error.message}`;
    }
  }

  async getTableReferences(connection, tableName, schema) {
    const query = `
      SELECT 
        name,
        type,
        owner,
        referenced_name,
        referenced_type,
        referenced_owner
      FROM dba_dependencies 
      WHERE name = UPPER(:tableName) 
        AND owner = UPPER(:schema)
        AND referenced_type = 'TABLE'
      ORDER BY referenced_type, referenced_name
    `;

    try {
      const result = await connection.execute(query, { tableName, schema });
      
      if (result.rows.length === 0) {
        return 'Esta tabela não referencia outras tabelas';
      }

      let output = '';
      for (const row of result.rows) {
        output += `- **${row[3]}** (${row[4]}) - ${row[5]}\n`;
      }

      return output;
    } catch (error) {
      return `Erro ao obter referências: ${error.message}`;
    }
  }

  async analyzeTable(options = {}) {
    const { tableName, schema = 'HR', estimatePercent = 10 } = options;
    let connection;

    try {
      connection = await this.getConnection();
      
      // Executar análise da tabela
      const analyzeQuery = `
        BEGIN
          DBMS_STATS.GATHER_TABLE_STATS(
            ownname => UPPER(:schema),
            tabname => UPPER(:tableName),
            estimate_percent => :estimatePercent,
            method_opt => 'FOR ALL COLUMNS SIZE AUTO'
          );
        END;
      `;

      await connection.execute(analyzeQuery, { schema, tableName, estimatePercent });
      
      // Obter estatísticas atualizadas
      const statsQuery = `
        SELECT 
          num_rows,
          blocks,
          avg_row_len,
          last_analyzed,
          sample_size
        FROM dba_tables 
        WHERE table_name = UPPER(:tableName) 
          AND owner = UPPER(:schema)
      `;

      const result = await connection.execute(statsQuery, { tableName, schema });
      
      if (result.rows.length === 0) {
        return 'Tabela não encontrada';
      }

      const row = result.rows[0];
      
      return `✅ **Análise concluída com sucesso!**

### Estatísticas Atualizadas:
- **Linhas:** ${row[0] || 'N/A'}
- **Blocos:** ${row[1] || 'N/A'}
- **Tamanho Médio da Linha:** ${row[2] || 'N/A'} bytes
- **Última Análise:** ${row[3] || 'Nunca'}
- **Tamanho da Amostra:** ${row[4] || 'N/A'} linhas
- **Percentual Estimado:** ${estimatePercent}%`;
      
    } catch (error) {
      this.logger.error('Erro ao analisar tabela:', error);
      return `❌ Erro ao analisar tabela: ${error.message}`;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Métodos para gerenciar múltiplas conexões
  async getAvailableConnections() {
    if (this.connectionManager) {
      return this.connectionManager.getAvailableConnections();
    }
    return [{ name: 'default', description: 'Conexão padrão', environment: 'default' }];
  }

  async testConnection(connectionName = null) {
    if (this.connectionManager) {
      return await this.connectionManager.testConnection(connectionName);
    }
    
    // Fallback para teste de conexão padrão
    try {
      const connection = await this.getConnection();
      await connection.execute('SELECT 1 FROM DUAL');
      await connection.close();
      return {
        success: true,
        message: 'Conexão padrão testada com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        message: `Falha no teste da conexão: ${error.message}`
      };
    }
  }

  async testAllConnections() {
    if (this.connectionManager) {
      return await this.connectionManager.testAllConnections();
    }
    
    return { default: await this.testConnection() };
  }

  async getConnectionsStatus() {
    if (this.connectionManager) {
      return await this.connectionManager.getConnectionsStatus();
    }
    
    return { default: { active: false, error: 'ConnectionManager não disponível' } };
  }
}
