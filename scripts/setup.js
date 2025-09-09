#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SetupScript {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
  }

  async run() {
    console.log('🚀 Configurando Oracle Node MCP Server...\n');

    try {
      await this.createDirectories();
      await this.createConfigFiles();
      await this.setupLogging();
      await this.validateEnvironment();
      
      console.log('✅ Configuração concluída com sucesso!');
      console.log('\n📋 Próximos passos:');
      console.log('1. Configure suas credenciais Oracle no arquivo .env');
      console.log('2. Execute: npm install');
      console.log('3. Execute: npm start');
      console.log('\n📚 Consulte o README.md para mais informações.');
      
    } catch (error) {
      console.error('❌ Erro durante a configuração:', error.message);
      process.exit(1);
    }
  }

  async createDirectories() {
    console.log('📁 Criando diretórios...');
    
    const directories = [
      'logs',
      'scripts',
      'config',
      'backups',
      'migrations'
    ];

    for (const dir of directories) {
      const dirPath = path.join(this.projectRoot, dir);
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`  ✅ ${dir}/`);
      } catch (error) {
        console.log(`  ⚠️  ${dir}/ (já existe)`);
      }
    }
  }

  async createConfigFiles() {
    console.log('\n⚙️  Criando arquivos de configuração...');

    // Verificar se .env já existe
    const envPath = path.join(this.projectRoot, '.env');
    try {
      await fs.access(envPath);
      console.log('  ⚠️  .env (já existe, não sobrescrevendo)');
    } catch {
      // Copiar do exemplo
      const envExamplePath = path.join(this.projectRoot, 'env.example');
      try {
        await fs.copyFile(envExamplePath, envPath);
        console.log('  ✅ .env (criado a partir do exemplo)');
      } catch (error) {
        console.log('  ⚠️  .env (não foi possível criar)');
      }
    }

    // Criar arquivo de configuração do Oracle
    const oracleConfigPath = path.join(this.projectRoot, 'config', 'oracle.json');
    const oracleConfig = {
      connection: {
        poolMin: 1,
        poolMax: 10,
        poolIncrement: 1,
        poolTimeout: 60,
        poolPingInterval: 60
      },
      monitoring: {
        healthCheckInterval: 300000, // 5 minutos
        schemaCheckInterval: 600000, // 10 minutos
        performanceCheckInterval: 300000 // 5 minutos
      },
      alerts: {
        tablespaceUsageThreshold: 80,
        connectionThreshold: 100,
        performanceThreshold: 1000
      }
    };

    try {
      await fs.writeFile(oracleConfigPath, JSON.stringify(oracleConfig, null, 2));
      console.log('  ✅ config/oracle.json');
    } catch (error) {
      console.log('  ⚠️  config/oracle.json (erro ao criar)');
    }
  }

  async setupLogging() {
    console.log('\n📝 Configurando sistema de logs...');

    const logFiles = [
      'logs/oracle-mcp.log',
      'logs/error.log',
      'logs/notifications.log'
    ];

    for (const logFile of logFiles) {
      const logPath = path.join(this.projectRoot, logFile);
      try {
        await fs.writeFile(logPath, '');
        console.log(`  ✅ ${logFile}`);
      } catch (error) {
        console.log(`  ⚠️  ${logFile} (erro ao criar)`);
      }
    }
  }

  async validateEnvironment() {
    console.log('\n🔍 Validando ambiente...');

    // Verificar Node.js
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion >= 18) {
      console.log(`  ✅ Node.js ${nodeVersion} (compatível)`);
    } else {
      console.log(`  ❌ Node.js ${nodeVersion} (requer versão 18+)`);
      throw new Error('Versão do Node.js incompatível');
    }

    // Verificar se package.json existe
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    try {
      await fs.access(packageJsonPath);
      console.log('  ✅ package.json encontrado');
    } catch {
      console.log('  ❌ package.json não encontrado');
      throw new Error('package.json não encontrado');
    }

    // Verificar se node_modules existe
    const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    try {
      await fs.access(nodeModulesPath);
      console.log('  ✅ node_modules encontrado');
    } catch {
      console.log('  ⚠️  node_modules não encontrado (execute: npm install)');
    }
  }
}

// Executar script se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new SetupScript();
  setup.run();
}
