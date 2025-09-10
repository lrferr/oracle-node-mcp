#!/usr/bin/env node

/**
 * Script de configuração para múltiplas conexões Oracle
 * 
 * Este script ajuda a configurar o sistema para usar múltiplas conexões
 * sem precisar baixar múltiplas instâncias do projeto.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class MultiConnectionSetup {
  constructor() {
    this.configPath = './config/multi-connections.json';
    this.examplePath = './config/multi-connections-example.json';
  }

  async run() {
    console.log('🚀 Configuração de Múltiplas Conexões Oracle\n');
    
    try {
      // Verificar se já existe configuração
      if (fs.existsSync(this.configPath)) {
        const overwrite = await this.askQuestion(
          '⚠️ Já existe um arquivo de configuração. Deseja sobrescrever? (y/N): '
        );
        
        if (overwrite.toLowerCase() !== 'y') {
          console.log('❌ Configuração cancelada.');
          return;
        }
      }

      // Criar configuração interativa
      const config = await this.createConfiguration();
      
      // Salvar configuração
      await this.saveConfiguration(config);
      
      // Criar arquivo .env se necessário
      await this.createEnvFile();
      
      // Testar configuração
      await this.testConfiguration();
      
      console.log('\n✅ Configuração concluída com sucesso!');
      console.log('\n📋 Próximos passos:');
      console.log('1. Edite o arquivo config/multi-connections.json com suas credenciais');
      console.log('2. Execute: npm run test-connection');
      console.log('3. Execute: node examples/multi-connection-demo.js');
      
    } catch (error) {
      console.error('❌ Erro na configuração:', error.message);
    } finally {
      rl.close();
    }
  }

  async createConfiguration() {
    console.log('📝 Criando configuração de múltiplas conexões...\n');
    
    const config = {
      connections: {},
      defaultConnection: 'development',
      monitoring: {
        healthCheckInterval: 300000,
        schemaCheckInterval: 600000,
        performanceCheckInterval: 300000
      },
      alerts: {
        tablespaceUsageThreshold: 80,
        connectionThreshold: 100,
        performanceThreshold: 1000
      }
    };

    // Adicionar conexões
    const environments = ['development', 'testing', 'staging', 'production'];
    
    for (const env of environments) {
      console.log(`\n--- Configurando ambiente: ${env} ---`);
      
      const addConnection = await this.askQuestion(
        `Deseja adicionar conexão para ${env}? (y/N): `
      );
      
      if (addConnection.toLowerCase() === 'y') {
        const connection = await this.getConnectionDetails(env);
        config.connections[env] = connection;
      }
    }

    // Definir conexão padrão
    const availableConnections = Object.keys(config.connections);
    if (availableConnections.length > 0) {
      console.log(`\nConexões disponíveis: ${availableConnections.join(', ')}`);
      const defaultConn = await this.askQuestion(
        `Qual será a conexão padrão? (${availableConnections[0]}): `
      );
      config.defaultConnection = defaultConn || availableConnections[0];
    }

    return config;
  }

  async getConnectionDetails(environment) {
    const host = await this.askQuestion(`Host do servidor Oracle para ${environment}: `);
    const port = await this.askQuestion(`Porta (1521): `) || '1521';
    const serviceName = await this.askQuestion(`Service Name para ${environment}: `);
    const user = await this.askQuestion(`Usuário para ${environment}: `);
    const password = await this.askQuestion(`Senha para ${environment}: `);
    const description = await this.askQuestion(`Descrição para ${environment}: `) || 
      `Banco de ${environment}`;

    return {
      user,
      password,
      connectString: `${host}:${port}/${serviceName}`,
      description,
      environment,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1
    };
  }

  async saveConfiguration(config) {
    console.log('\n💾 Salvando configuração...');
    
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(
      this.configPath, 
      JSON.stringify(config, null, 2)
    );
    
    console.log(`✅ Configuração salva em: ${this.configPath}`);
  }

  async createEnvFile() {
    const envPath = './.env';
    
    if (!fs.existsSync(envPath)) {
      console.log('\n📄 Criando arquivo .env...');
      
      const envContent = `# Configurações do Oracle Database (Fallback)
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=ORCL
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password

# Configurações do MCP Server
MCP_SERVER_NAME=oracle-monitor
MCP_SERVER_VERSION=1.0.0

# Configurações de Log
LOG_LEVEL=info
LOG_FILE=logs/oracle-mcp.log

# Configurações de Monitoramento
MONITOR_INTERVAL=300000
CRITICAL_SCHEMAS=HR,SCOTT,SYSTEM
SENSITIVE_TABLES=USERS,ACCOUNTS,TRANSACTIONS

# Configurações de Notificação
NOTIFICATION_ENABLED=true
NOTIFICATION_EMAIL=admin@company.com
`;
      
      fs.writeFileSync(envPath, envContent);
      console.log(`✅ Arquivo .env criado em: ${envPath}`);
    }
  }

  async testConfiguration() {
    console.log('\n🔍 Testando configuração...');
    
    try {
      const { ConnectionManager } = await import('../src/connection-manager.js');
      const connectionManager = new ConnectionManager();
      
      const connections = connectionManager.getAvailableConnections();
      console.log(`✅ ${connections.length} conexão(ões) configurada(s)`);
      
      // Testar conexões disponíveis
      for (const conn of connections) {
        console.log(`   - ${conn.name}: ${conn.description}`);
      }
      
    } catch (error) {
      console.log(`⚠️ Erro ao testar configuração: ${error.message}`);
    }
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }
}

// Executar setup se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new MultiConnectionSetup();
  setup.run().catch(console.error);
}

export { MultiConnectionSetup };
