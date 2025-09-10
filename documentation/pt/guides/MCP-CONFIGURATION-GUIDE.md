# Guia de Configuração MCP - Múltiplas Conexões Oracle

Este guia explica como configurar o Oracle Node MCP com múltiplas conexões usando arquivos de configuração MCP (Cursor/Claude).

## 🎯 Opções de Configuração

### **Opção 1: Conexão Única (Como Antes)**

Use esta configuração se você quer apenas uma conexão Oracle:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "ORACLE_HOST": "seu-servidor-oracle.com",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "SEU_SERVICE",
        "ORACLE_USER": "seu_usuario",
        "ORACLE_PASSWORD": "sua_senha",
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**✅ Funciona exatamente como antes!**
- Todas as ferramentas funcionam normalmente
- Não precisa especificar `connectionName`
- Usa as variáveis de ambiente do MCP config

### **Opção 2: Múltiplas Conexões (Nova Funcionalidade)**

#### **Método A: Arquivo de Configuração Separado (Recomendado)**

1. **Configure o MCP:**
```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

2. **Crie o arquivo `config/multi-connections.json` no diretório do projeto:**
```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "description": "Production Database",
      "environment": "production"
    },
    "development": {
      "user": "HR_DEV",
      "password": "dev_password",
      "connectString": "dev-server:1521/DEV",
      "description": "Development Database",
      "environment": "development"
    },
    "testing": {
      "user": "HR_TEST",
      "password": "test_password",
      "connectString": "test-server:1521/TEST",
      "description": "Testing Database",
      "environment": "testing"
    }
  },
  "defaultConnection": "development"
}
```

#### **Método B: Tudo no MCP Config (Alternativo)**

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "ORACLE_CONNECTIONS_CONFIG": "{\"connections\":{\"production\":{\"user\":\"HR_PROD\",\"password\":\"prod_password\",\"connectString\":\"prod-server:1521/PROD\",\"description\":\"Production Database\"},\"development\":{\"user\":\"HR_DEV\",\"password\":\"dev_password\",\"connectString\":\"dev-server:1521/DEV\",\"description\":\"Development Database\"}},\"defaultConnection\":\"development\"}"
      }
    }
  }
}
```

## 🚀 Como Usar

### **Com Conexão Única (Opção 1)**
```javascript
// Funciona exatamente como antes
await mcp.callTool('check_database_health');
await mcp.callTool('create_table', { tableName: 'test' });
await mcp.callTool('select_data', { tableName: 'employees' });
```

### **Com Múltiplas Conexões (Opção 2)**
```javascript
// Listar conexões disponíveis
await mcp.callTool('list_connections');

// Usar conexão específica
await mcp.callTool('check_database_health', {
  connectionName: 'production'
});

await mcp.callTool('create_table', {
  connectionName: 'development',
  tableName: 'test'
});

// Sem connectionName (usa default)
await mcp.callTool('check_database_health');
```

## 📋 Exemplos Práticos

### **Exemplo 1: Desenvolvimento Multi-Ambiente**

```json
{
  "mcpServers": {
    "oracle-dev": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "MCP_SERVER_NAME": "oracle-dev",
        "MCP_SERVER_VERSION": "1.0.0"
      }
    }
  }
}
```

Com `config/multi-connections.json`:
```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "description": "Production Database"
    },
    "development": {
      "user": "HR_DEV",
      "password": "dev_password",
      "connectString": "dev-server:1521/DEV",
      "description": "Development Database"
    }
  },
  "defaultConnection": "development"
}
```

### **Exemplo 2: Múltiplos Servidores MCP**

```json
{
  "mcpServers": {
    "oracle-prod": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "ORACLE_HOST": "prod-server.com",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "PROD",
        "ORACLE_USER": "HR_PROD",
        "ORACLE_PASSWORD": "prod_password",
        "MCP_SERVER_NAME": "oracle-prod"
      }
    },
    "oracle-dev": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "ORACLE_HOST": "dev-server.com",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "DEV",
        "ORACLE_USER": "HR_DEV",
        "ORACLE_PASSWORD": "dev_password",
        "MCP_SERVER_NAME": "oracle-dev"
      }
    }
  }
}
```

## 🔧 Configuração Avançada

### **Pool de Conexões**

```json
{
  "connections": {
    "production": {
      "user": "HR_PROD",
      "password": "prod_password",
      "connectString": "prod-server:1521/PROD",
      "poolMin": 5,
      "poolMax": 50,
      "poolIncrement": 5,
      "poolTimeout": 60,
      "poolPingInterval": 60
    }
  }
}
```

### **Monitoramento e Alertas**

```json
{
  "connections": { /* ... */ },
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

## 🚨 Troubleshooting

### **Problema: Conexão não encontrada**
```
Error: Connection 'production' not found in configuration
```
**Solução**: Verifique se o arquivo `config/multi-connections.json` existe e tem a conexão configurada

### **Problema: Fallback para .env não funciona**
```
Error: No connection configuration available
```
**Solução**: Verifique se as variáveis de ambiente estão configuradas no MCP config

### **Problema: Múltiplas conexões não funcionam**
```
Error: ConnectionManager not available
```
**Solução**: Verifique se o arquivo `config/multi-connections.json` está no diretório correto

## 📊 Vantagens de Cada Abordagem

### **Conexão Única (.env)**
- ✅ Simples e direto
- ✅ Funciona exatamente como antes
- ✅ Fácil de configurar
- ❌ Apenas uma conexão

### **Múltiplas Conexões (JSON)**
- ✅ Múltiplas conexões
- ✅ Configuração centralizada
- ✅ Pool otimizado
- ✅ Monitoramento unificado
- ❌ Configuração mais complexa

## 🎯 Recomendação

1. **Para uso simples**: Use a **Opção 1** (conexão única)
2. **Para múltiplos ambientes**: Use a **Opção 2** (múltiplas conexões)
3. **Para migração gradual**: Comece com Opção 1, migre para Opção 2 quando necessário

---

**💡 Dica**: Comece com conexão única e migre para múltiplas conexões quando precisar de mais ambientes!
