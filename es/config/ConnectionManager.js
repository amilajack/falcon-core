function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Manage saved connections to databases. Encrypts passwords
import BaseManager from './BaseManager';
import sqliteConnectionValidation from './validation/SqliteConnectionValidation';


/**
 * This class is a general manager for falcon database connections.
 * It can be extended to fit the needs of specific databases. For
 * example, if a specific database requires encryption, the .get()
 * method can be modified
 */
export default class ConnectionManager extends BaseManager {
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
            yield sqliteConnectionValidation(connection);
            break;
          }
        default:
          {
            throw new Error(`Unknown database type "${connection.type}". This probably means it is not supported`);
          }
      }
    })();
  }
}
//# sourceMappingURL=ConnectionManager.js.map