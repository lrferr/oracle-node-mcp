# 🤝 Contribuindo para o Oracle Node MCP Server

Obrigado por considerar contribuir para o Oracle Node MCP Server! Este documento fornece diretrizes para contribuições.

## 📋 Como Contribuir

### 1. Fork do Repositório

1. Faça um fork do repositório no GitHub
2. Clone seu fork localmente:
   ```bash
   git clone https://github.com/SEU_USUARIO/oracle-node-mcp.git
   cd oracle-node-mcp
   ```

### 2. Configurar Ambiente de Desenvolvimento

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env

# Editar .env com suas configurações Oracle
```

### 3. Criar Branch para Feature

```bash
# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Ou para correção de bug
git checkout -b fix/corrigir-bug
```

### 4. Fazer Alterações

- Faça suas alterações no código
- Adicione testes se necessário
- Atualize documentação se aplicável
- Mantenha compatibilidade com Node.js 18+

### 5. Testar Alterações

```bash
# Executar linter
npm run lint

# Executar testes
npm test

# Testar conexão Oracle
npm run test-connection

# Testar configuração MCP
npm run test-mcp-config
```

### 6. Commit e Push

```bash
# Adicionar arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: adicionar nova funcionalidade X"

# Push para seu fork
git push origin feature/nova-funcionalidade
```

### 7. Criar Pull Request

1. Vá para o repositório original no GitHub
2. Clique em "New Pull Request"
3. Selecione sua branch
4. Preencha o template do PR
5. Aguarde revisão

## 📝 Padrões de Código

### Convenções de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: adicionar nova funcionalidade
fix: corrigir bug
docs: atualizar documentação
style: formatação de código
refactor: refatorar código
test: adicionar testes
chore: tarefas de manutenção
```

### Estrutura de Código

- Use ES6+ features
- Mantenha funções pequenas e focadas
- Adicione comentários JSDoc para funções públicas
- Use async/await ao invés de callbacks
- Trate erros adequadamente

### Documentação

- Mantenha README.md atualizado
- Adicione exemplos de uso
- Documente APIs públicas
- Atualize CHANGELOG.md

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Teste específico
npm run test-connection

# Teste de configuração
npm run test-mcp-config
```

### Adicionar Novos Testes

1. Crie arquivo de teste: `test/nova-funcionalidade.test.js`
2. Use framework de teste padrão do Node.js
3. Teste casos de sucesso e erro
4. Mantenha cobertura de código alta

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifique se o bug já foi reportado
2. Teste com a versão mais recente
3. Verifique logs de erro

### Como Reportar

1. Use o template de issue
2. Inclua informações do sistema
3. Descreva passos para reproduzir
4. Inclua logs de erro se aplicável

### Template de Bug Report

```markdown
## Descrição do Bug
Descrição clara do problema.

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja erro

## Comportamento Esperado
O que deveria acontecer.

## Informações do Sistema
- OS: [ex: Windows 10]
- Node.js: [ex: 18.17.0]
- Oracle: [ex: 19c]
- Versão do pacote: [ex: 1.0.0]

## Logs de Erro
```
Erro aqui
```

## Screenshots
Se aplicável, adicione screenshots.
```

## ✨ Sugerir Funcionalidades

### Antes de Sugerir

1. Verifique se já foi sugerido
2. Considere o escopo do projeto
3. Pense na implementação

### Como Sugerir

1. Use o template de feature request
2. Descreva o problema que resolve
3. Explique a solução proposta
4. Considere alternativas

### Template de Feature Request

```markdown
## Funcionalidade Sugerida
Descrição clara da funcionalidade.

## Problema que Resolve
Qual problema esta funcionalidade resolve?

## Solução Proposta
Como você imagina que deveria funcionar?

## Alternativas Consideradas
Outras soluções que você considerou?

## Contexto Adicional
Qualquer outra informação relevante.
```

## 📚 Documentação

### Atualizar Documentação

1. Mantenha consistência entre versões (EN/PT)
2. Use linguagem clara e objetiva
3. Inclua exemplos práticos
4. Atualize índices se necessário

### Arquivos de Documentação

- `README.md` - Português (principal)
- `README-EN.md` - Inglês
- `docs/` - Guias detalhados
- `examples/` - Exemplos de uso
- `CHANGELOG.md` - Histórico de mudanças

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

```env
# Oracle Database
ORACLE_HOST=localhost
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=ORCL
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password

# MCP Server
MCP_SERVER_NAME=oracle-monitor
LOG_LEVEL=debug
```

### Scripts Úteis

```bash
# Desenvolvimento com watch
npm run dev

# Testar conexão
npm run test-connection

# Configurar Cursor
npm run setup-cursor

# Publicar (apenas mantenedores)
npm publish
```

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Mudanças incompatíveis
- **MINOR** (0.1.0): Funcionalidades compatíveis
- **PATCH** (0.0.1): Correções compatíveis

## 📞 Suporte

### Canais de Comunicação

- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas e discussões
- **Email**: admin@oracle-mcp.dev

### Código de Conduta

- Seja respeitoso e inclusivo
- Foque no que é melhor para a comunidade
- Mostre empatia com outros membros
- Aceite críticas construtivas

## 🎯 Roadmap

### Próximas Funcionalidades

- [ ] Suporte a múltiplos bancos
- [ ] Interface web para monitoramento
- [ ] Integração com CI/CD
- [ ] Relatórios automáticos
- [ ] Alertas por email/Slack

### Contribuições Bem-vindas

- Correções de bugs
- Melhorias de performance
- Novas funcionalidades
- Documentação
- Testes
- Traduções

---

**Obrigado por contribuir para o Oracle Node MCP Server! 🚀**

**Thank you for contributing to Oracle Node MCP Server! 🚀**
