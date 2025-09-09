# Exemplos de Metadados - Oracle Node MCP Server

Este documento contém exemplos específicos para as ferramentas de metadados e administração do Oracle.

## 🔍 Consultas de Metadados

### 1. Informações Completas de uma Tabela

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

**Resultado:**
- Informações básicas (tablespace, linhas, blocos)
- Estrutura das colunas com tipos e constraints
- Constraints (PK, FK, UNIQUE, CHECK)
- Índices com estatísticas

### 2. Análise de Constraints por Tipo

```json
{
  "name": "get_constraints",
  "arguments": {
    "schema": "HR",
    "constraintType": "FOREIGN KEY"
  }
}
```

**Resultado:**
- Lista todas as foreign keys do esquema
- Mostra tabelas referenciadas
- Inclui condições de constraint

### 3. Mapeamento de Chaves Estrangeiras

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

**Resultado:**
- Mapeamento coluna → coluna referenciada
- Tabelas de destino das referências
- Estrutura hierárquica das dependências

## 📊 Análise de Performance

### 1. Índices com Estatísticas Detalhadas

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

**Métricas Incluídas:**
- Número de linhas indexadas
- Blocos folha utilizados
- Chaves distintas
- Data da última análise
- Status de validade

### 2. Análise de Tabela para Otimização

```json
{
  "name": "analyze_table",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "estimatePercent": 20
  }
}
```

**Benefícios:**
- Atualiza estatísticas do otimizador
- Melhora performance de queries
- Permite análise de amostra
- Gera métricas de tamanho

## 🔗 Análise de Dependências

### 1. Dependências Completas

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

**Mostra:**
- Objetos que dependem da tabela
- Objetos que a tabela referencia
- Tipos de dependência (VIEW, TRIGGER, etc.)

### 2. Apenas Objetos Dependentes

```json
{
  "name": "get_table_dependencies",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "dependencyType": "DEPENDENTS"
  }
}
```

**Útil para:**
- Verificar impacto de mudanças
- Identificar objetos afetados por DROP
- Planejar migrações

## 🔐 Administração de Usuários

### 1. Informações Completas de Usuário

```json
{
  "name": "get_users_privileges",
  "arguments": {
    "user": "HR",
    "includeRoles": true,
    "includeSystemPrivs": true
  }
}
```

**Inclui:**
- Status da conta
- Tablespaces padrão e temporário
- Roles atribuídos
- Privilégios de sistema
- Opções de administração

### 2. Lista Todos os Usuários

```json
{
  "name": "get_users_privileges",
  "arguments": {
    "includeRoles": true,
    "includeSystemPrivs": false
  }
}
```

**Filtra:**
- Usuários do sistema (SYS, SYSTEM)
- Mostra apenas usuários de aplicação
- Inclui roles básicos

## 🔄 Sequences e Triggers

### 1. Sequences com Valores Atuais

```json
{
  "name": "get_sequences",
  "arguments": {
    "schema": "HR",
    "includeValues": true
  }
}
```

**Informações:**
- Valores mínimo e máximo
- Incremento configurado
- Próximo valor a ser gerado
- Configurações de cache e ciclo

### 2. Triggers com Código

```json
{
  "name": "get_triggers",
  "arguments": {
    "tableName": "EMPLOYEES",
    "schema": "HR",
    "includeCode": true
  }
}
```

**Inclui:**
- Tipo de trigger (BEFORE/AFTER)
- Eventos que disparam (INSERT/UPDATE/DELETE)
- Condições WHEN
- Código PL/SQL completo

## 🛠️ Casos de Uso Práticos

### 1. Auditoria de Estrutura

```javascript
// Script para auditar estrutura completa de um esquema
const auditSchema = async (schema) => {
  const tools = [
    { name: 'get_constraints', args: { schema } },
    { name: 'get_foreign_keys', args: { schema } },
    { name: 'get_indexes', args: { schema, includeStats: true } },
    { name: 'get_sequences', args: { schema, includeValues: true } },
    { name: 'get_triggers', args: { schema } }
  ];

  for (const tool of tools) {
    const result = await executeTool(tool.name, tool.args);
    console.log(`\n=== ${tool.name.toUpperCase()} ===`);
    console.log(result);
  }
};
```

### 2. Análise de Performance

