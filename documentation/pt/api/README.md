# 🔧 API Reference - Oracle MCP Server

Referência completa da API do Oracle MCP Server com todas as ferramentas disponíveis.

## 🔗 Ferramentas de Múltiplas Conexões

### `list_connections`
Lista todas as conexões configuradas no sistema.

**Parâmetros:** Nenhum

**Retorno:**
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
Testa uma conexão específica.

**Parâmetros:**
- `connectionName` (string, obrigatório): Nome da conexão para testar

**Retorno:**
```json
{
  "connectionName": "production",
  "status": "success",
  "message": "Conexão testada com sucesso",
  "responseTime": 150
}
```

### `test_all_connections`
Testa todas as conexões configuradas.

**Parâmetros:** Nenhum

**Retorno:**
```json
{
  "results": {
    "production": {
      "status": "success",
      "message": "Conexão testada com sucesso",
      "responseTime": 150
    },
    "development": {
      "status": "error",
      "message": "Falha na conexão: ORA-12541: TNS:no listener",
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
Obtém o status de todas as conexões ativas.

**Parâmetros:** Nenhum

**Retorno:**
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

## 📊 Ferramentas de Monitoramento

### `check_database_health`
Verifica a saúde geral do banco de dados.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `checkConnections` (boolean, opcional): Verificar conexões ativas (padrão: true)
- `checkTablespaces` (boolean, opcional): Verificar espaço em tablespaces (padrão: true)
- `checkPerformance` (boolean, opcional): Verificar métricas de performance (padrão: true)

**Retorno:**
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
Monitora mudanças em esquemas críticos.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `schemas` (array, opcional): Lista de esquemas para monitorar (padrão: ["HR", "SCOTT", "SYSTEM"])
- `checkInterval` (number, opcional): Intervalo de verificação em minutos (padrão: 5)

**Retorno:**
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

## 🔧 Ferramentas DDL (Data Definition Language)

### `create_table`
Cria uma nova tabela no banco de dados.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `columns` (array, obrigatório): Lista de colunas da tabela
- `constraints` (array, opcional): Lista de constraints da tabela
- `tablespace` (string, opcional): Tablespace da tabela (padrão: "USERS")
- `ifNotExists` (boolean, opcional): Criar apenas se não existir (padrão: true)

**Exemplo de colunas:**
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

**Exemplo de constraints:**
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
Altera uma tabela existente.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `operation` (string, obrigatório): Tipo de operação
  - `ADD_COLUMN`: Adicionar coluna
  - `MODIFY_COLUMN`: Modificar coluna
  - `DROP_COLUMN`: Remover coluna
  - `ADD_CONSTRAINT`: Adicionar constraint
  - `DROP_CONSTRAINT`: Remover constraint
  - `RENAME_COLUMN`: Renomear coluna

**Exemplo para adicionar coluna:**
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
Remove uma tabela do banco de dados.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `ifExists` (boolean, opcional): Remover apenas se existir (padrão: true)
- `cascadeConstraints` (boolean, opcional): Remover constraints dependentes (padrão: false)

## 📝 Ferramentas DML (Data Manipulation Language)

### `select_data`
Executa uma consulta SELECT no banco de dados.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `columns` (array, opcional): Lista de colunas para selecionar (padrão: ["*"])
- `whereClause` (string, opcional): Condição WHERE
- `orderBy` (string, opcional): Ordenação dos resultados
- `limit` (number, opcional): Limite de linhas
- `offset` (number, opcional): Offset para paginação (padrão: 0)

**Exemplo:**
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
Insere dados em uma tabela.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `data` (object, opcional): Dados para inserir (objeto chave-valor)
- `columns` (array, opcional): Lista de colunas
- `values` (array, opcional): Lista de valores
- `returning` (string, opcional): Coluna para retornar após inserção

**Exemplo:**
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
Atualiza dados em uma tabela.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `data` (object, obrigatório): Dados para atualizar (objeto chave-valor)
- `whereClause` (string, obrigatório): Condição WHERE
- `returning` (string, opcional): Coluna para retornar após atualização

**Exemplo:**
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
Remove dados de uma tabela.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `whereClause` (string, obrigatório): Condição WHERE (obrigatória)
- `returning` (string, opcional): Coluna para retornar após remoção

**Exemplo:**
```json
{
  "tableName": "employees",
  "schema": "HR",
  "whereClause": "employee_id = 100",
  "returning": "employee_id"
}
```

## 👥 Ferramentas DCL (Data Control Language)

### `create_user`
Cria um novo usuário no banco de dados.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `username` (string, obrigatório): Nome do usuário
- `password` (string, obrigatório): Senha do usuário
- `defaultTablespace` (string, opcional): Tablespace padrão (padrão: "USERS")
- `temporaryTablespace` (string, opcional): Tablespace temporário (padrão: "TEMP")
- `quota` (string, opcional): Quota no tablespace (padrão: "UNLIMITED")
- `profile` (string, opcional): Profile do usuário (padrão: "DEFAULT")
- `ifNotExists` (boolean, opcional): Criar apenas se não existir (padrão: true)

### `grant_privileges`
Concede privilégios a um usuário ou role.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `privileges` (array, obrigatório): Lista de privilégios
- `onObject` (string, opcional): Objeto para conceder privilégios
- `toUser` (string, opcional): Usuário de destino
- `toRole` (string, opcional): Role de destino
- `withGrantOption` (boolean, opcional): Com opção de conceder (padrão: false)
- `withAdminOption` (boolean, opcional): Com opção de administrar (padrão: false)

**Exemplo:**
```json
{
  "privileges": ["SELECT", "INSERT", "UPDATE"],
  "onObject": "HR.EMPLOYEES",
  "toUser": "app_user",
  "withGrantOption": false
}
```

### `revoke_privileges`
Revoga privilégios de um usuário ou role.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `privileges` (array, obrigatório): Lista de privilégios
- `onObject` (string, opcional): Objeto para revogar privilégios
- `fromUser` (string, opcional): Usuário de origem
- `fromRole` (string, opcional): Role de origem
- `cascade` (boolean, opcional): Cascata para constraints (padrão: false)

## 🔍 Ferramentas de Consulta e Análise

### `execute_safe_query`
Executa uma query de forma segura (apenas SELECT).

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `query` (string, obrigatório): Query SQL para executar
- `schema` (string, opcional): Esquema para executar a query (padrão: "HR")

**Exemplo:**
```json
{
  "query": "SELECT * FROM HR.EMPLOYEES WHERE department_id = 10",
  "schema": "HR"
}
```

### `get_database_info`
Obtém informações gerais sobre o banco de dados.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `includeUsers` (boolean, opcional): Incluir informações de usuários (padrão: false)
- `includeTablespaces` (boolean, opcional): Incluir informações de tablespaces (padrão: true)

### `get_table_info`
Obtém informações detalhadas sobre uma tabela específica.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `includeConstraints` (boolean, opcional): Incluir informações de constraints (padrão: true)
- `includeIndexes` (boolean, opcional): Incluir informações de índices (padrão: true)

### `get_constraints`
Lista constraints de uma tabela ou esquema.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, opcional): Nome da tabela
- `schema` (string, opcional): Esquema para buscar constraints (padrão: "HR")
- `constraintType` (string, opcional): Tipo de constraint para filtrar (padrão: "ALL")
  - `ALL`, `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, `CHECK`, `NOT NULL`

