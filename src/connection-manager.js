import oracledb from 'oracledb';
import { Logger } from './logger.js';
import fs from 'fs';
import os from 'os';

export class ConnectionManager {
  constructor(configPath = './config/multi-connections.json') {
    this.logger = new Logger();
    this.connections = new Map();
    this.configPath = configPath;
    this.config = null;
    this.oracleClientInitialized = false;
    this.loadConfig();
    // Inicializar Oracle Client de forma assíncrona para evitar bloqueios
    this.initializeOracleClient().catch(error => {
      this.logger.warn('Erro ao inicializar Oracle Client:', error.message);
    });
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

  /**
   * Detecta possíveis localizações do Oracle Instant Client
   */
  detectOracleClientPaths() {
    const possiblePaths = [];
    const platform = os.platform();
    
    // Caminhos comuns do Oracle Instant Client
    if (platform === 'win32') {
      possiblePaths.push(
        process.env.ORACLE_CLIENT_PATH,
        'C:\\oracle\\instantclient_21_8',
        'C:\\oracle\\instantclient_21_7',
        'C:\\oracle\\instantclient_21_6',
        'C:\\oracle\\instantclient_21_5',
        'C:\\oracle\\instantclient_21_4',
        'C:\\oracle\\instantclient_21_3',
        'C:\\oracle\\instantclient_21_2',
        'C:\\oracle\\instantclient_21_1',
        'C:\\oracle\\instantclient_19_8',
        'C:\\oracle\\instantclient_19_7',
        'C:\\oracle\\instantclient_19_6',
        'C:\\oracle\\instantclient_19_5',
        'C:\\oracle\\instantclient_19_4',
        'C:\\oracle\\instantclient_19_3',
        'C:\\oracle\\instantclient_19_2',
        'C:\\oracle\\instantclient_19_1',
        'C:\\oracle\\instantclient_18_8',
        'C:\\oracle\\instantclient_18_7',
        'C:\\oracle\\instantclient_18_6',
        'C:\\oracle\\instantclient_18_5',
        'C:\\oracle\\instantclient_18_4',
        'C:\\oracle\\instantclient_18_3',
        'C:\\oracle\\instantclient_18_2',
        'C:\\oracle\\instantclient_18_1',
        'C:\\oracle\\instantclient_12_2',
        'C:\\oracle\\instantclient_12_1',
        'C:\\oracle\\instantclient_11_2'
      );
    } else if (platform === 'darwin') {
      possiblePaths.push(
        process.env.ORACLE_CLIENT_PATH,
        '/opt/oracle/instantclient_21_8',
        '/opt/oracle/instantclient_21_7',
        '/opt/oracle/instantclient_21_6',
        '/opt/oracle/instantclient_21_5',
        '/opt/oracle/instantclient_21_4',
        '/opt/oracle/instantclient_21_3',
        '/opt/oracle/instantclient_21_2',
        '/opt/oracle/instantclient_21_1',
        '/opt/oracle/instantclient_19_8',
        '/opt/oracle/instantclient_19_7',
        '/opt/oracle/instantclient_19_6',
        '/opt/oracle/instantclient_19_5',
        '/opt/oracle/instantclient_19_4',
        '/opt/oracle/instantclient_19_3',
        '/opt/oracle/instantclient_19_2',
        '/opt/oracle/instantclient_19_1',
        '/opt/oracle/instantclient_18_8',
        '/opt/oracle/instantclient_18_7',
        '/opt/oracle/instantclient_18_6',
        '/opt/oracle/instantclient_18_5',
        '/opt/oracle/instantclient_18_4',
        '/opt/oracle/instantclient_18_3',
        '/opt/oracle/instantclient_18_2',
        '/opt/oracle/instantclient_18_1',
        '/opt/oracle/instantclient_12_2',
        '/opt/oracle/instantclient_12_1',
        '/opt/oracle/instantclient_11_2'
      );
    } else {
      // Linux
      possiblePaths.push(
        process.env.ORACLE_CLIENT_PATH,
        '/opt/oracle/instantclient_21_8',
        '/opt/oracle/instantclient_21_7',
        '/opt/oracle/instantclient_21_6',
        '/opt/oracle/instantclient_21_5',
        '/opt/oracle/instantclient_21_4',
        '/opt/oracle/instantclient_21_3',
        '/opt/oracle/instantclient_21_2',
        '/opt/oracle/instantclient_21_1',
        '/opt/oracle/instantclient_19_8',
        '/opt/oracle/instantclient_19_7',
        '/opt/oracle/instantclient_19_6',
        '/opt/oracle/instantclient_19_5',
        '/opt/oracle/instantclient_19_4',
        '/opt/oracle/instantclient_19_3',
        '/opt/oracle/instantclient_19_2',
        '/opt/oracle/instantclient_19_1',
        '/opt/oracle/instantclient_18_8',
        '/opt/oracle/instantclient_18_7',
        '/opt/oracle/instantclient_18_6',
        '/opt/oracle/instantclient_18_5',
        '/opt/oracle/instantclient_18_4',
        '/opt/oracle/instantclient_18_3',
        '/opt/oracle/instantclient_18_2',
        '/opt/oracle/instantclient_18_1',
        '/opt/oracle/instantclient_12_2',
        '/opt/oracle/instantclient_12_1',
        '/opt/oracle/instantclient_11_2'
      );
    }
    
    return possiblePaths.filter(path => path && fs.existsSync(path));
  }

  /**
   * Inicializa o Oracle Client no modo Thick se disponível
   */
  async initializeOracleClient() {
    if (this.oracleClientInitialized) {
      return;
    }

    try {
      // Verificar se já está em modo Thick
      if (oracledb.thin === false) {
        this.logger.info('Oracle Client já está em modo Thick');
        this.oracleClientInitialized = true;
        return;
      }

      // Tentar encontrar o Oracle Instant Client
      const clientPaths = this.detectOracleClientPaths();
      
      if (clientPaths.length === 0) {
        this.logger.warn('Oracle Instant Client não encontrado. Continuando em modo Thin.');
        this.logger.warn('Para suporte completo ao Oracle 19c, instale o Oracle Instant Client.');
        return;
      }

      // Tentar inicializar com cada caminho encontrado
      for (const clientPath of clientPaths) {
        try {
          this.logger.info(`Tentando inicializar Oracle Client com: ${clientPath}`);
          oracledb.initOracleClient({ libDir: clientPath });
          this.logger.info(`Oracle Client inicializado com sucesso em modo Thick: ${clientPath}`);
          this.oracleClientInitialized = true;
          return;
        } catch (error) {
          this.logger.debug(`Falha ao inicializar com ${clientPath}: ${error.message}`);
          continue;
        }
      }

      this.logger.warn('Não foi possível inicializar o Oracle Client em modo Thick. Continuando em modo Thin.');
      this.logger.warn('Para suporte completo ao Oracle 19c, verifique a instalação do Oracle Instant Client.');
      
    } catch (error) {
      this.logger.warn(`Erro ao inicializar Oracle Client: ${error.message}`);
      this.logger.warn('Continuando em modo Thin. Para suporte completo ao Oracle 19c, instale o Oracle Instant Client.');
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
      // Verificar se é erro de compatibilidade de senha (Oracle 19c)
      if (error.message.includes('password verifier type 0x939') || 
          error.message.includes('NJS-116')) {
        this.logger.warn(`Erro de compatibilidade detectado para '${connName}': ${error.message}`);
        this.logger.info('Tentando inicializar modo Thick para resolver compatibilidade com Oracle 19c...');
        
        try {
          // Tentar inicializar modo Thick se ainda não foi feito
          if (!this.oracleClientInitialized) {
            await this.initializeOracleClient();
          }
          
          // Tentar conexão novamente
          const connConfig = this.config.connections[connName];
          const connection = await oracledb.getConnection(connConfig);
          
          // Armazenar no cache
          this.connections.set(connName, connection);
          
          this.logger.info(`Conexão '${connName}' estabelecida com sucesso usando modo Thick`);
          return connection;
        } catch (thickError) {
          this.logger.error(`Erro ao conectar com '${connName}' mesmo em modo Thick:`, thickError);
          throw new Error(`Falha na conexão '${connName}' (modo Thick): ${thickError.message}`);
        }
      }
      
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
      environment: this.config.connections[name].environment || 'default'
    }));
  }

  getDefaultConnection() {
    return this.config.defaultConnection;
  }

  /**
   * Obtém informações sobre o modo Oracle Client atual
   */
  getOracleClientInfo() {
    return {
      thin: oracledb.thin,
      version: oracledb.version,
      clientInitialized: this.oracleClientInitialized,
      clientVersion: oracledb.thin ? 'N/A (Thin mode)' : oracledb.versionString
    };
  }

  async testConnection(connectionName) {
    try {
      const connection = await this.getConnection(connectionName);
      await connection.execute('SELECT 1 FROM DUAL');
      
      const oracleInfo = this.getOracleClientInfo();
      
      return {
        success: true,
        message: `Conexão '${connectionName}' testada com sucesso`,
        connection: this.config.connections[connectionName],
        oracleMode: oracleInfo.thin ? 'Thin' : 'Thick',
        oracleVersion: oracleInfo.clientVersion
      };
    } catch (error) {
      const oracleInfo = this.getOracleClientInfo();
      
      return {
        success: false,
        message: `Falha no teste da conexão '${connectionName}': ${error.message}`,
        error: error.message,
        oracleMode: oracleInfo.thin ? 'Thin' : 'Thick',
        oracleVersion: oracleInfo.clientVersion
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
