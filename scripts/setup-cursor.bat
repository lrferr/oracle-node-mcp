@echo off
echo Configurando Oracle MCP Server para Cursor IDE...

REM Obter diretório atual
set "PROJECT_DIR=%~dp0.."
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

REM Obter diretório de configuração do Claude Desktop
set "CONFIG_DIR=%APPDATA%\Claude"
set "CONFIG_FILE=%CONFIG_DIR%\claude_desktop_config.json"

echo.
echo Diretório do projeto: %PROJECT_DIR%
echo Arquivo de configuração: %CONFIG_FILE%
echo.

REM Verificar se o diretório de configuração existe
if not exist "%CONFIG_DIR%" (
    echo Criando diretório de configuração...
    mkdir "%CONFIG_DIR%"
)

REM Verificar se o arquivo de configuração existe
if not exist "%CONFIG_FILE%" (
    echo Criando arquivo de configuração inicial...
    echo {> "%CONFIG_FILE%"
    echo   "mcpServers": {}>> "%CONFIG_FILE%"
    echo }>> "%CONFIG_FILE%"
)

REM Criar backup do arquivo existente
if exist "%CONFIG_FILE%" (
    echo Criando backup do arquivo de configuração...
    copy "%CONFIG_FILE%" "%CONFIG_FILE%.backup.%date:~-4,4%%date:~-10,2%%date:~-7,2%"
)

REM Criar configuração MCP
echo Criando configuração MCP...
echo {
echo   "mcpServers": {
echo     "oracle-monitor": {
echo       "command": "node",
echo       "args": ["%PROJECT_DIR:\=\\%\\src\\index.js"],
echo       "env": {
echo         "ORACLE_HOST": "localhost",
echo         "ORACLE_PORT": "1521",
echo         "ORACLE_SERVICE_NAME": "ORCL",
echo         "ORACLE_USER": "your_username",
echo         "ORACLE_PASSWORD": "your_password",
echo         "MCP_SERVER_NAME": "oracle-monitor",
echo         "MCP_SERVER_VERSION": "1.0.0",
echo         "LOG_LEVEL": "info",
echo         "LOG_FILE": "logs/oracle-mcp.log",
echo         "MONITOR_INTERVAL": "300000",
echo         "CRITICAL_SCHEMAS": "HR,SCOTT,SYSTEM",
echo         "SENSITIVE_TABLES": "USERS,ACCOUNTS,TRANSACTIONS",
echo         "NOTIFICATION_ENABLED": "true",
echo         "NOTIFICATION_EMAIL": "admin@company.com"
echo       }
echo     }
echo   }
echo } > "%CONFIG_FILE%"

echo.
echo ✅ Configuração criada com sucesso!
echo.
echo 📋 Próximos passos:
echo 1. Edite o arquivo de configuração: %CONFIG_FILE%
echo 2. Configure suas credenciais Oracle
echo 3. Reinicie o Cursor IDE
echo 4. Teste com: "Verifique a saúde do banco Oracle"
echo.
echo 🔧 Para editar as credenciais:
echo    - Abra: %CONFIG_FILE%
echo    - Altere ORACLE_USER e ORACLE_PASSWORD
echo    - Altere ORACLE_HOST se necessário
echo.
pause
