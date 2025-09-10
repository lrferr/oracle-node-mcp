# 📚 Oracle MCP Documentation

Documentação completa do Oracle Node MCP Server - Sistema de monitoramento e administração de bancos Oracle com suporte a múltiplas conexões.

## 🌐 Idiomas Disponíveis

- **🇧🇷 [Português](pt/)** - Documentação completa em português
- **🇺🇸 [English](en/)** - Complete documentation in English

## 📖 Estrutura da Documentação

### Português (`pt/`)

#### 📋 Guias Principais
- **[README](pt/README.md)** - Documentação principal do projeto
- **[Múltiplas Conexões](pt/guides/MULTIPLE-CONNECTIONS.md)** - Guia completo para múltiplas conexões Oracle
- **[Configuração MCP](pt/guides/MCP-CONFIGURATION-GUIDE.md)** - Como configurar com Cursor/Claude Desktop
- **[Configuração Simples](pt/guides/MCP-SIMPLE-CONFIG.md)** - Configuração rápida e simples
- **[Início Rápido](pt/guides/QUICKSTART.md)** - Guia de início rápido

#### 🛠️ Exemplos
- **[Exemplos de Múltiplas Conexões](pt/examples/multi-connection-examples.md)** - Exemplos práticos de uso
- **[Demo Multi-Conexões](pt/examples/multi-connection-demo.js)** - Script de demonstração

#### ⚙️ Configurações
- **[Configurações MCP](pt/configs/)** - Arquivos de configuração para Cursor/Claude
- **[Configurações Multi-Conexões](pt/configs/)** - Exemplos de configuração de múltiplas conexões

### English (`en/`)

#### 📋 Main Guides
- **[README](en/README.md)** - Main project documentation
- **[Multiple Connections](en/guides/MULTIPLE-CONNECTIONS-EN.md)** - Complete guide for multiple Oracle connections
- **[Quick Start](en/guides/QUICKSTART-EN.md)** - Quick start guide

#### 🛠️ Examples
- **[Multiple Connections Examples](en/examples/multi-connection-examples-en.md)** - Practical usage examples
- **[Multi-Connections Demo](en/examples/multi-connection-demo-en.js)** - Demonstration script

#### ⚙️ Configurations
- **[MCP Configurations](en/configs/)** - Configuration files for Cursor/Claude
- **[Multi-Connections Configs](en/configs/)** - Multiple connections configuration examples

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

## ✨ Funcionalidades Principais

- **🔗 Múltiplas Conexões** - Conecte-se a vários bancos Oracle simultaneamente
- **📊 Monitoramento** - Saúde do banco, performance e métricas em tempo real
- **🛡️ Segurança** - Validação de scripts de migração e operações seguras
- **⚡ Performance** - Pool de conexões otimizado para cada ambiente
- **🔧 Administração** - DDL, DML e DCL operations completas
- **📱 Integração** - Compatível com Cursor IDE e Claude Desktop

## 📚 Recursos Adicionais

- [📦 Pacote NPM](https://www.npmjs.com/package/oracle-mcp-v1)
- [🐙 Repositório GitHub](https://github.com/lrferr/oracle-mcp-v1)
- [📖 Documentação Oracle](https://docs.oracle.com/en/database/)
- [🔗 Model Context Protocol](https://modelcontextprotocol.io/)

## 🤝 Contribuição

Contribuições são bem-vindas! Consulte o arquivo [CONTRIBUTING.md](../CONTRIBUTING.md) para mais detalhes.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](../LICENSE) para detalhes.

---

**Desenvolvido com ❤️ por Leandro Ferreira**
