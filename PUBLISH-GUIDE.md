# 📦 Guia de Publicação NPM - Oracle Node MCP Server

Este guia explica como publicar o Oracle Node MCP Server no NPM para uso com `npx`.

## 🚀 Preparação para Publicação

### 1. Verificar Configuração

```bash
# Verificar se está logado no NPM
npm whoami

# Se não estiver logado, fazer login
npm login
```

### 2. Verificar Arquivos

```bash
# Verificar quais arquivos serão incluídos
npm pack --dry-run

# Verificar se o package.json está correto
npm run lint
```

### 3. Testar Localmente

```bash
# Instalar globalmente para teste
npm install -g .

# Testar comando
oracle-mcp --help
oracle-mcp test-connection
oracle-mcp setup-cursor

# Desinstalar após teste
npm uninstall -g oracle-mcp-v1
```

## 📋 Checklist de Publicação

### ✅ Arquivos Obrigatórios

- [x] `package.json` com configurações corretas
- [x] `bin/oracle-mcp-cli.js` (executável)
- [x] `LICENSE` (MIT)
- [x] `README.md` (documentação completa)
- [x] `.npmignore` (arquivos a ignorar)

### ✅ Configurações do package.json

- [x] `name`: "oracle-mcp-v1"
- [x] `version`: "1.0.0"
- [x] `bin`: comando executável
- [x] `files`: arquivos a incluir
- [x] `engines`: Node.js >= 18.0.0
- [x] `keywords`: palavras-chave relevantes
- [x] `repository`: URL do GitHub
- [x] `author`: informações do autor

### ✅ Testes

- [x] `npm run lint` (sem erros)
- [x] `npm test` (testes passando)
- [x] `npm run test-connection` (conexão Oracle)
- [x] `npm run quick-setup` (configuração)

## 🚀 Processo de Publicação

### 1. Verificar Versão

```bash
# Verificar versão atual
npm version

# Se necessário, incrementar versão
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 2. Publicar

```bash
# Publicar no NPM
npm publish

# Ou publicar como beta
npm publish --tag beta
```

### 3. Verificar Publicação

```bash
# Verificar se foi publicado
npm view oracle-mcp-v1

# Testar instalação
npx oracle-mcp-v1@latest --help
```

## 🔄 Atualizações Futuras

### 1. Incrementar Versão

```bash
# Patch (correções)
npm version patch

# Minor (novas funcionalidades)
npm version minor

# Major (mudanças que quebram compatibilidade)
npm version major
```

### 2. Publicar Atualização

```bash
# Publicar nova versão
npm publish

# Ou publicar como beta primeiro
npm publish --tag beta
```

### 3. Deprecar Versão

```bash
# Deprecar versão específica
npm deprecate oracle-mcp-v1@1.0.0 "Versão desatualizada, use 1.1.0+"
```

## 📊 Comandos Disponíveis Após Publicação

### Instalação Global

```bash
# Instalar globalmente
npm install -g oracle-mcp-v1

# Usar comandos
oracle-mcp --help
oracle-mcp test-connection
oracle-mcp setup-cursor
```

### Uso com npx

```bash
# Usar sem instalar
npx oracle-mcp-v1 --help
npx oracle-mcp-v1 test-connection
npx oracle-mcp-v1 setup-cursor

# Usar versão específica
npx oracle-mcp-v1@1.0.0 --help
```

## 🎯 Exemplos de Uso Pós-Publicação

### 1. Configuração Rápida

```bash
# Instalar e configurar automaticamente
npx oracle-mcp-v1 setup-cursor

# Testar conexão
npx oracle-mcp-v1 test-connection

# Iniciar servidor
npx oracle-mcp-v1
```

### 2. Configuração Manual

```bash
# Instalar globalmente
npm install -g oracle-mcp-v1

# Configurar Cursor
oracle-mcp setup-cursor

# Testar
oracle-mcp test-connection

# Iniciar
oracle-mcp
```

### 3. Integração em Projetos

```bash
# Adicionar como dependência de desenvolvimento
npm install --save-dev oracle-mcp-v1

# Usar em scripts do package.json
{
  "scripts": {
    "db:test": "oracle-mcp test-connection",
    "db:setup": "oracle-mcp setup-cursor",
    "db:start": "oracle-mcp"
  }
}
```

## 🔧 Configuração do Cursor/Claude Desktop

Após a instalação, o comando `setup-cursor` criará automaticamente:

```json
{
  "mcpServers": {
    "oracle-monitor": {
      "command": "npx",
      "args": ["oracle-mcp-v1"],
      "env": {
        "ORACLE_HOST": "localhost",
        "ORACLE_PORT": "1521",
        "ORACLE_SERVICE_NAME": "ORCL",
        "ORACLE_USER": "your_username",
        "ORACLE_PASSWORD": "your_password"
      }
    }
  }
}
```

## 📈 Métricas e Monitoramento

### 1. Estatísticas do NPM

```bash
# Ver estatísticas do pacote
npm view oracle-mcp-v1

# Ver downloads
npm view oracle-mcp-v1 downloads
```

### 2. GitHub Insights

- Acessar: https://github.com/lrferr/oracle-mcp-v1/insights
- Verificar: Stars, Forks, Clones, Traffic

## 🐛 Troubleshooting

### Problema: "Package already exists"

**Solução:**
```bash
# Verificar se o nome está disponível
npm view oracle-mcp-v1

# Se existir, escolher outro nome
npm init
# Alterar o nome no package.json
```

### Problema: "Permission denied"

**Solução:**
```bash
# Verificar se está logado
npm whoami

# Fazer login
npm login

# Verificar permissões
npm access ls-packages
```

### Problema: "Version already exists"

**Solução:**
```bash
# Incrementar versão
npm version patch

# Publicar nova versão
npm publish
```

## 📚 Recursos Adicionais

- [Documentação NPM](https://docs.npmjs.com/)
- [Guia de Publicação NPM](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [NPM Best Practices](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry/creating-a-package-json-file)

---

**🎉 Parabéns! Seu pacote Oracle Node MCP Server está pronto para ser publicado no NPM!**

**💡 Dica:** Teste sempre localmente antes de publicar e mantenha a documentação atualizada.
