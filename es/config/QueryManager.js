'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BaseManager = require('./BaseManager');

var _BaseManager2 = _interopRequireDefault(_BaseManager);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function validateQuery(query) {
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
      const errorsMessages = errors.error.details.map(detail => ({
        message: detail.message,
        fieldName: detail.context.label
      }));

      throw new _BaseManager.FalconError(`Failed validation: ${JSON.stringify(errorsMessages)}`, { errors });
    }
  }
}

class QueryManager extends _BaseManager2.default {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.itemType = 'queries', _temp;
  }

  validateBeforeCreation(query) {
    switch (query.type) {
      case 'sqlite':
        {
          validateQuery(query);
          break;
        }
      default:
        {
          throw new Error(`Unknown database type "${this.itemType}". This probably means it is not supported`);
        }
    }
  }
}
exports.default = QueryManager;
//# sourceMappingURL=QueryManager.js.map