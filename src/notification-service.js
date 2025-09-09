import { Logger } from './logger.js';
import fs from 'fs/promises';
import path from 'path';

export class NotificationService {
  constructor() {
    this.logger = new Logger();
    this.notificationsEnabled = process.env.NOTIFICATION_ENABLED === 'true';
    this.notificationEmail = process.env.NOTIFICATION_EMAIL;
    this.notificationFile = 'logs/notifications.log';
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    try {
      await fs.mkdir('logs', { recursive: true });
    } catch (error) {
      this.logger.error('Erro ao criar diretório de logs:', error);
    }
  }

  async sendAlert(type, message, details = {}) {
    const notification = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
      severity: this.getSeverity(type)
    };

    // Log da notificação
    await this.logNotification(notification);

    // Enviar notificação baseada no tipo
    switch (type) {
      case 'SCHEMA_CHANGE':
        await this.handleSchemaChangeAlert(notification);
        break;
      case 'SENSITIVE_TABLE_CHANGE':
        await this.handleSensitiveTableAlert(notification);
        break;
      case 'MIGRATION_WARNING':
        await this.handleMigrationWarning(notification);
        break;
      case 'DATABASE_HEALTH':
        await this.handleDatabaseHealthAlert(notification);
        break;
      case 'PERFORMANCE_ISSUE':
        await this.handlePerformanceAlert(notification);
        break;
      default:
        await this.handleGenericAlert(notification);
    }

