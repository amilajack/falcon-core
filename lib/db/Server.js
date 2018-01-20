'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createServer = createServer;

var _Client = require('./Client');

var _Client2 = _interopRequireDefault(_Client);

var _provider_clients = require('./provider_clients');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create and persist a server session. Returns a server object that
 * contains this state.
 *
 * This API is exposed to users. Users pass the configuration of their
 * server to this function
 */


/**
 * The config passed by the user to the external createServer() API
 */
function createServer(serverConfig) {
  if (!serverConfig) {
    throw new Error('Missing server configuration');
  }

  if (!_provider_clients.CLIENTS.some(cli => cli.key === serverConfig.client)) {
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
      server.db[dbName] = (0, _Client2.default)(server, database);
      // @TODO: Handles only sqlite/sqlite3/db files
      return server.db[dbName];
    }
  };
}

exports.default = createServer;
//# sourceMappingURL=Server.js.map