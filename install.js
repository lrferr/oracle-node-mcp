#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Oracle Node MCP Server - Instalação Automática\n');

async function install() {
  try {
    // 1. Verificar Node.js
    console.log('1️⃣ Verificando Node.js...');
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      console.error('❌ Node.js 18+ é necessário. Versão atual:', nodeVersion);
      process.exit(1);
    }
    console.log(`✅ Node.js ${nodeVersion} (compatível)\n`);

    // 2. Instalar dependências
    console.log('2️⃣ Instalando dependências...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas\n');

    // 3. Criar diretórios necessários
    console.log('3️⃣ Criando estrutura de diretórios...');
    const directories = ['logs', 'config', 'backups', 'migrations', 'reports'];
    
    for (const dir of directories) {
      await fs.mkdir(path.join(__dirname, dir), { recursive: true });
      console.log(`   ✅ ${dir}/`);
    }
    console.log('');

    // 4. Configurar arquivo .env
    console.log('4️⃣ Configurando arquivo .env...');
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, 'env.example');
    
    try {
      await fs.access(envPath);
      console.log('   ⚠️  .env já existe (não sobrescrevendo)');
    } catch {
      await fs.copyFile(envExamplePath, envPath);
      console.log('   ✅ .env criado a partir do exemplo');
    }
    console.log('');

    // 5. Criar arquivos de configuração
    console.log('5️⃣ Criando arquivos de configuração...');
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

    await fs.writeFile(
      path.join(__dirname, 'config', 'oracle.json'),
      JSON.stringify(oracleConfig, null, 2)
    );
    console.log('   ✅ config/oracle.json');

    // 6. Criar arquivos de log iniciais
    console.log('6️⃣ Inicializando sistema de logs...');
    const logFiles = [
      'logs/oracle-mcp.log',
      'logs/error.log',
      'logs/notifications.log'
    ];

    for (const logFile of logFiles) {
      await fs.writeFile(path.join(__dirname, logFile), '');
      console.log(`   ✅ ${logFile}`);
    }
    console.log('');

    // 7. Tornar scripts executáveis
    console.log('7️⃣ Configurando scripts...');
    try {
      execSync('chmod +x scripts/*.js', { stdio: 'pipe' });
      console.log('   ✅ Scripts configurados como executáveis');
    } catch {
      console.log('   ⚠️  Não foi possível configurar permissões (Windows?)');
    }
    console.log('');

    // 8. Verificar instalação
    console.log('8️⃣ Verificando instalação...');
    
    // Verificar se node_modules existe
    try {
      await fs.access(path.join(__dirname, 'node_modules'));
      console.log('   ✅ node_modules encontrado');
    } catch {
      console.log('   ❌ node_modules não encontrado');
    }

    // Verificar se arquivos principais existem
    const mainFiles = [
      'src/index.js',
      'src/oracle-monitor.js',
      'src/migration-validator.js',
      'src/notification-service.js',
      'src/logger.js'
    ];

    for (const file of mainFiles) {
      try {
        await fs.access(path.join(__dirname, file));
        console.log(`   ✅ ${file}`);
      } catch {
        console.log(`   ❌ ${file} não encontrado`);
      }
    }
    console.log('');

    // 9. Instruções finais
    console.log('🎉 Instalação concluída com sucesso!\n');
    console.log('📋 Próximos passos:');
    console.log('1. Configure suas credenciais Oracle no arquivo .env');
    console.log('2. Teste a conexão: node scripts/test-connection.js');
    console.log('3. Inicie o servidor: npm start');
    console.log('4. Consulte o README.md para mais informações\n');
    
    console.log('🔧 Comandos úteis:');
    console.log('   npm start          - Iniciar servidor MCP');
    console.log('   npm run dev        - Modo desenvolvimento');
    console.log('   npm test           - Executar testes');
    console.log('   node scripts/test-connection.js - Testar conexão Oracle\n');

  } catch (error) {
    console.error('❌ Erro durante a instalação:', error.message);
    process.exit(1);
  }
}

install();
