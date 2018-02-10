'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let validateQuery = (() => {
  var _ref = _asyncToGenerator(function* (query) {
    const schema = _joi2.default.object().keys({
      id: _joi2.default.string().required(),
      name: _joi2.default.string().required(),
      type: _joi2.default.string().required(),
      query: _joi2.default.string().required(),
      color: _joi2.default.string()
    });

    const errors = _joi2.default.validate(query, schema, {
      abortEarly: false
    });

    if (errors.error) {
      if (errors.error.details.length > 0) {
        return {
          errorMessages: errors.error.details.map(function (detail) {
            return {
              message: detail.message,
              fieldName: detail.context.label
            };
          }),
          passed: false
        };
      }
    }

    return {
      errorMessages: [],
      passed: true
    };
  });

  return function validateQuery(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _BaseManager = require('./BaseManager');

var _BaseManager2 = _interopRequireDefault(_BaseManager);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class QueryManager extends _BaseManager2.default {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.itemType = 'queries', _temp;
  }

  validateBeforeCreation(query) {
    var _this = this;

    return _asyncToGenerator(function* () {
      switch (query.type) {
        case 'sqlite':
          {
            return validateQuery(query);
          }
        default:
          {
            throw new Error(`Unknown database type "${_this.itemType}". This probably means it is not supported`);
          }
      }
    })();
  }
}
exports.default = QueryManager;
//# sourceMappingURL=QueryManager.js.map