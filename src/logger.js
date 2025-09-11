import winston from 'winston';

export class Logger {
  constructor() {
    // Verificar se está rodando como servidor MCP (sem TTY)
    const isMCPServer = !process.stdout.isTTY || process.env.MCP_SERVER_MODE === 'true';
    
    const transports = [];
    
    // Só adicionar console transport se não estiver rodando como servidor MCP
    if (!isMCPServer) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              let log = `${timestamp} [${level}]: ${message}`;
              if (Object.keys(meta).length > 0) {
                log += ` ${JSON.stringify(meta)}`;
              }
              return log;
            })
          )
        })
      );
    }
    
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'oracle-mcp' },
      transports: [
        ...transports,
        
        // File transport for all logs
        new winston.transports.File({
          filename: process.env.LOG_FILE || 'logs/oracle-mcp.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }),
        
        // File transport for errors only
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 3,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      ]
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({ filename: 'logs/exceptions.log' })
    );

    // Handle unhandled promise rejections
    this.logger.rejections.handle(
      new winston.transports.File({ filename: 'logs/rejections.log' })
    );
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Método específico para logs de Oracle
  oracle(operation, details = {}) {
    this.logger.info(`Oracle ${operation}`, {
      operation,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Método específico para logs de MCP
  mcp(tool, result, details = {}) {
    this.logger.info(`MCP Tool: ${tool}`, {
      tool,
      success: !result.isError,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Método para logs de segurança
  security(event, details = {}) {
    this.logger.warn(`Security Event: ${event}`, {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Método para logs de performance
  performance(metric, value, threshold = null) {
    const level = threshold && value > threshold ? 'warn' : 'info';
    this.logger[level](`Performance: ${metric} = ${value}`, {
      metric,
      value,
      threshold,
      timestamp: new Date().toISOString()
    });
  }

  // Método para logs de migração
  migration(script, validation, details = {}) {
    const level = validation.approved ? 'info' : 'warn';
    this.logger[level](`Migration: ${validation.approved ? 'Approved' : 'Rejected'}`, {
      script: script.substring(0, 100) + '...',
      validation,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Método para logs de notificação
  notification(type, message, details = {}) {
    this.logger.info(`Notification: ${type}`, {
      type,
      message,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  // Método para criar child logger com contexto específico
  child(context) {
    return this.logger.child(context);
  }

  // Método para obter estatísticas de logs
  async getLogStats() {
    try {
      const fs = await import('fs/promises');
      const logFiles = [
        'logs/oracle-mcp.log',
        'logs/error.log',
        'logs/exceptions.log',
        'logs/rejections.log'
      ];

      const stats = {};
      
      for (const file of logFiles) {
        try {
          const stat = await fs.stat(file);
          stats[file] = {
            size: stat.size,
            modified: stat.mtime,
            exists: true
          };
        } catch (error) {
          stats[file] = {
            size: 0,
            modified: null,
            exists: false
          };
        }
      }

      return stats;
    } catch (error) {
      this.logger.error('Erro ao obter estatísticas de logs:', error);
      return {};
    }
  }

  // Método para limpar logs antigos
  async cleanOldLogs(daysToKeep = 30) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logDir = 'logs';
      const files = await fs.readdir(logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let cleanedCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.log')) {
          const filePath = path.join(logDir, file);
          const stat = await fs.stat(filePath);
          
          if (stat.mtime < cutoffDate) {
            await fs.unlink(filePath);
            cleanedCount++;
            this.logger.info(`Log antigo removido: ${file}`);
          }
        }
      }

      this.logger.info(`Limpeza de logs concluída: ${cleanedCount} arquivos removidos`);
      return cleanedCount;
    } catch (error) {
      this.logger.error('Erro ao limpar logs antigos:', error);
      return 0;
    }
  }
}
