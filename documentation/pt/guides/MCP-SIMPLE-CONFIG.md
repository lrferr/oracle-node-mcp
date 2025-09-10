# Configuração MCP Simplificada - Múltiplas Conexões Oracle

Este guia mostra como configurar múltiplas conexões Oracle **diretamente no arquivo de configuração MCP**, eliminando a necessidade de arquivos separados.

## 🎯 Solução Simplificada

### **Tudo em um arquivo JSON!**

Agora você pode configurar todas as conexões diretamente no arquivo de configuração MCP do Cursor/Claude, sem precisar de arquivos separados.

## 🚀 Configuração Rápida

### **Método 1: Gerador Automático (Recomendado)**

```bash
# Execute o gerador interativo
npm run generate-mcp-config
```

O script irá:
1. Perguntar sobre cada conexão
2. Gerar o arquivo `mcp-config-generated.json`
3. Você só precisa copiar para seu arquivo MCP

### **Método 2: Configuração Manual**

Copie este exemplo para seu arquivo de configuração MCP:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-node-mcp"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"production\":{\"user\":\"HR_PROD\",\"password\":\"prod_password\",\"connectString\":\"prod-server:1521/PROD\",\"description\":\"Production Database\"},\"development\":{\"user\":\"HR_DEV\",\"password\":\"dev_password\",\"connectString\":\"dev-server:1521/DEV\",\"description\":\"Development Database\"}},\"defaultConnection\":\"development\"}"
      }
    }
  }
}
```

## 📋 Exemplos Práticos

### **Exemplo 1: Desenvolvimento e Produção**

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-node-mcp"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"production\":{\"user\":\"HR_PROD\",\"password\":\"prod_password\",\"connectString\":\"prod-server:1521/PROD\",\"description\":\"Production Database\"},\"development\":{\"user\":\"HR_DEV\",\"password\":\"dev_password\",\"connectString\":\"dev-server:1521/DEV\",\"description\":\"Development Database\"}},\"defaultConnection\":\"development\"}"
      }
    }
  }
}
```

### **Exemplo 2: Múltiplos Ambientes**

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-node-mcp"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"production\":{\"user\":\"HR_PROD\",\"password\":\"prod_password\",\"connectString\":\"prod-server:1521/PROD\",\"description\":\"Production Database\"},\"staging\":{\"user\":\"HR_STAGING\",\"password\":\"staging_password\",\"connectString\":\"staging-server:1521/STAGING\",\"description\":\"Staging Database\"},\"development\":{\"user\":\"HR_DEV\",\"password\":\"dev_password\",\"connectString\":\"dev-server:1521/DEV\",\"description\":\"Development Database\"},\"testing\":{\"user\":\"HR_TEST\",\"password\":\"test_password\",\"connectString\":\"test-server:1521/TEST\",\"description\":\"Testing Database\"}},\"defaultConnection\":\"development\"}"
      }
    }
  }
}
```

## 🛠️ Como Usar

### **Listar Conexões**
```javascript
await mcp.callTool('list_connections');
```

### **Usar Conexão Específica**
```javascript
// Produção
await mcp.callTool('check_database_health', {
  connectionName: 'production'
});

// Desenvolvimento
await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'new_table',
  schema: 'HR',
  columns: [
    { name: 'id', type: 'NUMBER', notNull: true },
    { name: 'name', type: 'VARCHAR2', length: 100 }
  ]
});

// Teste
await mcp.callTool('select_data', {
  connectionName: 'testing',
  tableName: 'employees',
  schema: 'HR',
  limit: 10
});
```

### **Sem connectionName (usa padrão)**
```javascript
// Usa a conexão padrão definida em defaultConnection
await mcp.callTool('check_database_health');
```

## 🔧 Configuração Avançada

### **Pool de Conexões**
```json
{
  "ORACLE_CONNECTIONS": "{\"connections\":{\"production\":{\"user\":\"HR_PROD\",\"password\":\"prod_password\",\"connectString\":\"prod-server:1521/PROD\",\"poolMin\":5,\"poolMax\":50,\"poolIncrement\":5,\"poolTimeout\":60,\"poolPingInterval\":60}},\"defaultConnection\":\"production\"}"
}
```

### **Monitoramento e Alertas**
```json
{
  "ORACLE_CONNECTIONS": "{\"connections\":{...},\"defaultConnection\":\"development\",\"monitoring\":{\"healthCheckInterval\":300000,\"schemaCheckInterval\":600000,\"performanceCheckInterval\":300000},\"alerts\":{\"tablespaceUsageThreshold\":80,\"connectionThreshold\":100,\"performanceThreshold\":1000}}"
}
```

## 🚨 Troubleshooting

### **Problema: JSON inválido**
```
Error: Unexpected token in JSON
```
**Solução**: Use o gerador automático (`npm run generate-mcp-config`) ou valide o JSON

### **Problema: Conexão não encontrada**
```
Error: Connection 'production' not found
```
**Solução**: Verifique se a conexão existe na configuração `ORACLE_CONNECTIONS`

### **Problema: Fallback para .env**
```
Error: No connection configuration available
```
**Solução**: Verifique se a variável `ORACLE_CONNECTIONS` está configurada corretamente

## 📊 Vantagens da Nova Abordagem

1. **✅ Um único arquivo**: Toda configuração no MCP config
2. **✅ Sem arquivos separados**: Não precisa de `config/multi-connections.json`
3. **✅ Configuração centralizada**: Tudo em um lugar
4. **✅ Fácil de compartilhar**: Um arquivo JSON para toda a equipe
5. **✅ Compatibilidade total**: Funciona com configuração antiga
6. **✅ Gerador automático**: Script interativo para facilitar

## 🎯 Ordem de Prioridade

1. **`ORACLE_CONNECTIONS`** (variável de ambiente) - **Nova abordagem**
2. **`config/multi-connections.json`** (arquivo) - Fallback
3. **`.env`** (variáveis individuais) - Fallback antigo

## 🚀 Próximos Passos

1. **Execute**: `npm run generate-mcp-config`
2. **Copie**: O conteúdo gerado para seu arquivo MCP
3. **Edite**: Substitua as credenciais pelos valores reais
4. **Reinicie**: O Cursor/Claude
5. **Teste**: `await mcp.callTool('list_connections')`

---

**💡 Dica**: Use o gerador automático para evitar erros de JSON e facilitar a configuração!
