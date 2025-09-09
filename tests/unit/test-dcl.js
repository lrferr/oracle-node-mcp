#!/usr/bin/env node
/**
 * Testes Unitários - DCL Operations
 */

import { DCLOperations } from '../../src/dcl-operations.js';
import { getConnectionConfig } from '../utils/test-config.js';

export async function testDCLOperations() {
  console.log('  Testing DCL Operations...');
  
  const connectionConfig = getConnectionConfig();
  const dcl = new DCLOperations(connectionConfig);
  
  // Teste 1: Validação de nome de usuário
  try {
    dcl.validateUsername('TEST_USER');
    console.log('    ✅ Username validation works');
  } catch (error) {
    throw new Error(`Username validation failed: ${error.message}`);
  }

  // Teste 2: Validação de senha
  try {
    dcl.validatePassword('SecurePass123!');
    console.log('    ✅ Password validation works');
  } catch (error) {
    throw new Error(`Password validation failed: ${error.message}`);
  }

  // Teste 3: Validação de nome de role
  try {
    dcl.validateRoleName('TEST_ROLE');
    console.log('    ✅ Role name validation works');
  } catch (error) {
    throw new Error(`Role name validation failed: ${error.message}`);
  }

  // Teste 4: Validação de privilégios
  try {
    dcl.validatePrivileges(['SELECT', 'INSERT', 'UPDATE']);
    console.log('    ✅ Privileges validation works');
  } catch (error) {
    throw new Error(`Privileges validation failed: ${error.message}`);
  }
}
