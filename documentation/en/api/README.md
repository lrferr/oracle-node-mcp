# 🔧 API Reference - Oracle MCP Server

Complete API reference for Oracle MCP Server with all available tools.

## 🔗 Multiple Connections Tools

### `list_connections`
Lists all configured connections in the system.

**Parameters:** None

**Returns:**
```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "connectString": "prod-server:1521/PROD",
      "description": "Production Database",
      "environment": "production",
      "status": "active"
    },
    "development": {
      "user": "HR_DEV",
      "connectString": "dev-server:1521/DEV",
      "description": "Development Database",
      "environment": "development",
      "status": "active"
    }
  },
  "defaultConnection": "production"
}
```

### `test_connection`
Tests a specific connection.

**Parameters:**
- `connectionName` (string, required): Name of the connection to test

**Returns:**
```json
{
  "connectionName": "production",
  "status": "success",
  "message": "Connection tested successfully",
  "responseTime": 150
}
```

### `test_all_connections`
Tests all configured connections.

**Parameters:** None

**Returns:**
```json
{
  "results": {
    "production": {
      "status": "success",
      "message": "Connection tested successfully",
      "responseTime": 150
    },
    "development": {
      "status": "error",
      "message": "Connection failed: ORA-12541: TNS:no listener",
      "responseTime": 0
    }
  },
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1
  }
}
```

### `get_connections_status`
Gets the status of all active connections.

**Parameters:** None

**Returns:**
```json
{
  "connections": {
    "production": {
      "status": "active",
      "poolSize": 5,
      "poolMax": 20,
      "lastUsed": "2024-01-15T10:30:00Z"
    },
    "development": {
      "status": "inactive",
      "poolSize": 0,
      "poolMax": 10,
      "lastUsed": null
    }
  }
}
```

## 📊 Monitoring Tools

### `check_database_health`
Checks the overall health of the database.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `checkConnections` (boolean, optional): Check active connections (default: true)
- `checkTablespaces` (boolean, optional): Check tablespace space (default: true)
- `checkPerformance` (boolean, optional): Check performance metrics (default: true)

**Returns:**
```json
{
  "connectionName": "production",
  "timestamp": "2024-01-15T10:30:00Z",
  "overallStatus": "healthy",
  "checks": {
    "connections": {
      "status": "healthy",
      "activeConnections": 15,
      "maxConnections": 100,
      "utilization": 15
    },
    "tablespaces": {
      "status": "healthy",
      "tablespaces": [
        {
          "name": "USERS",
          "usedPercent": 45,
          "status": "healthy"
        }
      ]
    },
    "performance": {
      "status": "healthy",
      "averageResponseTime": 120,
      "bufferCacheHit": 95.5
    }
  }
}
```

### `monitor_schema_changes`
Monitors changes in critical schemas.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `schemas` (array, optional): List of schemas to monitor (default: ["HR", "SCOTT", "SYSTEM"])
- `checkInterval` (number, optional): Check interval in minutes (default: 5)

**Returns:**
```json
{
  "connectionName": "production",
  "timestamp": "2024-01-15T10:30:00Z",
  "schemas": ["HR", "SCOTT", "SYSTEM"],
  "changes": [
    {
      "schema": "HR",
      "objectType": "TABLE",
      "objectName": "EMPLOYEES",
      "changeType": "ALTER",
      "timestamp": "2024-01-15T10:25:00Z"
    }
  ],
  "summary": {
    "totalChanges": 1,
    "criticalChanges": 0
  }
}
```

## 🔧 DDL (Data Definition Language) Tools

### `create_table`
Creates a new table in the database.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `columns` (array, required): List of table columns
- `constraints` (array, optional): List of table constraints
- `tablespace` (string, optional): Table tablespace (default: "USERS")
- `ifNotExists` (boolean, optional): Create only if not exists (default: true)

**Column example:**
```json
{
  "columns": [
    {
      "name": "id",
      "type": "NUMBER",
      "notNull": true,
      "defaultValue": null
    },
    {
      "name": "name",
      "type": "VARCHAR2",
      "length": 100,
      "notNull": true
    },
    {
      "name": "email",
      "type": "VARCHAR2",
      "length": 255,
      "notNull": false
    }
  ]
}
```

**Constraints example:**
```json
{
  "constraints": [
    {
      "name": "PK_USERS",
      "type": "PRIMARY KEY",
      "columns": ["id"]
    },
    {
      "name": "UK_USERS_EMAIL",
      "type": "UNIQUE",
      "columns": ["email"]
    }
  ]
}
```

### `alter_table`
Alters an existing table.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `operation` (string, required): Operation type
  - `ADD_COLUMN`: Add column
  - `MODIFY_COLUMN`: Modify column
  - `DROP_COLUMN`: Drop column
  - `ADD_CONSTRAINT`: Add constraint
  - `DROP_CONSTRAINT`: Drop constraint
  - `RENAME_COLUMN`: Rename column

