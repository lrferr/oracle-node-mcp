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

console.log('�� Oracle MCP - Test Suite');
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
    console.log(`� Running ${test.name}...`);
    try {
      await test.fn();
      console.log(`✅ ${test.name} - PASSED\n`);
      results.passed++;
    } catch (error) {
      console.log(`❌ ${test.name} - FAILED: ${error.message}\n`);
      results.failed++;
    }
    results.total++;
  }

  // Resumo final
  console.log('� Test Results Summary');
  console.log('=======================');
  console.log(`Total: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Some tests failed!');
    process.exit(1);
  } else {
    console.log('\n� All tests passed!');
  }
}

runAllTests().catch(console.error);
