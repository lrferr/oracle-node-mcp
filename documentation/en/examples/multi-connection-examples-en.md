# Multiple Oracle Connections Examples

This document shows how to configure and use multiple Oracle connections with Oracle Node MCP.

## Configuration

### 1. Multiple Connections Configuration File

Create the file `config/multi-connections.json`:

```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "description": "Production Database",
      "environment": "production",
      "poolMin": 2,
      "poolMax": 20,
      "poolIncrement": 2
    },
    "development": {
      "user": "HR_DEV",
      "password": "dev_password", 
      "connectString": "dev-server:1521/DEV",
      "description": "Development Database",
      "environment": "development",
      "poolMin": 1,
      "poolMax": 10,
      "poolIncrement": 1
    },
    "testing": {
      "user": "HR_TEST",
      "password": "test_password",
      "connectString": "test-server:1521/TEST",
      "description": "Testing Database",
      "environment": "testing",
      "poolMin": 1,
      "poolMax": 5,
      "poolIncrement": 1
    }
  },
  "defaultConnection": "development",
  "monitoring": {
    "healthCheckInterval": 300000,
    "schemaCheckInterval": 600000,
    "performanceCheckInterval": 300000
  },
  "alerts": {
    "tablespaceUsageThreshold": 80,
    "connectionThreshold": 100,
    "performanceThreshold": 1000
  }
}
```

### 2. MCP Configuration

Update your `mcp-config.json` file:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Tool Usage

### 1. List Available Connections

```javascript
// List all configured connections
await mcp.callTool('list_connections');
```

### 2. Test Connections

```javascript
// Test a specific connection
await mcp.callTool('test_connection', {
  connectionName: 'production'
});

// Test all connections
await mcp.callTool('test_all_connections');
```

### 3. Check Connection Status

```javascript
// Get status of all active connections
await mcp.callTool('get_connections_status');
```

### 4. Operations with Specific Connection

```javascript
// Check production database health
await mcp.callTool('check_database_health', {
  connectionName: 'production',
  checkConnections: true,
  checkTablespaces: true,
  checkPerformance: true
});

// Create table in development database
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'test_table',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100 }
  ]
});

// Query data from testing database
await mcp.callTool('select_data', {
  connectionName: 'testing',
  tableName: 'employees',
  schema: 'HR',
  columns: ['*'],
  limit: 10
});
```

## Use Cases

### 1. Multi-Environment Development

```javascript
// Development
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'new_feature_table',
  // ... other parameters
});

// Testing
await mcp.callTool('create_table', {
  connectionName: 'testing',
  tableName: 'new_feature_table',
  // ... other parameters
});

// Production (after testing)
await mcp.callTool('create_table', {
  connectionName: 'production',
  tableName: 'new_feature_table',
  // ... other parameters
});
```

### 2. Multiple Database Monitoring

```javascript
// Check health of all databases
const connections = ['production', 'development', 'testing'];

for (const conn of connections) {
  const health = await mcp.callTool('check_database_health', {
    connectionName: conn
  });
  console.log(`${conn} status:`, health);
}
```

### 3. Data Migration Between Environments

```javascript
// 1. Query data from development
const devData = await mcp.callTool('select_data', {
  connectionName: 'development',
  tableName: 'migration_data',
  schema: 'HR'
});

// 2. Insert into testing database
await mcp.callTool('insert_data', {
  connectionName: 'testing',
  tableName: 'migration_data',
  schema: 'HR',
  data: devData
});
```

## Advantages

1. **No need for multiple instances**: A single project manages all connections
2. **Centralized configuration**: All connections in one JSON file
3. **Optimized connection pooling**: Each connection has its own pool
4. **Unified monitoring**: Status of all connections in one place
5. **Flexibility**: Easy to add/remove connections
6. **Compatibility**: Maintains compatibility with old configuration

## Troubleshooting

### Connection not found
```
Error: Connection 'production' not found in configuration
```
**Solution**: Check if the connection name exists in `config/multi-connections.json`

### Connection failure
```
Error: Connection failure 'production': ORA-12541: TNS:no listener
```
**Solution**: Check if Oracle server is running and connection parameters are correct

### Connection pool exhausted
```
Error: Connection pool exhausted
```
**Solution**: Increase `poolMax` values in connection configuration
