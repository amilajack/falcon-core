var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let MysqlProviderFactory = (() => {
  var _ref4 = _asyncToGenerator(function* (server, database) {
    const databaseConfig = configDatabase(server, database);
    const logger = createLogger('db:clients:mysql');
    logger().debug('create driver client for mysql with config %j', databaseConfig);

    const connection = {
      pool: mysql.createPool(databaseConfig)
    };
    const provider = new MysqlProvider(server, database, connection);

    // light solution to test connection with with the server
    yield provider.driverExecuteQuery({ query: 'select version();' });

    return provider;
  });

  return function MysqlProviderFactory(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/* eslint-disable */
// @TODO: Add flow annotation
import mysql from 'mysql';
import { identify } from 'sql-query-identifier';
import BaseProvider from './BaseProvider';
import createLogger from '../../Logger';
import { createCancelablePromise } from '../../Utils';
import errors from '../../Errors';


/**
 * @TODO: Why are we using this.connection.connection? Seems hard to follow
 *        Refactor to use just this.connection instead
 *
 *        Add typings for the responses of driverExecuteQuery(). Each response
 *        is different
 */
class MysqlProvider extends BaseProvider {

  constructor(server, database, connection) {
    super(server, database);
    this.mysqlErrors = {
      EMPTY_QUERY: 'ER_EMPTY_QUERY',
      CONNECTION_LOST: 'PROTOCOL_CONNECTION_LOST'
    };
    this.connection = connection;
  }

  disconnect() {
    this.connection.pool.end();
  }

  runWithConnection(run) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const { pool } = _this.connection;
      let rejected = false;

      return new Promise(function (resolve, reject) {
        const rejectErr = function (err) {
          if (!rejected) {
            rejected = true;
            reject(err);
          }
        };

        return pool.getConnection((() => {
          var _ref = _asyncToGenerator(function* (errPool, _connection) {
            if (errPool) {
              return rejectErr(errPool);
            }

            _connection.on('error', function (error) {
              // it will be handled later in the next query execution
              logger().error('Connection fatal error %j', error);
            });

            try {
              resolve((yield run(_connection)));
            } catch (err) {
              rejectErr(err);
            } finally {
              _connection.release();
            }

            return _connection;
          });

          return function (_x, _x2) {
            return _ref.apply(this, arguments);
          };
        })());
      });
    })();
  }

  getRealError(err) {
    /* eslint no-underscore-dangle: 0 */
    return this.connection && this.connection._protocol && this.connection._protocol._fatalError ? this.connection._protocol._fatalError : err;
  }

  driverExecuteQuery(queryArgs) {
    const runQuery = connection => new Promise((resolve, reject) => {
      connection.query(queryArgs.query, queryArgs.params, (err, data, fields) => {
        if (err && err.code === this.mysqlErrors.EMPTY_QUERY) {
          return resolve({});
        }
        if (err) return reject(this.getRealError(connection, err));

        return resolve({ data, fields });
      });
    });

    return this.connection.connection ? runQuery(this.connection.connection) : this.runWithConnection(runQuery);
  }

  getTables() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT table_name as name
      FROM information_schema.tables
      WHERE table_schema = database()
      AND table_type NOT LIKE '%VIEW%'
      ORDER BY table_name
    `;

      return _this2.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  getViews() {
    const sql = `
      SELECT table_name as name
      FROM information_schema.views
      WHERE table_schema = database()
      ORDER BY table_name
    `;

    return this.driverExecuteQuery({ query: sql }).then(res => res.data);
  }

  getRoutines() {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = database()
      ORDER BY routine_name
    `;

      const { data } = yield _this3.driverExecuteQuery({ query: sql });

      return data.map(function (row) {
        return {
          routineName: row.routine_name,
          routineType: row.routine_type
        };
      });
    })();
  }

  getTableColumns(table) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = database()
      AND table_name = ?
    `;
      const params = [table];

      const { data } = yield _this4.driverExecuteQuery({ query: sql, params });

      return data.map(function (row) {
        return {
          columnName: row.column_name,
          dataType: row.data_type
        };
      });
    })();
  }

  getTableTriggers(table) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_schema = database()
      AND event_object_table = ?
    `;
      const params = [table];
      const { data } = yield _this5.driverExecuteQuery({ query: sql, params });

      return data.map(function (row) {
        return row.trigger_name;
      });
    })();
  }

  getTableIndexes(database, table) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const sql = 'SHOW INDEX FROM ?? FROM ??';
      const params = [table, database];
      const { data } = yield _this6.driverExecuteQuery({ query: sql, params });

      return data.map(function (row) {
        return row.Key_name;
      });
    })();
  }

  getSchemas() {
    return Promise.resolve([]);
  }

  getTableReferences(table) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT referenced_table_name
      FROM information_schema.key_column_usage
      WHERE referenced_table_name IS NOT NULL
      AND table_schema = database()
      AND table_name = ?
    `;
      const params = [table];
      const { data } = yield _this7.driverExecuteQuery({ query: sql, params });

      return data.map(function (row) {
        return row.referenced_table_name;
      });
    })();
  }

  getTableColumns(database, table) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT constraint_name, column_name, referenced_table_name,
        CASE WHEN (referenced_table_name IS NOT NULL) THEN 'FOREIGN'
        ELSE constraint_name
        END as key_type
      FROM information_schema.key_column_usage
      WHERE table_schema = database()
      AND table_name = ?
      AND ((referenced_table_name IS NOT NULL) OR constraint_name LIKE '%PRIMARY%')
    `;
      const params = [table];
      const { data } = yield _this8.driverExecuteQuery({ query: sql, params });

      return data.map(function (row) {
        return {
          constraintName: `${row.constraint_name} KEY`,
          columnName: row.column_name,
          referencedTable: row.referenced_table_name,
          keyType: `${row.key_type} KEY`
        };
      });
    })();
  }

  getTableValues(tableName) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT * FROM ${tableName};
    `;
      const { data } = yield _this9.driverExecuteQuery({ query: sql });
      return data;
    })();
  }

  getQuerySelectTop(table, limit) {
    return `SELECT * FROM ${this.wrapIdentifier(table)} LIMIT ${limit}`;
  }

  filterDatabase(item, { database } = {}, databaseField) {
    if (!database) {
      return true;
    }

    const value = item[databaseField];
    if (typeof database === 'string') {
      return database === value;
    }

    const { only } = database;

    return !(only && only.length);
  }

  executeQuery(queryText) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      const { fields, data } = yield _this10.driverExecuteQuery({
        query: queryText
      });
      if (!data) {
        return [];
      }

      const commands = _this10.identifyCommands(queryText).map(function (item) {
        return item.type;
      });

      if (!_this10.isMultipleQuery(fields)) {
        return [_this10.parseRowQueryResult(data, fields, commands[0])];
      }

      return data.map(function (_, index) {
        return _this10.parseRowQueryResult(data[index], fields[index], commands[index]);
      });
    })();
  }

  query(queryText) {
    let pid = null;
    let canceling = false;
    const cancelable = createCancelablePromise(_extends({}, errors.CANCELED_BY_USER, {
      sqlectronError: 'CANCELED_BY_USER'
    }));

    return {
      execute() {
        var _this11 = this;

        return this.runWithConnection((() => {
          var _ref2 = _asyncToGenerator(function* (connection) {
            const connectionClient = { connection };
            const { data: dataPid } = yield _this11.driverExecuteQuery(connectionClient, {
              query: 'SELECT connection_id() AS pid'
            });

            pid = dataPid[0].pid;

            try {
              const data = yield Promise.race([cancelable.wait(), _this11.executeQuery(connectionClient, queryText)]);

              pid = null;

              return data;
            } catch (err) {
              if (canceling && err.code === _this11.mysqlErrors.CONNECTION_LOST) {
                canceling = false;
                err.sqlectronError = 'CANCELED_BY_USER';
              }

              throw err;
            } finally {
              cancelable.discard();
            }
          });

          return function (_x3) {
            return _ref2.apply(this, arguments);
          };
        })());
      },

      cancel() {
        var _this12 = this;

        return _asyncToGenerator(function* () {
          if (!pid) {
            throw new Error('Query not ready to be canceled');
          }

          canceling = true;

          try {
            yield _this12.driverExecuteQuery({
              query: `kill ${pid};`
            });
            cancelable.cancel();
          } catch (err) {
            canceling = false;
            throw new Error(err);
          }
        })();
      }
    };
  }

  getDatabases(filter) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      const sql = 'show databases';
      const { data } = yield _this13.driverExecuteQuery({ query: sql });

      return data.filter(function (item) {
        return _this13.filterDatabase(item, filter, 'Database');
      }).map(function (row) {
        return row.Database;
      });
    })();
  }

  getTableCreateScript(table) {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      const sql = `SHOW CREATE TABLE ${table}`;
      const { data } = yield _this14.driverExecuteQuery({ query: sql });
      return data.map(function (row) {
        return row['Create Table'];
      });
    })();
  }

  getViewCreateScript(view) {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      const sql = `SHOW CREATE VIEW ${view}`;
      const { data } = yield _this15.driverExecuteQuery({ query: sql });
      return data.map(function (row) {
        return row['Create View'];
      });
    })();
  }

  getRoutineCreateScript(routine, type) {
    var _this16 = this;

    return _asyncToGenerator(function* () {
      const sql = `SHOW CREATE ${type.toUpperCase()} ${routine}`;
      const { data } = yield _this16.driverExecuteQuery({ query: sql });
      return data.map(function (row) {
        return row[`Create ${type}`];
      });
    })();
  }

  wrapIdentifier(value) {
    return value !== '*' ? `\`${value.replace(/`/g, '``')}\`` : '*';
  }

  getSchema() {
    var _this17 = this;

    return _asyncToGenerator(function* () {
      const sql = "SELECT database() AS 'schema'";
      const { data } = yield _this17.driverExecuteQuery({ query: sql });
      return data[0].schema;
    })();
  }

  truncateAllTables() {
    var _this18 = this;

    return this.runWithConnection(_asyncToGenerator(function* () {
      const schema = yield _this18.getSchema();
      const sql = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = '${schema}'
        AND table_type NOT LIKE '%VIEW%'
      `;

      const { data } = yield _this18.driverExecuteQuery({ query: sql });

      const truncateAllQuery = data.map(function (row) {
        return `
          SET FOREIGN_KEY_CHECKS = 0;
          TRUNCATE TABLE ${_this18.wrapIdentifier(schema)}.${_this18.wrapIdentifier(row.table_name)};
          SET FOREIGN_KEY_CHECKS = 1;
        `;
      }).join('');

      return _this18.driverExecuteQuery({ query: truncateAllQuery });
    }));
  }

  parseRowQueryResult(data, fields, command) {
    // Fallback in case the identifier could not reconize the command
    const isSelect = Array.isArray(data);
    return {
      command: command || isSelect && 'SELECT',
      rows: isSelect ? data : [],
      fields: fields || [],
      rowCount: isSelect ? (data || []).length : undefined,
      affectedRows: !isSelect ? data.affectedRows : undefined
    };
  }

  isMultipleQuery(fields) {
    if (!fields) {
      return false;
    }
    if (!fields.length) {
      return false;
    }
    return Array.isArray(fields[0]) || fields[0] === undefined;
  }

  identifyCommands(queryText) {
    try {
      return identify(queryText);
    } catch (err) {
      return [];
    }
  }
}

function configDatabase(server, database) {
  const config = {
    host: server.config.host,
    port: server.config.port,
    user: server.config.user,
    password: server.config.password,
    database: database.database,
    multipleStatements: true,
    dateStrings: true,
    supportBigNumbers: true,
    bigNumberStrings: true
  };

  if (server.sshTunnel) {
    config.host = server.config.localHost;
    config.port = server.config.localPort;
  }

  if (server.config.ssl) {
    config.ssl = {
      // It is not the best recommend way to use SSL with node-mysql
      // https://github.com/felixge/node-mysql#ssl-options
      // But this way we have compatibility with all clients.
      rejectUnauthorized: false
    };
  }

  return config;
}

export default MysqlProviderFactory;
//# sourceMappingURL=MysqlProviderFactory.js.map