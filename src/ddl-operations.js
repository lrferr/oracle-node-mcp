import { Logger } from './logger.js';
import oracledb from 'oracledb';

export class DDLOperations {
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

  // ===== OPERAÇÕES DE TABELA =====

  async createTable(options = {}) {
    const {
      tableName,
      schema = 'HR',
      columns = [],
      constraints = [],
      tablespace = 'USERS',
      ifNotExists = true
    } = options;

    if (!tableName || columns.length === 0) {
      throw new Error('Nome da tabela e colunas são obrigatórios');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Verificar se a tabela já existe
      if (ifNotExists) {
        const exists = await this.tableExists(connection, tableName, schema);
        if (exists) {
          return `⚠️ Tabela ${schema}.${tableName} já existe. Operação ignorada.`;
        }
      }

      // Construir query CREATE TABLE
      const columnDefinitions = columns.map(col => {
        let def = `${col.name} ${col.type}`;
        if (col.length) def += `(${col.length}${col.precision ? ',' + col.precision : ''})`;
        if (col.notNull) def += ' NOT NULL';
        if (col.defaultValue) def += ` DEFAULT ${col.defaultValue}`;
        return def;
      }).join(',\n  ');

      const constraintDefinitions = constraints.map(constraint => {
        let def = `CONSTRAINT ${constraint.name} `;
        switch (constraint.type) {
          case 'PRIMARY KEY':
            def += `PRIMARY KEY (${constraint.columns.join(', ')})`;
            break;
          case 'UNIQUE':
            def += `UNIQUE (${constraint.columns.join(', ')})`;
            break;
          case 'CHECK':
            def += `CHECK (${constraint.condition})`;
            break;
          case 'FOREIGN KEY':
            def += `FOREIGN KEY (${constraint.columns.join(', ')}) REFERENCES ${constraint.referencedTable}(${constraint.referencedColumns.join(', ')})`;
            break;
        }
        return def;
      }).join(',\n  ');

      const createQuery = `
        CREATE TABLE ${schema}.${tableName} (
          ${columnDefinitions}${constraints.length > 0 ? ',\n  ' + constraintDefinitions : ''}
        ) TABLESPACE ${tablespace}
      `;

      await connection.execute(createQuery);
      await connection.commit();

      this.logger.info(`Tabela ${schema}.${tableName} criada com sucesso`);
      return `✅ Tabela ${schema}.${tableName} criada com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao criar tabela:', error);
      throw new Error(`Erro ao criar tabela: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async alterTable(options = {}) {
    const {
      tableName,
      schema = 'HR',
      operation,
      columnName,
      columnType,
      columnLength,
      notNull,
      defaultValue,
      constraintName,
      constraintType,
      constraintColumns,
      constraintCondition,
      referencedTable,
      referencedColumns
    } = options;

    if (!tableName || !operation) {
      throw new Error('Nome da tabela e operação são obrigatórios');
    }

    let connection;
    try {
      connection = await this.getConnection();

      let alterQuery = `ALTER TABLE ${schema}.${tableName} `;

      switch (operation) {
        case 'ADD_COLUMN':
          if (!columnName || !columnType) {
            throw new Error('Nome e tipo da coluna são obrigatórios para ADD_COLUMN');
          }
          let columnDef = `${columnName} ${columnType}`;
          if (columnLength) columnDef += `(${columnLength})`;
          if (notNull) columnDef += ' NOT NULL';
          if (defaultValue) columnDef += ` DEFAULT ${defaultValue}`;
          alterQuery += `ADD ${columnDef}`;
          break;

        case 'MODIFY_COLUMN':
          if (!columnName || !columnType) {
            throw new Error('Nome e tipo da coluna são obrigatórios para MODIFY_COLUMN');
          }
          let modifyDef = `${columnName} ${columnType}`;
          if (columnLength) modifyDef += `(${columnLength})`;
          if (notNull !== undefined) modifyDef += notNull ? ' NOT NULL' : ' NULL';
          if (defaultValue) modifyDef += ` DEFAULT ${defaultValue}`;
          alterQuery += `MODIFY ${modifyDef}`;
          break;

        case 'DROP_COLUMN':
          if (!columnName) {
            throw new Error('Nome da coluna é obrigatório para DROP_COLUMN');
          }
          alterQuery += `DROP COLUMN ${columnName}`;
          break;

        case 'ADD_CONSTRAINT':
          if (!constraintName || !constraintType) {
            throw new Error('Nome e tipo da constraint são obrigatórios para ADD_CONSTRAINT');
          }
          let constraintDef = `CONSTRAINT ${constraintName} `;
          switch (constraintType) {
            case 'PRIMARY KEY':
              constraintDef += `PRIMARY KEY (${constraintColumns.join(', ')})`;
              break;
            case 'UNIQUE':
              constraintDef += `UNIQUE (${constraintColumns.join(', ')})`;
              break;
            case 'CHECK':
              constraintDef += `CHECK (${constraintCondition})`;
              break;
            case 'FOREIGN KEY':
              constraintDef += `FOREIGN KEY (${constraintColumns.join(', ')}) REFERENCES ${referencedTable}(${referencedColumns.join(', ')})`;
              break;
          }
          alterQuery += `ADD ${constraintDef}`;
          break;

        case 'DROP_CONSTRAINT':
          if (!constraintName) {
            throw new Error('Nome da constraint é obrigatório para DROP_CONSTRAINT');
          }
          alterQuery += `DROP CONSTRAINT ${constraintName}`;
          break;

        case 'RENAME_COLUMN':
          if (!columnName || !options.newColumnName) {
            throw new Error('Nome atual e novo nome da coluna são obrigatórios para RENAME_COLUMN');
          }
          alterQuery += `RENAME COLUMN ${columnName} TO ${options.newColumnName}`;
          break;

        default:
          throw new Error(`Operação não suportada: ${operation}`);
      }

      await connection.execute(alterQuery);
      await connection.commit();

      this.logger.info(`Tabela ${schema}.${tableName} alterada com sucesso`);
      return `✅ Tabela ${schema}.${tableName} alterada com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao alterar tabela:', error);
      throw new Error(`Erro ao alterar tabela: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async dropTable(options = {}) {
    const {
      tableName,
      schema = 'HR',
      ifExists = true,
      cascadeConstraints = false
    } = options;

    if (!tableName) {
      throw new Error('Nome da tabela é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Verificar se a tabela existe
      if (ifExists) {
        const exists = await this.tableExists(connection, tableName, schema);
        if (!exists) {
          return `⚠️ Tabela ${schema}.${tableName} não existe. Operação ignorada.`;
        }
      }

      let dropQuery = `DROP TABLE ${schema}.${tableName}`;
      if (cascadeConstraints) {
        dropQuery += ' CASCADE CONSTRAINTS';
      }

      await connection.execute(dropQuery);
      await connection.commit();

      this.logger.info(`Tabela ${schema}.${tableName} removida com sucesso`);
      return `✅ Tabela ${schema}.${tableName} removida com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao remover tabela:', error);
      throw new Error(`Erro ao remover tabela: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES DE ÍNDICE =====

  async createIndex(options = {}) {
    const {
      indexName,
      tableName,
      schema = 'HR',
      columns = [],
      unique = false,
      tablespace = 'USERS',
      ifNotExists = true
    } = options;

    if (!indexName || !tableName || columns.length === 0) {
      throw new Error('Nome do índice, tabela e colunas são obrigatórios');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Verificar se o índice já existe
      if (ifNotExists) {
        const exists = await this.indexExists(connection, indexName, schema);
        if (exists) {
          return `⚠️ Índice ${schema}.${indexName} já existe. Operação ignorada.`;
        }
      }

      const uniqueClause = unique ? 'UNIQUE ' : '';
      const createQuery = `
        CREATE ${uniqueClause}INDEX ${schema}.${indexName}
        ON ${schema}.${tableName} (${columns.join(', ')})
        TABLESPACE ${tablespace}
      `;

      await connection.execute(createQuery);
      await connection.commit();

      this.logger.info(`Índice ${schema}.${indexName} criado com sucesso`);
      return `✅ Índice ${schema}.${indexName} criado com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao criar índice:', error);
      throw new Error(`Erro ao criar índice: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async dropIndex(options = {}) {
    const {
      indexName,
      schema = 'HR',
      ifExists = true
    } = options;

    if (!indexName) {
      throw new Error('Nome do índice é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Verificar se o índice existe
      if (ifExists) {
        const exists = await this.indexExists(connection, indexName, schema);
        if (!exists) {
          return `⚠️ Índice ${schema}.${indexName} não existe. Operação ignorada.`;
        }
      }

      const dropQuery = `DROP INDEX ${schema}.${indexName}`;
      await connection.execute(dropQuery);
      await connection.commit();

      this.logger.info(`Índice ${schema}.${indexName} removido com sucesso`);
      return `✅ Índice ${schema}.${indexName} removido com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao remover índice:', error);
      throw new Error(`Erro ao remover índice: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES DE SEQUENCE =====

  async createSequence(options = {}) {
    const {
      sequenceName,
      schema = 'HR',
      startWith = 1,
      incrementBy = 1,
      minValue = 1,
      maxValue = null,
      cache = 20,
      cycle = false,
      ifNotExists = true
    } = options;

    if (!sequenceName) {
      throw new Error('Nome da sequence é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Verificar se a sequence já existe
      if (ifNotExists) {
        const exists = await this.sequenceExists(connection, sequenceName, schema);
        if (exists) {
          return `⚠️ Sequence ${schema}.${sequenceName} já existe. Operação ignorada.`;
        }
      }

      let createQuery = `
        CREATE SEQUENCE ${schema}.${sequenceName}
        START WITH ${startWith}
        INCREMENT BY ${incrementBy}
        MINVALUE ${minValue}
        ${maxValue ? `MAXVALUE ${maxValue}` : 'NOMAXVALUE'}
        CACHE ${cache}
        ${cycle ? 'CYCLE' : 'NOCYCLE'}
      `;

      await connection.execute(createQuery);
      await connection.commit();

      this.logger.info(`Sequence ${schema}.${sequenceName} criada com sucesso`);
      return `✅ Sequence ${schema}.${sequenceName} criada com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao criar sequence:', error);
      throw new Error(`Erro ao criar sequence: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async dropSequence(options = {}) {
    const {
      sequenceName,
      schema = 'HR',
      ifExists = true
    } = options;

    if (!sequenceName) {
      throw new Error('Nome da sequence é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection();

      // Verificar se a sequence existe
      if (ifExists) {
        const exists = await this.sequenceExists(connection, sequenceName, schema);
        if (!exists) {
          return `⚠️ Sequence ${schema}.${sequenceName} não existe. Operação ignorada.`;
        }
      }

      const dropQuery = `DROP SEQUENCE ${schema}.${sequenceName}`;
      await connection.execute(dropQuery);
      await connection.commit();

      this.logger.info(`Sequence ${schema}.${sequenceName} removida com sucesso`);
      return `✅ Sequence ${schema}.${sequenceName} removida com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao remover sequence:', error);
      throw new Error(`Erro ao remover sequence: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  async tableExists(connection, tableName, schema) {
    try {
      const query = `
        SELECT COUNT(*) 
        FROM dba_tables 
        WHERE table_name = UPPER(:tableName) 
          AND owner = UPPER(:schema)
      `;
      const result = await connection.execute(query, { tableName, schema });
      return result.rows[0][0] > 0;
    } catch (error) {
      return false;
    }
  }

  async indexExists(connection, indexName, schema) {
    try {
      const query = `
        SELECT COUNT(*) 
        FROM dba_indexes 
        WHERE index_name = UPPER(:indexName) 
          AND owner = UPPER(:schema)
      `;
      const result = await connection.execute(query, { indexName, schema });
      return result.rows[0][0] > 0;
    } catch (error) {
      return false;
    }
  }

  async sequenceExists(connection, sequenceName, schema) {
    try {
      const query = `
        SELECT COUNT(*) 
        FROM dba_sequences 
        WHERE sequence_name = UPPER(:sequenceName) 
          AND sequence_owner = UPPER(:schema)
      `;
      const result = await connection.execute(query, { sequenceName, schema });
      return result.rows[0][0] > 0;
    } catch (error) {
      return false;
    }
  }

  // ===== VALIDAÇÕES DE SEGURANÇA =====

  validateTableName(tableName) {
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('Nome da tabela deve ser uma string válida');
    }
    
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(tableName)) {
      throw new Error('Nome da tabela deve conter apenas letras, números e underscore, começando com letra');
    }
    
    if (tableName.length > 30) {
      throw new Error('Nome da tabela não pode exceder 30 caracteres');
    }
  }

  validateColumnDefinition(column) {
    if (!column.name || !column.type) {
      throw new Error('Nome e tipo da coluna são obrigatórios');
    }
    
    this.validateTableName(column.name);
    
    const validTypes = [
      'VARCHAR2', 'CHAR', 'NUMBER', 'DATE', 'TIMESTAMP', 'CLOB', 'BLOB',
      'RAW', 'LONG', 'LONG RAW', 'BFILE', 'ROWID', 'UROWID'
    ];
    
    if (!validTypes.includes(column.type.toUpperCase())) {
      throw new Error(`Tipo de coluna inválido: ${column.type}`);
    }
  }

  validateConstraintDefinition(constraint) {
    if (!constraint.name || !constraint.type) {
      throw new Error('Nome e tipo da constraint são obrigatórios');
    }
    
    this.validateTableName(constraint.name);
    
    const validTypes = ['PRIMARY KEY', 'UNIQUE', 'CHECK', 'FOREIGN KEY'];
    if (!validTypes.includes(constraint.type)) {
      throw new Error(`Tipo de constraint inválido: ${constraint.type}`);
    }
  }
}
