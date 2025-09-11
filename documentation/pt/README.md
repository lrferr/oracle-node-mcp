# Oracle Node MCP Server

[![npm version](https://badge.fury.io/js/oracle-mcp-v1.svg)](https://badge.fury.io/js/oracle-mcp-v1)
[![Downloads](https://img.shields.io/npm/dm/oracle-mcp-v1.svg)](https://www.npmjs.com/package/oracle-mcp-v1)
[![GitHub stars](https://img.shields.io/github/stars/lrferr/oracle-mcp-v1.svg)](https://github.com/lrferr/oracle-mcp-v1/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um servidor MCP (Model Context Protocol) para monitoramento e interação com Oracle Database, desenvolvido em Node.js.

**📖 [English Version](README-EN.md) | 🇧🇷 [Versão em Português](README.md)**

## 🚀 Funcionalidades

### 🔗 Múltiplas Conexões Oracle
- ✅ **Conexões Simultâneas** - Conecte-se a vários bancos Oracle ao mesmo tempo
- ✅ **Pool Otimizado** - Cada conexão tem seu próprio pool de conexões
- ✅ **Configuração Centralizada** - Todas as conexões em um arquivo de configuração
- ✅ **Ambientes Multi-Camada** - Desenvolvimento, Teste, Staging, Produção
- ✅ **Monitoramento Unificado** - Status de todas as conexões em um lugar

### 📊 Monitoramento de Banco de Dados
- ✅ Verificação de saúde geral do banco
- ✅ Monitoramento de conexões ativas
- ✅ Análise de tablespaces e uso de espaço
- ✅ Métricas de performance em tempo real
- ✅ Detecção de problemas de conectividade

### 🛡️ Monitoramento de Esquemas Críticos
- ✅ Detecção de mudanças em esquemas sensíveis
- ✅ Alertas automáticos para alterações não autorizadas
- ✅ Histórico de mudanças com timestamps
- ✅ Validação de integridade de esquemas

### 🔧 Validação de Scripts de Migração
- ✅ Análise de segurança de scripts SQL
- ✅ Detecção de operações perigosas
- ✅ Verificação de estratégias de backup
- ✅ Validação de sintaxe e boas práticas
- ✅ Geração de templates de migração

### 📱 Sistema de Notificações
- ✅ Alertas em tempo real para mudanças críticas
- ✅ Notificações por email (configurável)
- ✅ Logs estruturados com diferentes níveis
- ✅ Relatórios de histórico de alertas

## 📋 Pré-requisitos

- Node.js 18.0.0 ou superior
- Oracle Database 11g ou superior
- Acesso ao banco com privilégios adequados
- DBeaver ou similar para configuração inicial

## 🛠️ Instalação

### Opção 1: Instalação via NPM (Recomendado)

```bash
# Instalar globalmente
npm install -g oracle-mcp-v1

# Ou usar com npx (sem instalar)
npx oracle-mcp-v1 --help
```

## 🚀 Configuração Rápida

### Configuração MCP (Cursor/Claude Desktop)

Adicione a seguinte configuração ao seu arquivo `mcp.json`:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1@latest"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "ORACLE_CLIENT_PATH": "C:\\oracle\\instantclient_21_8",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"prod\":{\"user\":\"seu_usuario\",\"password\":\"sua_senha\",\"connectString\":\"servidor:porta/servico\",\"description\":\"Production Database\"}},\"defaultConnection\":\"prod\"}"
      }
    }
  }
}
```

**Para múltiplas conexões:**
```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1@latest"],
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "ORACLE_CLIENT_PATH": "C:\\oracle\\instantclient_21_8",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"hml\":{\"user\":\"usuario_hml\",\"password\":\"senha_hml\",\"connectString\":\"servidor_hml:1521/hml01\",\"description\":\"Homologação Database\"},\"prod\":{\"user\":\"usuario_prod\",\"password\":\"senha_prod\",\"connectString\":\"servidor_prod:1529/prod01\",\"description\":\"Production Database\"}},\"defaultConnection\":\"prod\"}"
      }
    }
  }
}
```

### Opção 2: Instalação Local

1. **Clone o repositório:**
```bash
git clone https://github.com/lrferr/oracle-mcp-v1.git
cd oracle-mcp-v1
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
```bash
cp env.example .env
```

