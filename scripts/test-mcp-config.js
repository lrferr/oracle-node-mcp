#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MCPConfigTester {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.configPaths = this.getConfigPaths();
  }

  getConfigPaths() {
    const os = process.platform;
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    
    const paths = [];
    
    if (os === 'win32') {
      paths.push({
        name: 'Windows (Claude Desktop)',
        path: path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json')
      });
    } else if (os === 'darwin') {
      paths.push({
        name: 'macOS (Claude Desktop)',
        path: path.join(homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json')
      });
    } else if (os === 'linux') {
      paths.push({
        name: 'Linux (Claude Desktop)',
        path: path.join(homeDir, '.config', 'claude', 'claude_desktop_config.json')
      });
    }
    
    return paths;
  }

  async testConfiguration() {
    console.log('🔍 Testando configuração MCP Oracle...\n');

    // 1. Verificar se o projeto está configurado
    await this.testProjectSetup();
    
    // 2. Verificar arquivos de configuração
    await this.testConfigFiles();
    
    // 3. Verificar conectividade Oracle
    await this.testOracleConnection();
    
    // 4. Gerar configuração MCP
    await this.generateMCPConfig();
    
    console.log('\n✅ Teste de configuração concluído!');
  }

  async testProjectSetup() {
    console.log('1️⃣ Verificando configuração do projeto...');
    
    const requiredFiles = [
      'package.json',
      'src/index.js',
      'src/oracle-monitor.js',
      '.env'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      try {
        await fs.access(filePath);
        console.log(`   ✅ ${file}`);
      } catch (error) {
        console.log(`   ❌ ${file} - Arquivo não encontrado`);
      }
    }
    
    // Verificar se node_modules existe
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    try {
      await fs.access(nodeModulesPath);
      console.log('   ✅ node_modules');
    } catch (error) {
      console.log('   ❌ node_modules - Execute: npm install');
    }
    
    console.log('');
  }

  async testConfigFiles() {
    console.log('2️⃣ Verificando arquivos de configuração...');
    
    for (const configPath of this.configPaths) {
      try {
        await fs.access(configPath.path);
        console.log(`   ✅ ${configPath.name}: ${configPath.path}`);
        
        // Verificar se contém configuração Oracle
        const content = await fs.readFile(configPath.path, 'utf8');
        const config = JSON.parse(content);
        
        if (config.mcpServers && config.mcpServers['oracle-monitor']) {
          console.log(`   ✅ Configuração Oracle encontrada`);
        } else {
          console.log(`   ⚠️  Configuração Oracle não encontrada`);
        }
      } catch (error) {
        console.log(`   ❌ ${configPath.name}: ${configPath.path} - Arquivo não encontrado`);
      }
    }
    
    console.log('');
  }

  async testOracleConnection() {
    console.log('3️⃣ Testando conexão Oracle...');
    
    try {
      // Carregar variáveis de ambiente
      const dotenv = await import('dotenv');
      dotenv.config();
      
      const oracledb = await import('oracledb');
      
      const connectionConfig = {
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`
      };
      
      console.log(`   Host: ${process.env.ORACLE_HOST}`);
      console.log(`   Port: ${process.env.ORACLE_PORT}`);
      console.log(`   Service: ${process.env.ORACLE_SERVICE_NAME}`);
      console.log(`   User: ${process.env.ORACLE_USER}`);
      
      const connection = await oracledb.getConnection(connectionConfig);
      console.log('   ✅ Conexão Oracle estabelecida com sucesso!');
      
      // Testar query básica
      const result = await connection.execute('SELECT user FROM dual');
      console.log(`   ✅ Query de teste executada: ${result.rows[0][0]}`);
      
      await connection.close();
    } catch (error) {
      console.log(`   ❌ Erro na conexão Oracle: ${error.message}`);
    }
    
    console.log('');
  }

  async generateMCPConfig() {
    console.log('4️⃣ Gerando configuração MCP...');
    
    const mcpConfig = {
      mcpServers: {
        "oracle-monitor": {
          command: "node",
          args: [path.join(this.projectRoot, 'src', 'index.js').replace(/\\/g, '\\\\')],
          env: {
            ORACLE_HOST: process.env.ORACLE_HOST || "localhost",
            ORACLE_PORT: process.env.ORACLE_PORT || "1521",
            ORACLE_SERVICE_NAME: process.env.ORACLE_SERVICE_NAME || "ORCL",
            ORACLE_USER: process.env.ORACLE_USER || "your_username",
            ORACLE_PASSWORD: process.env.ORACLE_PASSWORD || "your_password",
            MCP_SERVER_NAME: "oracle-monitor",
            MCP_SERVER_VERSION: "1.0.0",
            LOG_LEVEL: "info",
            LOG_FILE: "logs/oracle-mcp.log",
            MONITOR_INTERVAL: "300000",
            CRITICAL_SCHEMAS: "HR,SCOTT,SYSTEM",
            SENSITIVE_TABLES: "USERS,ACCOUNTS,TRANSACTIONS",
            NOTIFICATION_ENABLED: "true",
            NOTIFICATION_EMAIL: "admin@company.com"
          }
        }
      }
    };
    
    // Salvar configuração em arquivo
    const configFile = path.join(this.projectRoot, 'mcp-config.json');
    await fs.writeFile(configFile, JSON.stringify(mcpConfig, null, 2));
    console.log(`   ✅ Configuração salva em: ${configFile}`);
    
    // Mostrar instruções
    console.log('\n📋 Instruções de configuração:');
    console.log('1. Copie o conteúdo do arquivo mcp-config.json');
    console.log('2. Cole no arquivo de configuração do Claude Desktop:');
    
    for (const configPath of this.configPaths) {
      console.log(`   - ${configPath.name}: ${configPath.path}`);
    }
    
    console.log('\n3. Reinicie o Cursor/Claude Desktop');
    console.log('4. Teste com: "Verifique a saúde do banco Oracle"');
  }
}

// Executar teste se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new MCPConfigTester();
  tester.testConfiguration().catch(console.error);
}
