# Múltiplas Conexões Oracle - Guia Completo

Este guia explica como usar o Oracle Node MCP com múltiplas conexões Oracle **sem precisar baixar múltiplas instâncias do projeto**.

## 🎯 Por que Múltiplas Conexões?

- **Desenvolvimento Multi-Ambiente**: Desenvolvimento, Teste, Staging, Produção
- **Monitoramento Centralizado**: Um único ponto para monitorar todos os bancos
- **Migração de Dados**: Transferir dados entre ambientes facilmente
- **Backup e Restore**: Operações em bancos de backup
- **Analytics**: Conexões com data warehouses

## 🚀 Configuração Rápida

### 1. Configuração Automática

```bash
# Executar o script de configuração interativa
npm run setup-multi-connections
```

### 2. Configuração Manual

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
    }
  },
  "defaultConnection": "development"
}
```

## 🛠️ Uso das Ferramentas

### Ferramentas de Conexão

#### Listar Conexões
```javascript
await mcp.callTool('list_connections');
```

#### Testar Conexão Específica
```javascript
await mcp.callTool('test_connection', {
  connectionName: 'production'
});
```

#### Testar Todas as Conexões
```javascript
await mcp.callTool('test_all_connections');
```

#### Status das Conexões Ativas
```javascript
await mcp.callTool('get_connections_status');
```

### Operações com Conexão Específica

Todas as ferramentas existentes agora aceitam o parâmetro `connectionName`:

#### Monitoramento
```javascript
// Verificar saúde do banco de produção
await mcp.callTool('check_database_health', {
  connectionName: 'production',
  checkConnections: true,
  checkTablespaces: true,
  checkPerformance: true
});

// Monitorar esquemas no ambiente de desenvolvimento
await mcp.callTool('monitor_schema_changes', {
  connectionName: 'development',
  schemas: ['HR', 'SCOTT'],
  checkInterval: 5
});
```

#### Operações DDL
```javascript
// Criar tabela no banco de desenvolvimento
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'new_table',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100 }
  ]
});

// Alterar tabela no banco de produção
await mcp.callTool('alter_table', {
  connectionName: 'production',
  tableName: 'existing_table',
  schema: 'HR',
  operation: 'ADD_COLUMN',
  columnName: 'new_column',
  columnType: 'VARCHAR2',
  columnLength: 50
});
```

#### Operações DML
```javascript
// Consultar dados do banco de testes
await mcp.callTool('select_data', {
  connectionName: 'testing',
  tableName: 'employees',
  schema: 'HR',
  columns: ['*'],
  whereClause: 'department_id = 10',
  limit: 10
});

// Inserir dados no banco de desenvolvimento
await mcp.callTool('insert_data', {
  connectionName: 'development',
  tableName: 'test_data',
  schema: 'HR',
  data: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com'
  }
});
```

#### Operações DCL
```javascript
// Criar usuário no banco de desenvolvimento
await mcp.callTool('create_user', {
  connectionName: 'development',
  username: 'new_user',
  password: 'secure_password',
  defaultTablespace: 'USERS'
});

// Conceder privilégios no banco de produção
await mcp.callTool('grant_privileges', {
  connectionName: 'production',
  privileges: ['SELECT', 'INSERT', 'UPDATE'],
  onObject: 'HR.EMPLOYEES',
  toUser: 'app_user'
});
```

## 📊 Exemplos Práticos

### 1. Pipeline de Desenvolvimento

```javascript
// 1. Desenvolvimento - Criar nova funcionalidade
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'user_preferences',
  schema: 'HR',
  columns: [
    { name: 'user_id', type: 'NUMBER', notNull: true },
    { name: 'preference_key', type: 'VARCHAR2', length: 50 },
    { name: 'preference_value', type: 'VARCHAR2', length: 200 }
  ]
});

// 2. Teste - Validar funcionalidade
await mcp.callTool('create_table', {
  connectionName: 'testing',
  tableName: 'user_preferences',
  schema: 'HR',
  columns: [
    { name: 'user_id', type: 'NUMBER', notNull: true },
    { name: 'preference_key', type: 'VARCHAR2', length: 50 },
    { name: 'preference_value', type: 'VARCHAR2', length: 200 }
  ]
});

