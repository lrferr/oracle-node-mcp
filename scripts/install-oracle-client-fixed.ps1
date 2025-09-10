# Script PowerShell para instalar Oracle Instant Client
# Execute como Administrador

Write-Host "=== Instalador Oracle Instant Client ===" -ForegroundColor Green

# Criar diretório
$oraclePath = "C:\oracle\instantclient_21_8"
if (!(Test-Path $oraclePath)) {
    New-Item -ItemType Directory -Path $oraclePath -Force
    Write-Host "Diretório criado: $oraclePath" -ForegroundColor Yellow
}

# URLs de download (versão 21.8 - mais recente)
$downloadUrls = @{
    "basic" = "https://download.oracle.com/otn_software/nt/instantclient/218000/instantclient-basic-windows.x64-21.8.0.0.0dbru.zip"
    "sdk" = "https://download.oracle.com/otn_software/nt/instantclient/218000/instantclient-sdk-windows.x64-21.8.0.0.0dbru.zip"
}

Write-Host "`n=== Download dos arquivos ===" -ForegroundColor Green

foreach ($type in $downloadUrls.Keys) {
    $url = $downloadUrls[$type]
    $fileName = "$type.zip"
    $filePath = "$oraclePath\$fileName"
    
    Write-Host "Baixando $type..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $url -OutFile $filePath -UseBasicParsing
        Write-Host "✓ $type baixado com sucesso" -ForegroundColor Green
    } catch {
        Write-Host "✗ Erro ao baixar $type : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Extraindo arquivos ===" -ForegroundColor Green

# Extrair arquivos
foreach ($type in $downloadUrls.Keys) {
    $fileName = "$type.zip"
    $filePath = "$oraclePath\$fileName"
    
    if (Test-Path $filePath) {
        Write-Host "Extraindo $type..." -ForegroundColor Yellow
        try {
            Expand-Archive -Path $filePath -DestinationPath $oraclePath -Force
            Remove-Item $filePath -Force
            Write-Host "✓ $type extraído com sucesso" -ForegroundColor Green
        } catch {
            Write-Host "✗ Erro ao extrair $type : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Configurar variáveis de ambiente
Write-Host "`n=== Configurando variáveis de ambiente ===" -ForegroundColor Green

# Adicionar ao PATH do sistema
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($currentPath -notlike "*$oraclePath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$oraclePath", "Machine")
    Write-Host "✓ PATH atualizado com $oraclePath" -ForegroundColor Green
} else {
    Write-Host "✓ PATH já contém $oraclePath" -ForegroundColor Green
}

# Definir ORACLE_CLIENT_PATH
[Environment]::SetEnvironmentVariable("ORACLE_CLIENT_PATH", $oraclePath, "Machine")
Write-Host "✓ ORACLE_CLIENT_PATH definido como $oraclePath" -ForegroundColor Green

Write-Host "`n=== Instalação concluída! ===" -ForegroundColor Green
Write-Host "Reinicie o terminal e execute: npm run test-connection" -ForegroundColor Yellow
Write-Host "`nArquivos instalados em: $oraclePath" -ForegroundColor Cyan


