#!/usr/bin/env node

/**
 * Demonstração de uso de múltiplas conexões Oracle
 * 
 * Este script mostra como usar o Oracle Node MCP com múltiplas conexões
 * sem precisar baixar múltiplas instâncias do projeto.
 */

import { ConnectionManager } from '../src/connection-manager.js';
import { OracleMonitor } from '../src/oracle-monitor.js';
import { DDLOperations } from '../src/ddl-operations.js';
import { DMLOperations } from '../src/dml-operations.js';
import { DCLOperations } from '../src/dcl-operations.js';

class MultiConnectionDemo {
  constructor() {
    this.connectionManager = new ConnectionManager();
    this.oracleMonitor = new OracleMonitor(this.connectionManager);
    this.ddlOperations = new DDLOperations(null, this.connectionManager);
    this.dmlOperations = new DMLOperations(null, this.connectionManager);
    this.dclOperations = new DCLOperations(null, this.connectionManager);
  }

  async run() {
    console.log('🚀 Iniciando demonstração de múltiplas conexões Oracle...\n');

    try {
      // 1. Listar conexões disponíveis
      await this.listConnections();

      // 2. Testar todas as conexões
      await this.testAllConnections();

      // 3. Verificar status das conexões
      await this.checkConnectionsStatus();

      // 4. Demonstração de operações em diferentes ambientes
      await this.demonstrateOperations();

      // 5. Monitoramento de saúde
      await this.monitorHealth();

    } catch (error) {
      console.error('❌ Erro na demonstração:', error.message);
    } finally {
      // Fechar todas as conexões
      await this.connectionManager.closeAllConnections();
      console.log('\n✅ Demonstração concluída!');
    }
  }

  async listConnections() {
    console.log('📋 Listando conexões disponíveis...');
    
    const connections = await this.oracleMonitor.getAvailableConnections();
    
    if (connections.length === 0) {
      console.log('❌ Nenhuma conexão configurada.');
      return;
    }

    connections.forEach((conn, index) => {
      console.log(`${index + 1}. ${conn.name}`);
      console.log(`   Descrição: ${conn.description}`);
      console.log(`   Ambiente: ${conn.environment}\n`);
    });
  }

  async testAllConnections() {
    console.log('🔍 Testando todas as conexões...');
    
    const results = await this.oracleMonitor.testAllConnections();
    
    for (const [connName, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`✅ ${connName}: ${result.message}`);
      } else {
        console.log(`❌ ${connName}: ${result.message}`);
        if (result.error) {
          console.log(`   Erro: ${result.error}`);
        }
      }
    }
    console.log('');
  }

  async checkConnectionsStatus() {
    console.log('📊 Verificando status das conexões ativas...');
    
    const status = await this.oracleMonitor.getConnectionsStatus();
    
    for (const [connName, connStatus] of Object.entries(status)) {
      if (connStatus.active) {
        console.log(`✅ ${connName}: Ativa`);
        if (connStatus.info) {
          console.log(`   Database: ${connStatus.info[1]}`);
          console.log(`   Host: ${connStatus.info[2]}`);
          console.log(`   Usuário: ${connStatus.info[4]}`);
        }
      } else {
        console.log(`❌ ${connName}: Inativa`);
        if (connStatus.error) {
          console.log(`   Erro: ${connStatus.error}`);
        }
      }
    }
    console.log('');
  }

  async demonstrateOperations() {
    console.log('🛠️ Demonstração de operações em diferentes ambientes...');
    
    const environments = ['development', 'testing', 'production'];
    
    for (const env of environments) {
      try {
        console.log(`\n--- Operações no ambiente: ${env} ---`);
        
        // Verificar se a conexão está disponível
        const testResult = await this.oracleMonitor.testConnection(env);
        if (!testResult.success) {
          console.log(`⚠️ Conexão ${env} não disponível: ${testResult.message}`);
          continue;
        }

        // Exemplo: Verificar informações do banco
        const dbInfo = await this.oracleMonitor.getDatabaseInfo({ 
          connectionName: env,
          includeTablespaces: true 
        });
        console.log(`📊 Informações do banco ${env}:`);
        console.log(dbInfo.substring(0, 200) + '...\n');

        // Exemplo: Listar tabelas (se disponível)
        try {
          const tables = await this.oracleMonitor.executeSafeQuery(
            "SELECT table_name FROM user_tables WHERE rownum <= 5",
            'HR'
          );
          console.log(`📋 Primeiras 5 tabelas em ${env}:`);
          console.log(tables);
        } catch (error) {
          console.log(`⚠️ Não foi possível listar tabelas em ${env}: ${error.message}`);
        }

      } catch (error) {
        console.log(`❌ Erro no ambiente ${env}: ${error.message}`);
      }
    }
  }

  async monitorHealth() {
    console.log('\n🏥 Monitoramento de saúde dos bancos...');
    
    const environments = ['development', 'testing', 'production'];
    
    for (const env of environments) {
      try {
        console.log(`\n--- Saúde do banco: ${env} ---`);
        
        const health = await this.oracleMonitor.checkDatabaseHealth({
          connectionName: env,
          checkConnections: true,
          checkTablespaces: true,
          checkPerformance: true
        });
        
        console.log(health.substring(0, 300) + '...\n');
        
      } catch (error) {
        console.log(`❌ Erro ao verificar saúde de ${env}: ${error.message}`);
      }
    }
  }
}

// Executar demonstração se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new MultiConnectionDemo();
  demo.run().catch(console.error);
}

export { MultiConnectionDemo };
