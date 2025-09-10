# 🚀 Oracle Node MCP Server

[![npm version](https://badge.fury.io/js/oracle-mcp-v1.svg)](https://badge.fury.io/js/oracle-mcp-v1)
[![Downloads](https://img.shields.io/npm/dm/oracle-mcp-v1.svg)](https://www.npmjs.com/package/oracle-mcp-v1)
[![GitHub stars](https://img.shields.io/github/stars/lrferr/oracle-mcp-v1.svg)](https://github.com/lrferr/oracle-mcp-v1/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um servidor MCP (Model Context Protocol) para monitoramento e interação com Oracle Database, desenvolvido em Node.js com suporte a **múltiplas conexões simultâneas**.

**📚 [Documentação Completa](documentation/README.md) | 📖 [English](documentation/en/README-EN.md) | 🇧🇷 [Português](documentation/pt/README.md)**

## ✨ Funcionalidades Principais

- **🔗 Múltiplas Conexões** - Conecte-se a vários bancos Oracle simultaneamente
- **📊 Monitoramento** - Saúde do banco, performance e métricas em tempo real
- **🛡️ Segurança** - Validação de scripts de migração e operações seguras
- **⚡ Performance** - Pool de conexões otimizado para cada ambiente
- **🔧 Administração** - DDL, DML e DCL operations completas
- **📱 Integração** - Compatível com Cursor IDE e Claude Desktop

## 🚀 Início Rápido

### 1. Instalação
```bash
npm install -g oracle-mcp-v1
```

### 2. Configuração Rápida
```bash
# Configurar Cursor IDE automaticamente
npx oracle-mcp setup-cursor

# Testar conexão Oracle
npx oracle-mcp test-connection
```

### 3. Múltiplas Conexões
```bash
# Configurar múltiplas conexões
npm run setup-multi-connections

# Testar todas as conexões
npm run demo-multi-connections
```

## 📚 Documentação

### 🇧🇷 Português
- **[Documentação Principal](documentation/pt/README.md)** - Guia completo
- **[Múltiplas Conexões](documentation/pt/guides/MULTIPLE-CONNECTIONS.md)** - Guia de múltiplas conexões
- **[API Reference](documentation/pt/api/README.md)** - Referência completa da API
- **[Exemplos](documentation/pt/examples/)** - Exemplos práticos

### 🇺🇸 English
- **[Main Documentation](documentation/en/README-EN.md)** - Complete guide
- **[Multiple Connections](documentation/en/guides/MULTIPLE-CONNECTIONS-EN.md)** - Multiple connections guide
- **[API Reference](documentation/en/api/README.md)** - Complete API reference
- **[Examples](documentation/en/examples/)** - Practical examples

## 🛠️ Ferramentas Disponíveis

### 🔗 Múltiplas Conexões
- `list_connections` - Lista todas as conexões
- `test_connection` - Testa conexão específica
- `test_all_connections` - Testa todas as conexões
- `get_connections_status` - Status das conexões ativas

### 📊 Monitoramento
- `check_database_health` - Verifica saúde do banco
- `monitor_schema_changes` - Monitora mudanças em esquemas
- `check_sensitive_tables` - Verifica tabelas sensíveis
- `detect_suspicious_activity` - Detecta atividades suspeitas

### 🔧 Administração
- **DDL**: `create_table`, `alter_table`, `drop_table`
- **DML**: `select_data`, `insert_data`, `update_data`, `delete_data`
- **DCL**: `create_user`, `grant_privileges`, `revoke_privileges`

### 🔍 Análise
- `get_table_info` - Informações detalhadas da tabela
- `get_constraints` - Lista constraints
- `get_foreign_keys` - Lista chaves estrangeiras
- `get_indexes` - Lista índices
- `analyze_table` - Analisa tabela e gera estatísticas

## 🎯 Casos de Uso

- **Desenvolvimento Multi-Ambiente**: Dev → Test → Staging → Produção
- **Monitoramento Centralizado**: Um dashboard para todos os ambientes
- **Migração de Dados**: Transferir dados entre ambientes
- **Backup e Restore**: Operações em bancos de backup
- **Analytics**: Conexões com data warehouses

## 📋 Pré-requisitos

- Node.js 18.0.0 ou superior
- Oracle Database 11g ou superior
- Acesso ao banco com privilégios adequados

## 🤝 Contribuição

Contribuições são bem-vindas! Consulte o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte e dúvidas:

1. Consulte a [documentação completa](documentation/README.md)
2. Abra uma issue no GitHub
3. Verifique os logs para erros específicos

## 📚 Recursos Adicionais

- [📦 Pacote NPM](https://www.npmjs.com/package/oracle-mcp-v1)
- [🐙 Repositório GitHub](https://github.com/lrferr/oracle-mcp-v1)
- [📖 Documentação Oracle](https://docs.oracle.com/en/database/)
- [🔗 Model Context Protocol](https://modelcontextprotocol.io/)

---

**Desenvolvido com ❤️ por Leandro Ferreira**
