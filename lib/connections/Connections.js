'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _electronStore = require('electron-store');

var _electronStore2 = _interopRequireDefault(_electronStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
// Manage saved connections to databases. Encrypts passwords


// We can't import electron in jest so electron-store won't work.
// We need to use 'conf' as a drop-in replacement for electron-store
// in the testing environment
const FinalStore = process.env.NODE_ENV === 'test' ? require('conf') // eslint-disable-line
: _electronStore2.default;

/**
 * This class is a general manager for falcon database connections.
 * It can be extended to fit the needs of specific databases. For
 * example, if a specific database requires encryption, the .get()
 * method can be modified
 */
class Connections {
  constructor() {
    this.store = new FinalStore({
      defaults: {
        connections: []
      }
    });
  }
  /**
   * @private
   */


  /**
   * @TODO
   * @private
   */
  validateBeforeCreation(connection) {
    return _asyncToGenerator(function* () {
      switch (connection.type) {
        case 'sqlite':
          {
            const { default: sqliteConnectionValidation } = yield Promise.resolve().then(() => require('./SqliteConnectionValidation.js'));
            return sqliteConnectionValidation(connection);
          }
        default:
          {
            throw new Error(`Unknown database type "${connection.type}". This probably means it is not supported`);
          }
      }
    })();
  }

  add(connection) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const rndm = yield Promise.resolve().then(() => require('rndm'));
      const connectionWithDefaults = _extends({
        id: `conn-${rndm(16)}`,
        color: 'gray'
      }, connection);
      const validation = yield _this.validateBeforeCreation(connectionWithDefaults);
      if (validation.errorMessages.length > 0) {
        return validation;
      }

      const connections = yield _this.getAll();
      connections.push(connectionWithDefaults);
      _this.store.set('connections', connections);

      return {
        errorMessages: [],
        passed: true,
        data: {
          connection: connectionWithDefaults
        }
      };
    })();
  }

  /**
   * Remove a connection by it's id
   */
  remove(connectionId) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const connections = yield _this2.getAll();
      const filteredConnections = connections.filter(function (connection) {
        return connection.id !== connectionId;
      });
      _this2.store.set('connections', filteredConnections);
    })();
  }

  removeAll() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3.store.set('connections', []);
    })();
  }

  /**
   * Update a connection by giving a new config
   */
  update(connectionId, connection) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const connections = yield _this4.getAll();
      const connectionToUpdateIndex = connections.findIndex(function (conn) {
        return conn.id === connectionId;
      });

      const validation = yield _this4.validateBeforeCreation(connection);
      if (validation.errorMessages.length > 0) {
        return validation;
      }

      switch (connectionToUpdateIndex) {
        case -1:
          {
            throw new Error(`Connection with id "${connectionId}" not found`);
          }
        default:
          {
            connections[connectionToUpdateIndex] = connection;
          }
      }

      _this4.store.set('connections', connections);

      return {
        errorMessages: [],
        passed: true,
        data: {
          connection
        }
      };
    })();
  }

  getAll() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return _this5.store.get('connections');
    })();
  }

  get(connectionId) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const connections = yield _this6.getAll();
      const connectionIndex = connections.findIndex(function (conn) {
        return conn.id === connectionId;
      });

      switch (connectionIndex) {
        case -1:
          {
            throw new Error(`Connection with id "${connectionId}" not found`);
          }
        default:
          {
            return connections[connectionIndex];
          }
      }
    })();
  }
}
exports.default = Connections;
//# sourceMappingURL=Connections.js.map