    return notification;
  }

  getSeverity(type) {
    const severityMap = {
      'SCHEMA_CHANGE': 'HIGH',
      'SENSITIVE_TABLE_CHANGE': 'CRITICAL',
      'MIGRATION_WARNING': 'MEDIUM',
      'DATABASE_HEALTH': 'HIGH',
      'PERFORMANCE_ISSUE': 'MEDIUM',
      'GENERIC': 'LOW'
    };

    return severityMap[type] || 'LOW';
  }

  async logNotification(notification) {
    try {
      const logEntry = `${notification.timestamp} [${notification.severity}] ${notification.type}: ${notification.message}\n`;
      await fs.appendFile(this.notificationFile, logEntry);
    } catch (error) {
      this.logger.error('Erro ao salvar notificação:', error);
    }
  }

  async handleSchemaChangeAlert(notification) {
    const { schema, changes } = notification.details;
    
    const alertMessage = `
🚨 **ALERTA: Mudança em Esquema Crítico**

**Esquema:** ${schema}
**Mudanças:** ${changes}
**Timestamp:** ${notification.timestamp}

**Ações Recomendadas:**
1. Verificar se a mudança foi autorizada
2. Revisar o impacto em aplicações dependentes
3. Considerar rollback se necessário
4. Atualizar documentação

**Detalhes Técnicos:**
${JSON.stringify(notification.details, null, 2)}
    `;

    this.logger.warn(alertMessage);
    
    if (this.notificationsEnabled) {
      await this.sendEmailNotification('Mudança em Esquema Crítico', alertMessage);
    }
  }

  async handleSensitiveTableAlert(notification) {
    const { table, operation, user } = notification.details;
    
    const alertMessage = `
🚨 **ALERTA CRÍTICO: Alteração em Tabela Sensível**

**Tabela:** ${table}
**Operação:** ${operation}
**Usuário:** ${user}
**Timestamp:** ${notification.timestamp}

**AÇÕES IMEDIATAS:**
1. Verificar autorização do usuário
2. Revisar logs de auditoria
3. Considerar bloqueio temporário
4. Notificar equipe de segurança

**Detalhes Técnicos:**
${JSON.stringify(notification.details, null, 2)}
    `;

    this.logger.error(alertMessage);
    
    if (this.notificationsEnabled) {
      await this.sendEmailNotification('ALERTA CRÍTICO - Tabela Sensível', alertMessage);
    }
  }

  async handleMigrationWarning(notification) {
    const { script, issues } = notification.details;
    
    const alertMessage = `
⚠️ **AVISO: Script de Migração Requer Revisão**

**Problemas Identificados:**
${issues.map(issue => `- ${issue}`).join('\n')}

**Script:**
\`\`\`sql
${script.substring(0, 500)}${script.length > 500 ? '...' : ''}
\`\`\`

**Recomendações:**
1. Revisar o script antes de executar
2. Testar em ambiente de desenvolvimento
3. Criar backup antes da execução
4. Documentar as mudanças

**Timestamp:** ${notification.timestamp}
    `;

    this.logger.warn(alertMessage);
    
    if (this.notificationsEnabled) {
      await this.sendEmailNotification('Script de Migração - Revisão Necessária', alertMessage);
    }
  }

  async handleDatabaseHealthAlert(notification) {
    const { metrics, issues } = notification.details;
    
    const alertMessage = `
🔍 **ALERTA: Problemas de Saúde do Banco**

**Métricas:**
${Object.entries(metrics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

**Problemas Identificados:**
${issues.map(issue => `- ${issue}`).join('\n')}

**Ações Recomendadas:**
1. Verificar logs do Oracle
2. Monitorar performance
3. Considerar otimizações
4. Verificar recursos do sistema

**Timestamp:** ${notification.timestamp}
    `;

    this.logger.warn(alertMessage);
    
    if (this.notificationsEnabled) {
      await this.sendEmailNotification('Problemas de Saúde do Banco', alertMessage);
    }
  }

  async handlePerformanceAlert(notification) {
    const { metric, value, threshold } = notification.details;
    
    const alertMessage = `
⚡ **ALERTA: Problema de Performance**

**Métrica:** ${metric}
**Valor Atual:** ${value}
**Limite:** ${threshold}

**Timestamp:** ${notification.timestamp}

**Ações Recomendadas:**
1. Verificar queries lentas
2. Analisar índices
3. Revisar estatísticas
4. Considerar otimizações
    `;

    this.logger.warn(alertMessage);
    
    if (this.notificationsEnabled) {
      await this.sendEmailNotification('Problema de Performance', alertMessage);
    }
  }

  async handleGenericAlert(notification) {
    const alertMessage = `
📢 **Notificação do Sistema Oracle MCP**

**Tipo:** ${notification.type}
**Mensagem:** ${notification.message}
**Severidade:** ${notification.severity}
**Timestamp:** ${notification.timestamp}

**Detalhes:**
${JSON.stringify(notification.details, null, 2)}
    `;

    this.logger.info(alertMessage);
  }

  async sendEmailNotification(subject, message) {
    // Implementação básica - em produção, usar serviço de email real
    try {
      const emailContent = `
Subject: ${subject}
From: oracle-mcp@company.com
To: ${this.notificationEmail}
Date: ${new Date().toISOString()}

${message}

---
Enviado pelo Oracle MCP Server
      `;

      await fs.appendFile('logs/email-notifications.log', emailContent + '\n\n');
      this.logger.info(`Notificação por email enviada: ${subject}`);
    } catch (error) {
      this.logger.error('Erro ao enviar notificação por email:', error);
    }
  }

  async getNotificationHistory(limit = 50) {
    try {
      const content = await fs.readFile(this.notificationFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      return lines
        .slice(-limit)
        .map(line => {
          const parts = line.split(' ');
          return {
            timestamp: parts[0] + ' ' + parts[1],
            severity: parts[2].replace(/[\[\]]/g, ''),
            type: parts[3].replace(':', ''),
            message: parts.slice(4).join(' ')
          };
        })
        .reverse();
    } catch (error) {
      this.logger.error('Erro ao ler histórico de notificações:', error);
      return [];
    }
  }

  async clearOldNotifications(daysToKeep = 30) {
    try {
      const content = await fs.readFile(this.notificationFile, 'utf8');
      const lines = content.trim().split('\n');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const recentLines = lines.filter(line => {
        const timestamp = line.split(' ')[0] + ' ' + line.split(' ')[1];
        const lineDate = new Date(timestamp);
        return lineDate >= cutoffDate;
      });

      await fs.writeFile(this.notificationFile, recentLines.join('\n') + '\n');
      this.logger.info(`Notificações antigas removidas (mantendo últimos ${daysToKeep} dias)`);
    } catch (error) {
      this.logger.error('Erro ao limpar notificações antigas:', error);
    }
  }

  async generateReport(startDate, endDate) {
    try {
      const content = await fs.readFile(this.notificationFile, 'utf8');
      const lines = content.trim().split('\n');
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filteredLines = lines.filter(line => {
        const timestamp = line.split(' ')[0] + ' ' + line.split(' ')[1];
        const lineDate = new Date(timestamp);
        return lineDate >= start && lineDate <= end;
      });

      const report = {
        period: { start: startDate, end: endDate },
        totalNotifications: filteredLines.length,
        byType: {},
        bySeverity: {},
        timeline: filteredLines.map(line => {
          const parts = line.split(' ');
          return {
            timestamp: parts[0] + ' ' + parts[1],
            severity: parts[2].replace(/[\[\]]/g, ''),
            type: parts[3].replace(':', ''),
            message: parts.slice(4).join(' ')
          };
        })
      };

      // Agrupar por tipo e severidade
      report.timeline.forEach(notification => {
        report.byType[notification.type] = (report.byType[notification.type] || 0) + 1;
        report.bySeverity[notification.severity] = (report.bySeverity[notification.severity] || 0) + 1;
      });

      return report;
    } catch (error) {
      this.logger.error('Erro ao gerar relatório:', error);
      return null;
    }
  }
}
