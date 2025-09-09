# Guia de Operações DDL, DML e DCL

Este guia apresenta as novas funcionalidades implementadas no Oracle MCP para operações de banco de dados, permitindo que usuários em geral executem operações DDL, DML e DCL de forma segura e controlada.

## Visão Geral

O projeto foi expandido para incluir:

- **DDL (Data Definition Language)**: Criação, alteração e remoção de estruturas de banco
- **DML (Data Manipulation Language)**: Consultas, inserções, atualizações e remoções de dados
- **DCL (Data Control Language)**: Gerenciamento de usuários, privilégios e roles
- **Auditoria e Segurança**: Logging completo e validações de segurança

## Funcionalidades DDL

### 1. Criação de Tabelas

```javascript
// Exemplo de uso via MCP
{
  "name": "create_table",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "columns": [
      {
        "name": "ID",
        "type": "NUMBER",
        "notNull": true
      },
      {
        "name": "NOME",
        "type": "VARCHAR2",
        "length": 100,
        "notNull": true
      },
      {
        "name": "PRECO",
        "type": "NUMBER",
        "precision": 10,
        "scale": 2
      },
      {
        "name": "ATIVO",
        "type": "CHAR",
        "length": 1,
        "defaultValue": "'Y'"
      }
    ],
    "constraints": [
      {
        "name": "PK_PRODUTOS",
        "type": "PRIMARY KEY",
        "columns": ["ID"]
      },
      {
        "name": "UK_PRODUTOS_NOME",
        "type": "UNIQUE",
        "columns": ["NOME"]
      },
      {
        "name": "CK_PRODUTOS_PRECO",
        "type": "CHECK",
        "condition": "PRECO > 0"
      }
    ],
    "tablespace": "USERS",
    "ifNotExists": true
  }
}
```

### 2. Alteração de Tabelas

```javascript
// Adicionar coluna
{
  "name": "alter_table",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "operation": "ADD_COLUMN",
    "columnName": "DESCRICAO",
    "columnType": "VARCHAR2",
    "columnLength": 500
  }
}

// Modificar coluna
{
  "name": "alter_table",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "operation": "MODIFY_COLUMN",
    "columnName": "NOME",
    "columnType": "VARCHAR2",
    "columnLength": 200,
    "notNull": true
  }
}

// Adicionar constraint
{
  "name": "alter_table",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "operation": "ADD_CONSTRAINT",
    "constraintName": "FK_PRODUTOS_CATEGORIA",
    "constraintType": "FOREIGN KEY",
    "constraintColumns": ["CATEGORIA_ID"],
    "referencedTable": "CATEGORIAS",
    "referencedColumns": ["ID"]
  }
}
```

### 3. Remoção de Tabelas

```javascript
{
  "name": "drop_table",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "ifExists": true,
    "cascadeConstraints": false
  }
}
```

## Funcionalidades DML

### 1. Consultas SELECT

```javascript
// Consulta simples
{
  "name": "select_data",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "columns": ["ID", "NOME", "PRECO"],
    "whereClause": "ATIVO = 'Y'",
    "orderBy": "NOME",
    "limit": 10
  }
}

// Consulta com paginação
{
  "name": "select_data",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "columns": ["*"],
    "whereClause": "PRECO > 100",
    "orderBy": "PRECO DESC",
    "limit": 20,
    "offset": 40
  }
}
```

### 2. Inserção de Dados

```javascript
// Inserção com objeto de dados
{
  "name": "insert_data",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "data": {
      "ID": 1,
      "NOME": "Produto Teste",
      "PRECO": 99.99,
      "ATIVO": "Y"
    },
    "returning": "ID"
  }
}

// Inserção com arrays
{
  "name": "insert_data",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "columns": ["ID", "NOME", "PRECO", "ATIVO"],
    "values": [2, "Outro Produto", 149.99, "Y"]
  }
}
```

### 3. Atualização de Dados

```javascript
{
  "name": "update_data",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "data": {
      "PRECO": 199.99,
      "ATIVO": "N"
    },
    "whereClause": "ID = 1",
    "returning": "NOME"
  }
}
```

### 4. Remoção de Dados

```javascript
{
  "name": "delete_data",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "whereClause": "ATIVO = 'N'",
    "returning": "ID"
  }
}
```

## Funcionalidades DCL

### 1. Criação de Usuários

```javascript
{
  "name": "create_user",
  "arguments": {
    "username": "USUARIO_TESTE",
    "password": "SenhaSegura123",
    "defaultTablespace": "USERS",
    "temporaryTablespace": "TEMP",
    "quota": "100M",
    "profile": "DEFAULT",
    "ifNotExists": true
  }
}
```

### 2. Concessão de Privilégios

```javascript
// Privilégios de objeto
{
  "name": "grant_privileges",
  "arguments": {
    "privileges": ["SELECT", "INSERT", "UPDATE"],
    "onObject": "HR.PRODUTOS",
    "toUser": "USUARIO_TESTE",
    "withGrantOption": false
  }
}

// Privilégios de sistema
{
  "name": "grant_privileges",
  "arguments": {
    "privileges": ["CREATE SESSION", "CREATE TABLE"],
    "toUser": "USUARIO_TESTE",
    "withAdminOption": false
  }
}
```

### 3. Revogação de Privilégios

```javascript
{
  "name": "revoke_privileges",
  "arguments": {
    "privileges": ["UPDATE", "DELETE"],
    "onObject": "HR.PRODUTOS",
    "fromUser": "USUARIO_TESTE",
    "cascade": false
  }
}
```

## Funcionalidades de Auditoria

### 1. Relatório de Auditoria

```javascript
{
  "name": "generate_audit_report",
  "arguments": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "user": "USUARIO_TESTE",
    "operation": "SELECT",
    "success": true
  }
}
```

