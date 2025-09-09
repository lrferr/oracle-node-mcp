#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Oracle Node MCP Server - Pós-instalação\n');

async function postInstall() {
  try {
    // Criar diretórios necessários
    const projectRoot = path.join(__dirname, '..');
    const directories = ['logs', 'config', 'backups', 'migrations', 'reports'];
    
    for (const dir of directories) {
      const dirPath = path.join(projectRoot, dir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`✅ Diretório criado: ${dir}/`);
      } catch (error) {
        console.log(`⚠️  Diretório ${dir}/ já existe`);
      }
    }

    // Criar arquivo .env se não existir
    const envPath = path.join(projectRoot, '.env');
    const envExamplePath = path.join(projectRoot, 'env.example');
    
    try {
      await fs.access(envPath);
      console.log('✅ Arquivo .env já existe');
    } catch {
      try {
        await fs.copyFile(envExamplePath, envPath);
        console.log('✅ Arquivo .env criado a partir do exemplo');
      } catch (error) {
        console.log('⚠️  Não foi possível criar arquivo .env');
      }
    }

    // Criar arquivo de configuração Oracle
    const oracleConfigPath = path.join(projectRoot, 'config', 'oracle.json');
    const oracleConfig = {
      connection: {
        poolMin: 1,
        poolMax: 10,
        poolIncrement: 1,
        poolTimeout: 60,
        poolPingInterval: 60
      },
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

    try {
      await fs.writeFile(oracleConfigPath, JSON.stringify(oracleConfig, null, 2));
      console.log('✅ Configuração Oracle criada');
    } catch (error) {
      console.log('⚠️  Erro ao criar configuração Oracle');
    }

    console.log('\n📋 Próximos passos:');
    console.log('1. Configure suas credenciais Oracle no arquivo .env');
    console.log('2. Execute: npx oracle-mcp --test-connection');
    console.log('3. Configure no Cursor/Claude Desktop');
    console.log('4. Execute: npx oracle-mcp --setup-cursor');
    
    console.log('\n🔧 Comandos disponíveis:');
    console.log('  npx oracle-mcp                    - Iniciar servidor MCP');
    console.log('  npx oracle-mcp --test-connection  - Testar conexão Oracle');
    console.log('  npx oracle-mcp --setup-cursor     - Configurar Cursor IDE');
    console.log('  npx oracle-mcp --help             - Mostrar ajuda');
    
    console.log('\n📚 Documentação:');
    console.log('  https://github.com/oracle-mcp/oracle-node-mcp');
    
    console.log('\n✅ Instalação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a pós-instalação:', error.message);
    process.exit(1);
  }
}

postInstall();