// 3. Produção - Deploy após testes
await mcp.callTool('create_table', {
  connectionName: 'production',
  tableName: 'user_preferences',
  schema: 'HR',
  columns: [
    { name: 'user_id', type: 'NUMBER', notNull: true },
    { name: 'preference_key', type: 'VARCHAR2', length: 50 },
    { name: 'preference_value', type: 'VARCHAR2', length: 200 }
  ]
});
```

### 2. Monitoramento de Múltiplos Ambientes

```javascript
// Verificar saúde de todos os ambientes
const environments = ['development', 'testing', 'staging', 'production'];

for (const env of environments) {
  try {
    const health = await mcp.callTool('check_database_health', {
      connectionName: env
    });
    console.log(`Status do ${env}:`, health);
  } catch (error) {
    console.log(`Erro no ${env}:`, error.message);
  }
}
```

### 3. Migração de Dados

```javascript
// 1. Consultar dados do desenvolvimento
const devData = await mcp.callTool('select_data', {
  connectionName: 'development',
  tableName: 'migration_source',
  schema: 'HR',
  columns: ['*']
});

// 2. Inserir no banco de staging
await mcp.callTool('insert_data', {
  connectionName: 'staging',
  tableName: 'migration_target',
  schema: 'HR',
  data: devData
});
```

## 🔧 Configuração Avançada

### Pool de Conexões

```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "poolMin": 5,        // Mínimo de conexões no pool
      "poolMax": 50,       // Máximo de conexões no pool
      "poolIncrement": 5,  // Incremento do pool
      "poolTimeout": 60,   // Timeout do pool em segundos
      "poolPingInterval": 60 // Intervalo de ping em segundos
    }
  }
}
```

### Monitoramento e Alertas

```json
{
  "monitoring": {
    "healthCheckInterval": 300000,    // 5 minutos
    "schemaCheckInterval": 600000,    // 10 minutos
    "performanceCheckInterval": 300000 // 5 minutos
  },
  "alerts": {
    "tablespaceUsageThreshold": 80,   // 80% de uso
    "connectionThreshold": 100,       // 100 conexões
    "performanceThreshold": 1000      // 1 segundo
  }
}
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Conexão não encontrada
```
Erro: Conexão 'production' não encontrada na configuração
```
**Solução**: Verifique se o nome da conexão existe no arquivo `config/multi-connections.json`

#### 2. Falha na conexão
```
Erro: Falha na conexão 'production': ORA-12541: TNS:no listener
```
**Solução**: 
- Verifique se o servidor Oracle está rodando
- Confirme os parâmetros de conexão (host, porta, service name)
- Teste a conectividade de rede

#### 3. Pool de conexões esgotado
```
Erro: Pool de conexões esgotado
```
**Solução**: Aumente os valores de `poolMax` na configuração

#### 4. Timeout de conexão
```
Erro: Timeout na conexão
```
**Solução**: Aumente o `poolTimeout` na configuração

### Logs e Debug

```bash
# Verificar logs
tail -f logs/oracle-mcp.log

# Testar conexões
npm run demo-multi-connections

# Testar conexão específica
node -e "
import { ConnectionManager } from './src/connection-manager.js';
const cm = new ConnectionManager();
cm.testConnection('production').then(console.log);
"
```

## 📈 Vantagens

1. **✅ Uma única instância**: Não precisa baixar o projeto múltiplas vezes
2. **✅ Configuração centralizada**: Todas as conexões em um arquivo
3. **✅ Pool otimizado**: Cada conexão tem seu próprio pool
4. **✅ Monitoramento unificado**: Status de todas as conexões
5. **✅ Flexibilidade**: Fácil adicionar/remover conexões
6. **✅ Compatibilidade**: Mantém compatibilidade com configuração antiga
7. **✅ Segurança**: Credenciais isoladas por ambiente
8. **✅ Performance**: Conexões reutilizadas eficientemente

## 🎯 Casos de Uso

- **Desenvolvimento Multi-Ambiente**: Desenvolvimento → Teste → Staging → Produção
- **Monitoramento de Múltiplos Bancos**: Um dashboard para todos os ambientes
- **Migração de Dados**: Transferir dados entre ambientes
- **Backup e Restore**: Operações em bancos de backup
- **Analytics**: Conexões com data warehouses
- **Disaster Recovery**: Conexões com bancos de recuperação

## 📚 Próximos Passos

1. Execute `npm run setup-multi-connections` para configurar
2. Edite `config/multi-connections.json` com suas credenciais
3. Execute `npm run demo-multi-connections` para testar
4. Integre com seu sistema MCP existente
5. Configure monitoramento e alertas conforme necessário

---

**💡 Dica**: Comece com 2-3 conexões (desenvolvimento, teste, produção) e expanda conforme necessário!
