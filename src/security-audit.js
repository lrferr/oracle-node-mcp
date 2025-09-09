import { Logger } from './logger.js';
import fs from 'fs/promises';
import path from 'path';

export class SecurityAudit {
  constructor() {
    this.logger = new Logger();
    this.auditLogPath = process.env.AUDIT_LOG_PATH || './logs/audit.log';
    this.securityConfig = {
      maxQueryLength: 10000,
      dangerousKeywords: [
        'DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'EXEC', 'EXECUTE',
        'SP_', 'XP_', 'SHUTDOWN', 'RESTORE', 'BACKUP', 'DBCC'
      ],
      allowedSchemas: process.env.ALLOWED_SCHEMAS?.split(',') || ['HR', 'SCOTT'],
      blockedSchemas: process.env.BLOCKED_SCHEMAS?.split(',') || ['SYS', 'SYSTEM'],
      maxRowsAffected: parseInt(process.env.MAX_ROWS_AFFECTED) || 10000
    };
  }

  // ===== VALIDAÇÕES DE SEGURANÇA =====

  validateQuery(query, operation = 'SELECT') {
    if (!query || typeof query !== 'string') {
      throw new Error('Query deve ser uma string válida');
    }

    const trimmedQuery = query.trim().toUpperCase();

    // Verificar comprimento da query
    if (query.length > this.securityConfig.maxQueryLength) {
      throw new Error(`Query muito longa. Máximo permitido: ${this.securityConfig.maxQueryLength} caracteres`);
    }

    // Verificar palavras perigosas baseado na operação
    this.validateDangerousKeywords(trimmedQuery, operation);

    // Verificar tentativas de SQL injection
    this.validateSQLInjection(query);

    // Verificar esquemas permitidos/bloqueados
    this.validateSchemaAccess(trimmedQuery);

    return true;
  }

  validateDangerousKeywords(query, operation) {
    const allowedOperations = {
      'SELECT': ['SELECT', 'FROM', 'WHERE', 'ORDER', 'GROUP', 'HAVING', 'JOIN', 'UNION'],
      'INSERT': ['INSERT', 'INTO', 'VALUES', 'SELECT'],
      'UPDATE': ['UPDATE', 'SET', 'WHERE'],
      'DELETE': ['DELETE', 'FROM', 'WHERE'],
      'DDL': ['CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'COMMENT'],
      'DCL': ['GRANT', 'REVOKE', 'CREATE', 'ALTER', 'DROP']
    };

    const allowed = allowedOperations[operation] || [];
    
    for (const keyword of this.securityConfig.dangerousKeywords) {
      if (query.includes(keyword) && !allowed.includes(keyword)) {
        throw new Error(`Palavra-chave perigosa detectada: ${keyword}. Operação: ${operation}`);
      }
    }
  }

  validateSQLInjection(query) {
    const injectionPatterns = [
      /'.*or.*'.*=/i,
      /'.*union.*select/i,
      /'.*drop.*table/i,
      /'.*delete.*from/i,
      /'.*insert.*into/i,
      /'.*update.*set/i,
      /'.*exec.*\(/i,
      /'.*sp_.*\(/i,
      /'.*xp_.*\(/i,
      /--.*$/gm,
      /\/\*.*?\*\//g,
      /'.*;.*--/i,
      /'.*;.*drop/i
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(query)) {
        throw new Error('Possível tentativa de SQL injection detectada');
      }
    }
  }

  validateSchemaAccess(query) {
    // Extrair esquemas mencionados na query
    const schemaMatches = query.match(/(\w+)\.\w+/g);
    if (schemaMatches) {
      for (const match of schemaMatches) {
        const schema = match.split('.')[0];
        
        if (this.securityConfig.blockedSchemas.includes(schema)) {
          throw new Error(`Acesso negado ao esquema: ${schema}`);
        }
        
        if (this.securityConfig.allowedSchemas.length > 0 && 
            !this.securityConfig.allowedSchemas.includes(schema)) {
          throw new Error(`Esquema não permitido: ${schema}`);
        }
      }
    }
  }

