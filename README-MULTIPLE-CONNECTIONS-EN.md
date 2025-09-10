# Oracle Node MCP - Multiple Connections

A comprehensive Oracle Database MCP server with support for multiple database connections without requiring multiple project instances.

## 🌟 Features

- **Multiple Oracle Connections**: Manage multiple databases from a single instance
- **Connection Pooling**: Optimized connection pools for each database
- **Environment Management**: Development, Testing, Staging, Production support
- **Centralized Monitoring**: Monitor all databases from one place
- **Data Migration**: Easy data transfer between environments
- **Backward Compatibility**: Works with existing single-connection setups

## 🚀 Quick Start

### 1. Installation

```bash
npm install oracle-node-mcp
```

### 2. Configuration

```bash
# Interactive setup
npm run setup-multi-connections

# Or manually create config/multi-connections.json
```

### 3. Basic Usage

```javascript
// List available connections
await mcp.callTool('list_connections');

// Test all connections
await mcp.callTool('test_all_connections');

// Use specific connection
await mcp.callTool('check_database_health', {
  connectionName: 'production'
});
```

## 📋 Configuration

### Multiple Connections Setup

Create `config/multi-connections.json`:

```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "description": "Production Database",
      "environment": "production",
      "poolMin": 5,
      "poolMax": 50,
      "poolIncrement": 5
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

### MCP Configuration

Update your `mcp-config.json`:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["path/to/oracle_node_mcp/src/index.js"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0"
      }
    }
  }
}
```

## 🛠️ Available Tools

### Connection Management

- `list_connections` - List all configured connections
- `test_connection` - Test a specific connection
- `test_all_connections` - Test all connections
- `get_connections_status` - Get status of active connections

### Database Operations (with connectionName parameter)

- `check_database_health` - Check database health
- `monitor_schema_changes` - Monitor schema changes
- `execute_safe_query` - Execute safe queries
- `get_database_info` - Get database information
- `get_table_info` - Get table information
- `create_table` - Create tables
- `alter_table` - Alter tables
- `drop_table` - Drop tables
- `select_data` - Query data
- `insert_data` - Insert data
- `update_data` - Update data
- `delete_data` - Delete data
- `create_user` - Create users
- `grant_privileges` - Grant privileges
- `revoke_privileges` - Revoke privileges

## 📊 Usage Examples

### Multi-Environment Development

```javascript
// Development
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'new_feature',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100 }
  ]
});

// Testing
await mcp.callTool('create_table', {
  connectionName: 'testing',
  tableName: 'new_feature',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100 }
  ]
});

// Production
await mcp.callTool('create_table', {
  connectionName: 'production',
  tableName: 'new_feature',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100 }
  ]
});
```

### Centralized Monitoring

```javascript
// Monitor all environments
const environments = ['development', 'testing', 'staging', 'production'];

for (const env of environments) {
  const health = await mcp.callTool('check_database_health', {
    connectionName: env
  });
  console.log(`${env} status:`, health);
}
```

### Data Migration

```javascript
// Query from development
const data = await mcp.callTool('select_data', {
  connectionName: 'development',
  tableName: 'source_table',
  schema: 'HR'
});

// Insert into staging
await mcp.callTool('insert_data', {
  connectionName: 'staging',
  tableName: 'target_table',
  schema: 'HR',
  data: data
});
```

## 🔧 Advanced Configuration

### Connection Pool Settings

```json
{
  "connections": {
    "production": {
      "poolMin": 5,        // Minimum connections
      "poolMax": 50,       // Maximum connections
      "poolIncrement": 5,  // Increment step
      "poolTimeout": 60,   // Timeout in seconds
      "poolPingInterval": 60 // Ping interval
    }
  }
}
```

### Monitoring Configuration

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

#### Connection Not Found
```
Error: Connection 'production' not found in configuration
```
**Solution**: Verify connection name exists in `config/multi-connections.json`

#### Connection Failure
```
Error: Connection failure 'production': ORA-12541: TNS:no listener
```
**Solution**: Check Oracle server status and connection parameters

#### Pool Exhausted
```
Error: Connection pool exhausted
```
**Solution**: Increase `poolMax` values in configuration

### Debug Commands

```bash
# Check logs
tail -f logs/oracle-mcp.log

# Test connections
npm run demo-multi-connections

# Interactive setup
npm run setup-multi-connections
```

## 📈 Benefits

1. **Single Instance**: No need for multiple project downloads
2. **Centralized Management**: All connections in one place
3. **Optimized Performance**: Individual connection pools
4. **Unified Monitoring**: Single dashboard for all databases
5. **Easy Migration**: Simple data transfer between environments
6. **Backward Compatible**: Works with existing setups
7. **Secure**: Environment-isolated credentials
8. **Scalable**: Easy to add/remove connections

## 🎯 Use Cases

- **Multi-Environment Development**: Dev → Test → Staging → Production
- **Centralized Database Monitoring**: Single point for all databases
- **Data Migration**: Transfer data between environments
- **Backup Operations**: Work with backup databases
- **Analytics**: Connect to data warehouses
- **Disaster Recovery**: Recovery database connections

## 📚 Documentation

- [Complete Guide](MULTIPLE-CONNECTIONS-EN.md) - Detailed setup and usage
- [Examples](examples/multi-connection-examples-en.md) - Practical examples
- [Configuration Reference](config/multi-connections-example.json) - Full configuration example

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/lrferr/oracle-node-mcp/issues)
- **Documentation**: [Full Documentation](README.md)
- **Examples**: [Examples Directory](examples/)

---

**💡 Pro Tip**: Start with 2-3 connections (development, testing, production) and expand as needed!
