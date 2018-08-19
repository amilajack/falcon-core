'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SqliteConnectionValidation;

var _isValidPath = require('is-valid-path');

var _isValidPath2 = _interopRequireDefault(_isValidPath);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _betterSqlite = require('better-sqlite3');

var _betterSqlite2 = _interopRequireDefault(_betterSqlite);

var _BaseManager = require('../BaseManager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SqliteConnectionValidation(connection) {
  const customJoi = _joi2.default.extend(joi => ({
    base: joi.string(),
    name: 'string',
    language: {
      file_has_absolute_path: 'needs to be an absolute path',
      file_is_valid: 'needs to be a file',
      file_exists: 'does not exist',
      sqlite_valid: 'is not valid'
    },
    rules: [{
      name: 'file_has_absolute_path',
      validate(params, value, state, options) {
        return !_path2.default.isAbsolute(value) ? this.createError('string.file_has_absolute_path', { v: value, q: params.q }, state, options) : value;
      }
    }, {
      name: 'file_is_valid',
      validate(params, value, state, options) {
        return !(0, _isValidPath2.default)(value) ? this.createError('string.file_is_valid', { v: value, q: params.q }, state, options) : value;
      }
    }, {
      name: 'file_exists',
      validate(params, value, state, options) {
        return _fs2.default.existsSync(value) ? value : this.createError('string.file_exists', { v: value, q: params.q }, state, options);
      }
    }, {
      name: 'sqlite_valid',
      validate(params, value, state, options) {
        let db;
        let passed = true;
        try {
          db = new _betterSqlite2.default(value, {
            readonly: true,
            fileMustExist: true
          });
          if (db.prepare('PRAGMA quick_check').pluck().get() !== 'ok') {
            passed = false;
          }
        } catch (e) {
          passed = false;
        } finally {
          if (db) {
            db.close();
          }
        }

        return passed ? value : this.createError('string.sqlite_valid', {
          v: value,
          q: params.q
        }, state, options);
      }
    }]
  }));

  const schema = customJoi.object().keys({
    id: customJoi.string().required(),
    name: customJoi.string().required(),
    color: customJoi.string(),
    database: customJoi.string().file_is_valid().file_has_absolute_path().file_exists().sqlite_valid().required(),
    type: customJoi.string().required()
  });

  const errors = customJoi.validate(connection, schema, {
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
//# sourceMappingURL=SqliteConnectionValidation.js.map