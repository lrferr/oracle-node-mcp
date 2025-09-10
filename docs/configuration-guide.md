# Guia de Configuração - Oracle Node MCP Server

Este guia explica como configurar o servidor MCP Oracle no Cursor e no Claude Desktop.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Oracle Database acessível
- Cursor IDE ou Claude Desktop
- Credenciais Oracle válidas

## 🚀 Instalação do Servidor MCP

### 1. Instalar Dependências

```bash
# No diretório do projeto
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar com suas credenciais
nano .env
```

**Exemplo de configuração (.env):**
```env
# Configurações do Oracle Database
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=ORCL
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha

# Configurações do MCP Server
MCP_SERVER_NAME=oracle-monitor
MCP_SERVER_VERSION=1.0.0

# Configurações de Log
LOG_LEVEL=info
LOG_FILE=logs/oracle-mcp.log

# Configurações de Monitoramento
MONITOR_INTERVAL=300000
CRITICAL_SCHEMAS=HR,SCOTT,SYSTEM
SENSITIVE_TABLES=USERS,ACCOUNTS,TRANSACTIONS

# Configurações de Notificação
NOTIFICATION_ENABLED=true
NOTIFICATION_EMAIL=admin@company.com
```

### 3. Testar Conexão

```bash
# Testar se a conexão Oracle está funcionando
npm run test-connection
```

## 🔧 Configuração no Cursor IDE

### 1. Localizar Arquivo de Configuração MCP

O Cursor usa o mesmo sistema de configuração do Claude Desktop. Localize o arquivo:

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

### 2. Configurar Servidor MCP

Adicione a configuração do servidor Oracle ao arquivo `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
       "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "seu_usuario",
        "ORACLE_PASSWORD": "sua_senha",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 3. Exemplo Completo de Configuração

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

## 🔧 Configuração no Claude Desktop

### 1. Localizar Arquivo de Configuração

O arquivo de configuração do Claude Desktop está localizado em:

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

### 2. Configurar Servidor MCP

Use a mesma configuração mostrada acima para o Cursor.

## 🛠️ Configuração Alternativa (Usando .env)

### 1. Configurar Caminho Absoluto

Se preferir usar o arquivo `.env`, configure o caminho absoluto:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
       "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
       "cwd": "C:\\path\\to\\oracle_node_mcp"
    }
  }
}
```

### 2. Usar Script de Inicialização

Crie um script `start-mcp.bat` (Windows) ou `start-mcp.sh` (Linux/macOS):

**start-mcp.bat:**
```batch
@echo off
cd /d "C:\path\to\oracle_node_mcp"
node src\index.js
```

**start-mcp.sh:**
```bash
#!/bin/bash
cd "/path/to/oracle_node_mcp"
node src/index.js
```

E configure no MCP:
```json
{
  "mcpServers": {
    "oracle-monitor": {
       "command": "C:\\path\\to\\oracle_node_mcp\\start-mcp.bat"
    }
  }
}
```

## 🔍 Verificação da Configuração

### 1. Verificar se o Servidor Está Funcionando

```bash
# No diretório do projeto
npm start
```

Você deve ver uma saída similar a:
```
Servidor MCP Oracle iniciado com sucesso!
```

### 2. Testar no Cursor/Claude Desktop

1. Reinicie o Cursor/Claude Desktop
2. Abra uma nova conversa
3. Digite: "Liste as ferramentas disponíveis do Oracle"
4. O Claude deve responder com a lista de ferramentas MCP

### 3. Testar Conexão Oracle

No Cursor/Claude Desktop, digite:
```
Verifique a saúde do banco de dados Oracle
```

## 🐛 Troubleshooting

### Problema: Servidor não inicia

**Solução:**
1. Verifique se Node.js está instalado: `node --version`
2. Verifique se as dependências estão instaladas: `npm install`
3. Verifique as credenciais Oracle no arquivo `.env`
4. Teste a conexão: `npm run test-connection`

### Problema: Claude não reconhece o servidor

**Solução:**
1. Verifique o caminho do arquivo de configuração
2. Verifique se o arquivo JSON está válido
3. Reinicie o Cursor/Claude Desktop
4. Verifique os logs do servidor

### Problema: Erro de conexão Oracle

**Solução:**
1. Verifique se o Oracle está rodando
2. Verifique host, porta e service name
3. Verifique usuário e senha
4. Verifique se o usuário tem privilégios necessários

### Problema: Caminho não encontrado

**Solução:**
1. Use caminhos absolutos
2. Verifique se o arquivo `src/index.js` existe
3. Use barras duplas no Windows: `C:\\caminho\\arquivo.js`

## 📝 Exemplos de Uso

### 1. Verificar Saúde do Banco

```
Verifique a saúde geral do banco de dados Oracle
```

### 2. Listar Tabelas de um Esquema

```
Liste todas as tabelas do esquema HR
```

### 3. Analisar Constraints

```
Mostre todas as foreign keys do esquema HR
```

### 4. Verificar Performance

```
Analise os índices da tabela EMPLOYEES no esquema HR
```

## 🔧 Configurações Avançadas

### 1. Múltiplos Servidores MCP

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
       "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "usuario1",
        "ORACLE_PASSWORD": "senha1"
      }
    },
    "oracle-prod": {
      "command": "node",
       "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "prod-server",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "PROD",
        "ORACLE_USER": "usuario2",
        "ORACLE_PASSWORD": "senha2"
      }
    }
  }
}
```

### 2. Configuração com Logs

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
       "args": ["C:\\path\\to\\oracle_node_mcp\\src\\index.js"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "seu_usuario",
        "ORACLE_PASSWORD": "sua_senha",
        "LOG_LEVEL": "debug",
        "LOG_FILE": "logs/oracle-mcp-debug.log"
      }
    }
  }
}
```

## 📚 Recursos Adicionais

- [Documentação MCP](https://modelcontextprotocol.io/)
- [Documentação Oracle Node.js](https://oracle.github.io/node-oracledb/)
- [Cursor IDE Documentation](https://cursor.sh/docs)
- [Claude Desktop Documentation](https://claude.ai/desktop)
- [Repositório GitHub](https://github.com/lrferr/oracle-mcp-v1)

---

**💡 Dica:** Mantenha sempre uma cópia de backup do arquivo de configuração antes de fazer alterações!
