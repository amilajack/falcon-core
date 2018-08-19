'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SqliteFormatter;

var _sqlFormatter = require('@falcon-client/sql-formatter');

var _sqlFormatter2 = _interopRequireDefault(_sqlFormatter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function SqliteFormatter(sql, numSpaces = 2) {
  return _sqlFormatter2.default.format(sql);
}
//# sourceMappingURL=SqliteFormatter.js.map