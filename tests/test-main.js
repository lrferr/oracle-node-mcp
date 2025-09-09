#!/usr/bin/env node
/**
 * Teste Principal - Executa todos os testes
 */

import { testDDLOperations } from './unit/test-ddl.js';
import { testDMLOperations } from './unit/test-dml.js';
import { testDCLOperations } from './unit/test-dcl.js';
import { testSecurityAudit } from './security/test-security.js';
import { testIntegration } from './integration/test-integration.js';
import { testPerformance } from './performance/test-performance.js';

console.log('ï¿½ï¿½ Oracle MCP - Test Suite');
console.log('==========================\n');

async function runAllTests() {
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'DDL Operations', fn: testDDLOperations },
    { name: 'DML Operations', fn: testDMLOperations },
    { name: 'DCL Operations', fn: testDCLOperations },
    { name: 'Security Audit', fn: testSecurityAudit },
    { name: 'Integration', fn: testIntegration },
    { name: 'Performance', fn: testPerformance }
  ];

  for (const test of tests) {
    console.log(`í·ª Running ${test.name}...`);
    try {
      await test.fn();
      console.log(`âœ… ${test.name} - PASSED\n`);
      results.passed++;
    } catch (error) {
      console.log(`âŒ ${test.name} - FAILED: ${error.message}\n`);
      results.failed++;
    }
    results.total++;
  }

  // Resumo final
  console.log('í³Š Test Results Summary');
  console.log('=======================');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\nâŒ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\ní¾‰ All tests passed!');
  }
}

runAllTests().catch(console.error);
