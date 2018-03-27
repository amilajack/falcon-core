var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import Client from './Client';
import { CLIENTS } from './provider_clients';

/**
 * The config passed by the user to the external createServer() API
 */


/**
 * Create and persist a server session. Returns a server object that
 * contains this state.
 *
 * This API is exposed to users. Users pass the configuration of their
 * server to this function
 */
export function createServer(serverConfig) {
  if (!serverConfig) {
    throw new Error('Missing server configuration');
  }

  if (!CLIENTS.some(cli => cli.key === serverConfig.client)) {
    throw new Error(`Invalid SQL client: "${serverConfig.client}"`);
  }

  const server = {
    /**
     * All connected dbs. This is the 'connection pool'
     */
    db: {},

    config: _extends({}, serverConfig, {
      host: serverConfig.host || serverConfig.socketPath
    })
  };

  /**
   * Server public API
   */
  return {
    /**
     * Retrieve the database connection pool if it exists
     * @TODO: Use use Map as dictionary instead of object literal
     */
    db(dbName) {
      if (dbName in server.db) {
        return server.db[dbName];
      }
      throw new Error('DB does not exist in databse connection pool');
    },

    /**
     * Kill the server and close the ssh tunnel
     */
    end() {
      // disconnect from all DBs
      Object.keys(server.db).forEach(key => server.db[key].disconnect());

      // close SSH tunnel
      if (server.sshTunnel) {
        server.sshTunnel.close();
        server.sshTunnel = null;
      }
    },

    /**
     * After the server session has been created, connect to a given
     * database
     */
    createConnection(dbName) {
      return _asyncToGenerator(function* () {
        // If connection to database already exists in pool, return in
        if (server.db[dbName]) {
          return server.db[dbName];
        }

        const database = {
          database: dbName,
          connection: null,
          connecting: false
        };

        // Add the connection to the 'connection pool'
        server.db[dbName] = yield Client(server, database);
        // @TODO: Handles only sqlite/sqlite3/db files
        return server.db[dbName];
      })();
    }
  };
}

export default createServer;
//# sourceMappingURL=Server.js.map