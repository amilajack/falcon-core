'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keytar = require('keytar');

var _keytar2 = _interopRequireDefault(_keytar);

var _electronStore = require('electron-store');

var _electronStore2 = _interopRequireDefault(_electronStore);

var _util = require('util');

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
   * @TODO
   */
  validateBeforeCreation(connection) {
    return _asyncToGenerator(function* () {
      const isFilePath = yield Promise.resolve().then(() => require('is-valid-path'));
      const Joi = yield Promise.resolve().then(() => require('joi'));
      const fs = yield Promise.resolve().then(() => require('fs'));

      const customJoi = Joi.extend(function (joi) {
        return {
          base: joi.string(),
          name: 'string',
          language: {
            file: 'needs to be a file',
            file_exists: 'does not exist'
          },
          rules: [{
            name: 'file',
            validate(params, value, state, options) {
              return !isFilePath(value) ? this.createError('string.file', { v: value, q: params.q }, state, options) : value;
            }
          }, {
            name: 'file_exists',
            validate(params, value, state, options) {
              console.log(value);
              return fs.existsSync(value) ? this.createError('string.file_exists', { v: value, q: params.q }, state, options) : value;
            }
          }]
        };
      });

      const schema = function () {
        switch (connection.type) {
          case 'sqlite':
            {
              return customJoi.object().keys({
                id: customJoi.string().required(),
                name: customJoi.string().required(),
                database: customJoi.string().file().file_exists().required(),
                type: customJoi.string()
              });
            }
          default:
            {
              throw new Error(`Unknown database type "${connection.type}". This probably means it is not supported`);
            }
        }
      }();

      const errors = customJoi.validate(connection, schema, { abortEarly: false });
      return errors.error.details;
    })();
  }

  create(connection) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const connections = yield _this.getAll();
      connections.push(connection);
      _this.store.set('connections', connections);
    })();
  }

  /**
   * Delete a connection by it's id
   */
  delete(connectionId) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const connections = yield _this2.getAll();
      const filteredConnections = connections.filter(function (connection) {
        return connection.id !== connectionId;
      });
      _this2.store.set('connections', filteredConnections);
    })();
  }

  deleteAll() {
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