# 🚀 Oracle Node MCP Server

[![npm version](https://badge.fury.io/js/oracle-mcp-v1.svg)](https://badge.fury.io/js/oracle-mcp-v1)
[![Downloads](https://img.shields.io/npm/dm/oracle-mcp-v1.svg)](https://www.npmjs.com/package/oracle-mcp-v1)
[![GitHub stars](https://img.shields.io/github/stars/lrferr/oracle-mcp-v1.svg)](https://github.com/lrferr/oracle-mcp-v1/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful MCP (Model Context Protocol) server for Oracle Database monitoring, administration, and interaction with Claude Desktop and Cursor IDE.

**📖 [English Version](README-EN.md) | 🇧🇷 [Versão em Português](README.md)**

## ✨ Features

- **🔗 Multiple Oracle Connections** - Connect to multiple Oracle databases simultaneously
- **📊 Database Health Monitoring** - Real-time health checks and performance metrics
- **🛡️ Schema Change Detection** - Monitor critical schema changes
- **🔧 Metadata Management** - Complete database structure analysis
- **✅ Migration Validation** - Safe migration script validation
- **👥 User Administration** - User and privilege management
- **🔍 Query Execution** - Safe SELECT query execution
- **⚡ Automated Setup** - One-command Cursor/Claude Desktop configuration
- **🎯 Multi-Environment Support** - Development, Testing, Staging, Production

## 🛠️ Installation

### Option 1: NPM Installation (Recommended)

```bash
# Install globally
npm install -g oracle-mcp-v1

# Or use with npx (without installing)
npx oracle-mcp-v1 --help
```

## 🚀 Quick Setup

### MCP Configuration (Cursor/Claude Desktop)

Add the following configuration to your `mcp.json` file:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1@latest"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "ORACLE_CLIENT_PATH": "C:\\oracle\\instantclient_21_8",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"prod\":{\"user\":\"your_username\",\"password\":\"your_password\",\"connectString\":\"server:port/service\",\"description\":\"Production Database\"}},\"defaultConnection\":\"prod\"}"
      }
    }
  }
}
```

**For multiple connections:**
```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1@latest"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "ORACLE_CLIENT_PATH": "C:\\oracle\\instantclient_21_8",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"dev\":{\"user\":\"dev_user\",\"password\":\"dev_password\",\"connectString\":\"dev_server:1521/dev01\",\"description\":\"Development Database\"},\"prod\":{\"user\":\"prod_user\",\"password\":\"prod_password\",\"connectString\":\"prod_server:1529/prod01\",\"description\":\"Production Database\"}},\"defaultConnection\":\"prod\"}"
      }
    }
  }
}
```

### Option 2: Local Installation

1. **Clone the repository:**
```bash
git clone https://github.com/lrferr/oracle-mcp-v1.git
cd oracle-mcp-v1
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp env.example .env
```

4. **Edit the `.env` file with your settings:**
```env
# Oracle Database Configuration
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=ORCL
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password

# MCP Server Configuration
MCP_SERVER_NAME=oracle-monitor
MCP_SERVER_VERSION=1.0.0

# Log Configuration
LOG_LEVEL=info
LOG_FILE=logs/oracle-mcp.log

# Monitoring Configuration
MONITOR_INTERVAL=300000
CRITICAL_SCHEMAS=HR,SCOTT,SYSTEM
SENSITIVE_TABLES=USERS,ACCOUNTS,TRANSACTIONS

# Notification Configuration
NOTIFICATION_ENABLED=true
NOTIFICATION_EMAIL=admin@company.com
```

## 🚀 Usage

### Quick Setup (NPM)

```bash
# Configure Cursor IDE automatically
npx oracle-mcp setup-cursor

# Test Oracle connection
npx oracle-mcp test-connection

# Start MCP server
npx oracle-mcp
```

### 🔗 Multiple Connections

```bash
# Configure multiple connections interactively
npm run setup-multi-connections

# Test all connections
npm run demo-multi-connections

# Generate MCP configuration for Cursor/Claude
npm run generate-mcp-config
```

**📖 [Complete Multiple Connections Guide](guides/MULTIPLE-CONNECTIONS-EN.md)**

### Manual Configuration

**Automatic Configuration:**
```bash
# Windows
scripts\setup-cursor.bat

# Linux/macOS
./scripts/setup-cursor.sh
```

**Manual Configuration:**
1. Locate the Claude Desktop configuration file
2. Add MCP configuration (see `docs/configuration-guide.md`)
3. Restart Cursor IDE

### Available Commands

```bash
# Show help
npx oracle-mcp --help

# Test Oracle connection
npx oracle-mcp test-connection

# Configure Cursor IDE
npx oracle-mcp setup-cursor

# Configure Claude Desktop
npx oracle-mcp setup-claude

# Start MCP server
npx oracle-mcp

# Show version
npx oracle-mcp version
```

### Start MCP Server

```bash
# Development mode (with watch)
npm run dev

# Production mode
npm start
```

## 🛠️ Available Tools

The MCP server offers the following tools:

### Health and Monitoring
- `check_database_health` - Check database health status
- `monitor_schema_changes` - Monitor critical schema changes
- `check_sensitive_tables` - Check sensitive table changes
- `get_database_info` - Get general database information

### Metadata and Structure
- `get_table_info` - Get detailed table information
- `get_constraints` - List table constraints
- `get_foreign_keys` - List foreign keys
- `get_indexes` - List table indexes
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

- Node.js 18.0.0 or higher
- Oracle Database 11g or higher
- Access to database with appropriate privileges
- DBeaver or similar for initial configuration

## 🔧 Configuration

### Cursor IDE Configuration

The server automatically configures Cursor IDE with the following MCP configuration:

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

### Claude Desktop Configuration

Same configuration as Cursor IDE.

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

### Problem: Server doesn't start

**Solution:**
1. Check if Node.js is installed: `node --version`
2. Check if dependencies are installed: `npm install`
3. Check Oracle credentials in `.env` file
4. Test connection: `npm run test-connection`

### Problem: Claude doesn't recognize the server

**Solution:**
1. Check configuration file path
2. Check if JSON is valid
3. Restart Cursor/Claude Desktop
4. Check server logs

### Problem: Oracle connection error

**Solution:**
1. Check if Oracle is running
2. Check host, port and service name
3. Check username and password
4. Check if user has necessary privileges

## 📚 Additional Resources

- [📦 NPM Package](https://www.npmjs.com/package/oracle-mcp-v1)
- [🐙 GitHub Repository](https://github.com/lrferr/oracle-mcp-v1)
- [📖 Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [🔗 Model Context Protocol](https://modelcontextprotocol.io/)
- [⚡ Node.js Oracle Driver](https://oracle.github.io/node-oracledb/)
- [📝 Winston Logger](https://github.com/winstonjs/winston)

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

**Developed with ❤️ by Leandro Ferreira**
