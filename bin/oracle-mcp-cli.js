#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho para o arquivo principal
const mainFile = join(__dirname, '..', 'src', 'index.js');
const projectRoot = join(__dirname, '..');

// Função para mostrar ajuda
function showHelp() {
  console.log(`
Oracle Node MCP Server

USAGE:
  npx oracle-mcp [COMMAND] [OPTIONS]

COMMANDS:
  start                 Iniciar servidor MCP (padrão)
  test-connection       Testar conexão com Oracle
  setup-cursor          Configurar Cursor IDE automaticamente
  setup-claude          Configurar Claude Desktop automaticamente
  version               Mostrar versão
  help                  Mostrar esta ajuda

EXAMPLES:
  npx oracle-mcp                           # Iniciar servidor
  npx oracle-mcp test-connection           # Testar conexão
  npx oracle-mcp setup-cursor              # Configurar Cursor
  npx oracle-mcp --help                    # Mostrar ajuda

CONFIGURAÇÃO:
  Configure suas credenciais Oracle no arquivo .env:
    ORACLE_HOST=localhost
    ORACLE_PORT=1521
    ORACLE_SERVICE_NAME=ORCL
    ORACLE_USER=seu_usuario
    ORACLE_PASSWORD=sua_senha

DOCUMENTAÇÃO:
  https://github.com/lrferr/oracle-node-mcp
`);
}

// Função para mostrar versão
function showVersion() {
  const packageJson = JSON.parse(fs.readFileSync(join(projectRoot, 'package.json'), 'utf8'));
  console.log(`Oracle Node MCP Server v${packageJson.version}`);
}

// Função para testar conexão
async function testConnection() {
  console.log('🔍 Testando conexão Oracle...\n');
  
  try {
    const { spawn } = await import('child_process');
    const testScript = join(projectRoot, 'scripts', 'test-connection.js');
    
    const child = spawn('node', [testScript], {
      stdio: 'inherit',
      cwd: projectRoot
    });
    
    child.on('exit', (code) => {
      process.exit(code);
    });
  } catch (error) {
    console.error('❌ Erro ao executar teste de conexão:', error.message);
    process.exit(1);
  }
}

// Função para configurar Cursor
async function setupCursor() {
  console.log('🔧 Configurando Cursor IDE...\n');
  
  try {
    const { spawn } = await import('child_process');
    const setupScript = join(projectRoot, 'scripts', 'quick-setup.js');
    
    const child = spawn('node', [setupScript], {
      stdio: 'inherit',
      cwd: projectRoot
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        console.log('\n✅ Configuração do Cursor concluída!');
        console.log('📋 Próximos passos:');
        console.log('1. Reinicie o Cursor IDE');
        console.log('2. Abra uma nova conversa');
        console.log('3. Digite: "Verifique a saúde do banco Oracle"');
      }
      process.exit(code);
    });
  } catch (error) {
    console.error('❌ Erro ao configurar Cursor:', error.message);
    process.exit(1);
  }
}

// Função para configurar Claude Desktop
async function setupClaude() {
  console.log('🔧 Configurando Claude Desktop...\n');
  
  try {
    const { spawn } = await import('child_process');
    const setupScript = join(projectRoot, 'scripts', 'quick-setup.js');
    
    const child = spawn('node', [setupScript], {
      stdio: 'inherit',
      cwd: projectRoot
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        console.log('\n✅ Configuração do Claude Desktop concluída!');
        console.log('📋 Próximos passos:');
        console.log('1. Reinicie o Claude Desktop');
        console.log('2. Abra uma nova conversa');
        console.log('3. Digite: "Verifique a saúde do banco Oracle"');
      }
      process.exit(code);
    });
  } catch (error) {
    console.error('❌ Erro ao configurar Claude Desktop:', error.message);
    process.exit(1);
  }
}

// Função para iniciar servidor
function startServer() {
  // Não enviar mensagens para stdout (usado pelo MCP)
  
  const child = spawn('node', [mainFile], {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production'
    }
  });

  child.on('error', (error) => {
    console.error('Erro ao iniciar Oracle MCP Server:', error.message);
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Oracle MCP Server encerrado com código ${code}`);
      process.exit(code);
    }
  });

  // Tratar sinais de interrupção
  process.on('SIGINT', () => {
    child.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
  });
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0] || 'start';

switch (command) {
  case 'start':
    startServer();
    break;
    
  case 'test-connection':
    testConnection();
    break;
    
  case 'setup-cursor':
    setupCursor();
    break;
    
  case 'setup-claude':
    setupClaude();
    break;
    
  case 'version':
    showVersion();
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    console.error(`❌ Comando desconhecido: ${command}`);
    console.log('Execute "npx oracle-mcp --help" para ver os comandos disponíveis.');
    process.exit(1);
}