### `get_foreign_keys`
Lista chaves estrangeiras e suas referências.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, opcional): Nome da tabela
- `schema` (string, opcional): Esquema para buscar foreign keys (padrão: "HR")
- `showReferenced` (boolean, opcional): Mostrar tabelas referenciadas (padrão: true)

### `get_indexes`
Lista índices de uma tabela ou esquema.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, opcional): Nome da tabela
- `schema` (string, opcional): Esquema para buscar índices (padrão: "HR")
- `includeStats` (boolean, opcional): Incluir estatísticas dos índices (padrão: false)

### `get_sequences`
Lista sequences de um esquema.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `schema` (string, opcional): Esquema para buscar sequences (padrão: "HR")
- `includeValues` (boolean, opcional): Incluir valores atuais das sequences (padrão: true)

### `get_triggers`
Lista triggers de uma tabela ou esquema.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, opcional): Nome da tabela
- `schema` (string, opcional): Esquema para buscar triggers (padrão: "HR")
- `includeCode` (boolean, opcional): Incluir código dos triggers (padrão: false)

### `get_users_privileges`
Lista usuários e seus privilégios.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `user` (string, opcional): Usuário específico
- `includeRoles` (boolean, opcional): Incluir roles do usuário (padrão: true)
- `includeSystemPrivs` (boolean, opcional): Incluir privilégios de sistema (padrão: false)

