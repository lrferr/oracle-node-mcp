#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminho para o arquivo principal
const mainFile = join(__dirname, '..', 'src', 'index.js');

// Executar o servidor MCP
const child = spawn('node', [mainFile], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Carregar variáveis de ambiente do arquivo .env se existir
    NODE_ENV: process.env.NODE_ENV || 'production'
  }
});

child.on('error', (error) => {
  console.error('❌ Erro ao iniciar Oracle MCP Server:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Oracle MCP Server encerrado com código ${code}`);
    process.exit(code);
  }
});

// Tratar sinais de interrupção
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando Oracle MCP Server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Encerrando Oracle MCP Server...');
  child.kill('SIGTERM');
});
