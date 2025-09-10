#!/usr/bin/env node

/**
 * Multiple Oracle Connections Usage Demonstration
 * 
 * This script demonstrates how to use Oracle Node MCP with multiple connections
 * without needing to download multiple instances of the project.
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
    console.log('🚀 Starting Oracle Multiple Connections demonstration...\n');

    try {
      // 1. List available connections
      await this.listConnections();

      // 2. Test all connections
      await this.testAllConnections();

      // 3. Check connections status
      await this.checkConnectionsStatus();

      // 4. Demonstrate operations in different environments
      await this.demonstrateOperations();

      // 5. Health monitoring
      await this.monitorHealth();

    } catch (error) {
      console.error('❌ Error in demonstration:', error.message);
    } finally {
      // Close all connections
      await this.connectionManager.closeAllConnections();
      console.log('\n✅ Demonstration completed!');
    }
  }

  async listConnections() {
    console.log('📋 Listing available connections...');
    
    const connections = await this.oracleMonitor.getAvailableConnections();
    
    if (connections.length === 0) {
      console.log('❌ No connections configured.');
      return;
    }

    connections.forEach((conn, index) => {
      console.log(`${index + 1}. ${conn.name}`);
      console.log(`   Description: ${conn.description}`);
      console.log(`   Environment: ${conn.environment}\n`);
    });
  }

  async testAllConnections() {
    console.log('🔍 Testing all connections...');
    
    const results = await this.oracleMonitor.testAllConnections();
    
    for (const [connName, result] of Object.entries(results)) {
      if (result.success) {
        console.log(`✅ ${connName}: ${result.message}`);
      } else {
        console.log(`❌ ${connName}: ${result.message}`);
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    }
    console.log('');
  }

  async checkConnectionsStatus() {
    console.log('📊 Checking active connections status...');
    
    const status = await this.oracleMonitor.getConnectionsStatus();
    
    for (const [connName, connStatus] of Object.entries(status)) {
      if (connStatus.active) {
        console.log(`✅ ${connName}: Active`);
        if (connStatus.info) {
          console.log(`   Database: ${connStatus.info[1]}`);
          console.log(`   Host: ${connStatus.info[2]}`);
          console.log(`   User: ${connStatus.info[4]}`);
        }
      } else {
        console.log(`❌ ${connName}: Inactive`);
        if (connStatus.error) {
          console.log(`   Error: ${connStatus.error}`);
        }
      }
    }
    console.log('');
  }

  async demonstrateOperations() {
    console.log('🛠️ Demonstrating operations in different environments...');
    
    const environments = ['development', 'testing', 'production'];
    
    for (const env of environments) {
      try {
        console.log(`\n--- Operations in environment: ${env} ---`);
        
        // Check if connection is available
        const testResult = await this.oracleMonitor.testConnection(env);
        if (!testResult.success) {
          console.log(`⚠️ Connection ${env} not available: ${testResult.message}`);
          continue;
        }

        // Example: Check database information
        const dbInfo = await this.oracleMonitor.getDatabaseInfo({ 
          connectionName: env,
          includeTablespaces: true 
        });
        console.log(`📊 Database information for ${env}:`);
        console.log(dbInfo.substring(0, 200) + '...\n');

        // Example: List tables (if available)
        try {
          const tables = await this.oracleMonitor.executeSafeQuery(
            "SELECT table_name FROM user_tables WHERE rownum <= 5",
            'HR'
          );
          console.log(`📋 First 5 tables in ${env}:`);
          console.log(tables);
        } catch (error) {
          console.log(`⚠️ Could not list tables in ${env}: ${error.message}`);
        }

      } catch (error) {
        console.log(`❌ Error in environment ${env}: ${error.message}`);
      }
    }
  }

  async monitorHealth() {
    console.log('\n🏥 Monitoring database health...');
    
    const environments = ['development', 'testing', 'production'];
    
    for (const env of environments) {
      try {
        console.log(`\n--- Health check for database: ${env} ---`);
        
        const health = await this.oracleMonitor.checkDatabaseHealth({
          connectionName: env,
          checkConnections: true,
          checkTablespaces: true,
          checkPerformance: true
        });
        
        console.log(health.substring(0, 300) + '...\n');
        
      } catch (error) {
        console.log(`❌ Error checking health of ${env}: ${error.message}`);
      }
    }
  }
}

// Run demonstration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new MultiConnectionDemo();
  demo.run().catch(console.error);
}

export { MultiConnectionDemo };
