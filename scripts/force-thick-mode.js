#!/usr/bin/env node
/**
 * Script para forçar modo Thick no MCP
 */

import oracledb from 'oracledb';

// Forçar inicialização do modo Thick
const clientPath = process.env.ORACLE_CLIENT_PATH || 'C:/oracle/instantclient_21_8/instantclient_21_8';

try {
  console.log('🔄 Forçando modo Thick...');
  oracledb.initOracleClient({ libDir: clientPath });
  console.log('✅ Modo Thick forçado com sucesso!');
  console.log('📊 Modo atual:', oracledb.thin ? 'Thin' : 'Thick');
} catch (error) {
  console.log('❌ Erro ao forçar modo Thick:', error.message);
}

// Exportar para uso em outros módulos
export { oracledb };

