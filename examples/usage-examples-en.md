# Usage Examples - Oracle Node MCP Server

This document provides practical examples of how to use each MCP tool available in the Oracle Node MCP Server.

## 🏥 Health and Monitoring Tools

### 1. Check Database Health

**Tool:** `check_database_health`

**Description:** Verifies the overall health of the Oracle database, including connections, tablespaces, and performance metrics.

**Example Usage:**
```json
{
  "tool": "check_database_health",
  "arguments": {
    "checkConnections": true,
    "checkTablespaces": true,
    "checkPerformance": true
  }
}
```

**Expected Response:**
```json
{
  "status": "healthy",
  "connections": {
    "active": 15,
    "max": 100,
    "usage_percentage": 15
  },
  "tablespaces": [
    {
      "name": "USERS",
      "used_percentage": 45.2,
      "status": "healthy"
    }
  ],
  "performance": {
    "average_response_time": 120,
    "status": "good"
  }
}
```

### 2. Monitor Schema Changes

**Tool:** `monitor_schema_changes`

**Description:** Monitors changes in critical schemas and generates alerts.

**Example Usage:**
```json
{
  "tool": "monitor_schema_changes",
  "arguments": {
    "schemas": ["HR", "SCOTT", "SYSTEM"],
    "checkInterval": 5
  }
}
```

### 3. Check Sensitive Tables

**Tool:** `check_sensitive_tables`

**Description:** Verifies changes in sensitive tables that require special attention.

**Example Usage:**
```json
{
  "tool": "check_sensitive_tables",
  "arguments": {
    "tables": ["USERS", "ACCOUNTS", "TRANSACTIONS"],
    "checkDataChanges": true
  }
}
```

### 4. Get Database Information

**Tool:** `get_database_info`

**Description:** Retrieves general information about the database.

**Example Usage:**
```json
{
  "tool": "get_database_info",
  "arguments": {
    "includeUsers": true,
    "includeTablespaces": true
  }
}
```

## 📊 Metadata and Structure Tools

### 5. Get Table Information

**Tool:** `get_table_info`

**Description:** Retrieves detailed information about a specific table.

**Example Usage:**
```json
{
  "tool": "get_table_info",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeConstraints": true,
    "includeIndexes": true
  }
}
```

**Expected Response:**
```json
{
  "table": {
    "name": "EMPLOYEES",
    "schema": "HR",
    "rows": 107,
    "size_mb": 2.5,
    "created": "2023-01-15T10:30:00Z"
  },
  "columns": [
    {
      "name": "EMPLOYEE_ID",
      "type": "NUMBER(6)",
      "nullable": false,
      "default": null
    }
  ],
  "constraints": [
    {
      "name": "EMP_EMP_ID_PK",
      "type": "PRIMARY KEY",
      "columns": ["EMPLOYEE_ID"]
    }
  ],
  "indexes": [
    {
      "name": "EMP_DEPARTMENT_IX",
      "columns": ["DEPARTMENT_ID"],
      "status": "VALID"
    }
  ]
}
```

### 6. Get Constraints

**Tool:** `get_constraints`

**Description:** Lists constraints for a table or schema.

**Example Usage:**
```json
{
  "tool": "get_constraints",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "constraintType": "ALL"
  }
}
```

### 7. Get Foreign Keys

**Tool:** `get_foreign_keys`

**Description:** Lists foreign keys and their references.

**Example Usage:**
```json
{
  "tool": "get_foreign_keys",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "showReferenced": true
  }
}
```

### 8. Get Indexes

**Tool:** `get_indexes`

**Description:** Lists indexes for a table or schema.

**Example Usage:**
```json
{
  "tool": "get_indexes",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeStats": true
  }
}
```

### 9. Get Sequences

**Tool:** `get_sequences`

**Description:** Lists sequences in a schema.

**Example Usage:**
```json
{
  "tool": "get_sequences",
  "arguments": {
    "schema": "HR",
    "includeValues": true
  }
}
```

### 10. Get Triggers

**Tool:** `get_triggers`

**Description:** Lists triggers for a table or schema.

**Example Usage:**
```json
{
  "tool": "get_triggers",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeCode": false
  }
}
```

## 👥 Administration Tools

### 11. Get Users and Privileges

