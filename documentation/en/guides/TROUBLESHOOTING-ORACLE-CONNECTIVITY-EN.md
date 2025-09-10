# 🔧 Troubleshooting Guide - Oracle Connectivity

This guide helps resolve common Oracle connectivity issues in the Oracle Node MCP Server.

## 🚨 Common Issues

### **1. Error: "password verifier type 0x939 is not supported"**

**Symptoms:**
```
❌ Connection test failed 'prod': NJS-116: password verifier type 0x939 is not supported by node-oracledb in Thin mode
```

**Cause:** The Oracle database is using an old password verifier that is not compatible with node-oracledb Thin mode.

**Solutions:**

#### **Solution 1: Install Oracle Instant Client (Recommended)**

1. **Windows:**
   ```cmd
   # Run as Administrator
   scripts\install-oracle-simple.bat
   ```

2. **Linux/macOS:**
   ```bash
   # Run with sudo
   sudo ./scripts/install-oracle-client.sh
   ```

3. **Configure environment variable in MCP:**
   ```json
   {
     "mcpServers": {
       "oracle-monitor-2": {
         "command": "npx oracle-mcp-v1@1.5.1",
         "env": {
           "ORACLE_CLIENT_PATH": "C:\\oracle\\instantclient_21_8\\instantclient_21_8",
           "ORACLE_CONNECTIONS": "..."
         }
       }
     }
   }
   ```

#### **Solution 2: Update Password in Database (Alternative)**

Execute in Oracle database as DBA:

```sql
-- Connect as DBA
CONNECT / AS SYSDBA;

-- Check user
SELECT username, account_status, password_versions 
FROM dba_users 
WHERE username = 'YOUR_USER';

-- Change password to generate modern verifier
ALTER USER YOUR_USER IDENTIFIED BY NewStrongPassword123!;

-- Verify it worked
SELECT username, password_versions 
FROM dba_users 
WHERE username = 'YOUR_USER';
-- Should show: 10G 11G 12C HTTP
```

### **2. Error: "ORA-01017: invalid username/password"**

**Symptoms:**
```
❌ Connection error: ORA-01017: invalid username/password; logon denied
```

**Solutions:**

1. **Verify credentials:**
   - Confirm username and password
   - Check if password has expired
   - Test connection in another tool (SQL Developer, DBeaver)

2. **Check if user is locked:**
   ```sql
   SELECT username, account_status, lock_date 
   FROM dba_users 
   WHERE username = 'YOUR_USER';
   ```

3. **Unlock user if necessary:**
   ```sql
   ALTER USER YOUR_USER ACCOUNT UNLOCK;
   ```

### **3. Error: "ORA-12541: TNS:no listener"**

**Symptoms:**
```
❌ Connection error: ORA-12541: TNS:no listener
```

**Solutions:**

1. **Check network connectivity:**
   ```bash
   telnet oracle-server.com 1521
   ```

2. **Verify connection string:**
   - Correct host
   - Correct port
   - Correct service name

3. **Test with different formats:**
   ```json
   "connectString": "server:1521/SERVICE_NAME"
   "connectString": "server:1521/XE"
   "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=server)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=SERVICE_NAME)))"
   ```

### **4. Error: "ORA-12514: TNS:listener does not currently know of service"**

**Symptoms:**
```
❌ Connection error: ORA-12514: TNS:listener does not currently know of service
```

**Solutions:**

1. **Check service name:**
   ```sql
   SELECT name FROM v$services;
   ```

2. **Use SID instead of service name:**
   ```json
   "connectString": "server:1521/SID"
   ```

3. **Check if database is running:**
   ```sql
   SELECT status FROM v$instance;
   ```

## 🔍 Diagnostic Scripts

### **Complete Connectivity Test**

```bash
# Run complete diagnosis
node scripts/diagnose-mcp.js
```

### **Thick Mode Test**

```bash
# Test Thick mode specifically
node scripts/test-thick-mode.js
```

### **MCP Connections Test**

```bash
# Test all configured connections
npm run test-connection
```

## 📋 Troubleshooting Checklist

### **Step 1: Diagnosis**
- [ ] Run diagnostic script
- [ ] Check error logs
- [ ] Test network connectivity

### **Step 2: Configuration**
- [ ] Verify credentials
- [ ] Verify connection string
- [ ] Verify environment variables

### **Step 3: Database**
- [ ] Check if user exists
- [ ] Check if user is active
- [ ] Check if password is correct
- [ ] Check if service name is correct

### **Step 4: Oracle Client**
- [ ] Install Oracle Instant Client
- [ ] Configure ORACLE_CLIENT_PATH variable
- [ ] Test Thick mode

### **Step 5: MCP**
- [ ] Update MCP configuration
- [ ] Restart Cursor/Claude
- [ ] Test connections

## 🛠️ Recommended Configuration

### **Complete mcp.json file:**

```json
{
  "mcpServers": {
    "oracle-monitor-2": {
      "command": "npx oracle-mcp-v1@1.5.1",
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor-2",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "ORACLE_CLIENT_PATH": "C:\\oracle\\instantclient_21_8\\instantclient_21_8",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"hml\":{\"user\":\"hml_user\",\"password\":\"hml_password\",\"connectString\":\"hml_server:1521/hml01\",\"description\":\"Homologation\"},\"prod\":{\"user\":\"prod_user\",\"password\":\"prod_password\",\"connectString\":\"prod_server:1529/prod01\",\"description\":\"Production\"}},\"defaultConnection\":\"hml\"}"
      }
    }
  }
}
```

## 📞 Support

If problems persist:

1. **Check logs:** `logs/oracle-mcp.log`
2. **Run diagnosis:** `node scripts/diagnose-mcp.js`
3. **Check documentation:** [README.md](../README-EN.md)
4. **Open issue:** [GitHub Issues](https://github.com/lrferr/oracle-mcp-v1/issues)

## 🔗 Useful Links

- [node-oracledb Documentation](https://node-oracledb.readthedocs.io/)
- [Oracle Instant Client Downloads](https://www.oracle.com/database/technologies/instant-client/downloads.html)
- [Oracle Database Error Messages](https://docs.oracle.com/en/database/oracle/oracle-database/19/errmg/)
