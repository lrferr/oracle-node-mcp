# 🚀 Quick Start - Oracle Node MCP Server

Guia rápido para começar a usar o Oracle Node MCP Server.

## ⚡ Instalação Rápida

```bash
# 1. Instalar dependências e configurar
npm run install-setup

# 2. Configurar credenciais Oracle
nano .env

# 3. Testar conexão
npm run test-connection

# 4. Iniciar servidor
npm start
```

## 🔧 Configuração Mínima

Edite o arquivo `.env` com suas credenciais Oracle:

```env
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=ORCL
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
```

## 🧪 Teste Rápido

```bash
# Testar conexão
npm run test-connection

# Iniciar em modo desenvolvimento
npm run dev
```

## 📋 Ferramentas Disponíveis

### Monitoramento e Saúde
| Ferramenta | Descrição |
|------------|-----------|
| `check_database_health` | Verifica saúde do banco |
| `monitor_schema_changes` | Monitora mudanças em esquemas |
| `check_sensitive_tables` | Verifica tabelas sensíveis |
| `get_database_info` | Obtém informações do banco |

### Metadados e Estrutura
| Ferramenta | Descrição |
|------------|-----------|
| `get_table_info` | Informações detalhadas de tabela |
| `get_constraints` | Lista constraints |
| `get_foreign_keys` | Lista chaves estrangeiras |
| `get_indexes` | Lista índices |
| `get_sequences` | Lista sequences |
| `get_triggers` | Lista triggers |

### Administração
| Ferramenta | Descrição |
|------------|-----------|
| `get_users_privileges` | Usuários e privilégios |
| `get_table_dependencies` | Dependências de tabela |
| `analyze_table` | Analisa tabela e gera estatísticas |

### Validação e Consultas
| Ferramenta | Descrição |
|------------|-----------|
| `validate_migration_script` | Valida scripts de migração |
| `execute_safe_query` | Executa queries SELECT |

## 🔍 Exemplo de Uso

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

## 📚 Documentação Completa

- [README.md](README.md) - Documentação completa
- [examples/usage-examples.md](examples/usage-examples.md) - Exemplos práticos
- [scripts/](scripts/) - Scripts utilitários

## 🆘 Problemas Comuns

### Erro de Conexão
```bash
# Verificar se Oracle está rodando
npm run test-connection
```

### Privilégios Insuficientes
```sql
-- Conceder privilégios necessários
GRANT CONNECT, RESOURCE TO seu_usuario;
GRANT SELECT ON v_$session TO seu_usuario;
GRANT SELECT ON dba_tablespaces TO seu_usuario;
-- ... (veja README.md para lista completa)
```

### Porta em Uso
```bash
# Verificar processos na porta
netstat -an | grep 1521
```

## 🎯 Próximos Passos

1. ✅ Configure suas credenciais
2. ✅ Teste a conexão
3. ✅ Inicie o servidor
4. 🔄 Configure monitoramento contínuo
5. 📊 Configure alertas personalizados
6. 📈 Monitore performance

---

**💡 Dica:** Consulte o `README.md` para configurações avançadas e exemplos detalhados!
