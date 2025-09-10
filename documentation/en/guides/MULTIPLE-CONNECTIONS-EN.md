# Multiple Oracle Connections - Complete Guide

This guide explains how to use Oracle Node MCP with multiple Oracle connections **without needing to download multiple instances of the project**.

## 🎯 Why Multiple Connections?

- **Multi-Environment Development**: Development, Testing, Staging, Production
- **Centralized Monitoring**: Single point to monitor all databases
- **Data Migration**: Easily transfer data between environments
- **Backup and Restore**: Operations on backup databases
- **Analytics**: Connections to data warehouses

## 🚀 Quick Setup

### 1. Automatic Configuration

```bash
# Run the interactive configuration script
npm run setup-multi-connections
```

### 2. Manual Configuration

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
    }
  },
  "defaultConnection": "development"
}
```

## 🛠️ Tool Usage

### Connection Tools

#### List Connections
```javascript
await mcp.callTool('list_connections');
```

#### Test Specific Connection
```javascript
await mcp.callTool('test_connection', {
  connectionName: 'production'
});
```

#### Test All Connections
```javascript
await mcp.callTool('test_all_connections');
```

#### Active Connections Status
```javascript
await mcp.callTool('get_connections_status');
```

### Operations with Specific Connection

All existing tools now accept the `connectionName` parameter:

#### Monitoring
```javascript
// Check production database health
await mcp.callTool('check_database_health', {
  connectionName: 'production',
  checkConnections: true,
  checkTablespaces: true,
  checkPerformance: true
});

// Monitor schemas in development environment
await mcp.callTool('monitor_schema_changes', {
  connectionName: 'development',
  schemas: ['HR', 'SCOTT'],
  checkInterval: 5
});
```

#### DDL Operations
```javascript
// Create table in development database
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'new_table',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100 }
  ]
});

// Alter table in production database
await mcp.callTool('alter_table', {
  connectionName: 'production',
  tableName: 'existing_table',
  schema: 'HR',
  operation: 'ADD_COLUMN',
  columnName: 'new_column',
  columnType: 'VARCHAR2',
  columnLength: 50
});
```

#### DML Operations
```javascript
// Query data from testing database
await mcp.callTool('select_data', {
  connectionName: 'testing',
  tableName: 'employees',
  schema: 'HR',
  columns: ['*'],
  whereClause: 'department_id = 10',
  limit: 10
});

// Insert data into development database
await mcp.callTool('insert_data', {
  connectionName: 'development',
  tableName: 'test_data',
  schema: 'HR',
  data: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com'
  }
});
```

#### DCL Operations
```javascript
// Create user in development database
await mcp.callTool('create_user', {
  connectionName: 'development',
  username: 'new_user',
  password: 'secure_password',
  defaultTablespace: 'USERS'
});

// Grant privileges in production database
await mcp.callTool('grant_privileges', {
  connectionName: 'production',
  privileges: ['SELECT', 'INSERT', 'UPDATE'],
  onObject: 'HR.EMPLOYEES',
  toUser: 'app_user'
});
```

## 📊 Practical Examples

### 1. Development Pipeline

```javascript
// 1. Development - Create new feature
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'user_preferences',
  schema: 'HR',
  columns: [
    { name: 'user_id', type: 'NUMBER', notNull: true },
    { name: 'preference_key', type: 'VARCHAR2', length: 50 },
    { name: 'preference_value', type: 'VARCHAR2', length: 200 }
  ]
});

// 2. Testing - Validate feature
await mcp.callTool('create_table', {
  connectionName: 'testing',
  tableName: 'user_preferences',
  schema: 'HR',
  columns: [
    { name: 'user_id', type: 'NUMBER', notNull: true },
    { name: 'preference_key', type: 'VARCHAR2', length: 50 },
    { name: 'preference_value', type: 'VARCHAR2', length: 200 }
  ]
});