```javascript
// Script para análise de performance de tabelas
const analyzePerformance = async (tables) => {
  for (const table of tables) {
    // Analisar tabela
    await executeTool('analyze_table', {
      tableName: table.name,
      schema: table.schema,
      estimatePercent: 10
    });

    // Verificar índices
    const indexes = await executeTool('get_indexes', {
      tableName: table.name,
      schema: table.schema,
      includeStats: true
    });

    // Verificar dependências
    const deps = await executeTool('get_table_dependencies', {
      tableName: table.name,
      schema: table.schema
    });

    console.log(`Análise completa para ${table.schema}.${table.name}`);
  }
};
```

### 3. Validação de Integridade

```javascript
// Script para validar integridade referencial
const validateIntegrity = async (schema) => {
  // Obter todas as foreign keys
  const fks = await executeTool('get_foreign_keys', {
    schema,
    showReferenced: true
  });

  // Verificar constraints
  const constraints = await executeTool('get_constraints', {
    schema,
    constraintType: 'FOREIGN KEY'
  });

  // Validar cada foreign key
  for (const fk of fks) {
    const query = `
      SELECT COUNT(*) as orphan_count
      FROM ${schema}.${fk.table_name} t
      WHERE NOT EXISTS (
        SELECT 1 FROM ${fk.ref_schema}.${fk.ref_table} r
        WHERE t.${fk.column} = r.${fk.ref_column}
      )
    `;
    
    const result = await executeTool('execute_safe_query', {
      query,
      schema
    });
    
    if (result.orphan_count > 0) {
      console.warn(`⚠️  Orfãos encontrados em ${fk.table_name}.${fk.column}`);
    }
  }
};
```

### 4. Documentação Automática

```javascript
// Script para gerar documentação de esquema
const generateDocumentation = async (schema) => {
  const tables = await getTablesInSchema(schema);
  
  for (const table of tables) {
    const info = await executeTool('get_table_info', {
      tableName: table,
      schema,
      includeConstraints: true,
      includeIndexes: true
    });
    
    const deps = await executeTool('get_table_dependencies', {
      tableName: table,
      schema
    });
    
    // Gerar documentação em Markdown
    const doc = `
# Tabela ${table}

${info}

## Dependências

${deps}
    `;
    
    await saveDocumentation(`${schema}_${table}.md`, doc);
  }
};
```

## 📈 Monitoramento de Mudanças

### 1. Detecção de Mudanças Estruturais

```javascript
// Script para detectar mudanças em constraints
const detectConstraintChanges = async (schema) => {
  const currentConstraints = await executeTool('get_constraints', {
    schema,
    constraintType: 'ALL'
  });
  
  // Comparar com snapshot anterior
  const previousConstraints = await loadSnapshot('constraints.json');
  
  const changes = compareConstraints(currentConstraints, previousConstraints);
  
  if (changes.length > 0) {
    await sendAlert('CONSTRAINT_CHANGE', {
      schema,
      changes,
      timestamp: new Date().toISOString()
    });
  }
};
```

### 2. Monitoramento de Performance

```javascript
// Script para monitorar performance de índices
const monitorIndexPerformance = async (schema) => {
  const indexes = await executeTool('get_indexes', {
    schema,
    includeStats: true
  });
  
  for (const index of indexes) {
    // Verificar se índice está sendo usado
    const usageQuery = `
      SELECT COUNT(*) as usage_count
      FROM v$object_usage
      WHERE index_name = '${index.name}'
        AND used = 'YES'
    `;
    
    const usage = await executeTool('execute_safe_query', {
      query: usageQuery,
      schema
    });
    
    if (usage.usage_count === 0) {
      console.warn(`⚠️  Índice ${index.name} não está sendo usado`);
    }
  }
};
```

## 🔧 Troubleshooting

### 1. Identificar Problemas de Performance

```json
{
  "name": "get_indexes",
  "arguments": {
    "schema": "HR",
    "includeStats": true
  }
}
```

**Procurar por:**
- Índices com muitas linhas mas poucas chaves distintas
- Índices não analisados recentemente
- Índices em tablespaces com pouco espaço

### 2. Verificar Integridade Referencial

```json
{
  "name": "get_foreign_keys",
  "arguments": {
    "schema": "HR",
    "showReferenced": true
  }
}
```

**Verificar:**
- Tabelas referenciadas existem
- Colunas referenciadas existem
- Tipos de dados são compatíveis

### 3. Analisar Dependências para Migração

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

**Considerar:**
- Ordem de criação/remoção
- Objetos dependentes
- Impacto de mudanças

---

**💡 Dica:** Use essas ferramentas em conjunto para obter uma visão completa da estrutura e performance do seu banco Oracle!