**Example for adding column:**
```json
{
  "operation": "ADD_COLUMN",
  "columnName": "phone",
  "columnType": "VARCHAR2",
  "columnLength": 20,
  "notNull": false
}
```

### `drop_table`
Removes a table from the database.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `ifExists` (boolean, optional): Remove only if exists (default: true)
- `cascadeConstraints` (boolean, optional): Remove dependent constraints (default: false)

## 📝 DML (Data Manipulation Language) Tools

### `select_data`
Executes a SELECT query in the database.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `columns` (array, optional): List of columns to select (default: ["*"])
- `whereClause` (string, optional): WHERE condition
- `orderBy` (string, optional): Result ordering
- `limit` (number, optional): Row limit
- `offset` (number, optional): Offset for pagination (default: 0)

**Example:**
```json
{
  "tableName": "employees",
  "schema": "HR",
  "columns": ["employee_id", "first_name", "last_name", "email"],
  "whereClause": "department_id = 10",
  "orderBy": "last_name ASC",
  "limit": 10
}
```

### `insert_data`
Inserts data into a table.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `data` (object, optional): Data to insert (key-value object)
- `columns` (array, optional): List of columns
- `values` (array, optional): List of values
- `returning` (string, optional): Column to return after insertion

**Example:**
```json
{
  "tableName": "employees",
  "schema": "HR",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "department_id": 10
  },
  "returning": "employee_id"
}
```

### `update_data`
Updates data in a table.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `data` (object, required): Data to update (key-value object)
- `whereClause` (string, required): WHERE condition
- `returning` (string, optional): Column to return after update

**Example:**
```json
{
  "tableName": "employees",
  "schema": "HR",
  "data": {
    "email": "new.email@company.com"
  },
  "whereClause": "employee_id = 100",
  "returning": "employee_id"
}
```

### `delete_data`
Removes data from a table.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `whereClause` (string, required): WHERE condition (required)
- `returning` (string, optional): Column to return after removal

**Example:**
```json
{
  "tableName": "employees",
  "schema": "HR",
  "whereClause": "employee_id = 100",
  "returning": "employee_id"
}
```

## 👥 DCL (Data Control Language) Tools

### `create_user`
Creates a new user in the database.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `username` (string, required): Username
- `password` (string, required): User password
- `defaultTablespace` (string, optional): Default tablespace (default: "USERS")
- `temporaryTablespace` (string, optional): Temporary tablespace (default: "TEMP")
- `quota` (string, optional): Tablespace quota (default: "UNLIMITED")
- `profile` (string, optional): User profile (default: "DEFAULT")
- `ifNotExists` (boolean, optional): Create only if not exists (default: true)

### `grant_privileges`
Grants privileges to a user or role.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `privileges` (array, required): List of privileges
- `onObject` (string, optional): Object to grant privileges on
- `toUser` (string, optional): Target user
- `toRole` (string, optional): Target role
- `withGrantOption` (boolean, optional): With grant option (default: false)
- `withAdminOption` (boolean, optional): With admin option (default: false)

**Example:**
```json
{
  "privileges": ["SELECT", "INSERT", "UPDATE"],
  "onObject": "HR.EMPLOYEES",
  "toUser": "app_user",
  "withGrantOption": false
}
```

### `revoke_privileges`
Revokes privileges from a user or role.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `privileges` (array, required): List of privileges
- `onObject` (string, optional): Object to revoke privileges from
- `fromUser` (string, optional): Source user
- `fromRole` (string, optional): Source role
- `cascade` (boolean, optional): Cascade to constraints (default: false)

## 🔍 Query and Analysis Tools

### `execute_safe_query`
Executes a query safely (SELECT only).

**Parameters:**
- `connectionName` (string, optional): Connection name
- `query` (string, required): SQL query to execute
- `schema` (string, optional): Schema to execute query in (default: "HR")

**Example:**
```json
{
  "query": "SELECT * FROM HR.EMPLOYEES WHERE department_id = 10",
  "schema": "HR"
}
```

### `get_database_info`
Gets general information about the database.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `includeUsers` (boolean, optional): Include user information (default: false)
- `includeTablespaces` (boolean, optional): Include tablespace information (default: true)

### `get_table_info`
Gets detailed information about a specific table.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `includeConstraints` (boolean, optional): Include constraint information (default: true)
- `includeIndexes` (boolean, optional): Include index information (default: true)

### `get_constraints`
Lists constraints of a table or schema.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, optional): Table name
- `schema` (string, optional): Schema to search constraints in (default: "HR")
- `constraintType` (string, optional): Constraint type to filter (default: "ALL")
  - `ALL`, `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL`

### `get_foreign_keys`
Lists foreign keys and their references.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, optional): Table name
- `schema` (string, optional): Schema to search foreign keys in (default: "HR")
- `showReferenced` (boolean, optional): Show referenced tables (default: true)

