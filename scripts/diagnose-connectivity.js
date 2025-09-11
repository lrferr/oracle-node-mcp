#!/usr/bin/env node
/**
 * Script de Diagnóstico de Conectividade Oracle
 * Execute este script para diagnosticar problemas de conectividade
 */

import oracledb from 'oracledb';
import fs from 'fs';
import os from 'os';

console.log('🔍 Oracle MCP - Diagnóstico de Conectividade\n');
console.log('=' .repeat(60));

// 1. Informações do Sistema
console.log('\n📋 Informações do Sistema:');
console.log(`   Sistema Operacional: ${os.platform()} ${os.arch()}`);
console.log(`   Node.js: ${process.version}`);
console.log(`   Oracle Driver: ${oracledb.versionString || oracledb.version}`);

// 2. Verificar modo Oracle
console.log('\n🔧 Modo Oracle Client:');
console.log(`   Modo atual: ${oracledb.thin ? 'Thin' : 'Thick'}`);
if (oracledb.thin) {
  console.log('   ⚠️  Modo Thin ativo - pode ter limitações de compatibilidade');
} else {
  console.log('   ✅ Modo Thick ativo - suporte completo');
}

// 3. Verificar variáveis de ambiente
console.log('\n🌍 Variáveis de Ambiente:');
const oracleClientPath = process.env.ORACLE_CLIENT_PATH;
console.log(`   ORACLE_CLIENT_PATH: ${oracleClientPath || 'NÃO DEFINIDA'}`);
console.log(`   PATH contém oracle: ${process.env.PATH?.includes('oracle') ? 'SIM' : 'NÃO'}`);

// 4. Verificar Oracle Instant Client
console.log('\n📁 Verificação do Oracle Instant Client:');
const possiblePaths = [
  oracleClientPath,
  'C:\\oracle\\instantclient_21_8\\instantclient_21_8',
  'C:\\oracle\\instantclient_21_8',
  'C:\\oracle\\instantclient_21_7\\instantclient_21_7',
  'C:\\oracle\\instantclient_19_8\\instantclient_19_8',
  '/opt/oracle/instantclient_21_8/instantclient_21_8',
  '/opt/oracle/instantclient_21_7/instantclient_21_7',
  '/opt/oracle/instantclient_19_8/instantclient_19_8'
].filter(Boolean);

let foundPaths = [];
let hasOciDll = false;

for (const path of possiblePaths) {
  if (fs.existsSync(path)) {
    console.log(`   ✅ Encontrado: ${path}`);
    foundPaths.push(path);
    
    // Verificar se tem oci.dll (Windows) ou libclntsh.so (Linux)
    const ociFile = os.platform() === 'win32' ? 'oci.dll' : 'libclntsh.so';
    if (fs.existsSync(`${path}/${ociFile}`)) {
      console.log(`      ✅ ${ociFile} encontrado`);
      hasOciDll = true;
    } else {
      console.log(`      ⚠️  ${ociFile} não encontrado`);
    }
  } else {
    console.log(`   ❌ Não encontrado: ${path}`);
  }
}

// 5. Tentar inicializar modo Thick
if (foundPaths.length > 0 && oracledb.thin) {
  console.log('\n🔄 Tentando inicializar modo Thick...');
  
  let thickInitialized = false;
  for (const clientPath of foundPaths) {
    try {
      console.log(`   Tentando: ${clientPath}`);
      oracledb.initOracleClient({ libDir: clientPath });
      console.log(`   ✅ Modo Thick inicializado com: ${clientPath}`);
      console.log(`   📊 Modo atual: ${oracledb.thin ? 'Thin' : 'Thick'}`);
      thickInitialized = true;
      break;
    } catch (error) {
      console.log(`   ❌ Falha: ${error.message}`);
    }
  }
  
  if (!thickInitialized) {
    console.log('   ⚠️  Não foi possível inicializar modo Thick');
  }
}

