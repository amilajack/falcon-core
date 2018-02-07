'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BaseManager = require('./BaseManager');

var _BaseManager2 = _interopRequireDefault(_BaseManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class QueryManager extends _BaseManager2.default {
  add(query) {
    return _asyncToGenerator(function* () {})();
  }

  remove() {
    return _asyncToGenerator(function* () {})();
  }

  removeAll() {
    return _asyncToGenerator(function* () {})();
  }

  get() {
    return _asyncToGenerator(function* () {})();
  }

  getAll() {
    return _asyncToGenerator(function* () {})();
  }
}
exports.default = QueryManager;
//# sourceMappingURL=QueryManager.js.map