'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FalconError = exports.QueryManager = exports.ConnectionManager = exports.db = exports.config = undefined;

var _BaseManager = require('./config/BaseManager');

Object.defineProperty(exports, 'FalconError', {
  enumerable: true,
  get: function () {
    return _BaseManager.FalconError;
  }
});

var _Config = require('./Config');

var _config = _interopRequireWildcard(_Config);

var _database = require('./database');

var _db = _interopRequireWildcard(_database);

var _ConnectionManager2 = require('./config/ConnectionManager');

var _ConnectionManager3 = _interopRequireDefault(_ConnectionManager2);

var _QueryManager2 = require('./config/QueryManager');

var _QueryManager3 = _interopRequireDefault(_QueryManager2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.config = _config;
exports.db = _db;
exports.ConnectionManager = _ConnectionManager3.default;
exports.QueryManager = _QueryManager3.default;
//# sourceMappingURL=index.js.map