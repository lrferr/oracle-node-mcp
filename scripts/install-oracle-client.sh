#!/bin/bash
# Script para instalar Oracle Instant Client no Linux/macOS

echo "=== Instalador Oracle Instant Client ==="

# Detectar sistema operacional
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="linux"
    ORACLE_PATH="/opt/oracle/instantclient_21_8"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="mac"
    ORACLE_PATH="/opt/oracle/instantclient_21_8"
else
    echo "Sistema operacional não suportado: $OSTYPE"
    exit 1
fi

echo "Sistema detectado: $PLATFORM"
echo "Diretório de instalação: $ORACLE_PATH"

# Criar diretório
sudo mkdir -p "$ORACLE_PATH"
cd "$ORACLE_PATH"

# URLs de download
if [[ "$PLATFORM" == "linux" ]]; then
    BASIC_URL="https://download.oracle.com/otn_software/linux/instantclient/218000/instantclient-basic-linux.x64-21.8.0.0.0dbru.zip"
    SDK_URL="https://download.oracle.com/otn_software/linux/instantclient/218000/instantclient-sdk-linux.x64-21.8.0.0.0dbru.zip"
elif [[ "$PLATFORM" == "mac" ]]; then
    BASIC_URL="https://download.oracle.com/otn_software/mac/instantclient/218000/instantclient-basic-macos.x64-21.8.0.0.0dbru.zip"
    SDK_URL="https://download.oracle.com/otn_software/mac/instantclient/218000/instantclient-sdk-macos.x64-21.8.0.0.0dbru.zip"
fi

echo "=== Baixando arquivos ==="

# Baixar basic
echo "Baixando basic..."
wget -O basic.zip "$BASIC_URL"
if [ $? -eq 0 ]; then
    echo "✓ Basic baixado com sucesso"
else
    echo "✗ Erro ao baixar basic"
    exit 1
fi

# Baixar SDK
echo "Baixando SDK..."
wget -O sdk.zip "$SDK_URL"
if [ $? -eq 0 ]; then
    echo "✓ SDK baixado com sucesso"
else
    echo "✗ Erro ao baixar SDK"
    exit 1
fi

echo "=== Extraindo arquivos ==="

# Extrair basic
echo "Extraindo basic..."
unzip -o basic.zip
if [ $? -eq 0 ]; then
    echo "✓ Basic extraído com sucesso"
    rm basic.zip
else
    echo "✗ Erro ao extrair basic"
    exit 1
fi

# Extrair SDK
echo "Extraindo SDK..."
unzip -o sdk.zip
if [ $? -eq 0 ]; then
    echo "✓ SDK extraído com sucesso"
    rm sdk.zip
else
    echo "✗ Erro ao extrair SDK"
    exit 1
fi

echo "=== Configurando variáveis de ambiente ==="

# Adicionar ao PATH
if ! grep -q "$ORACLE_PATH" ~/.bashrc; then
    echo "export PATH=\$PATH:$ORACLE_PATH" >> ~/.bashrc
    echo "✓ PATH atualizado no ~/.bashrc"
fi

# Definir ORACLE_CLIENT_PATH
if ! grep -q "ORACLE_CLIENT_PATH" ~/.bashrc; then
    echo "export ORACLE_CLIENT_PATH=$ORACLE_PATH" >> ~/.bashrc
    echo "✓ ORACLE_CLIENT_PATH definido no ~/.bashrc"
fi

# Para macOS, adicionar ao .zshrc também
if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! grep -q "$ORACLE_PATH" ~/.zshrc; then
        echo "export PATH=\$PATH:$ORACLE_PATH" >> ~/.zshrc
        echo "✓ PATH atualizado no ~/.zshrc"
    fi
    
    if ! grep -q "ORACLE_CLIENT_PATH" ~/.zshrc; then
        echo "export ORACLE_CLIENT_PATH=$ORACLE_PATH" >> ~/.zshrc
        echo "✓ ORACLE_CLIENT_PATH definido no ~/.zshrc"
    fi
fi

# Configurar bibliotecas (Linux)
if [[ "$PLATFORM" == "linux" ]]; then
    echo "Configurando bibliotecas..."
    sudo sh -c "echo '$ORACLE_PATH' > /etc/ld.so.conf.d/oracle-instantclient.conf"
    sudo ldconfig
    echo "✓ Bibliotecas configuradas"
fi

echo ""
echo "=== Instalação concluída! ==="
echo "Reinicie o terminal e execute: npm run test-connection"
echo "Arquivos instalados em: $ORACLE_PATH"
