#!/usr/bin/env node

import oracledb from 'oracledb';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

class ConnectionTester {
  constructor() {
    this.connectionConfig = {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`
    };
  }

  async testConnection() {
    console.log('🔌 Testando conexão com Oracle Database...\n');

    // Verificar variáveis de ambiente
    this.validateEnvironment();

    let connection;
    
    try {
      console.log('📡 Conectando ao banco...');
      console.log(`   Host: ${process.env.ORACLE_HOST}`);
      console.log(`   Port: ${process.env.ORACLE_PORT}`);
      console.log(`   Service: ${process.env.ORACLE_SERVICE_NAME}`);
      console.log(`   User: ${process.env.ORACLE_USER}\n`);

      connection = await oracledb.getConnection(this.connectionConfig);
      console.log('✅ Conexão estabelecida com sucesso!\n');

      // Testar queries básicas
      await this.testBasicQueries(connection);
      
      // Testar privilégios
      await this.testPrivileges(connection);

      console.log('🎉 Todos os testes passaram! O servidor MCP está pronto para uso.');

    } catch (error) {
      console.error('❌ Erro na conexão:', error.message);
      this.handleConnectionError(error);
    } finally {
      if (connection) {
        try {
          await connection.close();
          console.log('\n🔌 Conexão fechada.');
        } catch (error) {
          console.error('⚠️  Erro ao fechar conexão:', error.message);
        }
      }
    }
  }

  validateEnvironment() {
    const requiredVars = [
      'ORACLE_HOST',
      'ORACLE_PORT', 
      'ORACLE_SERVICE_NAME',
      'ORACLE_USER',
      'ORACLE_PASSWORD'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
      missing.forEach(varName => console.error(`   - ${varName}`));
      console.error('\n💡 Configure essas variáveis no arquivo .env');
      process.exit(1);
    }
  }

  async testBasicQueries(connection) {
    console.log('🧪 Testando queries básicas...');

    const queries = [
      {
        name: 'Versão do Oracle',
        query: 'SELECT banner FROM v$version WHERE rownum = 1'
      },
      {
        name: 'Instância atual',
        query: 'SELECT instance_name, host_name FROM v$instance'
      },
      {
        name: 'Usuário atual',
        query: 'SELECT user FROM dual'
      }
    ];

    for (const test of queries) {
      try {
        const result = await connection.execute(test.query);
        console.log(`   ✅ ${test.name}: ${result.rows[0][0]}`);
      } catch (error) {
        console.log(`   ❌ ${test.name}: ${error.message}`);
      }
    }
  }

  async testPrivileges(connection) {
    console.log('\n🔐 Testando privilégios necessários...');

    const privilegeTests = [
      {
        name: 'v$session',
        query: 'SELECT COUNT(*) FROM v$session WHERE rownum = 1'
      },
      {
        name: 'v$instance',
        query: 'SELECT COUNT(*) FROM v$instance'
      },
      {
        name: 'dba_tablespaces',
        query: 'SELECT COUNT(*) FROM dba_tablespaces WHERE rownum = 1'
      },
      {
        name: 'dba_data_files',
        query: 'SELECT COUNT(*) FROM dba_data_files WHERE rownum = 1'
      },
      {
        name: 'dba_objects',
        query: 'SELECT COUNT(*) FROM dba_objects WHERE rownum = 1'
      },
      {
        name: 'dba_tab_columns',
        query: 'SELECT COUNT(*) FROM dba_tab_columns WHERE rownum = 1'
      },
      {
        name: 'dba_users',
        query: 'SELECT COUNT(*) FROM dba_users WHERE rownum = 1'
      }
    ];

    for (const test of privilegeTests) {
      try {
        await connection.execute(test.query);
        console.log(`   ✅ ${test.name}: Acesso permitido`);
      } catch (error) {
        console.log(`   ❌ ${test.name}: ${error.message}`);
      }
    }
  }

  handleConnectionError(error) {
    console.log('\n🔧 Possíveis soluções:');

    if (error.message.includes('ORA-12541')) {
      console.log('   - Verifique se o Oracle Database está rodando');
      console.log('   - Confirme o host e porta no arquivo .env');
    } else if (error.message.includes('ORA-12514')) {
      console.log('   - Verifique o nome do serviço (ORACLE_SERVICE_NAME)');
      console.log('   - Confirme se o serviço está registrado no listener');
    } else if (error.message.includes('ORA-01017')) {
      console.log('   - Verifique usuário e senha no arquivo .env');
      console.log('   - Confirme se a conta não está bloqueada');
    } else if (error.message.includes('ORA-00942')) {
      console.log('   - O usuário não tem privilégios necessários');
      console.log('   - Execute os comandos SQL de concessão de privilégios');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   - Verifique a conectividade de rede');
      console.log('   - Confirme se o host está acessível');
    } else {
      console.log('   - Consulte a documentação do Oracle para o erro específico');
      console.log('   - Verifique os logs do Oracle Database');
    }

    console.log('\n📚 Para mais ajuda, consulte o README.md');
  }
}

// Executar teste se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ConnectionTester();
  tester.testConnection();
}
