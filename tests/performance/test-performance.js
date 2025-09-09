#!/usr/bin/env node
/**
 * Testes de Performance
 */

import { SecurityAudit } from '../../src/security-audit.js';
import { getConnectionConfig } from '../utils/test-config.js';

export async function testPerformance() {
  console.log('  Testing Performance...');
  
  const audit = new SecurityAudit();
  
  // Teste 1: Performance de validação de SQL injection
  const startTime = Date.now();
  const iterations = 1000;
  
  for (let i = 0; i < iterations; i++) {
    try {
      audit.validateQuery(`SELECT * FROM table${i} WHERE id = ${i}`, 'SELECT');
    } catch (error) {
      // Esperado que falhe para alguns casos
    }
  }
  
  const endTime = Date.now();
  const avgTime = (endTime - startTime) / iterations;
  
  console.log(`    ✅ SQL injection validation: ${avgTime.toFixed(2)}ms per query`);
  
  // Teste 2: Performance de sanitização
  const sanitizeStart = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    audit.sanitizeInput(`test${i}'; DROP TABLE users; --`);
  }
  
  const sanitizeEnd = Date.now();
  const sanitizeAvgTime = (sanitizeEnd - sanitizeStart) / iterations;
  
  console.log(`    ✅ Input sanitization: ${sanitizeAvgTime.toFixed(2)}ms per input`);
  
  // Teste 3: Performance de escape de identificador
  const escapeStart = Date.now();
  
  for (let i = 0; i < iterations; i++) {
    audit.escapeSQLIdentifier(`TABLE_${i}`);
  }
  
  const escapeEnd = Date.now();
  const escapeAvgTime = (escapeEnd - escapeStart) / iterations;
  
  console.log(`    ✅ SQL identifier escaping: ${escapeAvgTime.toFixed(2)}ms per identifier`);
}
