# Exemplos de Múltiplas Conexões Oracle

Este documento mostra como configurar e usar múltiplas conexões Oracle com o Oracle Node MCP.

## Configuração

### 1. Arquivo de Configuração de Múltiplas Conexões

Crie o arquivo `config/multi-connections.json`:

```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "description": "Banco de Produção",
      "environment": "production",
      "poolMin": 2,
      "poolMax": 20,
      "poolIncrement": 2
    },
    "development": {
      "user": "HR_DEV",
      "password": "dev_password", 
      "connectString": "dev-server:1521/DEV",
      "description": "Banco de Desenvolvimento",
      "environment": "development",
      "poolMin": 1,
      "poolMax": 10,
      "poolIncrement": 1
    },
    "testing": {
      "user": "HR_TEST",
      "password": "test_password",
      "connectString": "test-server:1521/TEST",
      "description": "Banco de Testes",
      "environment": "testing",
      "poolMin": 1,
      "poolMax": 5,
      "poolIncrement": 1
    }
  },
  "defaultConnection": "development",
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

### 2. Configuração do MCP

Atualize seu arquivo `mcp-config.json`:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

## Uso das Ferramentas

### 1. Listar Conexões Disponíveis

```javascript
// Lista todas as conexões configuradas
await mcp.callTool('list_connections');
```

### 2. Testar Conexões

```javascript
// Testar uma conexão específica
await mcp.callTool('test_connection', {
  connectionName: 'production'
});

// Testar todas as conexões
await mcp.callTool('test_all_connections');
```

### 3. Verificar Status das Conexões

```javascript
// Obter status de todas as conexões ativas
await mcp.callTool('get_connections_status');
```

### 4. Operações com Conexão Específica

```javascript
// Verificar saúde do banco de produção
await mcp.callTool('check_database_health', {
  connectionName: 'production',
  checkConnections: true,
  checkTablespaces: true,
  checkPerformance: true
});

// Criar tabela no banco de desenvolvimento
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'test_table',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100 }
  ]
});

// Consultar dados do banco de testes
await mcp.callTool('select_data', {
  connectionName: 'testing',
  tableName: 'employees',
  schema: 'HR',
  columns: ['*'],
  limit: 10
});
```

## Cenários de Uso

### 1. Desenvolvimento Multi-Ambiente

```javascript
// Desenvolvimento
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'new_feature_table',
  // ... outros parâmetros
});

// Teste
await mcp.callTool('create_table', {
  connectionName: 'testing',
  tableName: 'new_feature_table',
  // ... outros parâmetros
});

// Produção (após testes)
await mcp.callTool('create_table', {
  connectionName: 'production',
  tableName: 'new_feature_table',
  // ... outros parâmetros
});
```

### 2. Monitoramento de Múltiplos Bancos

```javascript
// Verificar saúde de todos os bancos
const connections = ['production', 'development', 'testing'];

for (const conn of connections) {
  const health = await mcp.callTool('check_database_health', {
    connectionName: conn
  });
  console.log(`Status do ${conn}:`, health);
}
```

### 3. Migração de Dados Entre Ambientes

```javascript
// 1. Consultar dados do desenvolvimento
const devData = await mcp.callTool('select_data', {
  connectionName: 'development',
  tableName: 'migration_data',
  schema: 'HR'
});

// 2. Inserir no banco de testes
await mcp.callTool('insert_data', {
  connectionName: 'testing',
  tableName: 'migration_data',
  schema: 'HR',
  data: devData
});
```

## Vantagens

1. **Não precisa de múltiplas instâncias**: Um único projeto gerencia todas as conexões
2. **Configuração centralizada**: Todas as conexões em um arquivo JSON
3. **Pool de conexões otimizado**: Cada conexão tem seu próprio pool
4. **Monitoramento unificado**: Status de todas as conexões em um lugar
5. **Flexibilidade**: Fácil adicionar/remover conexões
6. **Compatibilidade**: Mantém compatibilidade com configuração antiga

## Troubleshooting

### Conexão não encontrada
```
Erro: Conexão 'production' não encontrada na configuração
```
**Solução**: Verifique se o nome da conexão existe no arquivo `config/multi-connections.json`

### Falha na conexão
```
Erro: Falha na conexão 'production': ORA-12541: TNS:no listener
```
**Solução**: Verifique se o servidor Oracle está rodando e se os parâmetros de conexão estão corretos

### Pool de conexões esgotado
```
Erro: Pool de conexões esgotado
```
**Solução**: Aumente os valores de `poolMax` na configuração da conexão