  validateUserPermissions(user, operation, resource) {
    // Implementar validação de permissões do usuário
    // Por enquanto, apenas log da validação
    this.logger.info(`Validando permissões do usuário ${user} para ${operation} em ${resource}`);
    return true;
  }

  // ===== AUDITORIA =====

  async logOperation(operation) {
    const {
      user,
      operation: op,
      resource,
      query,
      result,
      timestamp = new Date(),
      ipAddress = 'unknown',
      sessionId = 'unknown'
    } = operation;

    const auditEntry = {
      timestamp: timestamp.toISOString(),
      user,
      operation: op,
      resource,
      query: this.sanitizeQueryForLog(query),
      result: this.sanitizeResultForLog(result),
      ipAddress,
      sessionId,
      success: result.success !== false
    };

    try {
      await this.writeAuditLog(auditEntry);
      this.logger.info(`Operação auditada: ${op} por ${user} em ${resource}`);
    } catch (error) {
      this.logger.error('Erro ao escrever log de auditoria:', error);
    }
  }

  async writeAuditLog(auditEntry) {
    const logLine = JSON.stringify(auditEntry) + '\n';
    
    try {
      await fs.mkdir(path.dirname(this.auditLogPath), { recursive: true });
      await fs.appendFile(this.auditLogPath, logLine);
    } catch (error) {
      this.logger.error('Erro ao escrever arquivo de auditoria:', error);
      throw error;
    }
  }

