#!/usr/bin/env node
/**
 * Script para testar e diagnosticar problemas de password verifier Oracle
 */

import oracledb from 'oracledb';
import { ConnectionManager } from '../src/connection-manager.js';
import { Logger } from '../src/logger.js';

const logger = new Logger();

async function testPasswordVerifier() {
  console.log('🔍 Testando Password Verifier Oracle...\n');

  try {
    // 1. Verificar modo atual do Oracle Client
    console.log('📋 Informações do Oracle Client:');
    console.log(`   Modo: ${oracledb.thin ? 'Thin' : 'Thick'}`);
    console.log(`   Versão: ${oracledb.version}`);
    console.log(`   Versão String: ${oracledb.versionString || 'N/A'}\n`);

    // 2. Tentar inicializar modo Thick se necessário
    if (oracledb.thin) {
      console.log('🔄 Tentando inicializar modo Thick...');
      
      const possiblePaths = [
        process.env.ORACLE_CLIENT_PATH,
        'C:\\oracle\\instantclient_21_8',
        'C:\\oracle\\instantclient_21_7',
        'C:\\oracle\\instantclient_21_6',
        'C:\\oracle\\instantclient_19_8',
        'C:\\oracle\\instantclient_19_7',
        'C:\\oracle\\instantclient_19_6',
        '/opt/oracle/instantclient_21_8',
        '/opt/oracle/instantclient_21_7',
        '/opt/oracle/instantclient_19_8',
        '/opt/oracle/instantclient_19_7'
      ].filter(Boolean);

      let thickInitialized = false;
      for (const clientPath of possiblePaths) {
        try {
          console.log(`   Tentando: ${clientPath}`);
          oracledb.initOracleClient({ libDir: clientPath });
          console.log(`   ✅ Modo Thick inicializado com: ${clientPath}`);
          thickInitialized = true;
          break;
        } catch (error) {
          console.log(`   ❌ Falha: ${error.message}`);
        }
      }

      if (!thickInitialized) {
        console.log('   ⚠️  Não foi possível inicializar modo Thick');
        console.log('   💡 Instale o Oracle Instant Client para resolver o problema');
      }
    } else {
      console.log('   ✅ Já está em modo Thick');
    }

    console.log('\n📊 Testando conexões...');

    // 3. Testar conexões
    const connectionManager = new ConnectionManager();
    const connections = connectionManager.getAvailableConnections();

    for (const conn of connections) {
      console.log(`\n🔗 Testando conexão: ${conn.name}`);
      const result = await connectionManager.testConnection(conn.name);
      
      if (result.success) {
        console.log(`   ✅ ${result.message}`);
        console.log(`   📊 Modo: ${result.oracleMode}`);
        console.log(`   🔢 Versão: ${result.oracleVersion}`);
      } else {
        console.log(`   ❌ ${result.message}`);
        console.log(`   📊 Modo: ${result.oracleMode}`);
        console.log(`   🔢 Versão: ${result.oracleVersion}`);
        
        // Verificar se é erro de password verifier
        if (result.error.includes('password verifier type 0x939') || 
            result.error.includes('NJS-116')) {
          console.log('   🚨 ERRO DE PASSWORD VERIFIER DETECTADO!');
          console.log('   💡 Soluções:');
          console.log('      1. Instale Oracle Instant Client');
          console.log('      2. Atualize senha do usuário no banco');
          console.log('      3. Use modo Thick do driver');
        }
      }
    }

    // 4. Fechar conexões
    await connectionManager.closeAllConnections();

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    process.exit(1);
  }
}

// Executar teste
testPasswordVerifier().then(() => {
  console.log('\n✅ Teste concluído!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Erro fatal:', error.message);
  process.exit(1);
});
