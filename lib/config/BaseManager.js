'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// We can't import electron in jest so electron-store won't work.
// We need to use 'conf' as a drop-in replacement for electron-store
// in the testing environment
const FinalStore = process.env.NODE_ENV === 'test' ? require('conf') // eslint-disable-line
: require('electron-store');

/**
 * This class is a general manager for falcon database items.
 * It can be extended to fit the needs of specific databases. For
 * example, if a specific database requires encryption, the .get()
 * method can be modified
 */

// Manage saved items to databases. Encrypts passwords
class BaseManager {
  constructor() {
    this.store = new FinalStore({
      defaults: {
        connections: [],
        queries: []
      }
    });
  }
  /**
   * @private
   */


  /**
   * @private
   * @abstract
   */
  validateBeforeCreation(item) {
    return _asyncToGenerator(function* () {
      return {
        errorMessages: [],
        passed: true
      };
    })();
  }

  add(item) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const rndm = yield Promise.resolve().then(() => require('rndm'));
      const itemWithDefaults = _extends({
        id: `conn-${rndm(16)}`,
        color: 'gray'
      }, item);
      const validation = yield _this.validateBeforeCreation(itemWithDefaults);
      if (validation.errorMessages.length > 0) {
        return validation;
      }

      const items = yield _this.getAll();
      items.push(itemWithDefaults);
      _this.store.set(_this.itemType, items);

      return {
        errorMessages: [],
        passed: true,
        data: {
          item: itemWithDefaults
        }
      };
    })();
  }

  /**
   * Remove a item by it's id
   */
  remove(itemId) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const items = yield _this2.getAll();
      const filtereditems = items.filter(function (item) {
        return item.id !== itemId;
      });
      _this2.store.set(_this2.itemType, filtereditems);
    })();
  }

  removeAll() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      yield _this3.store.set(_this3.itemType, []);
    })();
  }

  /**
   * Update a item by giving a new config
   */
  update(itemId, item) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const items = yield _this4.getAll();
      const itemToUpdateIndex = items.findIndex(function (itm) {
        return itm.id === itemId;
      });

      const validation = yield _this4.validateBeforeCreation(item);
      if (validation.errorMessages.length > 0) {
        return validation;
      }

      switch (itemToUpdateIndex) {
        case -1:
          {
            throw new Error(`item with id "${itemId}" not found`);
          }
        default:
          {
            items[itemToUpdateIndex] = item;
          }
      }

      _this4.store.set(_this4.itemType, items);

      return {
        errorMessages: [],
        passed: true,
        data: {
          item
        }
      };
    })();
  }

  getAll() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      return _this5.store.get(_this5.itemType);
    })();
  }

  get(itemId) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const items = yield _this6.getAll();
      const itemIndex = items.findIndex(function (conn) {
        return conn.id === itemId;
      });

      switch (itemIndex) {
        case -1:
          {
            throw new Error(`Item type "${_this6.itemType}" with id "${itemId}" not found`);
          }
        default:
          {
            return items[itemIndex];
          }
      }
    })();
  }
}
exports.default = BaseManager;
//# sourceMappingURL=BaseManager.js.map