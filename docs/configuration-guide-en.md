# Configuration Guide - Oracle Node MCP Server

This guide explains how to configure the Oracle MCP server in Cursor and Claude Desktop.

## 📋 Prerequisites

- Node.js 18+ installed
- Oracle Database accessible
- Cursor IDE or Claude Desktop
- Valid Oracle credentials

## 🚀 MCP Server Installation

### 1. Install Dependencies

```bash
# In the project directory
npm install
```

### 2. Configure Environment Variables

```bash
# Copy example file
cp env.example .env

# Edit with your credentials
nano .env
```

**Example configuration (.env):**
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

### 3. Test Connection

```bash
# Test if Oracle connection is working
npm run test-connection
```

## 🔧 Cursor IDE Configuration

### 1. Locate MCP Configuration File

Cursor uses the same configuration system as Claude Desktop. Locate the file:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/claude/claude_desktop_config.json
```

### 2. Configure MCP Server

Add the Oracle server configuration to the `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "your_username",
        "ORACLE_PASSWORD": "your_password",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 3. Complete Configuration Example

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "your-oracle-host.com",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "your_service",
        "ORACLE_USER": "your_username",
        "ORACLE_PASSWORD": "your_password",
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "LOG_FILE": "logs/oracle-mcp.log",
        "MONITOR_INTERVAL": "300000",
        "CRITICAL_SCHEMAS": "HR,SCOTT,SYSTEM",
        "SENSITIVE_TABLES": "USERS,ACCOUNTS,TRANSACTIONS",
        "NOTIFICATION_ENABLED": "true",
        "NOTIFICATION_EMAIL": "admin@company.com"
      }
    }
  }
}
```

## 🔧 Claude Desktop Configuration

### 1. Locate Configuration File

The Claude Desktop configuration file is located at:

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/claude/claude_desktop_config.json
```

### 2. Configure MCP Server

Use the same configuration shown above for Cursor.

## 🛠️ Alternative Configuration (Using .env)

### 1. Configure Absolute Path

If you prefer to use the `.env` file, configure the absolute path:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "cwd": "C:\\path\\to\\oracle_node_mcp"
    }
  }
}
```

### 2. Use Startup Script

Create a `start-mcp.bat` (Windows) or `start-mcp.sh` (Linux/macOS) script:

**start-mcp.bat:**
```batch
@echo off
cd /d "C:\path\to\oracle_node_mcp"
node src\index.js
```

**start-mcp.sh:**
```bash
#!/bin/bash
cd "/path/to/oracle_node_mcp"
node src/index.js
```

And configure in MCP:
```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "C:\\path\\to\\oracle_node_mcp\\start-mcp.bat"
    }
  }
}
```

## 🔍 Configuration Verification

### 1. Check if Server is Running

```bash
# In the project directory
npm start
```

You should see output similar to:
```
Oracle MCP Server started successfully!
```

### 2. Test in Cursor/Claude Desktop

1. Restart Cursor/Claude Desktop
2. Open a new conversation
3. Type: "List available Oracle tools"
4. Claude should respond with the list of MCP tools

### 3. Test Oracle Connection

In Cursor/Claude Desktop, type:
```
Check the health of the Oracle database
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

### Problem: Path not found

**Solution:**
1. Use absolute paths
2. Check if `src/index.js` file exists
3. Use double backslashes on Windows: `C:\\path\\file.js`

## 📝 Usage Examples

### 1. Check Database Health

```
Check the health of the Oracle database
```

### 2. List Tables from a Schema

```
List all tables from the HR schema
```

### 3. Analyze Constraints

```
Show all foreign keys from the HR schema
```

### 4. Check Performance

```
Analyze indexes for the EMPLOYEES table in HR schema
```

## 🔧 Advanced Configuration

### 1. Multiple MCP Servers

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "user1",
        "ORACLE_PASSWORD": "password1"
      }
    },
    "oracle-prod": {
      "command": "node",
      "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "prod-server",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "PROD",
        "ORACLE_USER": "user2",
        "ORACLE_PASSWORD": "password2"
      }
    }
  }
}
```

### 2. Configuration with Logs

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "your_username",
        "ORACLE_PASSWORD": "your_password",
        "LOG_LEVEL": "debug",
        "LOG_FILE": "logs/oracle-mcp-debug.log"
      }
    }
  }
}
```

## 📚 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Oracle Node.js Documentation](https://oracle.github.io/node-oracledb/)
- [Cursor IDE Documentation](https://cursor.sh/docs)
- [Claude Desktop Documentation](https://claude.ai/desktop)
- [GitHub Repository](https://github.com/lrferr/oracle-node-mcp)

---

**💡 Tip:** Always keep a backup copy of the configuration file before making changes!
