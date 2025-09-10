#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configuração Rápida - Oracle MCP Server\n');

// Obter diretório do projeto
const projectRoot = path.join(__dirname, '..');
const projectPath = projectRoot.replace(/\\/g, '\\\\');

console.log('📁 Diretório do projeto:', projectRoot);

// Detectar sistema operacional
const os = process.platform;
let configPath = '';

if (os === 'win32') {
  configPath = path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
} else if (os === 'darwin') {
  configPath = path.join(process.env.HOME, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
} else if (os === 'linux') {
  configPath = path.join(process.env.HOME, '.config', 'claude', 'claude_desktop_config.json');
}

console.log('📄 Arquivo de configuração:', configPath);

// Configuração MCP
const mcpConfig = {
  mcpServers: {
    "oracle-monitor": {
      command: "node",
      args: [path.join(projectRoot, 'src', 'index.js')],
      env: {
        ORACLE_HOST: "your-oracle-host.com",
        ORACLE_PORT: "1521",
        ORACLE_SERVICE_NAME: "your_service_name",
        ORACLE_USER: "your_username",
        ORACLE_PASSWORD: "your_password",
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

async function setup() {
  try {
    // Criar diretório se não existir
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });
    console.log('✅ Diretório de configuração criado');

    // Criar backup se arquivo existir
    try {
      await fs.access(configPath);
      const backupPath = configPath + '.backup.' + new Date().toISOString().slice(0, 10);
      await fs.copyFile(configPath, backupPath);
      console.log('✅ Backup criado:', backupPath);
    } catch (error) {
      console.log('ℹ️  Arquivo de configuração não existe, criando novo');
    }

    // Salvar configuração
    await fs.writeFile(configPath, JSON.stringify(mcpConfig, null, 2));
    console.log('✅ Configuração MCP salva com sucesso!');

    console.log('\n📋 Próximos passos:');
    console.log('1. Reinicie o Cursor IDE');
    console.log('2. Abra uma nova conversa');
    console.log('3. Digite: "Verifique a saúde do banco Oracle"');
    console.log('4. Teste outras ferramentas disponíveis');

    console.log('\n🔧 Configuração salva em:');
    console.log(configPath);

    console.log('\n🎯 Ferramentas disponíveis:');
    console.log('- check_database_health');
    console.log('- get_table_info');
    console.log('- get_constraints');
    console.log('- get_foreign_keys');
    console.log('- get_indexes');
    console.log('- get_sequences');
    console.log('- get_triggers');
    console.log('- get_users_privileges');
    console.log('- get_table_dependencies');
    console.log('- analyze_table');
    console.log('- execute_safe_query');
    console.log('- validate_migration_script');
    console.log('- monitor_schema_changes');
    console.log('- check_sensitive_tables');
    console.log('- get_database_info');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

setup();
