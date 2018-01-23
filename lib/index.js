'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLogger = exports.db = exports.servers = exports.config = undefined;

var _Config = require('./Config');

var config = _interopRequireWildcard(_Config);

var _Servers = require('./Servers');

var servers = _interopRequireWildcard(_Servers);

var _db = require('./db');

var db = _interopRequireWildcard(_db);

var _Logger = require('./Logger');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.config = config;
exports.servers = servers;
exports.db = db;
exports.setLogger = _Logger.setLogger;
//# sourceMappingURL=index.js.map