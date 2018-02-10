'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isValidPath = require('is-valid-path');

var _isValidPath2 = _interopRequireDefault(_isValidPath);

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _betterSqlite = require('better-sqlite3');

var _betterSqlite2 = _interopRequireDefault(_betterSqlite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
  var _ref = _asyncToGenerator(function* (connection) {
    const customJoi = _joi2.default.extend(function (joi) {
      return {
        base: joi.string(),
        name: 'string',
        language: {
          file: 'needs to be a file',
          file_exists: 'does not exist',
          sqlite_valid: 'is not valid'
        },
        rules: [{
          name: 'file',
          validate(params, value, state, options) {
            return !(0, _isValidPath2.default)(value) ? this.createError('string.file', { v: value, q: params.q }, state, options) : value;
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
              if (db.pragma('quick_check', true) !== 'ok') {
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
      };
    });

    const schema = customJoi.object().keys({
      id: customJoi.string().required(),
      name: customJoi.string().required(),
      color: customJoi.string(),
      database: customJoi.string().file().file_exists().sqlite_valid().required(),
      type: customJoi.string().required()
    });

    const errors = customJoi.validate(connection, schema, {
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

  function SqliteConnectionValidation(_x) {
    return _ref.apply(this, arguments);
  }

  return SqliteConnectionValidation;
})();
//# sourceMappingURL=SqliteConnectionValidation.js.map