4. **Edite o arquivo `.env` com suas configurações:**
```env
# Configurações do Oracle Database
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=ORCL
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password

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

## 🚀 Uso

### Configuração Rápida (NPM)

```bash
# Configurar Cursor IDE automaticamente
npx oracle-mcp setup-cursor

# Testar conexão Oracle
npx oracle-mcp test-connection

# Iniciar servidor MCP
npx oracle-mcp
```

### 🔗 Múltiplas Conexões

```bash
# Configurar múltiplas conexões interativamente
npm run setup-multi-connections

# Testar todas as conexões
npm run demo-multi-connections

# Gerar configuração MCP para Cursor/Claude
npm run generate-mcp-config
```

**📖 [Guia Completo de Múltiplas Conexões](guides/MULTIPLE-CONNECTIONS.md)**

### Configuração Manual

**Configuração Automática:**
```bash
# Windows
scripts\setup-cursor.bat

# Linux/macOS
./scripts/setup-cursor.sh
```

**Configuração Manual:**
1. Localize o arquivo de configuração do Claude Desktop
2. Adicione a configuração MCP (veja `docs/configuration-guide.md`)
3. Reinicie o Cursor IDE

### Comandos Disponíveis

```bash
# Mostrar ajuda
npx oracle-mcp --help

# Testar conexão Oracle
npx oracle-mcp test-connection

# Configurar Cursor IDE
npx oracle-mcp setup-cursor

# Configurar Claude Desktop
npx oracle-mcp setup-claude

# Iniciar servidor MCP
npx oracle-mcp

# Mostrar versão
npx oracle-mcp version
```

### Iniciar o Servidor MCP

```bash
# Modo desenvolvimento (com watch)
npm run dev

