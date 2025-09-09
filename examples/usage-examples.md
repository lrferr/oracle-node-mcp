# Exemplos de Uso - Oracle Node MCP Server

Este documento contém exemplos práticos de como usar o Oracle Node MCP Server.

## 🚀 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar configurações
nano .env
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Testar Conexão

```bash
# Executar script de teste
node scripts/test-connection.js
```

## 🔧 Exemplos de Ferramentas MCP

### 1. Verificar Saúde do Banco

```json
{
  "name": "check_database_health",
  "arguments": {
    "checkConnections": true,
    "checkTablespaces": true,
    "checkPerformance": true
  }
}
```

**Resposta esperada:**
```
## Status da Saúde do Banco de Dados

### Conexões Ativas
- Total de Conexões: 25
- Conexões Ativas: 18
- Conexões Inativas: 7

### Status dos Tablespaces
✅ USERS: 150.5MB / 500MB (30.1%)
⚠️ SYSTEM: 800.2MB / 1000MB (80.0%)
✅ TEMP: 50.0MB / 200MB (25.0%)

### Métricas de Performance
- Buffer Cache Hit Ratio: 95.5
- Library Cache Hit Ratio: 98.2
- Sessões com Problemas: 2
```

### 2. Monitorar Mudanças em Esquemas

```json
{
  "name": "monitor_schema_changes",
  "arguments": {
    "schemas": ["HR", "SCOTT", "SYSTEM"],
    "checkInterval": 5
  }
}
```

**Resposta esperada:**
```
## Monitoramento de Mudanças em Esquemas

### Mudanças no Esquema HR
✅ TABLE EMPLOYEES - 2024-01-15 14:30:25
✅ INDEX IDX_EMP_DEPT - 2024-01-15 14:30:26

### Mudanças no Esquema SCOTT
✅ TABLE NEW_TABLE - 2024-01-15 14:25:10
```

### 3. Validar Script de Migração

```json
{
  "name": "validate_migration_script",
  "arguments": {
    "script": "CREATE TABLE HR.NEW_EMPLOYEES (id NUMBER PRIMARY KEY, name VARCHAR2(100));",
    "targetSchema": "HR"
  }
}
```

**Resposta esperada:**
```
## Validação do Script de Migração

✅ Script Aprovado: O script de migração está adequado para execução em produção.
```

**Exemplo com problemas:**
```json
{
  "name": "validate_migration_script",
  "arguments": {
    "script": "DROP TABLE HR.EMPLOYEES;",
    "targetSchema": "HR"
  }
}
```

**Resposta esperada:**
```
## Validação do Script de Migração

❌ Script Requer Revisão:

⚠️ Operações Perigosas Detectadas:
- DROP TABLE

❌ Falta Estratégia de Backup: Script contém operações perigosas mas não possui estratégia de backup/rollback

⚠️ Falta Documentação: Script não possui comentários explicativos

⚠️ Falta Validações: Script não possui validações antes de operações críticas
```

### 4. Verificar Tabelas Sensíveis

```json
{
  "name": "check_sensitive_tables",
  "arguments": {
    "tables": ["USERS", "ACCOUNTS", "TRANSACTIONS"],
    "checkDataChanges": true
  }
}
```

**Resposta esperada:**
```
## Verificação de Tabelas Sensíveis

### Tabela USERS
**Estrutura:**
- USER_ID (NUMBER) NOT NULL
- USERNAME (VARCHAR2) NOT NULL
- PASSWORD_HASH (VARCHAR2) NOT NULL
- CREATED_DATE (DATE) NULL
**Últimas Modificações:** 1250

### Tabela ACCOUNTS
**Estrutura:**
- ACCOUNT_ID (NUMBER) NOT NULL
- USER_ID (NUMBER) NOT NULL
- BALANCE (NUMBER) NULL
- STATUS (VARCHAR2) NOT NULL
**Últimas Modificações:** 3420
```

### 5. Executar Query Segura

```json
{
  "name": "execute_safe_query",
  "arguments": {
    "query": "SELECT employee_id, first_name, last_name, salary FROM HR.EMPLOYEES WHERE department_id = 10 ORDER BY salary DESC",
    "schema": "HR"
  }
}
```

