import { Logger } from './logger.js';
import oracledb from 'oracledb';

export class DMLOperations {
  constructor(connectionConfig) {
    this.logger = new Logger();
    this.connectionConfig = connectionConfig;
  }

  async getConnection() {
    try {
      const connection = await oracledb.getConnection(this.connectionConfig);
      return connection;
    } catch (error) {
      this.logger.error('Erro ao conectar com Oracle:', error);
      throw new Error(`Falha na conexão: ${error.message}`);
    }
  }

  // ===== OPERAÇÕES SELECT =====

  async select(options = {}) {
    const {
      tableName,
      schema = 'HR',
      columns = ['*'],
      whereClause = '',
      orderBy = '',
      limit = null,
      offset = 0,
      groupBy = '',
      having = ''
    } = options;

    if (!tableName) {
      throw new Error('Nome da tabela é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Construir query SELECT
      const columnList = Array.isArray(columns) ? columns.join(', ') : columns;
      let query = `SELECT ${columnList} FROM ${schema}.${tableName}`;

      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }

      if (groupBy) {
        query += ` GROUP BY ${groupBy}`;
      }

      if (having) {
        query += ` HAVING ${having}`;
      }

      if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
      }

      // Aplicar paginação se especificada
      if (limit) {
        query = `
          SELECT * FROM (
            SELECT a.*, ROWNUM rnum FROM (${query}) a
            WHERE ROWNUM <= :limit
          ) WHERE rnum > :offset
        `;
      }

      const params = limit ? { limit: offset + limit, offset } : {};
      const result = await connection.execute(query, params);

      // Formatar resultado
      const formattedResult = this.formatSelectResult(result);
      
      this.logger.info(`Query SELECT executada com sucesso: ${result.rows.length} linhas retornadas`);
      return formattedResult;

    } catch (error) {
      this.logger.error('Erro ao executar SELECT:', error);
      throw new Error(`Erro ao executar SELECT: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES INSERT =====

  async insert(options = {}) {
    const {
      tableName,
      schema = 'HR',
      data = {},
      columns = [],
      values = [],
      returning = null
    } = options;

    if (!tableName) {
      throw new Error('Nome da tabela é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection();

      let query;
      let params = {};

      if (Object.keys(data).length > 0) {
        // Insert com objeto de dados
        const columnNames = Object.keys(data);
        const columnValues = columnNames.map((col, index) => `:val${index}`);
        
        query = `INSERT INTO ${schema}.${tableName} (${columnNames.join(', ')}) VALUES (${columnValues.join(', ')})`;
        
        columnNames.forEach((col, index) => {
          params[`val${index}`] = data[col];
        });
      } else if (columns.length > 0 && values.length > 0) {
        // Insert com arrays de colunas e valores
        const valuePlaceholders = columns.map((_, index) => `:val${index}`);
        
        query = `INSERT INTO ${schema}.${tableName} (${columns.join(', ')}) VALUES (${valuePlaceholders.join(', ')})`;
        
        columns.forEach((_, index) => {
          params[`val${index}`] = values[index];
        });
      } else {
        throw new Error('Dados para inserção são obrigatórios (data ou columns/values)');
      }

      // Adicionar RETURNING se especificado
      if (returning) {
        query += ` RETURNING ${returning} INTO :returningValue`;
        params.returningValue = { type: oracledb.STRING, dir: oracledb.BIND_OUT };
      }

      const result = await connection.execute(query, params);
      await connection.commit();

      let resultMessage = `✅ ${result.rowsAffected} linha(s) inserida(s) com sucesso!`;
      
      if (returning && result.outBinds && result.outBinds.returningValue) {
        resultMessage += `\nValor retornado: ${result.outBinds.returningValue}`;
      }

      this.logger.info(`Query INSERT executada com sucesso: ${result.rowsAffected} linhas afetadas`);
      return resultMessage;

    } catch (error) {
      this.logger.error('Erro ao executar INSERT:', error);
      throw new Error(`Erro ao executar INSERT: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async insertMultiple(options = {}) {
    const {
      tableName,
      schema = 'HR',
      dataArray = [],
      columns = [],
      batchSize = 1000
    } = options;

    if (!tableName || dataArray.length === 0) {
      throw new Error('Nome da tabela e array de dados são obrigatórios');
    }

    let connection;
    try {
      connection = await this.getConnection();

      const columnNames = columns.length > 0 ? columns : Object.keys(dataArray[0]);
      const valuePlaceholders = columnNames.map((_, index) => `:val${index}`);
      
      const query = `INSERT INTO ${schema}.${tableName} (${columnNames.join(', ')}) VALUES (${valuePlaceholders.join(', ')})`;

      let totalInserted = 0;
      const batches = this.chunkArray(dataArray, batchSize);

      for (const batch of batches) {
        const bindVars = batch.map(row => {
          const bind = {};
          columnNames.forEach((col, index) => {
            bind[`val${index}`] = row[col] || row[index];
          });
          return bind;
        });

        const result = await connection.executeMany(query, bindVars);
        totalInserted += result.rowsAffected;
      }

      await connection.commit();

      this.logger.info(`Query INSERT múltiplo executada com sucesso: ${totalInserted} linhas inseridas`);
      return `✅ ${totalInserted} linha(s) inserida(s) com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao executar INSERT múltiplo:', error);
      throw new Error(`Erro ao executar INSERT múltiplo: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES UPDATE =====

  async update(options = {}) {
    const {
      tableName,
      schema = 'HR',
      data = {},
      whereClause = '',
      returning = null
    } = options;

    if (!tableName) {
      throw new Error('Nome da tabela é obrigatório');
    }

    if (Object.keys(data).length === 0) {
      throw new Error('Dados para atualização são obrigatórios');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Construir SET clause
      const setClauses = Object.keys(data).map((col, index) => `${col} = :val${index}`);
      let query = `UPDATE ${schema}.${tableName} SET ${setClauses.join(', ')}`;

      if (whereClause) {
        query += ` WHERE ${whereClause}`;
      }

      // Adicionar RETURNING se especificado
      if (returning) {
        query += ` RETURNING ${returning} INTO :returningValue`;
      }

      const params = {};
      Object.keys(data).forEach((col, index) => {
        params[`val${index}`] = data[col];
      });

      if (returning) {
        params.returningValue = { type: oracledb.STRING, dir: oracledb.BIND_OUT };
      }

      const result = await connection.execute(query, params);
      await connection.commit();

      let resultMessage = `✅ ${result.rowsAffected} linha(s) atualizada(s) com sucesso!`;
      
      if (returning && result.outBinds && result.outBinds.returningValue) {
        resultMessage += `\nValor retornado: ${result.outBinds.returningValue}`;
      }

      this.logger.info(`Query UPDATE executada com sucesso: ${result.rowsAffected} linhas afetadas`);
      return resultMessage;

    } catch (error) {
      this.logger.error('Erro ao executar UPDATE:', error);
      throw new Error(`Erro ao executar UPDATE: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES DELETE =====

  async delete(options = {}) {
    const {
      tableName,
      schema = 'HR',
      whereClause = '',
      returning = null
    } = options;

    if (!tableName) {
      throw new Error('Nome da tabela é obrigatório');
    }

    if (!whereClause) {
      throw new Error('Cláusula WHERE é obrigatória para operações DELETE por segurança');
    }

    let connection;
    try {
      connection = await this.getConnection();

      let query = `DELETE FROM ${schema}.${tableName} WHERE ${whereClause}`;

      // Adicionar RETURNING se especificado
      if (returning) {
        query += ` RETURNING ${returning} INTO :returningValue`;
      }

      const params = {};
      if (returning) {
        params.returningValue = { type: oracledb.STRING, dir: oracledb.BIND_OUT };
      }

      const result = await connection.execute(query, params);
      await connection.commit();

      let resultMessage = `✅ ${result.rowsAffected} linha(s) removida(s) com sucesso!`;
      
      if (returning && result.outBinds && result.outBinds.returningValue) {
        resultMessage += `\nValor retornado: ${result.outBinds.returningValue}`;
      }

      this.logger.info(`Query DELETE executada com sucesso: ${result.rowsAffected} linhas afetadas`);
      return resultMessage;

    } catch (error) {
      this.logger.error('Erro ao executar DELETE:', error);
      throw new Error(`Erro ao executar DELETE: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES MERGE =====

  async merge(options = {}) {
    const {
      tableName,
      schema = 'HR',
      sourceTable,
      sourceSchema = 'HR',
      matchColumns = [],
      updateColumns = [],
      insertColumns = [],
      updateWhenMatched = true,
      insertWhenNotMatched = true
    } = options;

    if (!tableName || !sourceTable || matchColumns.length === 0) {
      throw new Error('Nome da tabela, tabela de origem e colunas de match são obrigatórios');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Construir cláusula MATCH
      const matchCondition = matchColumns.map(col => `t.${col} = s.${col}`).join(' AND ');

      // Construir cláusula UPDATE
      let updateClause = '';
      if (updateWhenMatched && updateColumns.length > 0) {
        const updateSet = updateColumns.map(col => `t.${col} = s.${col}`).join(', ');
        updateClause = `WHEN MATCHED THEN UPDATE SET ${updateSet}`;
      }

      // Construir cláusula INSERT
      let insertClause = '';
      if (insertWhenNotMatched && insertColumns.length > 0) {
        const insertCols = insertColumns.join(', ');
        const insertVals = insertColumns.map(col => `s.${col}`).join(', ');
        insertClause = `WHEN NOT MATCHED THEN INSERT (${insertCols}) VALUES (${insertVals})`;
      }

      const query = `
        MERGE INTO ${schema}.${tableName} t
        USING ${sourceSchema}.${sourceTable} s
        ON (${matchCondition})
        ${updateClause}
        ${insertClause}
      `;

      const result = await connection.execute(query);
      await connection.commit();

      this.logger.info(`Query MERGE executada com sucesso`);
      return `✅ Operação MERGE executada com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao executar MERGE:', error);
      throw new Error(`Erro ao executar MERGE: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  formatSelectResult(result) {
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
  }

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // ===== VALIDAÇÕES DE SEGURANÇA =====

  validateTableName(tableName) {
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Nome da tabela deve ser uma string válida');
    }
    
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(tableName)) {
      throw new Error('Nome da tabela deve conter apenas letras, números e underscore, começando com letra');
    }
  }

  validateWhereClause(whereClause) {
    if (!whereClause) {
      return;
    }

    // Verificar palavras perigosas
    const dangerousKeywords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE', 'TRUNCATE', 'EXEC', 'EXECUTE'];
    const upperWhere = whereClause.toUpperCase();
    
    for (const keyword of dangerousKeywords) {
      if (upperWhere.includes(keyword)) {
        throw new Error(`Palavra-chave perigosa detectada na cláusula WHERE: ${keyword}`);
      }
    }

    // Verificar tentativas de SQL injection básicas
    const injectionPatterns = [
      /'.*or.*'.*=/i,
      /'.*union.*select/i,
      /'.*drop.*table/i,
      /'.*delete.*from/i
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(whereClause)) {
        throw new Error('Possível tentativa de SQL injection detectada na cláusula WHERE');
      }
    }
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Remover caracteres perigosos
    return input
      .replace(/[';]/g, '') // Remover aspas simples e ponto e vírgula
      .replace(/--/g, '') // Remover comentários SQL
      .replace(/\/\*.*?\*\//g, '') // Remover comentários de bloco
      .trim();
  }
}
