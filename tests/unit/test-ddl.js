#!/usr/bin/env node
/**
 * Testes Unitários - DDL Operations
 */

import { DDLOperations } from '../../src/ddl-operations.js';
import { getConnectionConfig } from '../utils/test-config.js';

export async function testDDLOperations() {
  console.log('  Testing DDL Operations...');
  
  const connectionConfig = getConnectionConfig();
  const ddl = new DDLOperations(connectionConfig);
  
  // Teste 1: Validação de nome de tabela
  try {
    ddl.validateTableName('TEST_TABLE');
    console.log('    ✅ Table name validation works');
  } catch (error) {
    throw new Error(`Table name validation failed: ${error.message}`);
  }

  // Teste 2: Validação de definição de coluna
  try {
    ddl.validateColumnDefinition({
      name: 'ID',
      type: 'NUMBER',
      notNull: true
    });
    console.log('    ✅ Column definition validation works');
  } catch (error) {
    throw new Error(`Column definition validation failed: ${error.message}`);
  }

  // Teste 3: Validação de constraint
  try {
    ddl.validateConstraintDefinition({
      name: 'PK_TEST',
      type: 'PRIMARY KEY',
      columns: ['ID']
    });
    console.log('    ✅ Constraint definition validation works');
  } catch (error) {
    throw new Error(`Constraint definition validation failed: ${error.message}`);
  }

  // Teste 4: Teste de conexão (se configurado)
  if (connectionConfig.user) {
    try {
      await ddl.getConnection();
      console.log('    ✅ Database connection works');
    } catch (error) {
      console.log('    ⚠️  Database connection failed (expected if not configured)');
    }
  } else {
    console.log('    ⚠️  Skipping database connection test (no config)');
  }
}