**Resposta esperada:**
```
## Resultado da Query

| EMPLOYEE_ID | FIRST_NAME | LAST_NAME | SALARY |
|-------------|------------|-----------|--------|
| 200 | Jennifer | Whalen | 4400 |
| 201 | Michael | Hartstein | 13000 |
| 202 | Pat | Fay | 6000 |
```

### 6. Obter Informações do Banco

```json
{
  "name": "get_database_info",
  "arguments": {
    "includeUsers": true,
    "includeTablespaces": true
  }
}
```

**Resposta esperada:**
```
## Informações do Banco de Dados

### Informações Básicas
- **Instância:** ORCL
- **Host:** oracle-server
- **Versão:** Oracle Database 19c Enterprise Edition Release 19.0.0.0.0
- **Status:** OPEN
- **Status do Banco:** ACTIVE

### Tablespaces
✅ **USERS** - PERMANENT (500MB)
✅ **SYSTEM** - PERMANENT (1000MB)
✅ **TEMP** - TEMPORARY (200MB)
✅ **UNDOTBS1** - UNDO (300MB)

### Usuários
✅ **HR** - OPEN (USERS)
✅ **SCOTT** - OPEN (USERS)
✅ **SH** - OPEN (USERS)
❌ **TEST_USER** - LOCKED (USERS)
```

### 7. Obter Informações Detalhadas de uma Tabela

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

**Resposta esperada:**
```
## Informações da Tabela EMPLOYEES

### Informações Básicas
- **Nome:** EMPLOYEES
- **Tablespace:** USERS
- **Linhas:** 107
- **Blocos:** 5
- **Tamanho Médio da Linha:** 65 bytes
- **Última Análise:** 15-JAN-24

### Colunas
- **EMPLOYEE_ID** NUMBER(6) NOT NULL
- **FIRST_NAME** VARCHAR2(20) NULL
- **LAST_NAME** VARCHAR2(25) NOT NULL
- **EMAIL** VARCHAR2(25) NOT NULL
- **PHONE_NUMBER** VARCHAR2(20) NULL
- **HIRE_DATE** DATE NOT NULL
- **JOB_ID** VARCHAR2(10) NOT NULL
- **SALARY** NUMBER(8,2) NULL
- **COMMISSION_PCT** NUMBER(2,2) NULL
- **MANAGER_ID** NUMBER(6) NULL
- **DEPARTMENT_ID** NUMBER(4) NULL

### Constraints
- **EMP_EMP_ID_PK** (PRIMARY KEY)
- **EMP_EMAIL_UK** (UNIQUE)
- **EMP_DEPT_FK** (FOREIGN KEY) → HR.DEPARTMENTS
- **EMP_JOB_FK** (FOREIGN KEY) → HR.JOBS
- **EMP_MANAGER_FK** (FOREIGN KEY) → HR.EMPLOYEES

### Índices
✅ **EMP_EMP_ID_PK** (NORMAL, UNIQUE)
✅ **EMP_EMAIL_UK** (NORMAL, UNIQUE)
✅ **EMP_DEPT_FK** (NORMAL, NON-UNIQUE)
  - Linhas: 107, Última análise: 15-JAN-24
```

### 8. Listar Constraints de um Esquema

```json
{
  "name": "get_constraints",
  "arguments": {
    "schema": "HR",
    "constraintType": "FOREIGN KEY"
  }
}
```

**Resposta esperada:**
```
## Constraints

### Tabela EMPLOYEES
- **EMP_DEPT_FK** (FOREIGN KEY) → HR.DEPARTMENTS
- **EMP_JOB_FK** (FOREIGN KEY) → HR.JOBS
- **EMP_MANAGER_FK** (FOREIGN KEY) → HR.EMPLOYEES

### Tabela JOB_HISTORY
- **JHIST_EMP_FK** (FOREIGN KEY) → HR.EMPLOYEES
- **JHIST_JOB_FK** (FOREIGN KEY) → HR.JOBS
- **JHIST_DEPT_FK** (FOREIGN KEY) → HR.DEPARTMENTS
```

### 9. Listar Chaves Estrangeiras com Referências

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