// 6. Verificar configuração MCP
console.log('\n⚙️  Verificação da Configuração MCP:');
const mcpConfigPath = os.platform() === 'win32' 
  ? `${os.homedir()}\\.cursor\\mcp.json`
  : `${os.homedir()}/.cursor/mcp.json`;

if (fs.existsSync(mcpConfigPath)) {
  console.log(`   ✅ Arquivo MCP encontrado: ${mcpConfigPath}`);
  try {
    const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    const oracleServer = mcpConfig.mcpServers?.['oracle-monitor-2'];
    
    if (oracleServer) {
      console.log('   ✅ Servidor oracle-monitor-2 configurado');
      console.log(`   📊 Versão: ${oracleServer.command}`);
      
      if (oracleServer.env?.ORACLE_CLIENT_PATH) {
        console.log(`   ✅ ORACLE_CLIENT_PATH configurado: ${oracleServer.env.ORACLE_CLIENT_PATH}`);
      } else {
        console.log('   ⚠️  ORACLE_CLIENT_PATH não configurado no MCP');
      }
      
      if (oracleServer.env?.ORACLE_CONNECTIONS) {
        console.log('   ✅ ORACLE_CONNECTIONS configurado');
        try {
          const connections = JSON.parse(oracleServer.env.ORACLE_CONNECTIONS);
          const connNames = Object.keys(connections.connections || {});
          console.log(`   📊 Conexões: ${connNames.join(', ')}`);
        } catch (e) {
          console.log('   ⚠️  Erro ao parsear ORACLE_CONNECTIONS');
        }
      } else {
        console.log('   ⚠️  ORACLE_CONNECTIONS não configurado');
      }
    } else {
      console.log('   ❌ Servidor oracle-monitor-2 não encontrado na configuração');
    }
  } catch (error) {
    console.log(`   ❌ Erro ao ler configuração MCP: ${error.message}`);
  }
} else {
  console.log(`   ❌ Arquivo MCP não encontrado: ${mcpConfigPath}`);
}

// 7. Resumo e Recomendações
console.log('\n' + '=' .repeat(60));
console.log('📋 RESUMO E RECOMENDAÇÕES:');
console.log('=' .repeat(60));

if (oracledb.thin) {
  console.log('\n⚠️  PROBLEMA DETECTADO: Modo Thin ativo');
  console.log('   • Pode causar erro "password verifier type 0x939 not supported"');
  console.log('   • Recomendação: Instalar Oracle Instant Client');
  
  if (foundPaths.length === 0) {
    console.log('\n🔧 SOLUÇÃO:');
    console.log('   1. Execute: scripts\\install-oracle-simple.bat (Windows)');
    console.log('   2. Ou: sudo ./scripts/install-oracle-client.sh (Linux/macOS)');
    console.log('   3. Reinicie o Cursor/Claude');
  } else if (!hasOciDll) {
    console.log('\n🔧 SOLUÇÃO:');
    console.log('   • Oracle Instant Client encontrado mas incompleto');
    console.log('   • Reinstale o Oracle Instant Client completo');
  } else {
    console.log('\n🔧 SOLUÇÃO:');
    console.log('   • Oracle Instant Client instalado mas não configurado no MCP');
    console.log('   • Adicione ORACLE_CLIENT_PATH na configuração MCP');
    console.log('   • Reinicie o Cursor/Claude');
  }
} else {
  console.log('\n✅ SISTEMA OK: Modo Thick ativo');
  console.log('   • Suporte completo ao Oracle');
  console.log('   • Compatível com verificadores de senha antigos');
}

console.log('\n📚 Para mais informações:');
console.log('   • Guia de Troubleshooting: documentation/pt/guides/TROUBLESHOOTING-ORACLE-CONNECTIVITY.md');
console.log('   • Documentação: documentation/pt/README.md');
console.log('   • Issues: https://github.com/lrferr/oracle-node-mcp/issues');

console.log('\n✅ Diagnóstico concluído!');
