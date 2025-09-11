# 🔧 Guia de Resolução de Problemas - Conectividade Oracle

Este guia ajuda a resolver problemas comuns de conectividade Oracle no Oracle Node MCP Server.

## 🚨 Problemas Comuns

### **1. Erro: "password verifier type 0x939 is not supported"**

**Sintomas:**
```
❌ Falha no teste da conexão 'prod': NJS-116: password verifier type 0x939 is not supported by node-oracledb in Thin mode
```

**Causa:** O banco Oracle está usando um verificador de senha antigo que não é compatível com o modo Thin do node-oracledb.

**Soluções:**

#### **Solução 1: Instalar Oracle Instant Client (Recomendada)**

1. **Windows:**
   ```cmd
   # Execute como Administrador
   scripts\install-oracle-simple.bat
   ```

2. **Linux/macOS:**
   ```bash
   # Execute com sudo
   sudo ./scripts/install-oracle-client.sh
   ```

3. **Configurar variável de ambiente no MCP:**
   ```json
   {
     "mcpServers": {
       "oracle-monitor-2": {
         "command": "npx oracle-mcp-v1@1.5.1",
         "env": {
           "ORACLE_CLIENT_PATH": "C:\\oracle\\instantclient_21_8\\instantclient_21_8",
           "ORACLE_CONNECTIONS": "..."
         }
       }
     }
   }
   ```

#### **Solução 2: Atualizar Senha no Banco (Alternativa)**

Execute no banco Oracle como DBA:

```sql
-- Conectar como DBA
CONNECT / AS SYSDBA;

-- Verificar usuário
SELECT username, account_status, password_versions 
FROM dba_users 
WHERE username = 'SEU_USUARIO';

-- Alterar senha para gerar verificador moderno
ALTER USER SEU_USUARIO IDENTIFIED BY NovaSenhaForte123!;

-- Verificar se funcionou
SELECT username, password_versions 
FROM dba_users 
WHERE username = 'SEU_USUARIO';
-- Deve mostrar: 10G 11G 12C HTTP
```

### **2. Erro: "ORA-01017: invalid username/password"**

**Sintomas:**
```
❌ Erro na conexão: ORA-01017: invalid username/password; logon denied
```

**Soluções:**

1. **Verificar credenciais:**
   - Confirme usuário e senha
   - Verifique se a senha não expirou
   - Teste a conexão em outra ferramenta (SQL Developer, DBeaver)

2. **Verificar se usuário está bloqueado:**
   ```sql
   SELECT username, account_status, lock_date 
   FROM dba_users 
   WHERE username = 'SEU_USUARIO';
   ```

3. **Desbloquear usuário se necessário:**
   ```sql
   ALTER USER SEU_USUARIO ACCOUNT UNLOCK;
   ```

### **3. Erro: "ORA-12541: TNS:no listener"**

**Sintomas:**
```
❌ Erro na conexão: ORA-12541: TNS:no listener
```

**Soluções:**

1. **Verificar conectividade de rede:**
   ```bash
   telnet servidor-oracle.com 1521
   ```

2. **Verificar string de conexão:**
   - Host correto
   - Porta correta
   - Service name correto

3. **Testar com diferentes formatos:**
   ```json
   "connectString": "servidor:1521/SERVICE_NAME"
   "connectString": "servidor:1521/XE"
   "connectString": "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=servidor)(PORT=1521))(CONNECT_DATA=(SERVICE_NAME=SERVICE_NAME)))"
   ```

### **4. Erro: "ORA-12514: TNS:listener does not currently know of service"**

**Sintomas:**
```
❌ Erro na conexão: ORA-12514: TNS:listener does not currently know of service
```

**Soluções:**

1. **Verificar service name:**
   ```sql
   SELECT name FROM v$services;
   ```

2. **Usar SID em vez de service name:**
   ```json
   "connectString": "servidor:1521/SID"
   ```

3. **Verificar se o banco está rodando:**
   ```sql
   SELECT status FROM v$instance;
   ```

## 🔍 Scripts de Diagnóstico

### **Teste de Conectividade Completo**

```bash
# Executar diagnóstico completo
node scripts/diagnose-mcp.js
```

### **Teste de Modo Thick**

```bash
# Testar modo Thick especificamente
node scripts/test-thick-mode.js
```

### **Teste de Conexões MCP**

```bash
# Testar todas as conexões configuradas
npm run test-connection
```

## 📋 Checklist de Resolução

### **Passo 1: Diagnóstico**
- [ ] Executar script de diagnóstico
- [ ] Verificar logs de erro
- [ ] Testar conectividade de rede

### **Passo 2: Configuração**
- [ ] Verificar credenciais
- [ ] Verificar string de conexão
- [ ] Verificar variáveis de ambiente

### **Passo 3: Banco de Dados**
- [ ] Verificar se usuário existe
- [ ] Verificar se usuário está ativo
- [ ] Verificar se senha está correta
- [ ] Verificar se service name está correto

### **Passo 4: Oracle Client**
- [ ] Instalar Oracle Instant Client
- [ ] Configurar variável ORACLE_CLIENT_PATH
- [ ] Testar modo Thick

### **Passo 5: MCP**
- [ ] Atualizar configuração MCP
- [ ] Reiniciar Cursor/Claude
- [ ] Testar conexões

## 🛠️ Configuração Recomendada

### **Arquivo mcp.json completo:**

```json
{
  "mcpServers": {
    "oracle-monitor-2": {
      "command": "npx oracle-mcp-v1@1.5.1",
      "env": {
        "MCP_SERVER_NAME": "oracle-monitor-2",
        "MCP_SERVER_VERSION": "1.0.0",
        "LOG_LEVEL": "info",
        "ORACLE_CLIENT_PATH": "C:\\oracle\\instantclient_21_8\\instantclient_21_8",
        "ORACLE_CONNECTIONS": "{\"connections\":{\"hml\":{\"user\":\"usuario_hml\",\"password\":\"senha_hml\",\"connectString\":\"servidor_hml:1521/hml01\",\"description\":\"Homologação\"},\"prod\":{\"user\":\"usuario_prod\",\"password\":\"senha_prod\",\"connectString\":\"servidor_prod:1529/prod01\",\"description\":\"Produção\"}},\"defaultConnection\":\"hml\"}"
      }
    }
  }
}
```

## 📞 Suporte

Se os problemas persistirem:

1. **Verificar logs:** `logs/oracle-mcp.log`
2. **Executar diagnóstico:** `node scripts/diagnose-mcp.js`
3. **Verificar documentação:** [README.md](../README.md)
4. **Abrir issue:** [GitHub Issues](https://github.com/lrferr/oracle-node-mcp/issues)

## 🔗 Links Úteis

- [Documentação node-oracledb](https://node-oracledb.readthedocs.io/)
- [Oracle Instant Client Downloads](https://www.oracle.com/database/technologies/instant-client/downloads.html)
- [Oracle Database Error Messages](https://docs.oracle.com/en/database/oracle/oracle-database/19/errmg/)
