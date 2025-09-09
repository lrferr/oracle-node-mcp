#!/bin/bash

echo "Configurando Oracle MCP Server para Cursor IDE..."

# Obter diretório atual
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Detectar sistema operacional
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CONFIG_DIR="$HOME/.config/claude"
else
    echo "❌ Sistema operacional não suportado: $OSTYPE"
    exit 1
fi

CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

echo
echo "Diretório do projeto: $PROJECT_DIR"
echo "Arquivo de configuração: $CONFIG_FILE"
echo

# Verificar se o diretório de configuração existe
if [ ! -d "$CONFIG_DIR" ]; then
    echo "Criando diretório de configuração..."
    mkdir -p "$CONFIG_DIR"
fi

# Verificar se o arquivo de configuração existe
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Criando arquivo de configuração inicial..."
    echo '{
  "mcpServers": {}
}' > "$CONFIG_FILE"
fi

# Criar backup do arquivo existente
if [ -f "$CONFIG_FILE" ]; then
    echo "Criando backup do arquivo de configuração..."
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup.$(date +%Y%m%d)"
fi

# Criar configuração MCP
echo "Criando configuração MCP..."
cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "node",
      "args": ["$PROJECT_DIR/src/index.js"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
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
EOF

echo
echo "✅ Configuração criada com sucesso!"
echo
echo "📋 Próximos passos:"
echo "1. Edite o arquivo de configuração: $CONFIG_FILE"
echo "2. Configure suas credenciais Oracle"
echo "3. Reinicie o Cursor IDE"
echo "4. Teste com: \"Verifique a saúde do banco Oracle\""
echo
echo "🔧 Para editar as credenciais:"
echo "   - Abra: $CONFIG_FILE"
echo "   - Altere ORACLE_USER e ORACLE_PASSWORD"
echo "   - Altere ORACLE_HOST se necessário"
echo