# Modo produção
npm start
```

### Ferramentas Disponíveis

O servidor MCP oferece as seguintes ferramentas:

#### 🔗 Ferramentas de Múltiplas Conexões

#### 1. `list_connections`
Lista todas as conexões configuradas.

**Exemplo:**
```json
{
  "name": "list_connections",
  "arguments": {}
}
```

#### 2. `test_connection`
Testa uma conexão específica.

**Parâmetros:**
- `connectionName` (string): Nome da conexão para testar

**Exemplo:**
```json
{
  "name": "test_connection",
  "arguments": {
    "connectionName": "production"
  }
}
```

#### 3. `test_all_connections`
Testa todas as conexões configuradas.

**Exemplo:**
```json
{
  "name": "test_all_connections",
  "arguments": {}
}
```

#### 4. `get_connections_status`
Obtém o status de todas as conexões ativas.

**Exemplo:**
```json
{
  "name": "get_connections_status",
  "arguments": {}
}
```

#### 📊 Ferramentas de Monitoramento

#### 5. `check_database_health`
Verifica a saúde geral do banco de dados.

**Parâmetros:**
- `connectionName` (string): Nome da conexão (opcional)
- `checkConnections` (boolean): Verificar conexões ativas
- `checkTablespaces` (boolean): Verificar espaço em tablespaces
- `checkPerformance` (boolean): Verificar métricas de performance

**Exemplo:**
```json
{
  "name": "check_database_health",
  "arguments": {
    "connectionName": "production",
    "checkConnections": true,
    "checkTablespaces": true,
    "checkPerformance": true
  }
}
```

#### 6. `monitor_schema_changes`
Monitora mudanças em esquemas críticos.

**Parâmetros:**
- `schemas` (array): Lista de esquemas para monitorar
- `checkInterval` (number): Intervalo de verificação em minutos

**Exemplo:**
```json
{
  "name": "monitor_schema_changes",
  "arguments": {
    "schemas": ["HR", "SCOTT", "SYSTEM"],
    "checkInterval": 5
  }
}
```

#### 3. `validate_migration_script`
Valida se um script de migração está adequado.

**Parâmetros:**
- `script` (string): Conteúdo do script de migração SQL
- `targetSchema` (string): Esquema de destino da migração

**Exemplo:**
```json
{
  "name": "validate_migration_script",
  "arguments": {
    "script": "CREATE TABLE HR.NEW_TABLE (id NUMBER PRIMARY KEY);",
    "targetSchema": "HR"
  }
}
```

#### 4. `check_sensitive_tables`
Verifica alterações em tabelas sensíveis.

**Parâmetros:**
- `tables` (array): Lista de tabelas sensíveis para verificar
- `checkDataChanges` (boolean): Verificar mudanças nos dados

**Exemplo:**
```json
{
  "name": "check_sensitive_tables",
  "arguments": {
    "tables": ["USERS", "ACCOUNTS"],
    "checkDataChanges": true
  }
}
```

#### 5. `execute_safe_query`
Executa uma query de forma segura (apenas SELECT).

**Parâmetros:**
- `query` (string): Query SQL para executar
- `schema` (string): Esquema para executar a query

**Exemplo:**
```json
{
  "name": "execute_safe_query",
  "arguments": {
    "query": "SELECT * FROM HR.EMPLOYEES WHERE department_id = 10",
    "schema": "HR"
  }
}
```

#### 6. `get_database_info`
Obtém informações gerais sobre o banco de dados.

**Parâmetros:**
- `includeUsers` (boolean): Incluir informações de usuários
- `includeTablespaces` (boolean): Incluir informações de tablespaces

**Exemplo:**
```json
{
  "name": "get_database_info",
  "arguments": {
    "includeUsers": false,
    "includeTablespaces": true
  }
}
```

#### 7. `get_table_info`
Obtém informações detalhadas sobre uma tabela específica.

**Parâmetros:**
- `tableName` (string): Nome da tabela
- `schema` (string): Esquema da tabela
- `includeConstraints` (boolean): Incluir informações de constraints
- `includeIndexes` (boolean): Incluir informações de índices

**Exemplo:**
```json
{
  "name": "get_table_info",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeConstraints": true,
    "includeIndexes": true
  }
}
```

#### 8. `get_constraints`
Lista constraints de uma tabela ou esquema.

**Parâmetros:**
- `tableName` (string): Nome da tabela (opcional)
- `schema` (string): Esquema para buscar constraints
- `constraintType` (string): Tipo de constraint para filtrar

**Exemplo:**
```json
{
  "name": "get_constraints",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "constraintType": "FOREIGN KEY"
  }
}
```

#### 9. `get_foreign_keys`
Lista chaves estrangeiras e suas referências.

**Parâmetros:**
- `tableName` (string): Nome da tabela (opcional)
- `schema` (string): Esquema para buscar foreign keys
- `showReferenced` (boolean): Mostrar tabelas referenciadas

**Exemplo:**
```json
{
  "name": "get_foreign_keys",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "showReferenced": true
  }
}
```

#### 10. `get_indexes`
Lista índices de uma tabela ou esquema.

**Parâmetros:**
- `tableName` (string): Nome da tabela (opcional)
- `schema` (string): Esquema para buscar índices
- `includeStats` (boolean): Incluir estatísticas dos índices

**Exemplo:**
```json
{
  "name": "get_indexes",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeStats": true
  }
}
```

#### 11. `get_sequences`
Lista sequences de um esquema.

**Parâmetros:**
- `schema` (string): Esquema para buscar sequences
- `includeValues` (boolean): Incluir valores atuais das sequences

**Exemplo:**
```json
{
  "name": "get_sequences",
  "arguments": {
    "schema": "HR",
    "includeValues": true
  }
}
```

#### 12. `get_triggers`
Lista triggers de uma tabela ou esquema.

**Parâmetros:**
- `tableName` (string): Nome da tabela (opcional)
- `schema` (string): Esquema para buscar triggers
- `includeCode` (boolean): Incluir código dos triggers

**Exemplo:**
```json
{
  "name": "get_triggers",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeCode": false
  }
}
```

#### 13. `get_users_privileges`
Lista usuários e seus privilégios.

**Parâmetros:**
- `user` (string): Usuário específico (opcional)
- `includeRoles` (boolean): Incluir roles do usuário
- `includeSystemPrivs` (boolean): Incluir privilégios de sistema

**Exemplo:**
```json
{
  "name": "get_users_privileges",
  "arguments": {
    "user": "HR",
    "includeRoles": true,
    "includeSystemPrivs": false
  }
}
```

#### 14. `get_table_dependencies`
Mostra dependências de uma tabela.

**Parâmetros:**
- `tableName` (string): Nome da tabela
- `schema` (string): Esquema da tabela
- `dependencyType` (string): Tipo de dependência

**Exemplo:**
```json
{
  "name": "get_table_dependencies",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "dependencyType": "ALL"
  }
}
```

#### 15. `analyze_table`
Analisa uma tabela e gera estatísticas.

**Parâmetros:**
- `tableName` (string): Nome da tabela
- `schema` (string): Esquema da tabela
- `estimatePercent` (number): Percentual para estimativa

**Exemplo:**
```json
{
  "name": "analyze_table",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "estimatePercent": 10
  }
}
```

## 🔧 Configuração Avançada

### Configuração do Oracle

Certifique-se de que o usuário Oracle tenha os privilégios necessários:

```sql
-- Privilégios básicos necessários
GRANT CONNECT, RESOURCE TO your_user;
GRANT SELECT ON v_$session TO your_user;
GRANT SELECT ON v_$instance TO your_user;
GRANT SELECT ON dba_tablespaces TO your_user;
GRANT SELECT ON dba_data_files TO your_user;
GRANT SELECT ON dba_objects TO your_user;
GRANT SELECT ON dba_tab_columns TO your_user;
GRANT SELECT ON dba_users TO your_user;
```

### Configuração de Monitoramento

O sistema pode ser configurado para monitorar diferentes aspectos:

1. **Esquemas Críticos:** Defina quais esquemas devem ser monitorados
2. **Tabelas Sensíveis:** Especifique tabelas que requerem atenção especial
3. **Intervalos de Verificação:** Configure a frequência das verificações
4. **Limites de Performance:** Defina thresholds para alertas

### Sistema de Notificações

As notificações podem ser configuradas para diferentes tipos de eventos:

- **Mudanças em Esquemas:** Alertas para alterações em esquemas críticos
- **Tabelas Sensíveis:** Notificações críticas para mudanças em dados sensíveis
- **Scripts de Migração:** Avisos para scripts que requerem revisão
- **Saúde do Banco:** Alertas para problemas de performance ou conectividade

## 📊 Logs e Monitoramento

### Estrutura de Logs

```
logs/
├── oracle-mcp.log      # Log principal
├── error.log           # Logs de erro
├── exceptions.log      # Exceções não tratadas
├── rejections.log      # Promise rejections
├── notifications.log   # Histórico de notificações
└── email-notifications.log # Notificações por email
```

### Níveis de Log

- `error`: Erros críticos que impedem o funcionamento
- `warn`: Avisos sobre situações que requerem atenção
- `info`: Informações gerais sobre operações
- `debug`: Informações detalhadas para depuração

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar com coverage
npm run test:coverage

# Executar testes específicos
npm test -- --grep "OracleMonitor"
```

