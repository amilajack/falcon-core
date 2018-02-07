// @flow
// Manage saved connections to databases. Encrypts passwords
import Store from 'electron-store';

export type connectionValidationType = {
  errorMessages: Array<{
    fieldName: string,
    message: string
  }>,
  passed: bool,
  data?: {
    connection: connectionType
  }
};

export type databaseType = 'sqlite' | 'mysql' | 'postgres' | 'mssql';

export type connectionType = {
  // The internal id for the connection
  id: string,
  // The name of the connection
  name: string,
  // The color of the connection
  color?: string | 'default',
  // Which database the connection is for
  type: databaseType,
  // These are properties that are specific to certain databases.
  // The pervious properties are required for all databases
  meta?: {
    password?: string,
    database?: string,
    port?: number,
    host?: string,
    username?: string,
    [otherKeys: string]: string
  }
};

// We can't import electron in jest so electron-store won't work.
// We need to use 'conf' as a drop-in replacement for electron-store
// in the testing environment
const FinalStore = process.env.NODE_ENV === 'test'
  ? require('conf') // eslint-disable-line
  : Store;

/**
 * This class is a general manager for falcon database connections.
 * It can be extended to fit the needs of specific databases. For
 * example, if a specific database requires encryption, the .get()
 * method can be modified
 */
export default class ConnectionManager {
  /**
   * @private
   */
  store = new FinalStore({
    defaults: {
      connections: [],
      queries: []
    }
  });

  /**
   * @TODO
   * @private
   */
  async validateBeforeCreation(connection: connectionType): Promise<connectionValidationType> {
    switch (connection.type) {
      case 'sqlite': {
        const { default: sqliteConnectionValidation } =
          await import('./validation/SqliteConnectionValidation.js');
        return sqliteConnectionValidation(connection);
      }
      default: {
        throw new Error(`Unknown database type "${connection.type}". This probably means it is not supported`);
      }
    }
  }

  async add(connection: connectionType): Promise<connectionValidationType> {
    const rndm = await import('rndm');
    const connectionWithDefaults = {
      id: `conn-${rndm(16)}`,
      color: 'gray',
      ...connection
    };
    const validation = await this.validateBeforeCreation(connectionWithDefaults);
    if (validation.errorMessages.length > 0) {
      return validation;
    }

    const connections = await this.getAll();
    connections.push(connectionWithDefaults);
    this.store.set('connections', connections);

    return {
      errorMessages: [],
      passed: true,
      data: {
        connection: connectionWithDefaults
      }
    };
  }

  /**
   * Remove a connection by it's id
   */
  async remove(connectionId: string) {
    const connections = await this.getAll();
    const filteredConnections =
      connections.filter(connection => connection.id !== connectionId);
    this.store.set('connections', filteredConnections);
  }

  async removeAll() {
    await this.store.set('connections', []);
  }

  /**
   * Update a connection by giving a new config
   */
  async update(connectionId: string, connection: connectionType): Promise<connectionValidationType> {
    const connections = await this.getAll();
    const connectionToUpdateIndex =
      connections.findIndex(conn => conn.id === connectionId);

    const validation = await this.validateBeforeCreation(connection);
    if (validation.errorMessages.length > 0) {
      return validation;
    }

    switch (connectionToUpdateIndex) {
      case -1: {
        throw new Error(`Connection with id "${connectionId}" not found`);
      }
      default: {
        connections[connectionToUpdateIndex] = connection;
      }
    }

    this.store.set('connections', connections);

    return {
      errorMessages: [],
      passed: true,
      data: {
        connection
      }
    };
  }

  async getAll(): Promise<Array<connectionType>> {
    return this.store.get('connections');
  }

  async get(connectionId: string): Promise<connectionType> {
    const connections = await this.getAll();
    const connectionIndex =
      connections.findIndex(conn => conn.id === connectionId);

    switch (connectionIndex) {
      case -1: {
        throw new Error(`Connection with id "${connectionId}" not found`);
      }
      default: {
        return connections[connectionIndex];
      }
    }
  }
}
