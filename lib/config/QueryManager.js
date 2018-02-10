'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

let validateQuery = (() => {
  var _ref = _asyncToGenerator(function* (query) {
    const Joi = yield Promise.resolve().then(() => require('joi'));
    const schema = Joi.object().keys({
      id: Joi.string().required(),
      name: Joi.string().required(),
      color: Joi.string(),
      database: Joi.string().file().file_exists().sqlite_valid().required(),
      type: Joi.string().required()
    });

    const errors = Joi.validate(query, schema, {
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