import Joi from 'joi';
import { Logger } from './logger.js';

export class MigrationValidator {
  constructor() {
    this.logger = new Logger();
    this.dangerousOperations = [
      'DROP TABLE',
      'DROP INDEX',
      'DROP SEQUENCE',
      'DROP PROCEDURE',
      'DROP FUNCTION',
      'DROP PACKAGE',
      'DROP VIEW',
      'TRUNCATE TABLE',
      'DELETE FROM',
      'ALTER TABLE DROP COLUMN',
      'ALTER TABLE MODIFY COLUMN'
    ];

    this.safeOperations = [
      'CREATE TABLE',
      'CREATE INDEX',
      'CREATE SEQUENCE',
      'CREATE PROCEDURE',
      'CREATE FUNCTION',
      'CREATE PACKAGE',
      'CREATE VIEW',
      'ALTER TABLE ADD COLUMN',
      'ALTER TABLE ADD CONSTRAINT',
      'INSERT INTO',
      'UPDATE SET'
    ];

    this.validationSchema = Joi.object({
      script: Joi.string().required().min(10),
      targetSchema: Joi.string().required().min(1)
    });
  }

  async validateScript(script, targetSchema) {
    try {
      // Validar entrada
      const { error: validationError } = this.validationSchema.validate({
        script,
        targetSchema
      });

      if (validationError) {
        return `❌ **Erro de Validação:** ${validationError.details[0].message}`;
      }

      const results = [];
      
      // 1. Verificar se contém operações perigosas
      const dangerousOps = this.checkDangerousOperations(script);
      if (dangerousOps.length > 0) {
        results.push(`⚠️ **Operações Perigosas Detectadas:**\n${dangerousOps.map(op => `- ${op}`).join('\n')}`);
      }

      // 2. Verificar se tem backup/rollback
      const hasBackup = this.checkBackupStrategy(script);
      if (!hasBackup && dangerousOps.length > 0) {
        results.push(`❌ **Falta Estratégia de Backup:** Script contém operações perigosas mas não possui estratégia de backup/rollback`);
      }

      // 3. Verificar sintaxe básica
      const syntaxIssues = this.checkSyntax(script);
      if (syntaxIssues.length > 0) {
        results.push(`❌ **Problemas de Sintaxe:**\n${syntaxIssues.map(issue => `- ${issue}`).join('\n')}`);
      }

      // 4. Verificar se está no esquema correto
      const schemaIssues = this.checkSchemaUsage(script, targetSchema);
      if (schemaIssues.length > 0) {
        results.push(`⚠️ **Problemas de Esquema:**\n${schemaIssues.map(issue => `- ${issue}`).join('\n')}`);
      }

      // 5. Verificar se tem comentários explicativos
      const hasComments = this.checkComments(script);
      if (!hasComments) {
        results.push(`⚠️ **Falta Documentação:** Script não possui comentários explicativos`);
      }

      // 6. Verificar se tem validações
      const hasValidations = this.checkValidations(script);
      if (!hasValidations && dangerousOps.length > 0) {
        results.push(`⚠️ **Falta Validações:** Script não possui validações antes de operações críticas`);
      }

      // 7. Verificar tamanho e complexidade
      const complexity = this.checkComplexity(script);
      if (complexity.isComplex) {
        results.push(`⚠️ **Script Complexo:** ${complexity.reasons.join(', ')}`);
      }

      // Resultado final
      if (results.length === 0) {
        return `✅ **Script Aprovado:** O script de migração está adequado para execução em produção.`;
      }

      const status = dangerousOps.length > 0 ? '❌' : '⚠️';
      return `${status} **Script Requer Revisão:**\n\n${results.join('\n\n')}`;

    } catch (error) {
      this.logger.error('Erro ao validar script:', error);
      return `❌ **Erro na Validação:** ${error.message}`;
    }
  }

  checkDangerousOperations(script) {
    const upperScript = script.toUpperCase();
    const found = [];

    for (const operation of this.dangerousOperations) {
      if (upperScript.includes(operation)) {
        found.push(operation);
      }
    }

    return found;
  }

  checkBackupStrategy(script) {
    const upperScript = script.toUpperCase();
    const backupKeywords = [
      'BACKUP',
      'CREATE TABLE.*_BACKUP',
      'CREATE TABLE.*_OLD',
      '-- BACKUP',
      '-- ROLLBACK',
      'SAVEPOINT',
      'COMMIT',
      'ROLLBACK'
    ];

    return backupKeywords.some(keyword => {
      const regex = new RegExp(keyword, 'i');
      return regex.test(script);
    });
  }

  checkSyntax(script) {
    const issues = [];
    const lines = script.split('\n');

    // Verificar parênteses balanceados
    let parenCount = 0;
    for (const line of lines) {
      for (const char of line) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
      }
    }
    if (parenCount !== 0) {
      issues.push('Parênteses não balanceados');
    }

    // Verificar aspas balanceadas
    let quoteCount = 0;
    let inString = false;
    for (const line of lines) {
      for (const char of line) {
        if (char === "'" && !inString) {
          inString = true;
          quoteCount++;
        } else if (char === "'" && inString) {
          inString = false;
        }
      }
    }
    if (inString) {
      issues.push('Aspas simples não balanceadas');
    }

    // Verificar ponto e vírgula no final
    const lastLine = lines[lines.length - 1].trim();
    if (lastLine && !lastLine.endsWith(';') && !lastLine.startsWith('--')) {
      issues.push('Script não termina com ponto e vírgula');
    }