### `get_indexes`
Lists indexes of a table or schema.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, optional): Table name
- `schema` (string, optional): Schema to search indexes in (default: "HR")
- `includeStats` (boolean, optional): Include index statistics (default: false)

### `get_sequences`
Lists sequences of a schema.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `schema` (string, optional): Schema to search sequences in (default: "HR")
- `includeValues` (boolean, optional): Include current sequence values (default: true)

### `get_triggers`
Lists triggers of a table or schema.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, optional): Table name
- `schema` (string, optional): Schema to search triggers in (default: "HR")
- `includeCode` (boolean, optional): Include trigger code (default: false)

### `get_users_privileges`
Lists users and their privileges.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `user` (string, optional): Specific user
- `includeRoles` (boolean, optional): Include user roles (default: true)
- `includeSystemPrivs` (boolean, optional): Include system privileges (default: false)

### `get_table_dependencies`
Shows table dependencies.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `dependencyType` (string, optional): Dependency type (default: "ALL")
  - `ALL`, `DEPENDENTS`, `REFERENCES`

### `analyze_table`
Analyzes a table and generates statistics.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tableName` (string, required): Table name
- `schema` (string, optional): Table schema (default: "HR")
- `estimatePercent` (number, optional): Estimation percentage (default: 10)

## 🔒 Validation and Security Tools

### `validate_migration_script`
Validates if a migration script is adequate.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `script` (string, required): Migration script SQL content
- `targetSchema` (string, required): Target schema for migration

### `check_sensitive_tables`
Checks changes in sensitive tables.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `tables` (array, optional): List of sensitive tables to check
- `checkDataChanges` (boolean, optional): Check data changes (default: true)

### `detect_suspicious_activity`
Detects suspicious activity in the database.

**Parameters:**
- `connectionName` (string, optional): Connection name

### `generate_audit_report`
Generates audit report of operations.

**Parameters:**
- `connectionName` (string, optional): Connection name
- `startDate` (string, optional): Start date (ISO string)
- `endDate` (string, optional): End date (ISO string)
- `user` (string, optional): Filter by user
- `operation` (string, optional): Filter by operation
- `success` (boolean, optional): Filter by success/failure

## 📊 Status Codes

### Connection Status
- `active`: Connection active and working
- `inactive`: Connection inactive
- `error`: Connection error
- `testing`: Testing connection

### Health Status
- `healthy`: System working normally
- `warning`: Warnings requiring attention
- `critical`: Critical problems requiring immediate action
- `error`: Error preventing operation

### Operation Status
- `success`: Operation executed successfully
- `error`: Error executing operation
- `warning`: Operation executed with warnings
- `partial`: Operation executed partially

## 🚨 Error Handling

### Common Errors

#### Connection not found
```json
{
  "error": "Connection not found",
  "message": "Connection 'production' not found in configuration",
  "code": "CONNECTION_NOT_FOUND"
}
```

#### Connection failure
```json
{
  "error": "Connection failed",
  "message": "Connection failure 'production': ORA-12541: TNS:no listener",
  "code": "CONNECTION_FAILED",
  "oracleError": "ORA-12541"
}
```

#### Connection pool exhausted
```json
{
  "error": "Pool exhausted",
  "message": "Connection pool exhausted for 'production'",
  "code": "POOL_EXHAUSTED"
}
```

#### Connection timeout
```json
{
  "error": "Connection timeout",
  "message": "Connection timeout for 'production'",
  "code": "CONNECTION_TIMEOUT"
}
```

#### Validation error
```json
{
  "error": "Validation failed",
  "message": "Parameter 'tableName' is required",
  "code": "VALIDATION_ERROR",
  "field": "tableName"
}
```

## 📝 Usage Examples

### Example 1: Check production health
```javascript
const health = await mcp.callTool('check_database_health', {
  connectionName: 'production',
  checkConnections: true,
  checkTablespaces: true,
  checkPerformance: true
});
```

### Example 2: Create table in development
```javascript
const result = await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'users',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100, notNull: true },
    { name: 'email', type: 'VARCHAR2', length: 255, notNull: true }
  ],
  constraints: [
    { name: 'PK_USERS', type: 'PRIMARY KEY', columns: ['id'] },
    { name: 'UK_USERS_EMAIL', type: 'UNIQUE', columns: ['email'] }
  ]
});
```

### Example 3: Query data from multiple environments
```javascript
const environments = ['development', 'testing', 'production'];

for (const env of environments) {
  try {
    const data = await mcp.callTool('select_data', {
      connectionName: env,
      tableName: 'employees',
      schema: 'HR',
      columns: ['employee_id', 'first_name', 'last_name'],
      limit: 10
    });
    console.log(`${env}:`, data);
  } catch (error) {
    console.error(`Error in ${env}:`, error.message);
  }
}
```

---

**📚 For more information, see the [complete documentation](../README.md)**
