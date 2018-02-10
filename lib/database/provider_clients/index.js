'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CLIENTS = undefined;

var _CassandraProviderFactory = require('./CassandraProviderFactory');

var _CassandraProviderFactory2 = _interopRequireDefault(_CassandraProviderFactory);

var _SqliteProviderFactory = require('./SqliteProviderFactory');

var _SqliteProviderFactory2 = _interopRequireDefault(_SqliteProviderFactory);

var _MysqlProviderFactory = require('./MysqlProviderFactory');

var _MysqlProviderFactory2 = _interopRequireDefault(_MysqlProviderFactory);

var _PostgresqlProviderFactory = require('./PostgresqlProviderFactory');

var _PostgresqlProviderFactory2 = _interopRequireDefault(_PostgresqlProviderFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import sqlserver from './SqlserverProviderFactory';

/**
 * List of supported database clients
 */
const CLIENTS = exports.CLIENTS = [{
  key: 'mysql',
  name: 'MySQL',
  defaultPort: 3306,
  disabledFeatures: ['server:schema', 'server:domain']
}, {
  key: 'postgresql',
  name: 'PostgreSQL',
  defaultDatabase: 'postgres',
  defaultPort: 5432,
  disabledFeatures: ['server:domain']
}, {
  key: 'sqlserver',
  name: 'Microsoft SQL Server',
  defaultPort: 1433
}, {
  key: 'sqlite',
  name: 'SQLite',
  defaultDatabase: ':memory:',
  disabledFeatures: ['server:ssl', 'server:host', 'server:port', 'server:socketPath', 'server:user', 'server:password', 'server:schema', 'server:domain', 'server:ssh', 'scriptCreateTable', 'cancelQuery']
}, {
  key: 'cassandra',
  name: 'Cassandra',
  defaultPort: 9042,
  disabledFeatures: ['server:ssl', 'server:socketPath', 'server:user', 'server:password', 'server:schema', 'server:domain', 'scriptCreateTable', 'cancelQuery']
}];

exports.default = {
  // sqlserver,
  postgresql: _PostgresqlProviderFactory2.default,
  mysql: _MysqlProviderFactory2.default,
  sqlite: _SqliteProviderFactory2.default,
  cassandra: _CassandraProviderFactory2.default
};
//# sourceMappingURL=index.js.map