    return issues;
  }

  checkSchemaUsage(script, targetSchema) {
    const issues = [];
    const upperScript = script.toUpperCase();
    const upperTargetSchema = targetSchema.toUpperCase();

    // Verificar se usa o esquema correto
    const schemaPattern = new RegExp(`\\b${upperTargetSchema}\\.`, 'g');
    const schemaMatches = upperScript.match(schemaPattern);
    
    if (!schemaMatches || schemaMatches.length === 0) {
      issues.push(`Script não referencia o esquema de destino '${targetSchema}'`);
    }

    // Verificar se não usa outros esquemas
    const otherSchemaPattern = /\b[A-Z_][A-Z0-9_]*\./g;
    const allSchemaMatches = upperScript.match(otherSchemaPattern) || [];
    const otherSchemas = allSchemaMatches
      .map(match => match.replace('.', ''))
      .filter(schema => schema !== upperTargetSchema && !['SYS', 'SYSTEM', 'DBA'].includes(schema));

    if (otherSchemas.length > 0) {
      issues.push(`Script referencia outros esquemas: ${otherSchemas.join(', ')}`);
    }

    return issues;
  }

  checkComments(script) {
    const lines = script.split('\n');
    const commentLines = lines.filter(line => 
      line.trim().startsWith('--') || 
      line.trim().startsWith('/*') || 
      line.trim().startsWith('*')
    );

    const commentRatio = commentLines.length / lines.length;
    return commentRatio > 0.1; // Pelo menos 10% do script deve ser comentários
  }

  checkValidations(script) {
    const upperScript = script.toUpperCase();
    const validationKeywords = [
      'IF EXISTS',
      'IF NOT EXISTS',
      'SELECT COUNT',
      'WHERE EXISTS',
      'CASE WHEN',
      'DECODE',
      'NVL',
      'COALESCE'
    ];

    return validationKeywords.some(keyword => upperScript.includes(keyword));
  }

  checkComplexity(script) {
    const lines = script.split('\n');
    const reasons = [];

    if (lines.length > 100) {
      reasons.push('Muitas linhas');
    }

    const upperScript = script.toUpperCase();
    const complexKeywords = ['CURSOR', 'LOOP', 'WHILE', 'FOR', 'EXCEPTION', 'RAISE'];
    const complexCount = complexKeywords.filter(keyword => upperScript.includes(keyword)).length;

    if (complexCount > 3) {
      reasons.push('Muitas estruturas complexas');
    }

    const semicolonCount = (script.match(/;/g) || []).length;
    if (semicolonCount > 20) {
      reasons.push('Muitas declarações');
    }

    return {
      isComplex: reasons.length > 0,
      reasons
    };
  }

  generateMigrationTemplate(targetSchema, operation) {
    const templates = {
      'CREATE_TABLE': `
-- Migração: Criar tabela em ${targetSchema}
-- Data: ${new Date().toISOString()}
-- Autor: [SEU_NOME]

-- Verificar se a tabela já existe
SELECT COUNT(*) INTO v_count 
FROM user_tables 
WHERE table_name = UPPER('${targetSchema}_NEW_TABLE');

IF v_count = 0 THEN
    -- Criar tabela
    CREATE TABLE ${targetSchema}.new_table (
        id NUMBER PRIMARY KEY,
        name VARCHAR2(100) NOT NULL,
        created_date DATE DEFAULT SYSDATE
    );
    
    -- Criar índice
    CREATE INDEX idx_${targetSchema}_new_table_name 
    ON ${targetSchema}.new_table(name);
    
    -- Comentários
    COMMENT ON TABLE ${targetSchema}.new_table IS 'Nova tabela criada via migração';
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Tabela criada com sucesso');
ELSE
    DBMS_OUTPUT.PUT_LINE('Tabela já existe');
END IF;
`,

      'ALTER_TABLE': `
-- Migração: Alterar tabela em ${targetSchema}
-- Data: ${new Date().toISOString()}
-- Autor: [SEU_NOME]

-- Backup da tabela original
CREATE TABLE ${targetSchema}.table_backup AS 
SELECT * FROM ${targetSchema}.original_table;

-- Verificar se a coluna já existe
SELECT COUNT(*) INTO v_count 
FROM user_tab_columns 
WHERE table_name = UPPER('ORIGINAL_TABLE') 
AND column_name = UPPER('NEW_COLUMN');

IF v_count = 0 THEN
    -- Adicionar nova coluna
    ALTER TABLE ${targetSchema}.original_table 
    ADD new_column VARCHAR2(50);
    
    -- Atualizar dados se necessário
    UPDATE ${targetSchema}.original_table 
    SET new_column = 'DEFAULT_VALUE' 
    WHERE new_column IS NULL;
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Coluna adicionada com sucesso');
ELSE
    DBMS_OUTPUT.PUT_LINE('Coluna já existe');
END IF;
`,

      'DATA_MIGRATION': `
-- Migração: Migração de dados em ${targetSchema}
-- Data: ${new Date().toISOString()}
-- Autor: [SEU_NOME]

-- Verificar dados antes da migração
SELECT COUNT(*) as total_records FROM ${targetSchema}.source_table;

-- Backup dos dados
CREATE TABLE ${targetSchema}.source_table_backup AS 
SELECT * FROM ${targetSchema}.source_table;

-- Migrar dados
INSERT INTO ${targetSchema}.target_table (col1, col2, col3)
SELECT col1, col2, col3 
FROM ${targetSchema}.source_table
WHERE condition = 'value';

-- Verificar integridade
SELECT COUNT(*) as migrated_records FROM ${targetSchema}.target_table;

-- Commit se tudo estiver correto
COMMIT;
DBMS_OUTPUT.PUT_LINE('Migração de dados concluída');
`
    };

    return templates[operation] || 'Template não encontrado';
  }
}
