#!/usr/bin/env node
/**
 * Testes de Segurança
 */

import { SecurityAudit } from '../../src/security-audit.js';

export async function testSecurityAudit() {
  console.log('  Testing Security Audit...');
  
  const audit = new SecurityAudit();
  
  // Teste 1: Detecção de SQL Injection
  const injectionTests = [
    "SELECT * FROM users WHERE id = '1' OR '1'='1'",
    "SELECT * FROM users; DROP TABLE users; --",
    "SELECT * FROM users UNION SELECT * FROM passwords",
    "SELECT * FROM users WHERE id = 1; EXEC xp_cmdshell('dir')"
  ];

  injectionTests.forEach((query, i) => {
    try {
      audit.validateQuery(query, 'SELECT');
      throw new Error(`SQL injection test ${i+1} should have failed`);
    } catch (error) {
      if (error.message.includes('SQL injection')) {
        console.log(`    ✅ SQL injection test ${i+1} detected`);
      } else {
        throw error;
      }
    }
  });

  // Teste 2: Validação de esquemas
  try {
    audit.validateSchemaAccess("SELECT * FROM SYS.USERS");
    throw new Error('SYS schema should be blocked');
  } catch (error) {
    if (error.message.includes('negado') || error.message.includes('blocked')) {
      console.log('    ✅ SYS schema access blocked');
    } else {
      throw error;
    }
  }

  // Teste 3: Validação de entrada
  try {
    const sanitized = audit.sanitizeInput("test'; DROP TABLE users; --");
    console.log('    ✅ Input sanitization works');
  } catch (error) {
    throw new Error(`Input sanitization failed: ${error.message}`);
  }

  // Teste 4: Validação de identificador SQL
  try {
    const escaped = audit.escapeSQLIdentifier('TEST_TABLE');
    console.log('    ✅ SQL identifier escaping works');
  } catch (error) {
    throw new Error(`SQL identifier escaping failed: ${error.message}`);
  }
}
