# 🚀 Configuração Rápida - Cursor IDE

Guia rápido para configurar o Oracle MCP Server no Cursor IDE.

## ⚡ Configuração Automática

### 1. Executar Script de Configuração

**Windows:**
```bash
# Executar script automático
scripts\setup-cursor.bat
```

**Linux/macOS:**
```bash
# Executar script automático
./scripts/setup-cursor.sh
```

### 2. Configurar Credenciais

Edite o arquivo de configuração gerado e altere as credenciais Oracle:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux:** `~/.config/claude/claude_desktop_config.json`

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
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 3. Reiniciar Cursor

Feche e abra o Cursor IDE para carregar a nova configuração.

## 🔧 Configuração Manual

### 1. Localizar Arquivo de Configuração

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

### 2. Adicionar Configuração MCP

Adicione a seguinte configuração ao arquivo:

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

## 🧪 Testar Configuração

### 1. Testar Conexão Oracle

```bash
npm run test-connection
```

### 2. Testar Configuração MCP

```bash
npm run test-mcp-config
```

### 3. Testar no Cursor

Abra uma nova conversa no Cursor e digite:

```
Verifique a saúde do banco de dados Oracle
```

## 🔍 Verificar se Funcionou

Se a configuração estiver correta, o Claude deve responder com informações sobre:

- Status das conexões
- Uso de tablespaces
- Métricas de performance
- Informações do banco

## 🐛 Problemas Comuns

### Erro: "Servidor MCP não encontrado"

**Solução:**
1. Verifique se o arquivo de configuração existe
2. Verifique se o JSON está válido
3. Reinicie o Cursor
4. Verifique o caminho do arquivo `src/index.js`

### Erro: "Conexão Oracle falhou"

**Solução:**
1. Verifique as credenciais no arquivo de configuração
2. Teste a conexão: `npm run test-connection`
3. Verifique se o Oracle está rodando
4. Verifique host, porta e service name

### Erro: "Comando não encontrado"

**Solução:**
1. Verifique se Node.js está instalado
2. Verifique se o caminho está correto
3. Use caminho absoluto completo

## 📋 Comandos Úteis

```bash
# Instalar dependências
npm install

# Testar conexão Oracle
npm run test-connection

# Testar configuração MCP
npm run test-mcp-config

# Iniciar servidor manualmente
npm start

# Configurar automaticamente
scripts\setup-cursor.bat  # Windows
./scripts/setup-cursor.sh # Linux/macOS
```

## 🎯 Próximos Passos

1. ✅ Configure as credenciais Oracle
2. ✅ Reinicie o Cursor IDE
3. ✅ Teste com comandos básicos
4. 🔄 Explore as 15 ferramentas disponíveis
5. 📊 Configure monitoramento contínuo

---

**💡 Dica:** Use `npm run test-mcp-config` para verificar se tudo está configurado corretamente!
