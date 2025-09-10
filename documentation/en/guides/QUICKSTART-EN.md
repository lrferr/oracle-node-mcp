# 🚀 Quick Start Guide - Oracle Node MCP Server

Get up and running with the Oracle Node MCP Server in minutes!

## ⚡ Installation

### Option 1: NPM (Recommended)

```bash
# Install globally
npm install -g oracle-mcp-v1

# Or use with npx
npx oracle-mcp-v1 --help
```

### Option 2: Local Installation

```bash
# Clone repository
git clone https://github.com/lrferr/oracle-mcp-v1.git
cd oracle-mcp-v1

# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your Oracle credentials
```

## 🔧 Quick Configuration

### Automatic Setup

```bash
# Configure Cursor IDE automatically
npx oracle-mcp setup-cursor

# Test Oracle connection
npx oracle-mcp test-connection

# Start MCP server
npx oracle-mcp
```

### Manual Configuration

1. **Locate configuration file:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/claude/claude_desktop_config.json`

2. **Add MCP configuration:**
```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "ORACLE_HOST": "your-host",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "your_service",
        "ORACLE_USER": "your_username",
        "ORACLE_PASSWORD": "your_password"
      }
    }
  }
}
```

3. **Restart Cursor/Claude Desktop**

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

## 🧪 Test Your Setup

### 1. Test Connection

```bash
npx oracle-mcp test-connection
```

### 2. Test in Cursor/Claude Desktop

Open a new conversation and try:

```
Check the health of the Oracle database
```

**Expected response:**
- Database health status
- Connection information
- Tablespace usage
- Performance metrics

### 3. Explore Tools

Try these commands:

```
List all tables from the HR schema
Show all foreign keys from the HR schema
Analyze indexes for the EMPLOYEES table in HR schema
Execute query: SELECT COUNT(*) FROM HR.EMPLOYEES
```

## 📋 Prerequisites

- Node.js 18.0.0+
- Oracle Database 11g+
- Cursor IDE or Claude Desktop
- Oracle database access

## 🔧 Environment Configuration

Create a `.env` file with your Oracle credentials:

```env
# Oracle Database Configuration
ORACLE_HOST=your-oracle-host.com
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=your_service
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password

# MCP Server Configuration
MCP_SERVER_NAME=oracle-monitor
LOG_LEVEL=info
```

## 🐛 Troubleshooting

### Connection Issues

```bash
# Test Oracle connection
npx oracle-mcp test-connection

# Check if Oracle is running
# Verify host, port, and service name
# Check username and password
```

### Configuration Issues

```bash
# Verify configuration
npx oracle-mcp setup-cursor

# Check configuration file exists
# Restart Cursor/Claude Desktop
```

### Server Issues

```bash
# Start server manually
npx oracle-mcp

# Check logs for errors
# Verify Node.js version
```

## 📚 Next Steps

1. **Explore Tools:** Try different MCP tools
2. **Configure Monitoring:** Set up continuous monitoring
3. **Customize Alerts:** Configure notification settings
4. **Advanced Usage:** Explore complex queries and analysis

## 🔗 Useful Commands

```bash
# Show help
npx oracle-mcp --help

# Test connection
npx oracle-mcp test-connection

# Configure Cursor
npx oracle-mcp setup-cursor

# Configure Claude Desktop
npx oracle-mcp setup-claude

# Start server
npx oracle-mcp

# Show version
npx oracle-mcp version
```

## 📖 Documentation

- [Complete README](README-EN.md)
- [Configuration Guide](docs/configuration-guide-en.md)
- [Usage Examples](examples/usage-examples-en.md)
- [GitHub Repository](https://github.com/lrferr/oracle-mcp-v1)

---

**🎉 You're ready to start using the Oracle Node MCP Server!**

**💡 Tip:** Start with simple health checks and gradually explore more advanced features.