### `get_table_dependencies`
Mostra dependências de uma tabela.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `dependencyType` (string, opcional): Tipo de dependência (padrão: "ALL")
  - `ALL`, `DEPENDENTS`, `REFERENCES`

### `analyze_table`
Analisa uma tabela e gera estatísticas.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tableName` (string, obrigatório): Nome da tabela
- `schema` (string, opcional): Esquema da tabela (padrão: "HR")
- `estimatePercent` (number, opcional): Percentual para estimativa (padrão: 10)

## 🔒 Ferramentas de Validação e Segurança

### `validate_migration_script`
Valida se um script de migração está adequado.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `script` (string, obrigatório): Conteúdo do script de migração SQL
- `targetSchema` (string, obrigatório): Esquema de destino da migração

### `check_sensitive_tables`
Verifica alterações em tabelas sensíveis.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `tables` (array, opcional): Lista de tabelas sensíveis para verificar
- `checkDataChanges` (boolean, opcional): Verificar mudanças nos dados (padrão: true)

### `detect_suspicious_activity`
Detecta atividades suspeitas no banco de dados.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão

### `generate_audit_report`
Gera relatório de auditoria das operações.

**Parâmetros:**
- `connectionName` (string, opcional): Nome da conexão
- `startDate` (string, opcional): Data de início (ISO string)
- `endDate` (string, opcional): Data de fim (ISO string)
- `user` (string, opcional): Filtrar por usuário
- `operation` (string, opcional): Filtrar por operação
- `success` (boolean, opcional): Filtrar por sucesso/falha

## 📊 Códigos de Status

### Status de Conexão
- `active`: Conexão ativa e funcionando
- `inactive`: Conexão inativa
- `error`: Erro na conexão
- `testing`: Testando conexão

### Status de Saúde
- `healthy`: Sistema funcionando normalmente
- `warning`: Avisos que requerem atenção
- `critical`: Problemas críticos que requerem ação imediata
- `error`: Erro que impede o funcionamento

### Status de Operação
- `success`: Operação executada com sucesso
- `error`: Erro na execução da operação
- `warning`: Operação executada com avisos
- `partial`: Operação executada parcialmente

## 🚨 Tratamento de Erros

### Erros Comuns

#### Conexão não encontrada
```json
{
  "error": "Connection not found",
  "message": "Conexão 'production' não encontrada na configuração",
  "code": "CONNECTION_NOT_FOUND"
}
```

#### Falha na conexão
```json
{
  "error": "Connection failed",
  "message": "Falha na conexão 'production': ORA-12541: TNS:no listener",
  "code": "CONNECTION_FAILED",
  "oracleError": "ORA-12541"
}
```

#### Pool de conexões esgotado
```json
{
  "error": "Pool exhausted",
  "message": "Pool de conexões esgotado para 'production'",
  "code": "POOL_EXHAUSTED"
}
```

#### Timeout de conexão
```json
{
  "error": "Connection timeout",
  "message": "Timeout na conexão 'production'",
  "code": "CONNECTION_TIMEOUT"
}
```

#### Erro de validação
```json
{
  "error": "Validation failed",
  "message": "Parâmetro 'tableName' é obrigatório",
  "code": "VALIDATION_ERROR",
  "field": "tableName"
}
```

## 📝 Exemplos de Uso

### Exemplo 1: Verificar saúde de produção
```javascript
const health = await mcp.callTool('check_database_health', {
  connectionName: 'production',
  checkConnections: true,
  checkTablespaces: true,
  checkPerformance: true
});
```

### Exemplo 2: Criar tabela em desenvolvimento
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

### Exemplo 3: Consultar dados de múltiplos ambientes
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
    console.error(`Erro em ${env}:`, error.message);
  }
}
```

---

**📚 Para mais informações, consulte a [documentação completa](../README.md)**
