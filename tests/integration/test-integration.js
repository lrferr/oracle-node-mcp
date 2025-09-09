#!/usr/bin/env node
/**
 * Testes de Integração
 */

import { DDLOperations } from '../../src/ddl-operations.js';
import { DMLOperations } from '../../src/dml-operations.js';
import { DCLOperations } from '../../src/dcl-operations.js';
import { SecurityAudit } from '../../src/security-audit.js';
import { getConnectionConfig } from '../utils/test-config.js';

export async function testIntegration() {
  console.log('  Testing Integration...');
  
  const connectionConfig = getConnectionConfig();
  
  // Teste 1: Verificar se todos os módulos podem ser importados
  try {
    const ddl = new DDLOperations(connectionConfig);
    const dml = new DMLOperations(connectionConfig);
    const dcl = new DCLOperations(connectionConfig);
    const audit = new SecurityAudit();
    console.log('    ✅ All modules can be instantiated');
  } catch (error) {
    throw new Error(`Module instantiation failed: ${error.message}`);
  }

  // Teste 2: Verificar se as validações funcionam juntas
  try {
    const audit = new SecurityAudit();
    const ddl = new DDLOperations(connectionConfig);
    
    // Testar validação de tabela
    audit.validateTableName('TEST_TABLE');
    ddl.validateTableName('TEST_TABLE');
    console.log('    ✅ Cross-module validation works');
  } catch (error) {
    throw new Error(`Cross-module validation failed: ${error.message}`);
  }

  // Teste 3: Verificar se o audit pode ser configurado
  try {
    const audit = new SecurityAudit();
    audit.updateSecurityConfig({
      maxQueryLength: 5000,
      allowedSchemas: ['TEST']
    });
    console.log('    ✅ Security configuration works');
  } catch (error) {
    throw new Error(`Security configuration failed: ${error.message}`);
  }
}
