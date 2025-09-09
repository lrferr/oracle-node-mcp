# 🐙 Configuração do GitHub - Oracle Node MCP Server

## 📋 Passos para Publicar no GitHub

### 1. Criar Repositório no GitHub

1. **Acesse o GitHub:**
   - Vá para https://github.com
   - Faça login na sua conta

2. **Criar Novo Repositório:**
   - Clique em "New repository" ou "+" → "New repository"
   - **Repository name:** `oracle-node-mcp`
   - **Description:** `MCP Server for Oracle Database monitoring and administration with Claude Desktop and Cursor IDE`
   - **Visibility:** Public (recomendado)
   - **Initialize with:** NÃO marque nenhuma opção (já temos arquivos)

3. **Criar Repositório:**
   - Clique em "Create repository"

### 2. Conectar Repositório Local

Após criar o repositório, execute os comandos abaixo no terminal:

```bash
# Adicionar remote origin (substitua SEU_USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU_USUARIO/oracle-node-mcp.git

# Renomear branch para main (padrão do GitHub)
git branch -M main

# Fazer push do código
git push -u origin main
```

### 3. Configurar Repositório

#### 3.1 Configurar Branch Protection
1. Vá para Settings → Branches
2. Adicione regra para branch `main`:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Require branches to be up to date before merging

#### 3.2 Configurar GitHub Pages (Opcional)
1. Vá para Settings → Pages
2. Source: Deploy from a branch
3. Branch: main / docs folder
4. Salve

#### 3.3 Configurar Secrets para CI/CD
1. Vá para Settings → Secrets and variables → Actions
2. Adicione secret `NPM_TOKEN` com seu token do NPM

### 4. Configurar NPM Token

Para o CI/CD funcionar, você precisa de um token do NPM:

1. **Acesse NPM:**
   - Vá para https://www.npmjs.com
   - Faça login na sua conta

2. **Criar Token:**
   - Vá para Account → Access Tokens
   - Clique em "Generate New Token"
   - Type: "Automation"
   - Copie o token

3. **Adicionar no GitHub:**
   - Vá para o repositório → Settings → Secrets
   - Clique em "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: cole o token do NPM
   - Clique em "Add secret"

### 5. Verificar Configuração

Após configurar tudo, verifique:

1. **Repositório público:**
   - https://github.com/SEU_USUARIO/oracle-node-mcp

2. **Actions funcionando:**
   - Vá para a aba "Actions"
   - Deve mostrar workflow executando

3. **NPM package:**
   - https://www.npmjs.com/package/oracle-node-mcp

## 🎯 Estrutura do Repositório

```
oracle-node-mcp/
├── .github/
│   ├── workflows/
│   │   └── ci.yml              # CI/CD pipeline
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md       # Template para bugs
│       └── feature_request.md  # Template para features
├── bin/
│   ├── oracle-mcp-cli.js       # CLI principal
│   └── oracle-mcp.js           # Executável simples
├── docs/
│   ├── configuration-guide.md  # Guia de configuração (PT)
│   └── configuration-guide-en.md # Guia de configuração (EN)
├── examples/
│   ├── usage-examples.md       # Exemplos de uso (PT)
│   └── usage-examples-en.md    # Exemplos de uso (EN)
├── src/
│   ├── index.js                # Servidor MCP principal
│   ├── oracle-monitor.js       # Lógica do Oracle
│   └── ...                     # Outros módulos
├── README.md                   # Documentação principal (PT)
├── README-EN.md               # Documentação principal (EN)
├── INDEX.md                   # Índice bilíngue
├── CONTRIBUTING.md            # Guia de contribuição
├── LICENSE                    # Licença MIT
└── package.json               # Configuração NPM
```

## 🚀 Comandos Úteis

### Desenvolvimento
```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/oracle-node-mcp.git
cd oracle-node-mcp

# Instalar dependências
npm install

# Desenvolvimento com watch
npm run dev

# Testar
npm test
```

### Contribuição
```bash
# Criar branch para feature
git checkout -b feature/nova-funcionalidade

# Fazer alterações e commit
git add .
git commit -m "feat: adicionar nova funcionalidade"

# Push para GitHub
git push origin feature/nova-funcionalidade

# Criar Pull Request no GitHub
```

### Publicação
```bash
# Incrementar versão
npm version patch  # ou minor, major

# Push com tags
git push origin main --tags

# Publicar no NPM (automatizado via CI/CD)
# ou manualmente: npm publish
```

## 📊 Badges para README

Adicione estes badges ao seu README.md:

```markdown
[![npm version](https://badge.fury.io/js/oracle-node-mcp.svg)](https://badge.fury.io/js/oracle-node-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/oracle-node-mcp.svg)](https://nodejs.org/)
[![Downloads](https://img.shields.io/npm/dm/oracle-node-mcp.svg)](https://www.npmjs.com/package/oracle-node-mcp)
[![GitHub stars](https://img.shields.io/github/stars/SEU_USUARIO/oracle-node-mcp.svg)](https://github.com/SEU_USUARIO/oracle-node-mcp/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/SEU_USUARIO/oracle-node-mcp.svg)](https://github.com/SEU_USUARIO/oracle-node-mcp/issues)
```

## 🎉 Próximos Passos

1. **Criar repositório no GitHub**
2. **Conectar repositório local**
3. **Configurar CI/CD**
4. **Adicionar badges ao README**
5. **Promover o projeto**

---

**🚀 Seu Oracle Node MCP Server estará disponível globalmente no GitHub!**
