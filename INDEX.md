# 📚 Oracle Node MCP Server - Documentation Index

Welcome to the Oracle Node MCP Server documentation! This project is available in both English and Portuguese (Brazil).

## 🌍 Language Versions

### 🇺🇸 English
- **[README](README-EN.md)** - Complete project documentation
- **[Quick Start Guide](QUICKSTART-EN.md)** - Get started quickly
- **[Configuration Guide](docs/configuration-guide-en.md)** - Detailed configuration
- **[Usage Examples](examples/usage-examples-en.md)** - Practical examples
- **[Publishing Guide](PUBLISH-GUIDE-EN.md)** - NPM publishing guide

### 🇧🇷 Português (Brasil)
- **[README](README.md)** - Documentação completa do projeto
- **[Guia Rápido](QUICKSTART.md)** - Comece rapidamente
- **[Guia de Configuração](docs/configuration-guide.md)** - Configuração detalhada
- **[Exemplos de Uso](examples/usage-examples.md)** - Exemplos práticos
- **[Guia de Publicação](PUBLISH-GUIDE.md)** - Guia de publicação NPM

## 🚀 Quick Start

### Installation
```bash
# Install globally
npm install -g oracle-mcp-v1

# Or use with npx
npx oracle-mcp-v1 --help
```

### Configuration
```bash
# Configure Cursor IDE automatically
npx oracle-mcp setup-cursor

# Test Oracle connection
npx oracle-mcp test-connection

# Start MCP server
npx oracle-mcp
```

## 🛠️ Available Tools

### Health and Monitoring
- `check_database_health` - Check database health
- `monitor_schema_changes` - Monitor schema changes
- `check_sensitive_tables` - Check sensitive tables
- `get_database_info` - Get database information

### Metadata and Structure
- `get_table_info` - Get table information
- `get_constraints` - List constraints
- `get_foreign_keys` - List foreign keys
- `get_indexes` - List indexes
- `get_sequences` - List sequences
- `get_triggers` - List triggers

### Administration
- `get_users_privileges` - List users and privileges
- `get_table_dependencies` - Show table dependencies
- `analyze_table` - Analyze table and generate statistics

### Validation and Queries
- `execute_safe_query` - Execute safe SELECT queries
- `validate_migration_script` - Validate migration scripts

## 📋 Prerequisites

- Node.js 18.0.0+
- Oracle Database 11g+
- Cursor IDE or Claude Desktop
- Oracle database access

## 🔧 Configuration

The server automatically configures Cursor IDE and Claude Desktop with the following MCP configuration:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "your_username",
        "ORACLE_PASSWORD": "your_password"
      }
    }
  }
}
```

## 📝 Usage Examples

### Check Database Health
```
Check the health of the Oracle database
```

### List Tables from a Schema
```
Show all tables from the HR schema
```

### Analyze Constraints
```
List all foreign keys from the HR schema
```

### Check Performance
```
Analyze indexes for the EMPLOYEES table in HR schema
```

### Query Data
```
Execute query: SELECT * FROM HR.EMPLOYEES WHERE department_id = 10
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Problems**
   - Check Oracle credentials
   - Verify host, port, and service name
   - Test connection: `npx oracle-mcp test-connection`

2. **Configuration Issues**
   - Verify configuration file exists
   - Check JSON syntax
   - Restart Cursor/Claude Desktop

3. **Server Issues**
   - Check Node.js version
   - Verify dependencies
   - Check server logs

## 📚 Additional Resources

- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Node.js Oracle Driver](https://oracle.github.io/node-oracledb/)
- [GitHub Repository](https://github.com/lrferr/oracle-node-mcp)
- [Winston Logger](https://github.com/winstonjs/winston)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Open an issue on GitHub
2. Check the documentation
3. Check logs for specific errors
4. Contact the development team

---

**Developed with ❤️ by the Oracle MCP Team**

**Desenvolvido com ❤️ pela equipe Oracle MCP**
