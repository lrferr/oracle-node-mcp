#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OracleMonitor } from './oracle-monitor.js';
import { MigrationValidator } from './migration-validator.js';
import { NotificationService } from './notification-service.js';
import { Logger } from './logger.js';
import { DDLOperations } from './ddl-operations.js';
import { DMLOperations } from './dml-operations.js';
import { DCLOperations } from './dcl-operations.js';
import { SecurityAudit } from './security-audit.js';
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
    
    // Inicializar novos módulos
    this.connectionConfig = {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`
    };
    
    this.ddlOperations = new DDLOperations(this.connectionConfig);
    this.dmlOperations = new DMLOperations(this.connectionConfig);
    this.dclOperations = new DCLOperations(this.connectionConfig);
    this.securityAudit = new SecurityAudit();

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
          },
          // ===== FERRAMENTAS DDL =====
          {
            name: 'create_table',
            description: 'Cria uma nova tabela no banco de dados',
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
                columns: {
                  type: 'array',
                  description: 'Lista de colunas da tabela',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      length: { type: 'number' },
                      precision: { type: 'number' },
                      notNull: { type: 'boolean' },
                      defaultValue: { type: 'string' }
                    },
                    required: ['name', 'type']
                  }
                },
                constraints: {
                  type: 'array',
                  description: 'Lista de constraints da tabela',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string', enum: ['PRIMARY KEY', 'UNIQUE', 'CHECK', 'FOREIGN KEY'] },
                      columns: { type: 'array', items: { type: 'string' } },
                      condition: { type: 'string' },
                      referencedTable: { type: 'string' },
                      referencedColumns: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['name', 'type']
                  }
                },
                tablespace: {
                  type: 'string',
                  description: 'Tablespace da tabela',
                  default: 'USERS'
                },
                ifNotExists: {
                  type: 'boolean',
                  description: 'Criar apenas se não existir',
                  default: true
                }
              },
              required: ['tableName', 'columns']
            }
          },
          {
            name: 'alter_table',
            description: 'Altera uma tabela existente',
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
                operation: {
                  type: 'string',
                  enum: ['ADD_COLUMN', 'MODIFY_COLUMN', 'DROP_COLUMN', 'ADD_CONSTRAINT', 'DROP_CONSTRAINT', 'RENAME_COLUMN'],
                  description: 'Tipo de operação'
                },
                columnName: { type: 'string' },
                newColumnName: { type: 'string' },
                columnType: { type: 'string' },
                columnLength: { type: 'number' },
                notNull: { type: 'boolean' },
                defaultValue: { type: 'string' },
                constraintName: { type: 'string' },
                constraintType: { type: 'string' },
                constraintColumns: { type: 'array', items: { type: 'string' } },
                constraintCondition: { type: 'string' },
                referencedTable: { type: 'string' },
                referencedColumns: { type: 'array', items: { type: 'string' } }
              },
              required: ['tableName', 'operation']
            }
          },
          {
            name: 'drop_table',
            description: 'Remove uma tabela do banco de dados',
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
                ifExists: {
                  type: 'boolean',
                  description: 'Remover apenas se existir',
                  default: true
                },
                cascadeConstraints: {
                  type: 'boolean',
                  description: 'Remover constraints dependentes',
                  default: false
                }
              },
              required: ['tableName']
            }
          },
          // ===== FERRAMENTAS DML =====
          {
            name: 'select_data',
            description: 'Executa uma consulta SELECT no banco de dados',
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
                columns: {
                  type: 'array',
                  description: 'Lista de colunas para selecionar',
                  items: { type: 'string' },
                  default: ['*']
                },
                whereClause: {
                  type: 'string',
                  description: 'Condição WHERE'
                },
                orderBy: {
                  type: 'string',
                  description: 'Ordenação dos resultados'
                },
                limit: {
                  type: 'number',
                  description: 'Limite de linhas'
                },
                offset: {
                  type: 'number',
                  description: 'Offset para paginação',
                  default: 0
                }
              },
              required: ['tableName']
            }
          },
          {
            name: 'insert_data',
            description: 'Insere dados em uma tabela',
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
                data: {
                  type: 'object',
                  description: 'Dados para inserir (objeto chave-valor)'
                },
                columns: {
                  type: 'array',
                  description: 'Lista de colunas',
                  items: { type: 'string' }
                },
                values: {
                  type: 'array',
                  description: 'Lista de valores',
                  items: { type: 'string' }
                },
                returning: {
                  type: 'string',
                  description: 'Coluna para retornar após inserção'
                }
              },
              required: ['tableName']
            }
          },
          {
            name: 'update_data',
            description: 'Atualiza dados em uma tabela',
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
                data: {
                  type: 'object',
                  description: 'Dados para atualizar (objeto chave-valor)'
                },
                whereClause: {
                  type: 'string',
                  description: 'Condição WHERE'
                },
                returning: {
                  type: 'string',
                  description: 'Coluna para retornar após atualização'
                }
              },
              required: ['tableName', 'data', 'whereClause']
            }
          },
          {
            name: 'delete_data',
            description: 'Remove dados de uma tabela',
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
                whereClause: {
                  type: 'string',
                  description: 'Condição WHERE (obrigatória)'
                },
                returning: {
                  type: 'string',
                  description: 'Coluna para retornar após remoção'
                }
              },
              required: ['tableName', 'whereClause']
            }
          },
          // ===== FERRAMENTAS DCL =====
          {
            name: 'create_user',
            description: 'Cria um novo usuário no banco de dados',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Nome do usuário'
                },
                password: {
                  type: 'string',
                  description: 'Senha do usuário'
                },
                defaultTablespace: {
                  type: 'string',
                  description: 'Tablespace padrão',
                  default: 'USERS'
                },
                temporaryTablespace: {
                  type: 'string',
                  description: 'Tablespace temporário',
                  default: 'TEMP'
                },
                quota: {
                  type: 'string',
                  description: 'Quota no tablespace',
                  default: 'UNLIMITED'
                },
                profile: {
                  type: 'string',
                  description: 'Profile do usuário',
                  default: 'DEFAULT'
                },
                ifNotExists: {
                  type: 'boolean',
                  description: 'Criar apenas se não existir',
                  default: true
                }
              },
              required: ['username', 'password']
            }
          },
          {
            name: 'grant_privileges',
            description: 'Concede privilégios a um usuário ou role',
            inputSchema: {
              type: 'object',
              properties: {
                privileges: {
                  type: 'array',
                  description: 'Lista de privilégios',
                  items: { type: 'string' }
                },
                onObject: {
                  type: 'string',
                  description: 'Objeto para conceder privilégios'
                },
                toUser: {
                  type: 'string',
                  description: 'Usuário de destino'
                },
                toRole: {
                  type: 'string',
                  description: 'Role de destino'
                },
                withGrantOption: {
                  type: 'boolean',
                  description: 'Com opção de conceder',
                  default: false
                },
                withAdminOption: {
                  type: 'boolean',
                  description: 'Com opção de administrar',
                  default: false
                }
              },
              required: ['privileges']
            }
          },
          {
            name: 'revoke_privileges',
            description: 'Revoga privilégios de um usuário ou role',
            inputSchema: {
              type: 'object',
              properties: {
                privileges: {
                  type: 'array',
                  description: 'Lista de privilégios',
                  items: { type: 'string' }
                },
                onObject: {
                  type: 'string',
                  description: 'Objeto para revogar privilégios'
                },
                fromUser: {
                  type: 'string',
                  description: 'Usuário de origem'
                },
                fromRole: {
                  type: 'string',
                  description: 'Role de origem'
                },
                cascade: {
                  type: 'boolean',
                  description: 'Cascata para constraints',
                  default: false
                }
              },
              required: ['privileges']
            }
          },
          // ===== FERRAMENTAS DE AUDITORIA =====
          {
            name: 'generate_audit_report',
            description: 'Gera relatório de auditoria das operações',
            inputSchema: {
              type: 'object',
              properties: {
                startDate: {
                  type: 'string',
                  description: 'Data de início (ISO string)'
                },
                endDate: {
                  type: 'string',
                  description: 'Data de fim (ISO string)'
                },
                user: {
                  type: 'string',
                  description: 'Filtrar por usuário'
                },
                operation: {
                  type: 'string',
                  description: 'Filtrar por operação'
                },
                success: {
                  type: 'boolean',
                  description: 'Filtrar por sucesso/falha'
                }
              }
            }
          },
          {
            name: 'detect_suspicious_activity',
            description: 'Detecta atividades suspeitas no banco de dados',
            inputSchema: {
              type: 'object',
              properties: {}
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
          
          // ===== HANDLERS DDL =====
          case 'create_table':
            return await this.handleCreateTable(args);
          
          case 'alter_table':
            return await this.handleAlterTable(args);
          
          case 'drop_table':
            return await this.handleDropTable(args);
          
          // ===== HANDLERS DML =====
          case 'select_data':
            return await this.handleSelectData(args);
          
          case 'insert_data':
            return await this.handleInsertData(args);
          
          case 'update_data':
            return await this.handleUpdateData(args);
          
          case 'delete_data':
            return await this.handleDeleteData(args);
          
          // ===== HANDLERS DCL =====
          case 'create_user':
            return await this.handleCreateUser(args);
          
          case 'grant_privileges':
            return await this.handleGrantPrivileges(args);
          
          case 'revoke_privileges':
            return await this.handleRevokePrivileges(args);
          
          // ===== HANDLERS AUDITORIA =====
          case 'generate_audit_report':
            return await this.handleGenerateAuditReport(args);
          
          case 'detect_suspicious_activity':
            return await this.handleDetectSuspiciousActivity(args);
          
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

  // ===== HANDLERS DDL =====

  async handleCreateTable(args) {
    try {
      // Validar entrada
      this.securityAudit.validateTableName(args.tableName);
      if (args.columns) {
        args.columns.forEach(col => this.ddlOperations.validateColumnDefinition(col));
      }
      if (args.constraints) {
        args.constraints.forEach(constraint => this.ddlOperations.validateConstraintDefinition(constraint));
      }

      const result = await this.ddlOperations.createTable(args);
      
      // Log de auditoria
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'CREATE_TABLE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `CREATE TABLE ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Criação de Tabela\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'CREATE_TABLE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `CREATE TABLE ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  async handleAlterTable(args) {
    try {
      this.securityAudit.validateTableName(args.tableName);
      
      const result = await this.ddlOperations.alterTable(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'ALTER_TABLE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `ALTER TABLE ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Alteração de Tabela\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'ALTER_TABLE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `ALTER TABLE ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  async handleDropTable(args) {
    try {
      this.securityAudit.validateTableName(args.tableName);
      
      const result = await this.ddlOperations.dropTable(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'DROP_TABLE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `DROP TABLE ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Remoção de Tabela\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'DROP_TABLE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `DROP TABLE ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  // ===== HANDLERS DML =====

  async handleSelectData(args) {
    try {
      this.securityAudit.validateTableName(args.tableName);
      if (args.whereClause) {
        this.securityAudit.validateWhereClause(args.whereClause);
      }

      const result = await this.dmlOperations.select(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'SELECT',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `SELECT ${args.columns?.join(', ') || '*'} FROM ${args.schema || 'HR'}.${args.tableName}${args.whereClause ? ` WHERE ${args.whereClause}` : ''}`,
        result: { success: true, message: 'Query executada com sucesso' }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Consulta SELECT\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'SELECT',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `SELECT ${args.columns?.join(', ') || '*'} FROM ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  async handleInsertData(args) {
    try {
      this.securityAudit.validateTableName(args.tableName);
      
      const result = await this.dmlOperations.insert(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'INSERT',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `INSERT INTO ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Inserção de Dados\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'INSERT',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `INSERT INTO ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  async handleUpdateData(args) {
    try {
      this.securityAudit.validateTableName(args.tableName);
      this.securityAudit.validateWhereClause(args.whereClause);
      
      const result = await this.dmlOperations.update(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'UPDATE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `UPDATE ${args.schema || 'HR'}.${args.tableName} WHERE ${args.whereClause}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Atualização de Dados\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'UPDATE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `UPDATE ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  async handleDeleteData(args) {
    try {
      this.securityAudit.validateTableName(args.tableName);
      this.securityAudit.validateWhereClause(args.whereClause);
      
      const result = await this.dmlOperations.delete(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'DELETE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `DELETE FROM ${args.schema || 'HR'}.${args.tableName} WHERE ${args.whereClause}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Remoção de Dados\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'DELETE',
        resource: `${args.schema || 'HR'}.${args.tableName}`,
        query: `DELETE FROM ${args.schema || 'HR'}.${args.tableName}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  // ===== HANDLERS DCL =====

  async handleCreateUser(args) {
    try {
      this.securityAudit.validateUsername(args.username);
      this.securityAudit.validatePassword(args.password);
      
      const result = await this.dclOperations.createUser(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'CREATE_USER',
        resource: args.username,
        query: `CREATE USER ${args.username}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Criação de Usuário\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'CREATE_USER',
        resource: args.username,
        query: `CREATE USER ${args.username}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  async handleGrantPrivileges(args) {
    try {
      this.securityAudit.validatePrivileges(args.privileges);
      
      const result = await this.dclOperations.grantPrivileges(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'GRANT_PRIVILEGES',
        resource: args.toUser || args.toRole || 'unknown',
        query: `GRANT ${args.privileges.join(', ')}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Concessão de Privilégios\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'GRANT_PRIVILEGES',
        resource: args.toUser || args.toRole || 'unknown',
        query: `GRANT ${args.privileges?.join(', ') || 'unknown'}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  async handleRevokePrivileges(args) {
    try {
      this.securityAudit.validatePrivileges(args.privileges);
      
      const result = await this.dclOperations.revokePrivileges(args);
      
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'REVOKE_PRIVILEGES',
        resource: args.fromUser || args.fromRole || 'unknown',
        query: `REVOKE ${args.privileges.join(', ')}`,
        result: { success: true, message: result }
      });

      return {
        content: [
          {
            type: 'text',
            text: `## Revogação de Privilégios\n\n${result}`
          }
        ]
      };
    } catch (error) {
      await this.securityAudit.logOperation({
        user: process.env.ORACLE_USER || 'unknown',
        operation: 'REVOKE_PRIVILEGES',
        resource: args.fromUser || args.fromRole || 'unknown',
        query: `REVOKE ${args.privileges?.join(', ') || 'unknown'}`,
        result: { success: false, message: error.message }
      });
      throw error;
    }
  }

  // ===== HANDLERS AUDITORIA =====

  async handleGenerateAuditReport(args) {
    try {
      const options = {
        startDate: args.startDate ? new Date(args.startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000),
        endDate: args.endDate ? new Date(args.endDate) : new Date(),
        user: args.user,
        operation: args.operation,
        success: args.success
      };

      const result = await this.securityAudit.generateAuditReport(options);
      
      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de auditoria: ${error.message}`);
    }
  }

  async handleDetectSuspiciousActivity(args) {
    try {
      const activities = await this.securityAudit.detectSuspiciousActivity();
      
      let result = '## Detecção de Atividades Suspeitas\n\n';
      
      if (activities.length === 0) {
        result += '✅ Nenhuma atividade suspeita detectada.';
      } else {
        result += `⚠️ ${activities.length} atividade(s) suspeita(s) detectada(s):\n\n`;
        activities.forEach((activity, index) => {
          result += `${index + 1}. **${activity.type}**: ${activity.message}\n`;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      };
    } catch (error) {
      throw new Error(`Erro ao detectar atividades suspeitas: ${error.message}`);
    }
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
