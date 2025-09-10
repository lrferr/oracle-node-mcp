import { Logger } from './logger.js';
import oracledb from 'oracledb';
import { ConnectionManager } from './connection-manager.js';

export class DCLOperations {
  constructor(connectionConfig = null, connectionManager = null) {
    this.logger = new Logger();
    this.connectionConfig = connectionConfig;
    this.connectionManager = connectionManager || new ConnectionManager();
  }

  async getConnection(connectionName = null) {
    try {
      // Se temos um ConnectionManager, usar ele
      if (this.connectionManager) {
        return await this.connectionManager.getConnection(connectionName);
      }
      
      // Fallback para configuração antiga
      if (this.connectionConfig) {
        const connection = await oracledb.getConnection(this.connectionConfig);
        return connection;
      }
      
      throw new Error('Nenhuma configuração de conexão disponível');
    } catch (error) {
      this.logger.error('Erro ao conectar com Oracle:', error);
      throw new Error(`Falha na conexão: ${error.message}`);
    }
  }

  // ===== OPERAÇÕES DE USUÁRIO =====

  async createUser(options = {}) {
    const {
      username,
      password,
      defaultTablespace = 'USERS',
      temporaryTablespace = 'TEMP',
      quota = 'UNLIMITED',
      profile = 'DEFAULT',
      ifNotExists = true
    } = options;

    if (!username || !password) {
      throw new Error('Nome de usuário e senha são obrigatórios');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      // Verificar se o usuário já existe
      if (ifNotExists) {
        const exists = await this.userExists(connection, username);
        if (exists) {
          return `⚠️ Usuário ${username} já existe. Operação ignorada.`;
        }
      }

      const createQuery = `
        CREATE USER ${username} 
        IDENTIFIED BY ${password}
        DEFAULT TABLESPACE ${defaultTablespace}
        TEMPORARY TABLESPACE ${temporaryTablespace}
        QUOTA ${quota} ON ${defaultTablespace}
        PROFILE ${profile}
      `;

      await connection.execute(createQuery);
      await connection.commit();

      this.logger.info(`Usuário ${username} criado com sucesso`);
      return `✅ Usuário ${username} criado com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao criar usuário:', error);
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async alterUser(options = {}) {
    const {
      username,
      password = null,
      defaultTablespace = null,
      temporaryTablespace = null,
      quota = null,
      quotaTablespace = null,
      profile = null,
      accountStatus = null
    } = options;

    if (!username) {
      throw new Error('Nome de usuário é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      const alterClauses = [];

      if (password) {
        alterClauses.push(`IDENTIFIED BY ${password}`);
      }

      if (defaultTablespace) {
        alterClauses.push(`DEFAULT TABLESPACE ${defaultTablespace}`);
      }

      if (temporaryTablespace) {
        alterClauses.push(`TEMPORARY TABLESPACE ${temporaryTablespace}`);
      }

      if (quota && quotaTablespace) {
        alterClauses.push(`QUOTA ${quota} ON ${quotaTablespace}`);
      }

      if (profile) {
        alterClauses.push(`PROFILE ${profile}`);
      }

      if (accountStatus) {
        alterClauses.push(`ACCOUNT ${accountStatus}`);
      }

      if (alterClauses.length === 0) {
        throw new Error('Pelo menos uma opção de alteração deve ser especificada');
      }

      const alterQuery = `ALTER USER ${username} ${alterClauses.join(' ')}`;
      await connection.execute(alterQuery);
      await connection.commit();

      this.logger.info(`Usuário ${username} alterado com sucesso`);
      return `✅ Usuário ${username} alterado com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao alterar usuário:', error);
      throw new Error(`Erro ao alterar usuário: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async dropUser(options = {}) {
    const {
      username,
      ifExists = true,
      cascade = false
    } = options;

    if (!username) {
      throw new Error('Nome de usuário é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      // Verificar se o usuário existe
      if (ifExists) {
        const exists = await this.userExists(connection, username);
        if (!exists) {
          return `⚠️ Usuário ${username} não existe. Operação ignorada.`;
        }
      }

      let dropQuery = `DROP USER ${username}`;
      if (cascade) {
        dropQuery += ' CASCADE';
      }

      await connection.execute(dropQuery);
      await connection.commit();

      this.logger.info(`Usuário ${username} removido com sucesso`);
      return `✅ Usuário ${username} removido com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao remover usuário:', error);
      throw new Error(`Erro ao remover usuário: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES DE PRIVILÉGIOS =====

  async grantPrivileges(options = {}) {
    const {
      privileges = [],
      onObject = null,
      toUser = null,
      toRole = null,
      withGrantOption = false,
      withAdminOption = false
    } = options;

    if (privileges.length === 0) {
      throw new Error('Pelo menos um privilégio deve ser especificado');
    }

    if (!toUser && !toRole) {
      throw new Error('Usuário ou role de destino deve ser especificado');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      const privilegeList = privileges.join(', ');
      const grantee = toUser ? `TO ${toUser}` : `TO ROLE ${toRole}`;
      const onClause = onObject ? `ON ${onObject}` : '';
      const options = [];

      if (withGrantOption) {
        options.push('WITH GRANT OPTION');
      }

      if (withAdminOption) {
        options.push('WITH ADMIN OPTION');
      }

      const grantQuery = `GRANT ${privilegeList} ${onClause} ${grantee} ${options.join(' ')}`.trim();
      await connection.execute(grantQuery);
      await connection.commit();

      const target = toUser || toRole;
      this.logger.info(`Privilégios concedidos com sucesso para ${target}`);
      return `✅ Privilégios concedidos com sucesso para ${target}!`;

    } catch (error) {
      this.logger.error('Erro ao conceder privilégios:', error);
      throw new Error(`Erro ao conceder privilégios: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async revokePrivileges(options = {}) {
    const {
      privileges = [],
      onObject = null,
      fromUser = null,
      fromRole = null,
      cascade = false
    } = options;

    if (privileges.length === 0) {
      throw new Error('Pelo menos um privilégio deve ser especificado');
    }

    if (!fromUser && !fromRole) {
      throw new Error('Usuário ou role de origem deve ser especificado');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      const privilegeList = privileges.join(', ');
      const grantee = fromUser ? `FROM ${fromUser}` : `FROM ROLE ${fromRole}`;
      const onClause = onObject ? `ON ${onObject}` : '';
      const cascadeClause = cascade ? 'CASCADE CONSTRAINTS' : '';

      const revokeQuery = `REVOKE ${privilegeList} ${onClause} ${grantee} ${cascadeClause}`.trim();
      await connection.execute(revokeQuery);
      await connection.commit();

      const target = fromUser || fromRole;
      this.logger.info(`Privilégios revogados com sucesso de ${target}`);
      return `✅ Privilégios revogados com sucesso de ${target}!`;

    } catch (error) {
      this.logger.error('Erro ao revogar privilégios:', error);
      throw new Error(`Erro ao revogar privilégios: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES DE ROLE =====

  async createRole(options = {}) {
    const {
      roleName,
      ifNotExists = true
    } = options;

    if (!roleName) {
      throw new Error('Nome da role é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      // Verificar se a role já existe
      if (ifNotExists) {
        const exists = await this.roleExists(connection, roleName);
        if (exists) {
          return `⚠️ Role ${roleName} já existe. Operação ignorada.`;
        }
      }

      const createQuery = `CREATE ROLE ${roleName}`;
      await connection.execute(createQuery);
      await connection.commit();

      this.logger.info(`Role ${roleName} criada com sucesso`);
      return `✅ Role ${roleName} criada com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao criar role:', error);
      throw new Error(`Erro ao criar role: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async dropRole(options = {}) {
    const {
      roleName,
      ifExists = true
    } = options;

    if (!roleName) {
      throw new Error('Nome da role é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      // Verificar se a role existe
      if (ifExists) {
        const exists = await this.roleExists(connection, roleName);
        if (!exists) {
          return `⚠️ Role ${roleName} não existe. Operação ignorada.`;
        }
      }

      const dropQuery = `DROP ROLE ${roleName}`;
      await connection.execute(dropQuery);
      await connection.commit();

      this.logger.info(`Role ${roleName} removida com sucesso`);
      return `✅ Role ${roleName} removida com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao remover role:', error);
      throw new Error(`Erro ao remover role: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async grantRole(options = {}) {
    const {
      roleName,
      toUser = null,
      toRole = null,
      withAdminOption = false
    } = options;

    if (!roleName) {
      throw new Error('Nome da role é obrigatório');
    }

    if (!toUser && !toRole) {
      throw new Error('Usuário ou role de destino deve ser especificado');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      const grantee = toUser ? `TO ${toUser}` : `TO ROLE ${toRole}`;
      const adminOption = withAdminOption ? 'WITH ADMIN OPTION' : '';

      const grantQuery = `GRANT ${roleName} ${grantee} ${adminOption}`.trim();
      await connection.execute(grantQuery);
      await connection.commit();

      const target = toUser || toRole;
      this.logger.info(`Role ${roleName} concedida com sucesso para ${target}`);
      return `✅ Role ${roleName} concedida com sucesso para ${target}!`;

    } catch (error) {
      this.logger.error('Erro ao conceder role:', error);
      throw new Error(`Erro ao conceder role: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async revokeRole(options = {}) {
    const {
      roleName,
      fromUser = null,
      fromRole = null
    } = options;

    if (!roleName) {
      throw new Error('Nome da role é obrigatório');
    }

    if (!fromUser && !fromRole) {
      throw new Error('Usuário ou role de origem deve ser especificado');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      const grantee = fromUser ? `FROM ${fromUser}` : `FROM ROLE ${fromRole}`;

      const revokeQuery = `REVOKE ${roleName} ${grantee}`;
      await connection.execute(revokeQuery);
      await connection.commit();

      const target = fromUser || fromRole;
      this.logger.info(`Role ${roleName} revogada com sucesso de ${target}`);
      return `✅ Role ${roleName} revogada com sucesso de ${target}!`;

    } catch (error) {
      this.logger.error('Erro ao revogar role:', error);
      throw new Error(`Erro ao revogar role: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== OPERAÇÕES DE PROFILE =====

  async createProfile(options = {}) {
    const {
      profileName,
      passwordLifeTime = null,
      passwordGraceTime = null,
      passwordReuseTime = null,
      passwordReuseMax = null,
      failedLoginAttempts = null,
      passwordLockTime = null,
      ifNotExists = true
    } = options;

    if (!profileName) {
      throw new Error('Nome do profile é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      // Verificar se o profile já existe
      if (ifNotExists) {
        const exists = await this.profileExists(connection, profileName);
        if (exists) {
          return `⚠️ Profile ${profileName} já existe. Operação ignorada.`;
        }
      }

      const profileClauses = [];

      if (passwordLifeTime !== null) {
        profileClauses.push(`PASSWORD_LIFE_TIME ${passwordLifeTime}`);
      }

      if (passwordGraceTime !== null) {
        profileClauses.push(`PASSWORD_GRACE_TIME ${passwordGraceTime}`);
      }

      if (passwordReuseTime !== null) {
        profileClauses.push(`PASSWORD_REUSE_TIME ${passwordReuseTime}`);
      }

      if (passwordReuseMax !== null) {
        profileClauses.push(`PASSWORD_REUSE_MAX ${passwordReuseMax}`);
      }

      if (failedLoginAttempts !== null) {
        profileClauses.push(`FAILED_LOGIN_ATTEMPTS ${failedLoginAttempts}`);
      }

      if (passwordLockTime !== null) {
        profileClauses.push(`PASSWORD_LOCK_TIME ${passwordLockTime}`);
      }

      const createQuery = `CREATE PROFILE ${profileName} LIMIT ${profileClauses.join(' ')}`;
      await connection.execute(createQuery);
      await connection.commit();

      this.logger.info(`Profile ${profileName} criado com sucesso`);
      return `✅ Profile ${profileName} criado com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao criar profile:', error);
      throw new Error(`Erro ao criar profile: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async dropProfile(options = {}) {
    const {
      profileName,
      ifExists = true,
      cascade = false
    } = options;

    if (!profileName) {
      throw new Error('Nome do profile é obrigatório');
    }

    let connection;
    try {
      connection = await this.getConnection(options.connectionName);

      // Verificar se o profile existe
      if (ifExists) {
        const exists = await this.profileExists(connection, profileName);
        if (!exists) {
          return `⚠️ Profile ${profileName} não existe. Operação ignorada.`;
        }
      }

      let dropQuery = `DROP PROFILE ${profileName}`;
      if (cascade) {
        dropQuery += ' CASCADE';
      }

      await connection.execute(dropQuery);
      await connection.commit();

      this.logger.info(`Profile ${profileName} removido com sucesso`);
      return `✅ Profile ${profileName} removido com sucesso!`;

    } catch (error) {
      this.logger.error('Erro ao remover profile:', error);
      throw new Error(`Erro ao remover profile: ${error.message}`);
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  async userExists(connection, username) {
    try {
      const query = `
        SELECT COUNT(*) 
        FROM dba_users 
        WHERE username = UPPER(:username)
      `;
      const result = await connection.execute(query, { username });
      return result.rows[0][0] > 0;
    } catch (error) {
      return false;
    }
  }

  async roleExists(connection, roleName) {
    try {
      const query = `
        SELECT COUNT(*) 
        FROM dba_roles 
        WHERE role = UPPER(:roleName)
      `;
      const result = await connection.execute(query, { roleName });
      return result.rows[0][0] > 0;
    } catch (error) {
      return false;
    }
  }

  async profileExists(connection, profileName) {
    try {
      const query = `
        SELECT COUNT(*) 
        FROM dba_profiles 
        WHERE profile = UPPER(:profileName)
      `;
      const result = await connection.execute(query, { profileName });
      return result.rows[0][0] > 0;
    } catch (error) {
      return false;
    }
  }

  // ===== VALIDAÇÕES DE SEGURANÇA =====

  validateUsername(username) {
    if (!username || typeof username !== 'string') {
      throw new Error('Nome de usuário deve ser uma string válida');
    }
    
    if (!/^[A-Za-z][A-Za-z0-9_$#]*$/.test(username)) {
      throw new Error('Nome de usuário deve conter apenas letras, números, underscore, $ e #, começando com letra');
    }
    
    if (username.length > 30) {
      throw new Error('Nome de usuário não pode exceder 30 caracteres');
    }
  }

  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Senha deve ser uma string válida');
    }
    
    if (password.length < 8) {
      throw new Error('Senha deve ter pelo menos 8 caracteres');
    }
  }

  validateRoleName(roleName) {
    if (!roleName || typeof roleName !== 'string') {
      throw new Error('Nome da role deve ser uma string válida');
    }
    
    if (!/^[A-Za-z][A-Za-z0-9_$#]*$/.test(roleName)) {
      throw new Error('Nome da role deve conter apenas letras, números, underscore, $ e #, começando com letra');
    }
    
    if (roleName.length > 30) {
      throw new Error('Nome da role não pode exceder 30 caracteres');
    }
  }

  validatePrivileges(privileges) {
    if (!Array.isArray(privileges) || privileges.length === 0) {
      throw new Error('Privilégios devem ser um array não vazio');
    }

    const validPrivileges = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXECUTE', 'CREATE', 'ALTER', 'DROP',
      'INDEX', 'REFERENCES', 'ALL', 'CONNECT', 'RESOURCE', 'DBA', 'SYSDBA', 'SYSOPER'
    ];

    for (const privilege of privileges) {
      if (!validPrivileges.includes(privilege.toUpperCase())) {
        throw new Error(`Privilégio inválido: ${privilege}`);
      }
    }
  }
}
