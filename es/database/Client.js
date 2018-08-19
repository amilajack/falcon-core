'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Client;

var _SqliteProviderFactory = require('./provider_clients/SqliteProviderFactory');

var _SqliteProviderFactory2 = _interopRequireDefault(_SqliteProviderFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import CassandraProviderFactory from './provider_clients/CassandraProviderFactory';
// import MysqlProviderFactory from './provider_clients/MysqlProviderFactory';
// import PostgresqlProviderFactory from './provider_clients/PostgresqlProviderFactory';
function Client(server, database) {
  switch (server.config.client) {
    case 'sqlite':
      return (0, _SqliteProviderFactory2.default)(server, database);
    // case 'cassandra':
    //   return CassandraProviderFactory(server, database);
    // case 'mysql':
    //   return MysqlProviderFactory(server, database);
    // case 'postgresql':
    //   return PostgresqlProviderFactory(server, database);
    default:
      throw new Error(`Database client type "${server.config.client}" not recognized`);
  }
}
//# sourceMappingURL=Client.js.map