**Resposta esperada:**
```
## Chaves Estrangeiras

### Tabela EMPLOYEES

**EMP_DEPT_FK** → HR.DEPARTMENTS:
  - DEPARTMENT_ID → DEPARTMENT_ID

**EMP_JOB_FK** → HR.JOBS:
  - JOB_ID → JOB_ID

**EMP_MANAGER_FK** → HR.EMPLOYEES:
  - MANAGER_ID → EMPLOYEE_ID
```

### 10. Listar Índices com Estatísticas

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

**Resposta esperada:**
```
## Índices

### Tabela EMPLOYEES
✅ **EMP_EMP_ID_PK** (NORMAL, UNIQUE)
  - Tablespace: USERS
  - Linhas: 107, Última análise: 15-JAN-24
  - Blocos folha: 1
  - Chaves distintas: 107

✅ **EMP_EMAIL_UK** (NORMAL, UNIQUE)
  - Tablespace: USERS
  - Linhas: 107, Última análise: 15-JAN-24
  - Blocos folha: 1
  - Chaves distintas: 107

✅ **EMP_DEPT_FK** (NORMAL, NON-UNIQUE)
  - Tablespace: USERS
  - Linhas: 107, Última análise: 15-JAN-24
  - Blocos folha: 1
  - Chaves distintas: 11
```

### 11. Listar Sequences

```json
{
  "name": "get_sequences",
  "arguments": {
    "schema": "HR",
    "includeValues": true
  }
}
```

**Resposta esperada:**
```
## Sequences

### EMPLOYEES_SEQ
- **Min:** 1, **Max:** 999999999999999999999999999
- **Incremento:** 1
- **Ciclo:** Não
- **Ordem:** Sim
- **Cache:** 20
- **Próximo Valor:** 208

### DEPARTMENTS_SEQ
- **Min:** 1, **Max:** 999999999999999999999999999
- **Incremento:** 10
- **Ciclo:** Não
- **Ordem:** Sim
- **Cache:** 20
- **Próximo Valor:** 280
```

### 12. Listar Triggers

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

**Resposta esperada:**
```
## Triggers

### Tabela EMPLOYEES
✅ **SECURE_EMPLOYEES** (BEFORE EACH ROW, INSERT OR UPDATE)
  - Condição: (new.job_id in ('AD_PRES', 'AD_VP', 'AD_ASST'))

✅ **UPDATE_JOB_HISTORY** (AFTER EACH ROW, UPDATE)
  - Condição: (old.department_id != new.department_id)
```

### 13. Listar Usuários e Privilégios

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

**Resposta esperada:**
```
## Usuários e Privilégios

### Usuários
✅ **HR**
  - Status: OPEN
  - Criado: 15-JAN-24
  - Tablespace Padrão: USERS
  - Tablespace Temporário: TEMP
  - Profile: DEFAULT

### Roles

**HR:**
  - CONNECT (DEFAULT)
  - RESOURCE (DEFAULT)
  - HR_ROLE
```

### 14. Analisar Dependências de Tabela

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

**Resposta esperada:**
```
## Dependências da Tabela EMPLOYEES

### Objetos que Dependem de EMPLOYEES
- **JOB_HISTORY** (TABLE) - HR
- **EMP_DETAILS_VIEW** (VIEW) - HR
- **EMP_MANAGER_VIEW** (VIEW) - HR

### Objetos Referenciados por EMPLOYEES
- **DEPARTMENTS** (TABLE) - HR
- **JOBS** (TABLE) - HR
- **EMPLOYEES** (TABLE) - HR
```

### 15. Analisar Tabela

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

**Resposta esperada:**
```
## Análise da Tabela EMPLOYEES

✅ **Análise concluída com sucesso!**

### Estatísticas Atualizadas:
- **Linhas:** 107
- **Blocos:** 5
- **Tamanho Médio da Linha:** 65 bytes
- **Última Análise:** 15-JAN-24 14:30:25
- **Tamanho da Amostra:** 11 linhas
- **Percentual Estimado:** 10%
```

## 🔄 Exemplos de Monitoramento Contínuo

### 1. Script de Monitoramento Básico

