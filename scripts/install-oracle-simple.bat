@echo off
echo === Instalador Oracle Instant Client Simplificado ===

REM Criar diretorio
if not exist "C:\oracle\instantclient_21_8" mkdir "C:\oracle\instantclient_21_8"

echo.
echo Baixando Oracle Instant Client Basic...
powershell -Command "Invoke-WebRequest -Uri 'https://download.oracle.com/otn_software/nt/instantclient/218000/instantclient-basic-windows.x64-21.8.0.0.0dbru.zip' -OutFile 'C:\oracle\instantclient_21_8\basic.zip'"

echo.
echo Extraindo arquivos...
powershell -Command "Expand-Archive -Path 'C:\oracle\instantclient_21_8\basic.zip' -DestinationPath 'C:\oracle\instantclient_21_8' -Force"

echo.
echo Configurando variaveis de ambiente...
setx ORACLE_CLIENT_PATH "C:\oracle\instantclient_21_8" /M
setx PATH "%PATH%;C:\oracle\instantclient_21_8" /M

echo.
echo === Instalacao concluida! ===
echo Reinicie o terminal e teste a conexao.
pause


