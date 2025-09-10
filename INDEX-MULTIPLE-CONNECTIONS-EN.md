# Oracle Node MCP - Multiple Connections Index

Complete guide and reference for using multiple Oracle connections with Oracle Node MCP.

## 📚 Documentation

### Main Guides
- [**Complete Guide**](MULTIPLE-CONNECTIONS-EN.md) - Comprehensive setup and usage guide
- [**Quick Start**](README-MULTIPLE-CONNECTIONS-EN.md) - Get started quickly
- [**Examples**](examples/multi-connection-examples-en.md) - Practical usage examples

### Configuration Files
- [**Configuration Example**](config/multi-connections-example-en.json) - Complete configuration example
- [**Basic Configuration**](config/multi-connections.json) - Simple configuration template

### Scripts and Tools
- [**Setup Script**](scripts/setup-multi-connections.js) - Interactive configuration setup
- [**Demo Script**](examples/multi-connection-demo-en.js) - Usage demonstration
- [**Connection Manager**](src/connection-manager.js) - Core connection management

## 🚀 Quick Start

### 1. Installation
```bash
npm install oracle-mcp-v1
```

### 2. Configuration
```bash
# Interactive setup
npm run setup-multi-connections

# Or manually configure
# Edit config/multi-connections.json
```

### 3. Usage
```javascript
// List connections
await mcp.callTool('list_connections');

// Use specific connection
await mcp.callTool('check_database_health', {
  connectionName: 'production'
});
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

## 📊 Common Use Cases

### Multi-Environment Development
```javascript
// Development → Testing → Production pipeline
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'new_feature',
  // ... parameters
});
```

### Centralized Monitoring
```javascript
// Monitor all environments
const environments = ['development', 'testing', 'production'];
for (const env of environments) {
  const health = await mcp.callTool('check_database_health', {
    connectionName: env
  });
}
```

### Data Migration
```javascript
// Transfer data between environments
const data = await mcp.callTool('select_data', {
  connectionName: 'development',
  tableName: 'source_table'
});

await mcp.callTool('insert_data', {
  connectionName: 'staging',
  tableName: 'target_table',
  data: data
});
```

## 🔧 Configuration

### Basic Configuration
```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "description": "Production Database"
    },
    "development": {
      "user": "HR_DEV",
      "password": "dev_password",
      "connectString": "dev-server:1521/DEV",
      "description": "Development Database"
    }
  },
  "defaultConnection": "development"
}
```

### Advanced Configuration
```json
{
  "connections": {
    "production": {
      "poolMin": 5,
      "poolMax": 50,
      "poolIncrement": 5,
      "poolTimeout": 60,
      "poolPingInterval": 60
    }
  },
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

## 🚨 Troubleshooting

### Common Issues

#### Connection Not Found
```
Error: Connection 'production' not found in configuration
```
**Solution**: Check connection name in `config/multi-connections.json`

#### Connection Failure
```
Error: Connection failure 'production': ORA-12541: TNS:no listener
```
**Solution**: Verify Oracle server status and connection parameters

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

## 📚 Additional Resources

- [Main Documentation](README.md) - Complete project documentation
- [Configuration Guide](docs/configuration-guide-en.md) - Detailed configuration
- [DDL/DML/DCL Guide](docs/ddl-dml-dcl-guide.md) - Database operations guide
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Changelog](CHANGELOG.md) - Version history

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/lrferr/oracle-mcp-v1/issues)
- **Documentation**: [Full Documentation](README.md)
- **Examples**: [Examples Directory](examples/)

---

**💡 Pro Tip**: Start with 2-3 connections (development, testing, production) and expand as needed!