### 2. Detecção de Atividades Suspeitas

```javascript
{
  "name": "detect_suspicious_activity",
  "arguments": {}
}
```

## Configurações de Segurança

### Variáveis de Ambiente

```bash
# Esquemas permitidos
ALLOWED_SCHEMAS=HR,SCOTT,USUARIO_TESTE

# Esquemas bloqueados
BLOCKED_SCHEMAS=SYS,SYSTEM

# Limite de linhas afetadas
MAX_ROWS_AFFECTED=10000

# Caminho do log de auditoria
AUDIT_LOG_PATH=./logs/audit.log
```

### Validações de Segurança

O sistema implementa várias camadas de segurança:

1. **Validação de SQL Injection**: Detecta tentativas de injeção SQL
2. **Validação de Esquemas**: Controla acesso a esquemas específicos
3. **Validação de Palavras-chave**: Bloqueia operações perigosas
4. **Validação de Entrada**: Sanitiza dados de entrada
5. **Logging de Auditoria**: Registra todas as operações

## Exemplos de Uso Prático

### Cenário 1: Criação de Sistema de Produtos

```javascript
// 1. Criar tabela de categorias
{
  "name": "create_table",
  "arguments": {
    "tableName": "CATEGORIAS",
    "schema": "HR",
    "columns": [
      {"name": "ID", "type": "NUMBER", "notNull": true},
      {"name": "NOME", "type": "VARCHAR2", "length": 50, "notNull": true}
    ],
    "constraints": [
      {"name": "PK_CATEGORIAS", "type": "PRIMARY KEY", "columns": ["ID"]}
    ]
  }
}

// 2. Criar tabela de produtos
{
  "name": "create_table",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "columns": [
      {"name": "ID", "type": "NUMBER", "notNull": true},
      {"name": "NOME", "type": "VARCHAR2", "length": 100, "notNull": true},
      {"name": "CATEGORIA_ID", "type": "NUMBER", "notNull": true},
      {"name": "PRECO", "type": "NUMBER", "precision": 10, "scale": 2}
    ],
    "constraints": [
      {"name": "PK_PRODUTOS", "type": "PRIMARY KEY", "columns": ["ID"]},
      {"name": "FK_PRODUTOS_CATEGORIA", "type": "FOREIGN KEY", "columns": ["CATEGORIA_ID"], "referencedTable": "CATEGORIAS", "referencedColumns": ["ID"]}
    ]
  }
}

// 3. Inserir dados de exemplo
{
  "name": "insert_data",
  "arguments": {
    "tableName": "CATEGORIAS",
    "schema": "HR",
    "data": {"ID": 1, "NOME": "Eletrônicos"}
  }
}

// 4. Consultar produtos
{
  "name": "select_data",
  "arguments": {
    "tableName": "PRODUTOS",
    "schema": "HR",
    "columns": ["P.ID", "P.NOME", "P.PRECO", "C.NOME"],
    "whereClause": "P.CATEGORIA_ID = C.ID"
  }
}
```

### Cenário 2: Gerenciamento de Usuários

```javascript
// 1. Criar usuário
{
  "name": "create_user",
  "arguments": {
    "username": "VENDEDOR",
    "password": "Venda123!",
    "quota": "50M"
  }
}

// 2. Conceder privilégios
{
  "name": "grant_privileges",
  "arguments": {
    "privileges": ["SELECT", "INSERT", "UPDATE"],
    "onObject": "HR.PRODUTOS",
    "toUser": "VENDEDOR"
  }
}

// 3. Verificar atividades
{
  "name": "detect_suspicious_activity",
  "arguments": {}
}
```

## Monitoramento e Logs

### Logs de Auditoria

Todos as operações são registradas em `./logs/audit.log` com informações:

- Timestamp da operação
- Usuário que executou
- Tipo de operação
- Recurso afetado
- Query executada (sanitizada)
- Resultado da operação
- Endereço IP e sessão

### Relatórios Disponíveis

1. **Relatório por Período**: Operações em um intervalo de tempo
2. **Relatório por Usuário**: Atividades de um usuário específico
3. **Relatório por Operação**: Estatísticas por tipo de operação
4. **Detecção de Anomalias**: Identificação de atividades suspeitas

## Boas Práticas

### 1. Segurança
- Sempre use cláusulas WHERE em operações de modificação
- Configure esquemas permitidos/bloqueados adequadamente
- Monitore logs de auditoria regularmente
- Use senhas fortes para usuários

### 2. Performance
- Use LIMIT em consultas grandes
- Crie índices apropriados
- Monitore o número de linhas afetadas
- Use paginação para grandes volumes de dados

### 3. Manutenção
- Execute relatórios de auditoria regularmente
- Monitore atividades suspeitas
- Mantenha logs organizados
- Revise permissões periodicamente

## Troubleshooting

### Erros Comuns

1. **"Esquema não permitido"**: Verifique configuração ALLOWED_SCHEMAS
2. **"Palavra-chave perigosa detectada"**: Operação não permitida para o tipo de query
3. **"Possível tentativa de SQL injection"**: Query contém padrões suspeitos
4. **"Cláusula WHERE é obrigatória"**: Operações de modificação requerem WHERE

### Logs de Debug

Verifique os logs em:
- `./logs/oracle-mcp.log`: Logs gerais do sistema
- `./logs/audit.log`: Logs de auditoria
- `./logs/error.log`: Logs de erro

## Conclusão

As novas funcionalidades DDL, DML e DCL transformam o Oracle MCP em uma ferramenta completa para gerenciamento de banco de dados Oracle, mantendo a segurança e proporcionando auditoria completa de todas as operações.
