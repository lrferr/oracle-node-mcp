#!/usr/bin/env node
import { DDLOperations } from '../src/ddl-operations.js';
import { DMLOperations } from '../src/dml-operations.js';
import { DCLOperations } from '../src/dcl-operations.js';
import { SecurityAudit } from '../src/security-audit.js';
import dotenv from 'dotenv';

dotenv.config();

const connectionConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`
};

async function testDDLOperations() {
  console.log('��� Testing DDL Operations...');
  const ddl = new DDLOperations(connectionConfig);
  
  try {
    // Teste 1: Criar tabela de teste
    const result = await ddl.createTable({
      tableName: 'TEST_TABLE',
      schema: 'HR',
      columns: [
        { name: 'ID', type: 'NUMBER', notNull: true },
        { name: 'NAME', type: 'VARCHAR2', length: 50 }
      ],
      constraints: [
        { name: 'PK_TEST', type: 'PRIMARY KEY', columns: ['ID'] }
      ]
    });
    console.log('✅ CREATE TABLE:', result);
    
    // Teste 2: Alterar tabela
    const alterResult = await ddl.alterTable({
      tableName: 'TEST_TABLE',
      schema: 'HR',
      operation: 'ADD_COLUMN',
      columnName: 'DESCRIPTION',
      columnType: 'VARCHAR2',
      columnLength: 100
    });
    console.log('✅ ALTER TABLE:', alterResult);
    
    // Teste 3: Remover tabela
    const dropResult = await ddl.dropTable({
      tableName: 'TEST_TABLE',
      schema: 'HR'
    });
    console.log('✅ DROP TABLE:', dropResult);
    
  } catch (error) {
    console.error('❌ DDL Error:', error.message);
  }
}

async function testDMLOperations() {
  console.log('��� Testing DML Operations...');
  const dml = new DMLOperations(connectionConfig);
  
  try {
    // Teste 1: Consulta simples
    const selectResult = await dml.select({
      tableName: 'EMPLOYEES',
      schema: 'HR',
      columns: ['EMPLOYEE_ID', 'FIRST_NAME'],
      limit: 5
    });
    console.log('✅ SELECT:', selectResult.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ DML Error:', error.message);
  }
}

async function testSecurityAudit() {
  console.log('��� Testing Security Audit...');
  const audit = new SecurityAudit();
  
  try {
    // Teste 1: Validação de SQL injection
    try {
      audit.validateQuery("SELECT * FROM users WHERE id = '1' OR '1'='1'", 'SELECT');
      console.log('❌ SQL injection should have been detected');
    } catch (error) {
      console.log('✅ SQL injection detected:', error.message);
    }
    
    // Teste 2: Validação de esquema
    try {
      audit.validateSchemaAccess("SELECT * FROM SYS.USERS");
      console.log('❌ SYS schema should be blocked');
    } catch (error) {
      console.log('✅ SYS schema blocked:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Security Error:', error.message);
  }
}

async function runAllTests() {
  console.log('��� Starting comprehensive tests...\n');
  
  await testDDLOperations();
  console.log('');
  await testDMLOperations();
  console.log('');
  await testSecurityAudit();
  
  console.log('\n✅ All tests completed!');
}

runAllTests().catch(console.error);
