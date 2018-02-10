'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BaseManager = require('./BaseManager');

var _BaseManager2 = _interopRequireDefault(_BaseManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
// Manage saved connections to databases. Encrypts passwords


/**
 * This class is a general manager for falcon database connections.
 * It can be extended to fit the needs of specific databases. For
 * example, if a specific database requires encryption, the .get()
 * method can be modified
 */
class ConnectionManager extends _BaseManager2.default {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.itemType = 'connections', _temp;
  }

  /**
   * @TODO
   * @private
   */
  validateBeforeCreation(connection) {
    return _asyncToGenerator(function* () {
      switch (connection.type) {
        case 'sqlite':
          {
            const { default: sqliteConnectionValidation } = yield Promise.resolve().then(() => require('./validation/SqliteConnectionValidation.js'));
            return sqliteConnectionValidation(connection);
          }
        default:
          {
            throw new Error(`Unknown database type "${connection.type}". This probably means it is not supported`);
          }
      }
    })();
  }
}
exports.default = ConnectionManager;
//# sourceMappingURL=ConnectionManager.js.map