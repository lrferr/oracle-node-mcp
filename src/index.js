#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OracleMonitor } from './oracle-monitor.js';
import { MigrationValidator } from './migration-validator.js';
import { NotificationService } from './notification-service.js';
import { Logger } from './logger.js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

class OracleMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: process.env.MCP_SERVER_NAME || 'oracle-monitor',
        version: process.env.MCP_SERVER_VERSION || '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.oracleMonitor = new OracleMonitor();
    this.migrationValidator = new MigrationValidator();
    this.notificationService = new NotificationService();
    this.logger = new Logger();

    this.setupHandlers();
  }

  setupHandlers() {
    // Listar ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'check_database_health',
            description: 'Verifica a saúde geral do banco de dados Oracle',
            inputSchema: {
              type: 'object',
              properties: {
                checkConnections: {
                  type: 'boolean',
                  description: 'Verificar conexões ativas',
                  default: true
                },
                checkTablespaces: {
                  type: 'boolean',
                  description: 'Verificar espaço em tablespaces',
                  default: true
                },
                checkPerformance: {
                  type: 'boolean',
                  description: 'Verificar métricas de performance',
                  default: true
                }
              }
            }
          },
          {
            name: 'monitor_schema_changes',
            description: 'Monitora mudanças em esquemas críticos',
            inputSchema: {
              type: 'object',
              properties: {
                schemas: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Lista de esquemas para monitorar',
                  default: ['HR', 'SCOTT', 'SYSTEM']
                },
                checkInterval: {
                  type: 'number',
                  description: 'Intervalo de verificação em minutos',
                  default: 5
                }
              }
            }
          },
          {
            name: 'validate_migration_script',
            description: 'Valida se um script de migração está adequado',
            inputSchema: {
              type: 'object',
              properties: {
                script: {
                  type: 'string',
                  description: 'Conteúdo do script de migração SQL'
                },
                targetSchema: {
                  type: 'string',
                  description: 'Esquema de destino da migração'
                }
              },
              required: ['script', 'targetSchema']
            }
          },
          {
            name: 'check_sensitive_tables',
            description: 'Verifica alterações em tabelas sensíveis',
            inputSchema: {
              type: 'object',
              properties: {
                tables: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Lista de tabelas sensíveis para verificar'
                },
                checkDataChanges: {
                  type: 'boolean',
                  description: 'Verificar mudanças nos dados',
                  default: true
                }
              }
            }
          },
          {
            name: 'execute_safe_query',
            description: 'Executa uma query de forma segura (apenas SELECT)',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Query SQL para executar (apenas SELECT permitido)'
                },
                schema: {
                  type: 'string',
                  description: 'Esquema para executar a query',
                  default: 'HR'
                }
              },
              required: ['query']
            }
          },
          {
            name: 'get_database_info',
            description: 'Obtém informações gerais sobre o banco de dados',
            inputSchema: {
              type: 'object',
              properties: {
                includeUsers: {
                  type: 'boolean',
                  description: 'Incluir informações de usuários',
                  default: false
                },
                includeTablespaces: {
                  type: 'boolean',
                  description: 'Incluir informações de tablespaces',
                  default: true
                }
              }
            }
          },
          {
            name: 'get_table_info',
            description: 'Obtém informações detalhadas sobre uma tabela específica',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description: 'Nome da tabela'
                },
                schema: {
                  type: 'string',
                  description: 'Esquema da tabela',
                  default: 'HR'
                },
                includeConstraints: {
                  type: 'boolean',
                  description: 'Incluir informações de constraints',
                  default: true
                },
                includeIndexes: {
                  type: 'boolean',
                  description: 'Incluir informações de índices',
                  default: true
                }
              },
              required: ['tableName']
            }
          },
          {
            name: 'get_constraints',
            description: 'Lista constraints de uma tabela ou esquema',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description: 'Nome da tabela (opcional)'
                },
                schema: {
                  type: 'string',
                  description: 'Esquema para buscar constraints',
                  default: 'HR'
                },
                constraintType: {
                  type: 'string',
                  enum: ['ALL', 'PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK', 'NOT NULL'],
                  description: 'Tipo de constraint para filtrar',
                  default: 'ALL'
                }
              }
            }
          },
          {
            name: 'get_foreign_keys',
            description: 'Lista chaves estrangeiras e suas referências',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description: 'Nome da tabela (opcional)'
                },
                schema: {
                  type: 'string',
                  description: 'Esquema para buscar foreign keys',
                  default: 'HR'
                },
                showReferenced: {
                  type: 'boolean',
                  description: 'Mostrar tabelas referenciadas',
                  default: true
                }
              }
            }
          },
          {
            name: 'get_indexes',
            description: 'Lista índices de uma tabela ou esquema',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description: 'Nome da tabela (opcional)'
                },
                schema: {
                  type: 'string',
                  description: 'Esquema para buscar índices',
                  default: 'HR'
                },
                includeStats: {
                  type: 'boolean',
                  description: 'Incluir estatísticas dos índices',
                  default: false
                }
              }
            }
          },
          {
            name: 'get_sequences',
            description: 'Lista sequences de um esquema',
            inputSchema: {
              type: 'object',
              properties: {
                schema: {
                  type: 'string',
                  description: 'Esquema para buscar sequences',
                  default: 'HR'
                },
                includeValues: {
                  type: 'boolean',
                  description: 'Incluir valores atuais das sequences',
                  default: true
                }
              }
            }
          },
          {
            name: 'get_triggers',
            description: 'Lista triggers de uma tabela ou esquema',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description: 'Nome da tabela (opcional)'
                },
                schema: {
                  type: 'string',
                  description: 'Esquema para buscar triggers',
                  default: 'HR'
                },
                includeCode: {
                  type: 'boolean',
                  description: 'Incluir código dos triggers',
                  default: false
                }
              }
            }
          },
          {
            name: 'get_users_privileges',
            description: 'Lista usuários e seus privilégios',
            inputSchema: {
              type: 'object',
              properties: {
                user: {
                  type: 'string',
                  description: 'Usuário específico (opcional)'
                },
                includeRoles: {
                  type: 'boolean',
                  description: 'Incluir roles do usuário',
                  default: true
                },
                includeSystemPrivs: {
                  type: 'boolean',
                  description: 'Incluir privilégios de sistema',
                  default: false
                }
              }
            }
          },
          {
            name: 'get_table_dependencies',
            description: 'Mostra dependências de uma tabela (o que depende dela e do que ela depende)',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description: 'Nome da tabela'
                },
                schema: {
                  type: 'string',
                  description: 'Esquema da tabela',
                  default: 'HR'
                },
                dependencyType: {
                  type: 'string',
                  enum: ['ALL', 'DEPENDENTS', 'REFERENCES'],
                  description: 'Tipo de dependência',
                  default: 'ALL'
                }
              },
              required: ['tableName']
            }
          },
          {
            name: 'analyze_table',
            description: 'Analisa uma tabela e gera estatísticas',
            inputSchema: {
              type: 'object',
              properties: {
                tableName: {
                  type: 'string',
                  description: 'Nome da tabela'
                },
                schema: {
                  type: 'string',
                  description: 'Esquema da tabela',
                  default: 'HR'
                },
                estimatePercent: {
                  type: 'number',
                  description: 'Percentual para estimativa (0-100)',
                  default: 10
                }
              },
              required: ['tableName']
            }
          }
        ]
      };
    });

    // Executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'check_database_health':
            return await this.handleCheckDatabaseHealth(args);
          
          case 'monitor_schema_changes':
            return await this.handleMonitorSchemaChanges(args);
          
          case 'validate_migration_script':
            return await this.handleValidateMigrationScript(args);
          
          case 'check_sensitive_tables':
            return await this.handleCheckSensitiveTables(args);
          
          case 'execute_safe_query':
            return await this.handleExecuteSafeQuery(args);
          
          case 'get_database_info':
            return await this.handleGetDatabaseInfo(args);
          
          case 'get_table_info':
            return await this.handleGetTableInfo(args);
          
          case 'get_constraints':
            return await this.handleGetConstraints(args);
          
          case 'get_foreign_keys':
            return await this.handleGetForeignKeys(args);
          
          case 'get_indexes':
            return await this.handleGetIndexes(args);
          
          case 'get_sequences':
            return await this.handleGetSequences(args);
          
          case 'get_triggers':
            return await this.handleGetTriggers(args);
          
          case 'get_users_privileges':
            return await this.handleGetUsersPrivileges(args);
          
          case 'get_table_dependencies':
            return await this.handleGetTableDependencies(args);
          
          case 'analyze_table':
            return await this.handleAnalyzeTable(args);
          
          default:
            throw new Error(`Ferramenta desconhecida: ${name}`);
        }
      } catch (error) {
        this.logger.error(`Erro ao executar ferramenta ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Erro: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleCheckDatabaseHealth(args) {
    const result = await this.oracleMonitor.checkDatabaseHealth(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Status da Saúde do Banco de Dados\n\n${result}`
        }
      ]
    };
  }

  async handleMonitorSchemaChanges(args) {
    const result = await this.oracleMonitor.monitorSchemaChanges(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Monitoramento de Mudanças em Esquemas\n\n${result}`
        }
      ]
    };
  }

  async handleValidateMigrationScript(args) {
    const result = await this.migrationValidator.validateScript(args.script, args.targetSchema);
    return {
      content: [
        {
          type: 'text',
          text: `## Validação do Script de Migração\n\n${result}`
        }
      ]
    };
  }

  async handleCheckSensitiveTables(args) {
    const result = await this.oracleMonitor.checkSensitiveTables(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Verificação de Tabelas Sensíveis\n\n${result}`
        }
      ]
    };
  }

  async handleExecuteSafeQuery(args) {
    const result = await this.oracleMonitor.executeSafeQuery(args.query, args.schema);
    return {
      content: [
        {
          type: 'text',
          text: `## Resultado da Query\n\n${result}`
        }
      ]
    };
  }

  async handleGetDatabaseInfo(args) {
    const result = await this.oracleMonitor.getDatabaseInfo(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Informações do Banco de Dados\n\n${result}`
        }
      ]
    };
  }

  async handleGetTableInfo(args) {
    const result = await this.oracleMonitor.getTableInfo(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Informações da Tabela ${args.tableName}\n\n${result}`
        }
      ]
    };
  }

  async handleGetConstraints(args) {
    const result = await this.oracleMonitor.getConstraints(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Constraints\n\n${result}`
        }
      ]
    };
  }

  async handleGetForeignKeys(args) {
    const result = await this.oracleMonitor.getForeignKeys(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Chaves Estrangeiras\n\n${result}`
        }
      ]
    };
  }

  async handleGetIndexes(args) {
    const result = await this.oracleMonitor.getIndexes(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Índices\n\n${result}`
        }
      ]
    };
  }

  async handleGetSequences(args) {
    const result = await this.oracleMonitor.getSequences(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Sequences\n\n${result}`
        }
      ]
    };
  }

  async handleGetTriggers(args) {
    const result = await this.oracleMonitor.getTriggers(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Triggers\n\n${result}`
        }
      ]
    };
  }

  async handleGetUsersPrivileges(args) {
    const result = await this.oracleMonitor.getUsersPrivileges(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Usuários e Privilégios\n\n${result}`
        }
      ]
    };
  }

  async handleGetTableDependencies(args) {
    const result = await this.oracleMonitor.getTableDependencies(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Dependências da Tabela ${args.tableName}\n\n${result}`
        }
      ]
    };
  }

  async handleAnalyzeTable(args) {
    const result = await this.oracleMonitor.analyzeTable(args);
    return {
      content: [
        {
          type: 'text',
          text: `## Análise da Tabela ${args.tableName}\n\n${result}`
        }
      ]
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info('Servidor MCP Oracle iniciado com sucesso!');
  }
}

// Iniciar o servidor
const server = new OracleMCPServer();
server.start().catch(console.error);
