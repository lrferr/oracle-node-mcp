#!/usr/bin/env node
/**
 * Configuração de Testes
 */

import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

export function getConnectionConfig() {
  return {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`
  };
}

export function hasDatabaseConfig() {
  const config = getConnectionConfig();
  return !!(config.user && config.password && config.connectString);
}

export function getTestTableName() {
  return `TEST_${Date.now()}`;
}