  sanitizeQueryForLog(query) {
    if (!query) return '';
    
    // Remover informações sensíveis da query
    return query
      .replace(/PASSWORD\s+['"][^'"]*['"]/gi, 'PASSWORD ***')
      .replace(/IDENTIFIED\s+BY\s+['"][^'"]*['"]/gi, 'IDENTIFIED BY ***')
      .replace(/VALUES\s*\([^)]*\)/gi, 'VALUES (***)')
      .substring(0, 1000); // Limitar tamanho
  }

  sanitizeResultForLog(result) {
    if (!result) return '';
    
    // Remover dados sensíveis do resultado
    if (typeof result === 'string') {
      return result.substring(0, 500); // Limitar tamanho
    }
    
    if (typeof result === 'object') {
      return {
        success: result.success,
        rowsAffected: result.rowsAffected,
        message: result.message?.substring(0, 200)
      };
    }
    
    return result;
  }

  // ===== RELATÓRIOS DE AUDITORIA =====

  async generateAuditReport(options = {}) {
    const {
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000), // Últimas 24h
      endDate = new Date(),
      user = null,
      operation = null,
      success = null
    } = options;

    try {
      const auditEntries = await this.readAuditLogs();
      
      let filteredEntries = auditEntries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });

      if (user) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.user.toLowerCase().includes(user.toLowerCase())
        );
      }

      if (operation) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.operation.toLowerCase().includes(operation.toLowerCase())
        );
      }

      if (success !== null) {
        filteredEntries = filteredEntries.filter(entry => entry.success === success);
      }

      return this.formatAuditReport(filteredEntries, options);
    } catch (error) {
      this.logger.error('Erro ao gerar relatório de auditoria:', error);
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }
  }

  async readAuditLogs() {
    try {
      const logContent = await fs.readFile(this.auditLogPath, 'utf8');
      const lines = logContent.trim().split('\n');
      
      return lines
        .filter(line => line.trim())
        .map(line => {
          try {
            return JSON.parse(line);
          } catch (error) {
            this.logger.warn('Linha de log de auditoria inválida:', line);
            return null;
          }
        })
        .filter(entry => entry !== null);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []; // Arquivo não existe ainda
      }
      throw error;
    }
  }

  formatAuditReport(entries, options) {
    const totalEntries = entries.length;
    const successCount = entries.filter(e => e.success).length;
    const failureCount = totalEntries - successCount;

    // Agrupar por usuário
    const userStats = {};
    entries.forEach(entry => {
      if (!userStats[entry.user]) {
        userStats[entry.user] = { total: 0, success: 0, operations: {} };
      }
      userStats[entry.user].total++;
      if (entry.success) userStats[entry.user].success++;
      
      if (!userStats[entry.user].operations[entry.operation]) {
        userStats[entry.user].operations[entry.operation] = 0;
      }
      userStats[entry.user].operations[entry.operation]++;
    });

    // Agrupar por operação
    const operationStats = {};
    entries.forEach(entry => {
      if (!operationStats[entry.operation]) {
        operationStats[entry.operation] = { total: 0, success: 0 };
      }
      operationStats[entry.operation].total++;
      if (entry.success) operationStats[entry.operation].success++;
    });

    let report = `# Relatório de Auditoria\n\n`;
    report += `**Período:** ${options.startDate.toISOString()} - ${options.endDate.toISOString()}\n`;
    report += `**Total de Operações:** ${totalEntries}\n`;
    report += `**Sucessos:** ${successCount} (${((successCount/totalEntries)*100).toFixed(1)}%)\n`;
    report += `**Falhas:** ${failureCount} (${((failureCount/totalEntries)*100).toFixed(1)}%)\n\n`;

    report += `## Estatísticas por Usuário\n`;
    for (const [user, stats] of Object.entries(userStats)) {
      report += `### ${user}\n`;
      report += `- Total: ${stats.total}\n`;
      report += `- Sucessos: ${stats.success} (${((stats.success/stats.total)*100).toFixed(1)}%)\n`;
      report += `- Operações:\n`;
      for (const [op, count] of Object.entries(stats.operations)) {
        report += `  - ${op}: ${count}\n`;
      }
      report += `\n`;
    }

    report += `## Estatísticas por Operação\n`;
    for (const [operation, stats] of Object.entries(operationStats)) {
      report += `- **${operation}:** ${stats.total} (${((stats.success/stats.total)*100).toFixed(1)}% sucesso)\n`;
    }

    return report;
  }

  // ===== MONITORAMENTO DE SEGURANÇA =====

  async detectSuspiciousActivity() {
    try {
      const entries = await this.readAuditLogs();
      const recentEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return entryDate > oneHourAgo;
      });

      const suspiciousActivities = [];

      // Detectar muitas falhas de um usuário
      const userFailures = {};
      recentEntries.forEach(entry => {
        if (!entry.success) {
          userFailures[entry.user] = (userFailures[entry.user] || 0) + 1;
        }
      });

      for (const [user, failures] of Object.entries(userFailures)) {
        if (failures >= 5) {
          suspiciousActivities.push({
            type: 'MULTIPLE_FAILURES',
            user,
            count: failures,
            message: `Usuário ${user} teve ${failures} falhas na última hora`
          });
        }
      }

      // Detectar muitas operações de um usuário
      const userOperations = {};
      recentEntries.forEach(entry => {
        userOperations[entry.user] = (userOperations[entry.user] || 0) + 1;
      });

      for (const [user, operations] of Object.entries(userOperations)) {
        if (operations >= 100) {
          suspiciousActivities.push({
            type: 'HIGH_ACTIVITY',
            user,
            count: operations,
            message: `Usuário ${user} executou ${operations} operações na última hora`
          });
        }
      }

      return suspiciousActivities;
    } catch (error) {
      this.logger.error('Erro ao detectar atividades suspeitas:', error);
      return [];
    }
  }

  // ===== CONFIGURAÇÃO DE SEGURANÇA =====

  updateSecurityConfig(newConfig) {
    this.securityConfig = { ...this.securityConfig, ...newConfig };
    this.logger.info('Configuração de segurança atualizada');
  }

  getSecurityConfig() {
    return { ...this.securityConfig };
  }

  // ===== MÉTODOS AUXILIARES =====

  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .replace(/[';]/g, '') // Remover aspas simples e ponto e vírgula
      .replace(/--/g, '') // Remover comentários SQL
      .replace(/\/\*.*?\*\//g, '') // Remover comentários de bloco
      .trim();
  }

  escapeSQLIdentifier(identifier) {
    if (!identifier || typeof identifier !== 'string') {
      throw new Error('Identificador deve ser uma string válida');
    }

    // Verificar se contém apenas caracteres válidos
    if (!/^[A-Za-z][A-Za-z0-9_$#]*$/.test(identifier)) {
      throw new Error('Identificador contém caracteres inválidos');
    }

    return identifier.toUpperCase();
  }
}
