# Changelog - Oracle MCP v1 Server

## [1.5.1] - 2025-01-10

### 🔧 Correções
- **FIX**: Resolvido erro "password verifier type 0x939 is not supported" 
- Adicionado suporte para Oracle 10g/11g com verificadores de senha antigos
- Melhorada detecção automática e fallback para modo Thick do Oracle Client

### ✨ Adicionado
- Script PowerShell para instalação automática do Oracle Instant Client no Windows
- Script Bash para instalação automática do Oracle Instant Client no Linux/macOS
- Script de diagnóstico `diagnose-connectivity.js` para identificar problemas de compatibilidade
- Guia completo de troubleshooting em português e inglês
- Detecção automática de caminhos do Oracle Instant Client
- Tratamento inteligente de erros de conectividade com sugestões de solução
- Comando `npm run diagnose` para diagnóstico rápido

### 🚀 Melhorias
- ConnectionManager agora tenta automaticamente modo Thick quando detecta erro de password verifier
- Logs mais informativos para diagnóstico de problemas de conectividade
- Suporte aprimorado para múltiplas versões do Oracle Instant Client
- Configuração automática de variáveis de ambiente

## [1.5.0] - 2024-12-19

### 🔄 Renomeação
- **BREAKING CHANGE**: Projeto renomeado de `oracle-node-mcp` para `oracle-mcp-v1`
- Atualizadas todas as referências em documentação, scripts e configurações
- URLs do GitHub atualizadas para `github.com/lrferr/oracle-mcp-v1`
- Comandos NPM atualizados para `oracle-mcp-v1`

### ✨ Melhorias
- Versão bump para 1.5.0 para refletir a renomeação
- Documentação completamente atualizada
- Scripts de configuração atualizados
- Arquivos de exemplo atualizados

## [1.4.5] - 2024-12-19

### ✨ Adicionado
- Servidor MCP completo para Oracle Database
- 15 ferramentas de monitoramento e administração
- CLI com comandos para configuração automática
- Suporte a Cursor IDE e Claude Desktop
- Scripts de instalação e configuração
- Documentação completa e exemplos

### 🔧 Configuração
- Removidas referências específicas à UFPR
- Tornado projeto genérico e reutilizável
- Atualizadas URLs do repositório GitHub
- Configurações de exemplo genéricas

### 📦 NPM Ready
- Configurado para publicação no NPM
- Bin executável com CLI completo
- Scripts de pós-instalação
- Arquivos de configuração otimizados

### 🛠️ Ferramentas Disponíveis

#### Monitoramento e Saúde
- `check_database_health` - Verifica saúde do banco
- `monitor_schema_changes` - Monitora mudanças em esquemas
- `check_sensitive_tables` - Verifica tabelas sensíveis
- `get_database_info` - Obtém informações do banco

#### Metadados e Estrutura
- `get_table_info` - Informações detalhadas de tabela
- `get_constraints` - Lista constraints
- `get_foreign_keys` - Lista chaves estrangeiras
- `get_indexes` - Lista índices
- `get_sequences` - Lista sequences
- `get_triggers` - Lista triggers

#### Administração
- `get_users_privileges` - Usuários e privilégios
- `get_table_dependencies` - Dependências de tabela
- `analyze_table` - Analisa tabela e gera estatísticas

#### Validação e Consultas
- `execute_safe_query` - Executa queries SELECT
- `validate_migration_script` - Valida scripts de migração

### 🚀 Comandos NPM
```bash
# Instalar globalmente
npm install -g oracle-mcp-v1

# Usar com npx
npx oracle-mcp --help
npx oracle-mcp test-connection
npx oracle-mcp setup-cursor
npx oracle-mcp setup-claude
npx oracle-mcp
```

### 📚 Documentação
- README.md completo
- Guia de configuração detalhado
- Exemplos de uso práticos
- Guia de publicação NPM
- Documentação de troubleshooting

### 🔄 Próximas Versões
- [ ] Suporte a múltiplos bancos
- [ ] Interface web para monitoramento
- [ ] Integração com CI/CD
- [ ] Relatórios automáticos
- [ ] Alertas por email/Slack