```javascript
// monitor-basic.js
import { OracleMonitor } from '../src/oracle-monitor.js';

const monitor = new OracleMonitor();

async function basicMonitoring() {
  console.log('🔍 Iniciando monitoramento básico...');
  
  try {
    // Verificar saúde do banco
    const health = await monitor.checkDatabaseHealth({
      checkConnections: true,
      checkTablespaces: true,
      checkPerformance: true
    });
    
    console.log('📊 Status da Saúde:', health);
    
    // Verificar esquemas críticos
    const schemaChanges = await monitor.monitorSchemaChanges({
      schemas: ['HR', 'SCOTT'],
      checkInterval: 5
    });
    
    console.log('📋 Mudanças em Esquemas:', schemaChanges);
    
  } catch (error) {
    console.error('❌ Erro no monitoramento:', error);
  }
}

// Executar a cada 5 minutos
setInterval(basicMonitoring, 5 * 60 * 1000);
```

### 2. Script de Validação de Migração

```javascript
// validate-migration.js
import { MigrationValidator } from '../src/migration-validator.js';

const validator = new MigrationValidator();

async function validateMigration() {
  const script = `
    -- Migração: Adicionar nova coluna
    -- Data: 2024-01-15
    -- Autor: Desenvolvedor
    
    -- Backup da tabela
    CREATE TABLE HR.EMPLOYEES_BACKUP AS 
    SELECT * FROM HR.EMPLOYEES;
    
    -- Adicionar nova coluna
    ALTER TABLE HR.EMPLOYEES 
    ADD email VARCHAR2(100);
    
    -- Atualizar dados
    UPDATE HR.EMPLOYEES 
    SET email = LOWER(first_name || '.' || last_name || '@company.com')
    WHERE email IS NULL;
    
    COMMIT;
  `;
  
  const result = await validator.validateScript(script, 'HR');
  console.log('📋 Resultado da Validação:', result);
}

validateMigration();
```

### 3. Script de Notificações

```javascript
// notifications.js
import { NotificationService } from '../src/notification-service.js';

const notificationService = new NotificationService();

async function sendTestNotifications() {
  // Notificação de mudança em esquema
  await notificationService.sendAlert('SCHEMA_CHANGE', 'Mudança detectada no esquema HR', {
    schema: 'HR',
    changes: 'Nova tabela EMPLOYEES criada',
    user: 'HR_USER',
    timestamp: new Date().toISOString()
  });
  
  // Notificação de tabela sensível
  await notificationService.sendAlert('SENSITIVE_TABLE_CHANGE', 'Alteração em tabela sensível', {
    table: 'USERS',
    operation: 'UPDATE',
    user: 'ADMIN',
    timestamp: new Date().toISOString()
  });
  
  // Notificação de performance
  await notificationService.sendAlert('PERFORMANCE_ISSUE', 'Problema de performance detectado', {
    metric: 'Buffer Cache Hit Ratio',
    value: 75.5,
    threshold: 80,
    timestamp: new Date().toISOString()
  });
}

sendTestNotifications();
```

## 🧪 Exemplos de Testes

### 1. Teste de Conexão

```bash
# Testar conexão básica
node scripts/test-connection.js

# Testar com configurações específicas
ORACLE_HOST=localhost ORACLE_PORT=1521 node scripts/test-connection.js
```

### 2. Teste de Ferramentas MCP

```javascript
// test-mcp-tools.js
import { OracleMonitor } from './src/oracle-monitor.js';

const monitor = new OracleMonitor();

async function testAllTools() {
  console.log('🧪 Testando todas as ferramentas...\n');
  
  try {
    // Teste 1: Saúde do banco
    console.log('1. Testando saúde do banco...');
    const health = await monitor.checkDatabaseHealth();
    console.log('✅ Saúde do banco:', health.substring(0, 100) + '...\n');
    
    // Teste 2: Informações do banco
    console.log('2. Testando informações do banco...');
    const info = await monitor.getDatabaseInfo();
    console.log('✅ Informações:', info.substring(0, 100) + '...\n');
    
    // Teste 3: Query segura
    console.log('3. Testando query segura...');
    const query = await monitor.executeSafeQuery('SELECT user FROM dual');
    console.log('✅ Query segura:', query.substring(0, 100) + '...\n');
    
    console.log('🎉 Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

testAllTools();
```

## 📊 Exemplos de Relatórios

### 1. Relatório de Saúde Diário

