import oracledb from 'oracledb';
import { Logger } from './logger.js';
import fs from 'fs';
import path from 'path';

export class ConnectionManager {
  constructor(configPath = './config/multi-connections.json') {
    this.logger = new Logger();
    this.connections = new Map();
    this.configPath = configPath;
    this.config = null;
    this.loadConfig();
  }

  loadConfig() {
    try {
      // Primeiro, tenta carregar do arquivo JSON
      const configFile = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configFile);
      this.logger.info('Configuração de múltiplas conexões carregada do arquivo JSON');
    } catch (fileError) {
      // Se falhar, tenta carregar das variáveis de ambiente
      try {
        const envConfig = process.env.ORACLE_CONNECTIONS;
        if (envConfig) {
          this.config = JSON.parse(envConfig);
          this.logger.info('Configuração de múltiplas conexões carregada das variáveis de ambiente');
        } else {
          throw new Error('Nenhuma configuração de conexões encontrada');
        }
      } catch (envError) {
        this.logger.error('Erro ao carregar configuração de conexões:', envError);
        throw new Error(`Falha ao carregar configuração: ${envError.message}`);
      }
    }
  }

  async getConnection(connectionName = null) {
    const connName = connectionName || this.config.defaultConnection;
    
    if (!this.config.connections[connName]) {
      throw new Error(`Conexão '${connName}' não encontrada na configuração`);
    }

    // Verificar se já existe uma conexão ativa
    if (this.connections.has(connName)) {
      const existingConn = this.connections.get(connName);
      try {
        // Testar se a conexão ainda está ativa
        await existingConn.execute('SELECT 1 FROM DUAL');
        return existingConn;
      } catch (error) {
        // Conexão inativa, remover do cache
        this.connections.delete(connName);
        this.logger.warn(`Conexão '${connName}' estava inativa, removida do cache`);
      }
    }

    // Criar nova conexão
    try {
      const connConfig = this.config.connections[connName];
      const connection = await oracledb.getConnection(connConfig);
      
      // Armazenar no cache
      this.connections.set(connName, connection);
      
      this.logger.info(`Conexão '${connName}' estabelecida com sucesso`);
      return connection;
    } catch (error) {
      this.logger.error(`Erro ao conectar com '${connName}':`, error);
      throw new Error(`Falha na conexão '${connName}': ${error.message}`);
    }
  }

  async getConnectionConfig(connectionName = null) {
    const connName = connectionName || this.config.defaultConnection;
    
    if (!this.config.connections[connName]) {
      throw new Error(`Conexão '${connName}' não encontrada na configuração`);
    }

    return this.config.connections[connName];
  }

  async closeConnection(connectionName) {
    if (this.connections.has(connectionName)) {
      try {
        const connection = this.connections.get(connectionName);
        await connection.close();
        this.connections.delete(connectionName);
        this.logger.info(`Conexão '${connectionName}' fechada com sucesso`);
      } catch (error) {
        this.logger.error(`Erro ao fechar conexão '${connectionName}':`, error);
      }
    }
  }

  async closeAllConnections() {
    const closePromises = [];
    
    for (const [connName, connection] of this.connections) {
      closePromises.push(
        connection.close().catch(error => {
          this.logger.error(`Erro ao fechar conexão '${connName}':`, error);
        })
      );
    }
    
    await Promise.all(closePromises);
    this.connections.clear();
    this.logger.info('Todas as conexões foram fechadas');
  }

  getAvailableConnections() {
    return Object.keys(this.config.connections).map(name => ({
      name,
      description: this.config.connections[name].description,
      environment: this.config.connections[name].environment
    }));
  }

  getDefaultConnection() {
    return this.config.defaultConnection;
  }

  async testConnection(connectionName) {
    try {
      const connection = await this.getConnection(connectionName);
      await connection.execute('SELECT 1 FROM DUAL');
      return {
        success: true,
        message: `Conexão '${connectionName}' testada com sucesso`,
        connection: this.config.connections[connectionName]
      };
    } catch (error) {
      return {
        success: false,
        message: `Falha no teste da conexão '${connectionName}': ${error.message}`,
        error: error.message
      };
    }
  }

  async testAllConnections() {
    const results = {};
    
    for (const connName of Object.keys(this.config.connections)) {
      results[connName] = await this.testConnection(connName);
    }
    
    return results;
  }

  // Método para obter informações de monitoramento de todas as conexões
  async getConnectionsStatus() {
    const status = {};
    
    for (const [connName, connection] of this.connections) {
      try {
        const result = await connection.execute(`
          SELECT 
            '${connName}' as connection_name,
            SYS_CONTEXT('USERENV', 'DB_NAME') as database_name,
            SYS_CONTEXT('USERENV', 'HOST') as host,
            SYS_CONTEXT('USERENV', 'IP_ADDRESS') as ip_address,
            SYS_CONTEXT('USERENV', 'SESSION_USER') as session_user,
            SYSDATE as current_time
          FROM DUAL
        `);
        
        status[connName] = {
          active: true,
          info: result.rows[0]
        };
      } catch (error) {
        status[connName] = {
          active: false,
          error: error.message
        };
      }
    }
    
    return status;
  }
}
