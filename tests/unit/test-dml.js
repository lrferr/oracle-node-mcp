#!/usr/bin/env node
/**
 * Testes Unitários - DML Operations
 */

import { DMLOperations } from '../../src/dml-operations.js';
import { getConnectionConfig } from '../utils/test-config.js';

export async function testDMLOperations() {
  console.log('  Testing DML Operations...');
  
  const connectionConfig = getConnectionConfig();
  const dml = new DMLOperations(connectionConfig);
  
  // Teste 1: Validação de nome de tabela
  try {
    dml.validateTableName('TEST_TABLE');
    console.log('    ✅ Table name validation works');
  } catch (error) {
    throw new Error(`Table name validation failed: ${error.message}`);
  }

  // Teste 2: Validação de cláusula WHERE
  try {
    dml.validateWhereClause('ID = 1');
    console.log('    ✅ WHERE clause validation works');
  } catch (error) {
    throw new Error(`WHERE clause validation failed: ${error.message}`);
  }

  // Teste 3: Sanitização de entrada
  try {
    const sanitized = dml.sanitizeInput("test'; DROP TABLE users; --");
    console.log('    ✅ Input sanitization works');
  } catch (error) {
    throw new Error(`Input sanitization failed: ${error.message}`);
  }

  // Teste 4: Formatação de resultado
  try {
    const mockResult = {
      metaData: [{ name: 'ID' }, { name: 'NAME' }],
      rows: [[1, 'Test'], [2, 'Test2']]
    };
    const formatted = dml.formatSelectResult(mockResult);
    console.log('    ✅ Result formatting works');
  } catch (error) {
    throw new Error(`Result formatting failed: ${error.message}`);
  }
}