## 📈 Performance

### Otimizações Recomendadas

1. **Conexões:** Use connection pooling para melhor performance
2. **Queries:** Otimize queries de monitoramento
3. **Intervalos:** Configure intervalos apropriados para cada tipo de verificação
4. **Logs:** Configure rotação de logs para evitar arquivos muito grandes

### Métricas de Monitoramento

O sistema coleta automaticamente:

- Taxa de hit do buffer cache
- Taxa de hit da library cache
- Número de sessões ativas
- Uso de tablespaces
- Tempo de resposta de queries

## 🔒 Segurança

### Medidas de Segurança Implementadas

1. **Validação de Queries:** Apenas queries SELECT são permitidas por padrão
2. **Sanitização:** Entradas são validadas e sanitizadas
3. **Logs de Auditoria:** Todas as operações são logadas
4. **Notificações de Segurança:** Alertas para operações suspeitas

### Boas Práticas

1. **Credenciais:** Nunca commite credenciais no código
2. **Privilégios:** Use o princípio do menor privilégio
3. **Monitoramento:** Monitore logs regularmente
4. **Atualizações:** Mantenha dependências atualizadas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte e dúvidas:

1. Abra uma issue no GitHub
2. Consulte a documentação
3. Verifique os logs para erros específicos
4. Entre em contato com a equipe de desenvolvimento

## 📚 Recursos Adicionais

- [📦 Pacote NPM](https://www.npmjs.com/package/oracle-mcp-v1)
- [🐙 Repositório GitHub](https://github.com/lrferr/oracle-mcp-v1)
- [📖 Documentação do Oracle Database](https://docs.oracle.com/en/database/)
- [🔗 Model Context Protocol](https://modelcontextprotocol.io/)
- [⚡ Node.js Oracle Driver](https://oracle.github.io/node-oracledb/)
- [📝 Winston Logger](https://github.com/winstonjs/winston)

---

**Desenvolvido com ❤️ por Leandro Ferreira**
