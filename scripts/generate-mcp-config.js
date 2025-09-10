#!/usr/bin/env node

/**
 * Gerador de Configuração MCP para Múltiplas Conexões Oracle
 * 
 * Este script gera um arquivo de configuração MCP com múltiplas conexões
 * diretamente no JSON, eliminando a necessidade de arquivos separados.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class MCPConfigGenerator {
  constructor() {
    this.outputPath = './mcp-config-generated.json';
  }

  async run() {
    console.log('🚀 Gerador de Configuração MCP - Múltiplas Conexões Oracle\n');
    
    try {
      // Coletar informações
      const config = await this.collectConfiguration();
      
      // Gerar configuração MCP
      const mcpConfig = this.generateMCPConfig(config);
      
      // Salvar arquivo
      await this.saveConfig(mcpConfig);
      
      // Mostrar instruções
      this.showInstructions();
      
    } catch (error) {
      console.error('❌ Erro na geração:', error.message);
    } finally {
      rl.close();
    }
  }

  async collectConfiguration() {
    const config = {
      serverName: 'oracle-monitor',
      connections: {},
      defaultConnection: null
    };

    // Nome do servidor
    config.serverName = await this.askQuestion(
      'Nome do servidor MCP (oracle-monitor): '
    ) || 'oracle-monitor';

    // Adicionar conexões
    console.log('\n📝 Configurando conexões Oracle...\n');
    
    const environments = ['development', 'testing', 'staging', 'production'];
    
    for (const env of environments) {
      const addConnection = await this.askQuestion(
        `Adicionar conexão para ${env}? (y/N): `
      );
      
      if (addConnection.toLowerCase() === 'y') {
        const connection = await this.getConnectionDetails(env);
        config.connections[env] = connection;
        
        if (!config.defaultConnection) {
          config.defaultConnection = env;
        }
      }
    }

    // Definir conexão padrão
    const availableConnections = Object.keys(config.connections);
    if (availableConnections.length > 1) {
      console.log(`\nConexões disponíveis: ${availableConnections.join(', ')}`);
      const defaultConn = await this.askQuestion(
        `Qual será a conexão padrão? (${config.defaultConnection}): `
      );
      config.defaultConnection = defaultConn || config.defaultConnection;
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
      `Database de ${environment}`;

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

  generateMCPConfig(config) {
    // Criar configuração de conexões para a variável de ambiente
    const connectionsConfig = {
      connections: config.connections,
      defaultConnection: config.defaultConnection,
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

    // Gerar configuração MCP
    const mcpConfig = {
      mcpServers: {
        [config.serverName]: {
          command: "npx",
          args: ["oracle-mcp-v1"],
          env: {
            MCP_SERVER_NAME: config.serverName,
            MCP_SERVER_VERSION: "1.0.0",
            LOG_LEVEL: "info",
            ORACLE_CONNECTIONS: JSON.stringify(connectionsConfig)
          }
        }
      }
    };

    return mcpConfig;
  }

  async saveConfig(mcpConfig) {
    console.log('\n💾 Salvando configuração MCP...');
    
    fs.writeFileSync(
      this.outputPath, 
      JSON.stringify(mcpConfig, null, 2)
    );
    
    console.log(`✅ Configuração salva em: ${this.outputPath}`);
  }

  showInstructions() {
    console.log('\n📋 Próximos passos:');
    console.log('1. Copie o conteúdo do arquivo gerado para seu arquivo de configuração MCP');
    console.log('2. Substitua as credenciais pelos valores reais');
    console.log('3. Reinicie o Cursor/Claude');
    console.log('\n📁 Arquivo gerado: mcp-config-generated.json');
    console.log('\n🔧 Exemplo de uso:');
    console.log('await mcp.callTool("list_connections");');
    console.log('await mcp.callTool("check_database_health", { connectionName: "production" });');
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }
}

// Executar gerador se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new MCPConfigGenerator();
  generator.run().catch(console.error);
}

export { MCPConfigGenerator };