**Tool:** `get_users_privileges`

**Description:** Lists users and their privileges.

**Example Usage:**
```json
{
  "tool": "get_users_privileges",
  "arguments": {
    "user": "HR",
    "includeRoles": true,
    "includeSystemPrivs": false
  }
}
```

### 12. Get Table Dependencies

**Tool:** `get_table_dependencies`

**Description:** Shows table dependencies (what depends on it and what it depends on).

**Example Usage:**
```json
{
  "tool": "get_table_dependencies",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "dependencyType": "ALL"
  }
}
```

### 13. Analyze Table

**Tool:** `analyze_table`

**Description:** Analyzes a table and generates statistics.

**Example Usage:**
```json
{
  "tool": "analyze_table",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "estimatePercent": 10
  }
}
```

## 🔍 Validation and Query Tools

### 14. Execute Safe Query

**Tool:** `execute_safe_query`

**Description:** Executes safe SELECT queries.

**Example Usage:**
```json
{
  "tool": "execute_safe_query",
  "arguments": {
    "query": "SELECT employee_id, first_name, last_name FROM HR.EMPLOYEES WHERE department_id = 10",
    "schema": "HR"
  }
}
```

**Expected Response:**
```json
{
  "results": [
    {
      "EMPLOYEE_ID": 200,
      "FIRST_NAME": "Jennifer",
      "LAST_NAME": "Whalen"
    }
  ],
  "rowCount": 1,
  "executionTime": 45
}
```

### 15. Validate Migration Script

**Tool:** `validate_migration_script`

**Description:** Validates migration scripts for safety and syntax.

**Example Usage:**
```json
{
  "tool": "validate_migration_script",
  "arguments": {
    "script": "ALTER TABLE HR.EMPLOYEES ADD COLUMN phone VARCHAR2(20);",
    "targetSchema": "HR"
  }
}
```

## 🎯 Common Use Cases

### Database Health Check
```json
{
  "tool": "check_database_health",
  "arguments": {
    "checkConnections": true,
    "checkTablespaces": true,
    "checkPerformance": true
  }
}
```

### Schema Analysis
```json
{
  "tool": "get_table_info",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeConstraints": true,
    "includeIndexes": true
  }
}
```

### Performance Analysis
```json
{
  "tool": "get_indexes",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeStats": true
  }
}
```

### Data Query
```json
{
  "tool": "execute_safe_query",
  "arguments": {
    "query": "SELECT COUNT(*) as total_employees FROM HR.EMPLOYEES",
    "schema": "HR"
  }
}
```

### Migration Validation
```json
{
  "tool": "validate_migration_script",
  "arguments": {
    "script": "CREATE INDEX idx_emp_dept ON HR.EMPLOYEES(department_id);",
    "targetSchema": "HR"
  }
}
```

## 🔧 Error Handling

### Common Error Responses

**Connection Error:**
```json
{
  "error": "Connection failed",
  "message": "Unable to connect to Oracle database",
  "details": "ORA-12541: TNS:no listener"
}
```

**Permission Error:**
```json
{
  "error": "Permission denied",
  "message": "Insufficient privileges to access table",
  "details": "ORA-00942: table or view does not exist"
}
```

**Query Error:**
```json
{
  "error": "Query execution failed",
  "message": "Invalid SQL syntax",
  "details": "ORA-00933: SQL command not properly ended"
}
```

## 📝 Best Practices

1. **Always test connections** before running complex operations
2. **Use specific schemas** when possible to avoid conflicts
3. **Check permissions** before attempting administrative operations
4. **Validate migration scripts** before applying them
5. **Monitor performance** regularly to identify issues early
6. **Use safe queries** to avoid data modification accidents

## 🚀 Advanced Examples

### Complete Database Analysis
```json
{
  "tool": "get_database_info",
  "arguments": {
    "includeUsers": true,
    "includeTablespaces": true
  }
}
```

### Comprehensive Table Analysis
```json
{
  "tool": "get_table_info",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeConstraints": true,
    "includeIndexes": true
  }
}
```

### Dependency Analysis
```json
{
  "tool": "get_table_dependencies",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "dependencyType": "ALL"
  }
}
```

---

**💡 Tip:** Start with simple queries and gradually explore more complex operations as you become familiar with the tools.
