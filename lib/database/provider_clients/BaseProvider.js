'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _fs = require('fs');

var _json2csv = require('json2csv');

var _json2csv2 = _interopRequireDefault(_json2csv);

var _sqliteJsonExport = require('sqlite-json-export');

var _sqliteJsonExport2 = _interopRequireDefault(_sqliteJsonExport);

var _util3 = require('util.promisify');

var _util4 = _interopRequireDefault(_util3);

var _Tunnel = require('../Tunnel');

var _Tunnel2 = _interopRequireDefault(_Tunnel);

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _Config = require('../../Config');

var config = _interopRequireWildcard(_Config);

var _Logger = require('../../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

_util4.default.shim();

const writeFileAsync = _util2.default.promisify(_fs.writeFile);

const logger = (0, _Logger2.default)('db');

/**
 * Common superclass of all other providers. Contains common functionalities
 */
class BaseProvider {

  constructor(server, database) {
    this.logs = [];
    this._graphQLServerIsRunning = false;

    this.server = server;
    this.database = database;
  }

  connect() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.database.connecting) {
        throw new Error('There is already a connection in progress for this server. Aborting this new request.');
      }

      if (_this.database.connecting) {
        throw new Error('There is already a connection in progress for this database. Aborting this new request.');
      }

      try {
        _this.database.connecting = true;

        // terminate any previous lost connection for this DB
        if (_this.database.connection) {
          _this.database.connection.disconnect();
        }

        // reuse existing tunnel
        if (_this.server.config.ssh && !_this.server.sshTunnel) {
          logger().debug('creating ssh tunnel');
          _this.server.sshTunnel = yield (0, _Tunnel2.default)(_this.server.config);

          const { address, port } = _this.server.sshTunnel.address();
          logger().debug('ssh forwarding through local connection %s:%d', address, port);

          _this.server.config.localHost = address;
          _this.server.config.localPort = port;
        }

        const driver = _2.default[_this.server.config.client];

        const [connection] = yield Promise.all([driver(_this.server, _this.database), _this.handleSSHError(_this.server.sshTunnel)]);

        _this.database.connection = connection;
      } catch (err) {
        logger().error('Connection error %j', err);
        _this.disconnect();
        throw err;
      } finally {
        _this.database.connecting = false;
      }
    })();
  }

  handleSSHError(sshTunnel) {
    return new Promise((resolve, reject) => {
      if (!sshTunnel) {
        return resolve(true);
      }

      sshTunnel.on('success', resolve);
      sshTunnel.on('error', error => {
        logger().error('ssh error %j', error);
        reject(error);
      });

      return resolve(true);
    });
  }

  buildSchemaFilter({ schema } = {}, schemaField = 'schema_name') {
    if (!schema) {
      return null;
    }

    if (typeof schema === 'string') {
      return `${schemaField} = '${schema}'`;
    }

    const where = [];
    const { only, ignore } = schema;

    if (only && only.length) {
      where.push(`${schemaField} IN (${only.map(name => `'${name}'`).join(',')})`);
    }
    if (ignore && ignore.length) {
      where.push(`${schemaField} NOT IN (${ignore.map(name => `'${name}'`).join(',')})`);
    }

    return where.join(' AND ');
  }

  buildDatabseFilter({ database } = {}, databaseField) {
    if (!database) {
      return null;
    }

    if (typeof database === 'string') {
      return `${databaseField} = '${database}'`;
    }

    const where = [];
    const { only, ignore } = database;

    if (only && only.length) {
      where.push(`${databaseField} IN (${only.map(name => `'${name}'`).join(',')})`);
    }

    if (ignore && ignore.length) {
      where.push(`${databaseField} NOT IN (${ignore.map(name => `'${name}'`).join(',')})`);
    }

    return where.join(' AND ');
  }

  disconnect() {
    this.database.connecting = false;

    if (this.database.connection) {
      this.database.connection.disconnect();
      this.database.connection = null;
    }

    if (this.server.db[this.database.database]) {
      delete this.server.db[this.database.database];
    }
  }

  getQuerySelectTop(table, limit, schema) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      _this2.checkIsConnected();
      let limitValue = limit;

      yield _this2.loadConfigLimit();
      limitValue = BaseProvider.limitSelect === 'number' ? BaseProvider.limitSelect : BaseProvider.DEFAULT_LIMIT;

      return _this2.database.connection.getQuerySelectTop(table, limitValue, schema);
    })();
  }

  getTableSelectScript(table, schema) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const columnNames = yield _this3.getTableColumnNames(table);
      const schemaSelection = _this3.resolveSchema(schema);
      return [`SELECT ${_this3.wrap(columnNames).join(', ')}`, `FROM ${schemaSelection}${_this3.wrap(table)};`].join(' ');
    })();
  }

  getTableInsertScript(table, schema) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const columnNames = yield _this4.getTableColumnNames(table);
      const schemaSelection = _this4.resolveSchema(schema);
      return [`INSERT INTO ${schemaSelection}${_this4.wrap(table)}`, `(${_this4.wrap(columnNames).join(', ')})\n`, `VALUES (${columnNames.fill('?').join(', ')});`].join(' ');
    })();
  }

  getTableColumnNames(table) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      _this5.checkIsConnected();
      const columns = yield _this5.database.connection.listTableColumns(_this5.database.database, table);
      return columns.map(function (column) {
        return column.columnName;
      });
    })();
  }

  getTableUpdateScript(table, schema) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const columnNames = yield _this6.getTableColumnNames(table);
      const setColumnForm = _this6.wrap(columnNames).map(function (col) {
        return `${col}=?`;
      }).join(', ');
      const schemaSelection = _this6.resolveSchema(schema);
      return [`UPDATE ${schemaSelection}${_this6.wrap(table)}\n`, `SET ${setColumnForm}\n`, 'WHERE <condition>;'].join(' ');
    })();
  }

  getTableDeleteScript(table, schema) {
    const schemaSelection = this.resolveSchema(schema);
    return [`DELETE FROM ${schemaSelection}${this.wrap(table)}`, 'WHERE <condition>;'].join(' ');
  }

  resolveSchema(schema) {
    return schema ? `${this.wrap(schema)}.` : '';
  }

  wrap(identifier) {
    this.checkIsConnected();
    return !Array.isArray(identifier) ? this.database.connection.wrapIdentifier(identifier) : identifier.map(item => this.database.connection.wrapIdentifier(item));
  }

  loadConfigLimit() {
    return _asyncToGenerator(function* () {
      if (BaseProvider.limitSelect === null) {
        const { limitQueryDefaultSelectTop } = yield config.get();
        BaseProvider.limitSelect = limitQueryDefaultSelectTop;
      }
      return BaseProvider.limitSelect;
    })();
  }

  checkIsConnected() {
    if (this.database.connecting || !this.database.connection) {
      throw new Error('There is no connection available.');
    }
    return true;
  }

  checkUnsupported(exportOptions) {
    if (!exportOptions) {
      throw new Error('No exportOptions passed');
    }
  }

  getJsonString(exportOptions) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const exporter = new _sqliteJsonExport2.default(_this7.connection.dbConfig.database);
      _this7.checkUnsupported(exportOptions);

      if ('tables' in exportOptions && 'table' in exportOptions) {
        throw new Error('You cannot give both "tables" and "table". Choose one');
      }

      const getSingleTable = function (tableName) {
        return new Promise(function (resolve, reject) {
          const options = {
            table: tableName
          };
          exporter.json(options, function (err, json) {
            if (err) return reject(err);
            return resolve(json);
          });
        });
      };

      // Multiple tables
      if ('tables' in exportOptions) {
        const results = yield Promise.all(exportOptions.tables.map(function (tableName) {
          return getSingleTable(tableName);
        })).then(function (tableJsonStrings) {
          return tableJsonStrings.join(',');
        });

        return ['[', ...results, ']'].join('');
      }

      // Single table
      return getSingleTable(exportOptions.table);
    })();
  }

  getCsvString(exportOptions) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      if ('tables' in exportOptions) {
        throw new Error('Exporting multiple tables to csv is currently not supported');
      }

      const jsonString = yield _this8.getJsonString(exportOptions);
      const parsedJson = JSON.parse(jsonString);

      return (0, _json2csv2.default)({
        data: parsedJson,
        fields: Object.keys(parsedJson[0])
      });
    })();
  }

  exportJson(filename, exportOptions) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      const jsonString = yield _this9.getJsonString(exportOptions);
      yield writeFileAsync(filename, jsonString);
      return jsonString;
    })();
  }

  exportCsv(filename, exportOptions) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      const csvString = yield _this10.getCsvString(exportOptions);
      yield writeFileAsync(filename, csvString);
      return csvString;
    })();
  }
}
exports.default = BaseProvider;
BaseProvider.DEFAULT_LIMIT = 1000;
BaseProvider.limitSelect = null;
//# sourceMappingURL=BaseProvider.js.map