```javascript
// daily-health-report.js
import { OracleMonitor } from './src/oracle-monitor.js';
import { NotificationService } from './src/notification-service.js';

const monitor = new OracleMonitor();
const notifications = new NotificationService();

async function generateDailyReport() {
  console.log('📊 Gerando relatório diário...');
  
  const report = {
    date: new Date().toISOString().split('T')[0],
    health: await monitor.checkDatabaseHealth(),
    info: await monitor.getDatabaseInfo(),
    notifications: await notifications.getNotificationHistory(20)
  };
  
  console.log('📋 Relatório Diário -', report.date);
  console.log('=====================================');
  console.log('Saúde do Banco:', report.health);
  console.log('Informações:', report.info);
  console.log('Notificações Recentes:', report.notifications.length);
  
  // Salvar relatório
  const fs = await import('fs/promises');
  await fs.writeFile(
    `reports/daily-report-${report.date}.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Relatório salvo em reports/');
}

generateDailyReport();
```

### 2. Relatório de Migrações

```javascript
// migration-report.js
import { MigrationValidator } from './src/migration-validator.js';

const validator = new MigrationValidator();

async function generateMigrationReport() {
  const scripts = [
    {
      name: 'add-email-column.sql',
      content: 'ALTER TABLE HR.EMPLOYEES ADD email VARCHAR2(100);',
      schema: 'HR'
    },
    {
      name: 'create-index.sql',
      content: 'CREATE INDEX idx_emp_email ON HR.EMPLOYEES(email);',
      schema: 'HR'
    },
    {
      name: 'drop-table.sql',
      content: 'DROP TABLE HR.OLD_TABLE;',
      schema: 'HR'
    }
  ];
  
  console.log('📋 Relatório de Validação de Migrações');
  console.log('=====================================');
  
  for (const script of scripts) {
    console.log(`\n📄 ${script.name}:`);
    const result = await validator.validateScript(script.content, script.schema);
    console.log(result);
  }
}

generateMigrationReport();
```

## 🔧 Exemplos de Configuração

### 1. Configuração de Monitoramento Avançado

```javascript
// advanced-monitoring.js
import cron from 'node-cron';
import { OracleMonitor } from './src/oracle-monitor.js';
import { NotificationService } from './src/notification-service.js';

const monitor = new OracleMonitor();
const notifications = new NotificationService();

// Monitoramento a cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log('🔍 Executando monitoramento...');
  
  try {
    const health = await monitor.checkDatabaseHealth();
    
    // Verificar se há problemas
    if (health.includes('⚠️') || health.includes('❌')) {
      await notifications.sendAlert('DATABASE_HEALTH', 'Problemas detectados no banco', {
        health,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no monitoramento:', error);
  }
});

// Relatório diário às 9h
cron.schedule('0 9 * * *', async () => {
  console.log('📊 Gerando relatório diário...');
  
  const report = {
    date: new Date().toISOString(),
    health: await monitor.checkDatabaseHealth(),
    info: await monitor.getDatabaseInfo()
  };
  
  await notifications.sendAlert('DAILY_REPORT', 'Relatório diário gerado', report);
});

console.log('🚀 Monitoramento avançado iniciado!');
```

### 2. Configuração de Alertas Personalizados

```javascript
// custom-alerts.js
import { NotificationService } from './src/notification-service.js';

const notifications = new NotificationService();

// Configurar alertas personalizados
const alertConfig = {
  tablespaceUsage: {
    threshold: 80,
    message: 'Tablespace com uso alto detectado'
  },
  connectionCount: {
    threshold: 100,
    message: 'Número alto de conexões detectado'
  },
  performance: {
    threshold: 1000,
    message: 'Problema de performance detectado'
  }
};

async function checkCustomAlerts() {
  // Implementar lógica de verificação personalizada
  // e envio de alertas baseados na configuração
  
  for (const [alertType, config] of Object.entries(alertConfig)) {
    // Verificar condições e enviar alertas se necessário
    console.log(`Verificando alerta: ${alertType}`);
  }
}

// Executar verificações a cada minuto
setInterval(checkCustomAlerts, 60000);
```

---

**💡 Dica:** Consulte o arquivo `README.md` para informações mais detalhadas sobre cada ferramenta e configuração.