// 3. Production - Deploy after testing
await mcp.callTool('create_table', {
  connectionName: 'production',
  tableName: 'user_preferences',
  schema: 'HR',
  columns: [
    { name: 'user_id', type: 'NUMBER', notNull: true },
    { name: 'preference_key', type: 'VARCHAR2', length: 50 },
    { name: 'preference_value', type: 'VARCHAR2', length: 200 }
  ]
});
```

### 2. Multi-Environment Monitoring

```javascript
// Check health of all environments
const environments = ['development', 'testing', 'staging', 'production'];

for (const env of environments) {
  try {
    const health = await mcp.callTool('check_database_health', {
      connectionName: env
    });
    console.log(`${env} status:`, health);
  } catch (error) {
    console.log(`Error in ${env}:`, error.message);
  }
}
```

### 3. Data Migration

```javascript
// 1. Query data from development
const devData = await mcp.callTool('select_data', {
  connectionName: 'development',
  tableName: 'migration_source',
  schema: 'HR',
  columns: ['*']
});

// 2. Insert into staging database
await mcp.callTool('insert_data', {
  connectionName: 'staging',
  tableName: 'migration_target',
  schema: 'HR',
  data: devData
});
```

## 🔧 Advanced Configuration

### Connection Pooling

```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "poolMin": 5,        // Minimum connections in pool
      "poolMax": 50,       // Maximum connections in pool
      "poolIncrement": 5,  // Pool increment
      "poolTimeout": 60,   // Pool timeout in seconds
      "poolPingInterval": 60 // Ping interval in seconds
    }
  }
}
```

### Monitoring and Alerts

```json
{
  "monitoring": {
    "healthCheckInterval": 300000,    // 5 minutes
    "schemaCheckInterval": 600000,    // 10 minutes
    "performanceCheckInterval": 300000 // 5 minutes
  },
  "alerts": {
    "tablespaceUsageThreshold": 80,   // 80% usage
    "connectionThreshold": 100,       // 100 connections
    "performanceThreshold": 1000      // 1 second
  }
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection not found
```
Error: Connection 'production' not found in configuration
```
**Solution**: Check if the connection name exists in `config/multi-connections.json`

#### 2. Connection failure
```
Error: Connection failure 'production': ORA-12541: TNS:no listener
```
**Solution**: 
- Check if Oracle server is running
- Verify connection parameters (host, port, service name)
- Test network connectivity

#### 3. Connection pool exhausted
```
Error: Connection pool exhausted
```
**Solution**: Increase `poolMax` values in configuration

#### 4. Connection timeout
```
Error: Connection timeout
```
**Solution**: Increase `poolTimeout` in configuration

### Logs and Debug

```bash
# Check logs
tail -f logs/oracle-mcp.log

# Test connections
npm run demo-multi-connections

# Test specific connection
node -e "
import { ConnectionManager } from './src/connection-manager.js';
const cm = new ConnectionManager();
cm.testConnection('production').then(console.log);
"
```

## 📈 Advantages

1. **✅ Single instance**: No need to download the project multiple times
2. **✅ Centralized configuration**: All connections in one file
3. **✅ Optimized pooling**: Each connection has its own pool
4. **✅ Unified monitoring**: Status of all connections
5. **✅ Flexibility**: Easy to add/remove connections
6. **✅ Compatibility**: Maintains compatibility with old configuration
7. **✅ Security**: Credentials isolated by environment
8. **✅ Performance**: Connections reused efficiently

## 🎯 Use Cases

- **Multi-Environment Development**: Development → Testing → Staging → Production
- **Centralized Monitoring**: One dashboard for all environments
- **Data Migration**: Transfer data between environments
- **Backup and Restore**: Operations on backup databases
- **Analytics**: Connections to data warehouses
- **Disaster Recovery**: Connections to recovery databases

## 📚 Next Steps

1. Run `npm run setup-multi-connections` to configure
2. Edit `config/multi-connections.json` with your credentials
3. Run `npm run demo-multi-connections` to test
4. Integrate with your existing MCP system
5. Configure monitoring and alerts as needed

---

**💡 Tip**: Start with 2-3 connections (development, testing, production) and expand as needed!
