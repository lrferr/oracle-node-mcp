#!/usr/bin/env node

/**
 * Exemplos de uso das funcionalidades DDL, DML e DCL
 * Este arquivo demonstra como usar as novas funcionalidades do Oracle MCP
 */

import { DDLOperations } from '../src/ddl-operations.js';
import { DMLOperations } from '../src/dml-operations.js';
import { DCLOperations } from '../src/dcl-operations.js';
import { SecurityAudit } from '../src/security-audit.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração de conexão
const connectionConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`
};

// Inicializar módulos
const ddlOps = new DDLOperations(connectionConfig);
const dmlOps = new DMLOperations(connectionConfig);
const dclOps = new DCLOperations(connectionConfig);
const securityAudit = new SecurityAudit();

/**
 * Exemplo 1: Criação de Sistema de Produtos
 */
async function exemploCriacaoSistemaProdutos() {
  console.log('=== Exemplo 1: Criação de Sistema de Produtos ===\n');

  try {
    // 1. Criar tabela de categorias
    console.log('1. Criando tabela CATEGORIAS...');
    const categoriaResult = await ddlOps.createTable({
      tableName: 'CATEGORIAS',
      schema: 'HR',
      columns: [
        { name: 'ID', type: 'NUMBER', notNull: true },
        { name: 'NOME', type: 'VARCHAR2', length: 50, notNull: true },
        { name: 'DESCRICAO', type: 'VARCHAR2', length: 200 },
        { name: 'ATIVA', type: 'CHAR', length: 1, defaultValue: "'Y'" }
      ],
      constraints: [
        { name: 'PK_CATEGORIAS', type: 'PRIMARY KEY', columns: ['ID'] },
        { name: 'UK_CATEGORIAS_NOME', type: 'UNIQUE', columns: ['NOME'] }
      ],
      tablespace: 'USERS'
    });
    console.log(categoriaResult);

    // 2. Criar tabela de produtos
    console.log('\n2. Criando tabela PRODUTOS...');
    const produtoResult = await ddlOps.createTable({
      tableName: 'PRODUTOS',
      schema: 'HR',
      columns: [
        { name: 'ID', type: 'NUMBER', notNull: true },
        { name: 'NOME', type: 'VARCHAR2', length: 100, notNull: true },
        { name: 'DESCRICAO', type: 'VARCHAR2', length: 500 },
        { name: 'CATEGORIA_ID', type: 'NUMBER', notNull: true },
        { name: 'PRECO', type: 'NUMBER', precision: 10, scale: 2 },
        { name: 'ESTOQUE', type: 'NUMBER', precision: 10, scale: 0, defaultValue: '0' },
        { name: 'ATIVO', type: 'CHAR', length: 1, defaultValue: "'Y'" },
        { name: 'DATA_CRIACAO', type: 'DATE', defaultValue: 'SYSDATE' }
      ],
      constraints: [
        { name: 'PK_PRODUTOS', type: 'PRIMARY KEY', columns: ['ID'] },
        { name: 'FK_PRODUTOS_CATEGORIA', type: 'FOREIGN KEY', columns: ['CATEGORIA_ID'], referencedTable: 'CATEGORIAS', referencedColumns: ['ID'] },
        { name: 'CK_PRODUTOS_PRECO', type: 'CHECK', condition: 'PRECO >= 0' },
        { name: 'CK_PRODUTOS_ESTOQUE', type: 'CHECK', condition: 'ESTOQUE >= 0' }
      ],
      tablespace: 'USERS'
    });
    console.log(produtoResult);

    // 3. Criar sequence para IDs
    console.log('\n3. Criando sequence para IDs...');
    const sequenceResult = await ddlOps.createSequence({
      sequenceName: 'SEQ_PRODUTOS_ID',
      schema: 'HR',
      startWith: 1,
      incrementBy: 1,
      cache: 20
    });
    console.log(sequenceResult);

    // 4. Inserir dados de exemplo
    console.log('\n4. Inserindo dados de exemplo...');
    
    // Inserir categorias
    const categorias = [
      { ID: 1, NOME: 'Eletrônicos', DESCRICAO: 'Produtos eletrônicos em geral' },
      { ID: 2, NOME: 'Roupas', DESCRICAO: 'Vestuário e acessórios' },
      { ID: 3, NOME: 'Livros', DESCRICAO: 'Livros e materiais educativos' }
    ];

    for (const categoria of categorias) {
      const insertResult = await dmlOps.insert({
        tableName: 'CATEGORIAS',
        schema: 'HR',
        data: categoria
      });
      console.log(`Categoria ${categoria.NOME}: ${insertResult}`);
    }

    // Inserir produtos
    const produtos = [
      { ID: 1, NOME: 'Smartphone', DESCRICAO: 'Smartphone Android', CATEGORIA_ID: 1, PRECO: 899.99, ESTOQUE: 50 },
      { ID: 2, NOME: 'Notebook', DESCRICAO: 'Notebook para trabalho', CATEGORIA_ID: 1, PRECO: 2499.99, ESTOQUE: 20 },
      { ID: 3, NOME: 'Camiseta', DESCRICAO: 'Camiseta básica', CATEGORIA_ID: 2, PRECO: 29.99, ESTOQUE: 100 },
      { ID: 4, NOME: 'Livro de Programação', DESCRICAO: 'Livro sobre JavaScript', CATEGORIA_ID: 3, PRECO: 79.99, ESTOQUE: 30 }
    ];

    for (const produto of produtos) {
      const insertResult = await dmlOps.insert({
        tableName: 'PRODUTOS',
        schema: 'HR',
        data: produto
      });
      console.log(`Produto ${produto.NOME}: ${insertResult}`);
    }

    // 5. Consultar dados
    console.log('\n5. Consultando dados...');
    const consultaResult = await dmlOps.select({
      tableName: 'PRODUTOS',
      schema: 'HR',
      columns: ['P.ID', 'P.NOME', 'P.PRECO', 'C.NOME as CATEGORIA'],
      whereClause: 'P.CATEGORIA_ID = C.ID AND P.ATIVO = \'Y\'',
      orderBy: 'P.NOME'
    });
    console.log('Produtos ativos:');
    console.log(consultaResult);

  } catch (error) {
    console.error('Erro no exemplo 1:', error.message);
  }
}

/**
 * Exemplo 2: Gerenciamento de Usuários e Privilégios
 */
async function exemploGerenciamentoUsuarios() {
  console.log('\n=== Exemplo 2: Gerenciamento de Usuários e Privilégios ===\n');

  try {
    // 1. Criar usuários
    console.log('1. Criando usuários...');
    
    const usuarios = [
      {
        username: 'VENDEDOR',
        password: 'Venda123!',
        defaultTablespace: 'USERS',
        quota: '50M'
      },
      {
        username: 'ESTOQUE',
        password: 'Estoque456!',
        defaultTablespace: 'USERS',
        quota: '100M'
      }
    ];

    for (const usuario of usuarios) {
      const createResult = await dclOps.createUser(usuario);
      console.log(`Usuário ${usuario.username}: ${createResult}`);
    }

    // 2. Conceder privilégios
    console.log('\n2. Concedendo privilégios...');
    
    // Privilégios para VENDEDOR
    const vendedorPrivs = await dclOps.grantPrivileges({
      privileges: ['SELECT', 'INSERT', 'UPDATE'],
      onObject: 'HR.PRODUTOS',
      toUser: 'VENDEDOR'
    });
    console.log(`Privilégios para VENDEDOR: ${vendedorPrivs}`);

    // Privilégios para ESTOQUE
    const estoquePrivs = await dclOps.grantPrivileges({
      privileges: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
      onObject: 'HR.PRODUTOS',
      toUser: 'ESTOQUE'
    });
    console.log(`Privilégios para ESTOQUE: ${estoquePrivs}`);

    // Privilégios de sistema
    const systemPrivs = await dclOps.grantPrivileges({
      privileges: ['CREATE SESSION'],
      toUser: 'VENDEDOR'
    });
    console.log(`Privilégios de sistema para VENDEDOR: ${systemPrivs}`);

  } catch (error) {
    console.error('Erro no exemplo 2:', error.message);
  }
}

/**
 * Exemplo 3: Operações de Dados
 */
async function exemploOperacoesDados() {
  console.log('\n=== Exemplo 3: Operações de Dados ===\n');

  try {
    // 1. Consulta com filtros
    console.log('1. Consultando produtos caros...');
    const produtosCaros = await dmlOps.select({
      tableName: 'PRODUTOS',
      schema: 'HR',
      columns: ['NOME', 'PRECO', 'ESTOQUE'],
      whereClause: 'PRECO > 100',
      orderBy: 'PRECO DESC'
    });
    console.log('Produtos com preço > 100:');
    console.log(produtosCaros);

    // 2. Atualizar preços
    console.log('\n2. Atualizando preços...');
    const updateResult = await dmlOps.update({
      tableName: 'PRODUTOS',
      schema: 'HR',
      data: { PRECO: 'PRECO * 1.1' }, // Aumentar 10%
      whereClause: 'CATEGORIA_ID = 1' // Apenas eletrônicos
    });
    console.log(updateResult);

    // 3. Atualizar estoque
    console.log('\n3. Atualizando estoque...');
    const estoqueResult = await dmlOps.update({
      tableName: 'PRODUTOS',
      schema: 'HR',
      data: { ESTOQUE: 'ESTOQUE - 5' },
      whereClause: 'ID IN (1, 2, 3)'
    });
    console.log(estoqueResult);

    // 4. Consulta final
    console.log('\n4. Consulta final...');
    const consultaFinal = await dmlOps.select({
      tableName: 'PRODUTOS',
      schema: 'HR',
      columns: ['NOME', 'PRECO', 'ESTOQUE'],
      orderBy: 'NOME'
    });
    console.log('Estado final dos produtos:');
    console.log(consultaFinal);

  } catch (error) {
    console.error('Erro no exemplo 3:', error.message);
  }
}

/**
 * Exemplo 4: Auditoria e Segurança
 */
async function exemploAuditoriaSeguranca() {
  console.log('\n=== Exemplo 4: Auditoria e Segurança ===\n');

  try {
    // 1. Gerar relatório de auditoria
    console.log('1. Gerando relatório de auditoria...');
    const relatorio = await securityAudit.generateAuditReport({
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
      endDate: new Date()
    });
    console.log('Relatório de auditoria:');
    console.log(relatorio);

    // 2. Detectar atividades suspeitas
    console.log('\n2. Detectando atividades suspeitas...');
    const atividades = await securityAudit.detectSuspiciousActivity();
    console.log('Atividades suspeitas detectadas:');
    console.log(atividades);

    // 3. Testar validações de segurança
    console.log('\n3. Testando validações de segurança...');
    
    try {
      // Tentar query com SQL injection
      await dmlOps.select({
        tableName: 'PRODUTOS',
        schema: 'HR',
        whereClause: "NOME = 'test' OR '1'='1'"
      });
    } catch (error) {
      console.log('✅ SQL injection detectado e bloqueado:', error.message);
    }

    try {
      // Tentar acessar esquema bloqueado
      await dmlOps.select({
        tableName: 'USERS',
        schema: 'SYS'
      });
    } catch (error) {
      console.log('✅ Acesso a esquema bloqueado detectado:', error.message);
    }

  } catch (error) {
    console.error('Erro no exemplo 4:', error.message);
  }
}

/**
 * Exemplo 5: Limpeza (Remover objetos criados)
 */
async function exemploLimpeza() {
  console.log('\n=== Exemplo 5: Limpeza ===\n');

  try {
    // 1. Remover dados
    console.log('1. Removendo dados...');
    const deleteProdutos = await dmlOps.delete({
      tableName: 'PRODUTOS',
      schema: 'HR',
      whereClause: '1=1' // Remover todos
    });
    console.log(deleteProdutos);

    const deleteCategorias = await dmlOps.delete({
      tableName: 'CATEGORIAS',
      schema: 'HR',
      whereClause: '1=1' // Remover todos
    });
    console.log(deleteCategorias);

    // 2. Remover tabelas
    console.log('\n2. Removendo tabelas...');
    const dropProdutos = await ddlOps.dropTable({
      tableName: 'PRODUTOS',
      schema: 'HR',
      cascadeConstraints: true
    });
    console.log(dropProdutos);

    const dropCategorias = await ddlOps.dropTable({
      tableName: 'CATEGORIAS',
      schema: 'HR'
    });
    console.log(dropCategorias);

    // 3. Remover sequence
    console.log('\n3. Removendo sequence...');
    const dropSequence = await ddlOps.dropSequence({
      sequenceName: 'SEQ_PRODUTOS_ID',
      schema: 'HR'
    });
    console.log(dropSequence);

    // 4. Remover usuários
    console.log('\n4. Removendo usuários...');
    const dropVendedor = await dclOps.dropUser({
      username: 'VENDEDOR',
      cascade: true
    });
    console.log(dropVendedor);

    const dropEstoque = await dclOps.dropUser({
      username: 'ESTOQUE',
      cascade: true
    });
    console.log(dropEstoque);

  } catch (error) {
    console.error('Erro no exemplo 5:', error.message);
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Exemplos de Uso das Funcionalidades DDL, DML e DCL\n');
  console.log('Este script demonstra as novas funcionalidades do Oracle MCP\n');

  try {
    // Executar exemplos
    await exemploCriacaoSistemaProdutos();
    await exemploGerenciamentoUsuarios();
    await exemploOperacoesDados();
    await exemploAuditoriaSeguranca();
    
    // Perguntar se deve fazer limpeza
    console.log('\n⚠️  Deseja remover os objetos criados nos exemplos? (y/N)');
    // Em um ambiente real, você usaria readline ou similar
    // Para este exemplo, vamos pular a limpeza
    console.log('Pulando limpeza para preservar os dados de exemplo...');
    
    console.log('\n✅ Exemplos concluídos com sucesso!');
    console.log('\n📚 Consulte a documentação em docs/ddl-dml-dcl-guide.md para mais informações.');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  exemploCriacaoSistemaProdutos,
  exemploGerenciamentoUsuarios,
  exemploOperacoesDados,
  exemploAuditoriaSeguranca,
  exemploLimpeza
};
