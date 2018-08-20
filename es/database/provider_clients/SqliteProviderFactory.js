var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let SqliteFactory = (() => {
  var _ref5 = _asyncToGenerator(function* (server, database) {
    const logger = createLogger('db:clients:sqlite');
    const dbConfig = configDatabase(server, database);
    const connection = { dbConfig };
    logger().debug('create driver client for sqlite3 with config %j', dbConfig);

    const provider = new SqliteProvider(server, database, connection);

    // Light solution to test connection with with the server
    yield provider.driverExecuteQuery({ query: 'SELECT sqlite_version()' });

    return provider;
  });

  return function SqliteFactory(_x3, _x4) {
    return _ref5.apply(this, arguments);
  };
})();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import sqlite3 from 'sqlite3';
import getPort from 'get-port';
import cors from 'cors';
import { identify } from 'sql-query-identifier';

import createLogger from '../../Logger';
import BaseProvider from './BaseProvider';

/**
 * Contains data about a column/property/key in a table
 */


// @TODO: Why does logging in constructor vs logging in driver execute
// return two different things
class SqliteProvider extends BaseProvider {

  constructor(server, database, connection) {
    super(server, database);
    this.privateGraphQLServerIsRunning = false;
    this.connection = connection;
  }

  // @NOT_SUPPORTED


  /**
   * @private
   */
  disconnect() {
    // SQLite does not have connection poll. So we open and close connections
    // for every query request. This allows multiple request at same time by
    // using a different thread for each connection.
    // This may cause connection limit problem. So we may have to change this at some point.
  }

  wrapIdentifier(value) {
    if (value === '*') {
      return value;
    }

    const matched = value.match(/(.*?)(\[[0-9]\])/); // eslint-disable-line no-useless-escape

    return matched ? this.wrapIdentifier(matched[1]) + matched[2] : `"${value.replace(/"/g, '""')}"`;
  }

  getQuerySelectTop(table, limit) {
    return Promise.resolve(`SELECT * FROM ${this.wrapIdentifier(table)} LIMIT ${limit}`);
  }

  getLogs() {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this.logs.map(function (log) {
        return _extends({}, log, {
          query: log.query.replace(/(\r\n|\n|\r)/gm, '')
        });
      });
    })();
  }

  /**
   * @TODO
   */
  setLogs() {
    return _asyncToGenerator(function* () {
      return Promise.resolve();
    })();
  }

  query(queryText) {
    let queryConnection = null;
    const self = this;

    return Promise.resolve({
      execute() {
        return self.runWithConnection(() => {
          try {
            queryConnection = self.connection;
            return self.executeQuery(queryText);
          } catch (err) {
            if (err.code === self.CANCELED) {
              err.sqlectronError = 'CANCELED_BY_USER';
            }
            throw err;
          }
        });
      },
      cancel() {
        if (!queryConnection) {
          throw new Error('Query not ready to be canceled');
        }
        queryConnection.interrupt();
      }
    });
  }

  executeQuery(queryText) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const result = yield _this2.driverExecuteQuery({
        query: queryText,
        multiple: true
      });
      return result.map(_this2.parseRowQueryResult);
    })();
  }

  getConnectionType() {
    return Promise.resolve('local');
  }

  /**
   * Inserts a record into a table. If values is an empty object, will insert
   * an empty row
   */
  insert(table, rows) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const tableColumns = yield _this3.getTableColumnNames(table);
      const rowSqls = rows.map(function (row) {
        const rowData = tableColumns.map(function (key) {
          return row[key] ? `'${row[key]}'` : 'NULL';
        });
        return `(${rowData.join(', ')})`;
      });
      const query = `
     INSERT INTO ${table} (${tableColumns.join(', ')})
     VALUES
     ${rowSqls.join(',\n')};
    `;
      return _this3.driverExecuteQuery({ query }).then(function (res) {
        return res.data;
      });
    })();
  }

  /**
   * Each item in records will update new values in changes
   * @param changes - Object contaning column:newValue pairs
   * @param rowPrimaryKey - The row's (record's) identifier
   */
  update(table, records) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const tablePrimaryKey = yield _this4.getPrimaryKeyColumn(table);
      const queries = records.map(function (record) {
        const columnNames = Object.keys(record.changes);
        const edits = columnNames.map(function (columnName) {
          return `${columnName} = '${record.changes[columnName]}'`;
        });
        return `
        UPDATE ${table}
        SET ${edits.join(', ')}
        WHERE ${tablePrimaryKey.name} = ${record.rowPrimaryKeyValue};
    `;
      });
      const finalQuery = queries.join('\n');
      return _this4.driverExecuteQuery({ query: finalQuery }).then(function (res) {
        return res.data;
      });
    })();
  }

  getGraphQLServerPort() {
    return this.graphQLServerPort;
  }

  startGraphQLServer() {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (_this5.graphQLServerIsRunning()) {
        return;
      }

      // See https://github.com/airbnb/babel-plugin-dynamic-import-node/issues/47
      const [graphqlHTTP, tuql, express] = yield Promise.all([import('express-graphql').then(function (x) {
        return x.default || x;
      }), import('@falcon-client/tuql').then(function (x) {
        return x.default || x;
      }), import('express').then(function (x) {
        return x.default || x;
      })]);

      const { buildSchemaFromDatabase } = tuql;
      const app = express();

      const schema = yield buildSchemaFromDatabase(_this5.connection.dbConfig.database);
      const port = yield getPort();
      app.use('/graphql', cors(), graphqlHTTP({ schema }));

      yield new Promise(function (resolve) {
        _this5.graphQLServer = app.listen(port, function () {
          _this5.graphQLServerPort = port;
          console.log(` > Running at http://localhost:${port}/graphql`);
          resolve();
        });
        _this5.privateGraphQLServerIsRunning = true;
      });
    })();
  }

  stopGraphQLServer() {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      if (_this6.graphQLServerIsRunning()) {
        _this6.graphQLServer.close();
        _this6.graphQLServer = undefined;
        _this6.graphQLServerPort = undefined;
        _this6.privateGraphQLServerIsRunning = false;
      }
    })();
  }

  graphQLServerIsRunning() {
    return this.privateGraphQLServerIsRunning;
  }

  /**
   * Deletes records from a table. Finds table's primary key then deletes
   * specified columns
   */
  delete(table, keys) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const primaryKey = yield _this7.getPrimaryKeyColumn(table);
      const conditions = keys.map(function (key) {
        return `${primaryKey.name} = "${key}"`;
      });
      const query = `
      DELETE FROM ${table}
      WHERE ${conditions.join(' OR ')}
    `;
      const results = yield _this7.driverExecuteQuery({ query }).then(function (res) {
        return res.data;
      });
      return results;
    })();
  }

  getVersion() {
    return this.driverExecuteQuery({ query: 'SELECT sqlite_version()' }).then(res => res.data[0]['sqlite_version()']);
  }

  /**
   * Gets data about columns (properties) in a table
   */
  getTableColumns(table, raw = false) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const sql = `PRAGMA table_info(${table})`;
      const rawResults = _this8.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
      return raw ? rawResults : rawResults.then(function (res) {
        return res;
      });
    })();
  }

  getPrimaryKeyColumn(table) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      const columns = yield _this9.getTableColumns(table);
      const primaryKeyColumn = columns.find(function (key) {
        return key.pk === 1;
      });
      if (!primaryKeyColumn) {
        throw new Error(`No primary key exists in table ${table}`);
      }
      return primaryKeyColumn;
    })();
  }

  getTableValues(table) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT *
      FROM '${table}';
    `;
      return _this10.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  getTableNames() {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT name
      FROM sqlite_master
      WHERE type='table'
    `;
      return _this11.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data.map(function (table) {
          return table.name;
        });
      });
    })();
  }

  /**
   * Renames a table in the database
   */
  renameTable(oldTableName, newTableName) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      ALTER TABLE ${oldTableName}
        RENAME TO ${newTableName};
    `;
      return _this12.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  /**
   * Drops a table from the database
   */
  dropTable(table) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      DROP TABLE ${table};
    `;
      return _this13.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  /**
   * Adds a column to the table
   */
  addTableColumn(table, columnName, columnType) {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      const sql = `
    ALTER TABLE ${table}
      ADD COLUMN "${columnName}" ${columnType};
    `;
      return _this14.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  // TODO: This needs to be wrapped in a transaction
  renameTableColumns(table, columns) {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      // Used to make verify that each columns actually exist within the table
      const originalColumns = yield _this15.getTableColumnNames(table);
      columns.forEach(function (column) {
        if (!originalColumns.includes(column.oldColumnName)) {
          throw new Error(`${column.oldColumnName} is not a column in ${table}`);
        }
      });

      const propertiesArr = yield _this15.getTablePropertiesSql(table);
      let sql = `
    PRAGMA foreign_keys=off;
    BEGIN TRANSACTION;
    ALTER TABLE ${table} RENAME TO ${table}_temp;


    CREATE TABLE ${table} (${propertiesArr.join()}
    );

    INSERT INTO ${table} (${originalColumns.join(', ')})
      SELECT ${originalColumns.join(', ')}
      FROM ${table}_temp;

    DROP TABLE ${table}_temp;

    COMMIT;
    PRAGMA foreign_keys=on;`;

      // @TODO: Can probably make this more efficient
      columns.forEach(function (column) {
        sql = sql.replace(column.oldColumnName, column.newColumnName);
      });

      return _this15.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  /**
   * Drops columns from a table. Does this by creating a new table then
   * importing the data from the original and ignorng columnsToDrop
   * @param {*} table the table to drop columns from
   * @param {*} columnsToDrop array of columns which client wants to drop
   */
  dropTableColumns(table, columnsToDrop) {
    var _this16 = this;

    return _asyncToGenerator(function* () {
      const temp = yield _this16.getTableColumnNames(table);

      columnsToDrop.forEach(function (e) {
        if (!temp.includes(e)) {
          throw new Error(`${e} is not a column in ${table}`);
        }
      });

      const permittedColumns = temp.filter(function (col) {
        return !columnsToDrop.includes(col);
      });
      // Create an sql statement that creates a new table excluding dropped columns
      const propertiesArr = yield _this16.getTablePropertiesSql(table);
      const filteredPropertiesArr = propertiesArr.filter(function (row) {
        return !columnsToDrop.includes(row.substring(row.indexOf('"') + 1, row.lastIndexOf('"')));
      });
      const sql = `
    PRAGMA foreign_keys=off;
    BEGIN TRANSACTION;
    ALTER TABLE ${table} RENAME TO ${table}_temp;


    CREATE TABLE ${table} (${filteredPropertiesArr.join()}
    );

    INSERT INTO ${table} (${permittedColumns.join(', ')})
      SELECT ${permittedColumns.join(', ')}
      FROM ${table}_temp;

    DROP TABLE ${table}_temp;

    COMMIT;
    PRAGMA foreign_keys=on;`;
      return _this16.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  /**
   * Returns the sql statement to generate this table. Returns it in a uniform
   * format
   * Format - after "(", each column creation and foreign key constraint
   * will be in its own line
   */
  getCreateTableSql(table) {
    var _this17 = this;

    return _asyncToGenerator(function* () {
      const createTableArgs = yield _this17.getTablePropertiesSql(table);
      return `CREATE TABLE ${table} (${createTableArgs.join()})`;
    })();
  }

  /**
   * Used to get the arguments within a CREATE TABLE table(...)
   * in a format such that getCreateTableSql() and dropTable() can
   */
  getTablePropertiesSql(table) {
    var _this18 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT sql
      FROM sqlite_master
      WHERE name='${table}';
    `;
      const creationScript = yield _this18.driverExecuteQuery({
        query: sql
      }).then(function (res) {
        return res.data[0].sql.trim();
      });

      // Gets all the text between '(' and ')' of script
      const betweenParaentheses = creationScript.substring(creationScript.indexOf('(') + 1).replace(/\)$/, '').split(',');

      // Formats each argument to start on a new line with no extra white space
      // and wraps the column name in an "<identifier>" format. Does not
      // wrap constraints
      return betweenParaentheses.map(function (row) {
        return `\n\t${row.includes('PRIMARY') || row.includes('FOREIGN') ? row.trim().replace(/\r|\n|/g, '').replace(/\s{2,}/g, ' ') : row.trim().replace(/\r|\n|/g, '').replace(/\s{2,}/g, ' ').replace(/\[|\]|"|'/g, '').replace(/\[\w+\]|"\w+"|'\w+'|\w+/, '"$&"')}`;
      });
    })();
  }

  listTables() {
    var _this19 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT name
      FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `;
      return _this19.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  listViews() {
    var _this20 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT name
      FROM sqlite_master
      WHERE type = 'view'
    `;
      return _this20.driverExecuteQuery({ query: sql }).then(function (res) {
        return res.data;
      });
    })();
  }

  // @NOT_SUPPORTED
  listRoutines() {
    return Promise.resolve([]);
  }

  getTableColumnNames(table) {
    var _this21 = this;

    return _asyncToGenerator(function* () {
      _this21.checkIsConnected();
      const columns = yield _this21.listTableColumns(table);
      return columns.map(function (column) {
        return column.columnName;
      });
    })();
  }

  // @TODO: Find out how this is different from getTableColumns(table)
  listTableColumns(table) {
    var _this22 = this;

    return _asyncToGenerator(function* () {
      const sql = `PRAGMA table_info(${table})`;
      const { data } = yield _this22.driverExecuteQuery({ query: sql });

      return data.map(function (row) {
        return {
          columnName: row.name,
          dataType: row.type
        };
      });
    })();
  }

  listTableTriggers(table) {
    var _this23 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT name
      FROM sqlite_master
      WHERE type = 'trigger'
        AND tbl_name = '${table}'
    `;
      const { data } = yield _this23.driverExecuteQuery({ query: sql });

      return data.map(function (row) {
        return row.name;
      });
    })();
  }

  listTableIndexes(table) {
    var _this24 = this;

    return _asyncToGenerator(function* () {
      const sql = `PRAGMA INDEX_LIST('${table}')`;
      const { data } = yield _this24.driverExecuteQuery({ query: sql });

      return data.map(function (row) {
        return row.name;
      });
    })();
  }

  // @NOT_SUPPORTED
  listSchemas() {
    return Promise.resolve([]);
  }

  listDatabases() {
    var _this25 = this;

    return _asyncToGenerator(function* () {
      const result = yield _this25.driverExecuteQuery({
        query: 'PRAGMA database_list;'
      });

      if (!result) {
        throw new Error('No results');
      }

      return result.data.map(function (row) {
        return row.file || ':memory:';
      });
    })();
  }

  // @TODO
  getTableReferences() {
    return Promise.resolve([]);
  }

  getTableCreateScript(table) {
    var _this26 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT sql
      FROM sqlite_master
      WHERE name = '${table}';
    `;
      const { data } = yield _this26.driverExecuteQuery({ query: sql });

      return data.map(function (row) {
        return row.sql;
      });
    })();
  }

  getViewCreateScript(view) {
    var _this27 = this;

    return _asyncToGenerator(function* () {
      const sql = `
      SELECT sql
      FROM sqlite_master
      WHERE name = '${view}';
    `;
      const { data } = yield _this27.driverExecuteQuery({ query: sql });

      return data.map(function (row) {
        return row.sql;
      });
    })();
  }

  // @NOT_SUPPORTED
  getRoutineCreateScript() {
    return _asyncToGenerator(function* () {
      return '';
    })();
  }

  /**
   * SQLITE is a local file in there's no concept of being 'online'. Or
   * are we online when we can verify that the path to the sqlite database
   * exists?
   */
  isOnline() {
    return Promise.resolve(true);
  }

  truncateTable(table) {
    var _this28 = this;

    return this.runWithConnection(_asyncToGenerator(function* () {
      const truncateSingleQuery = `DELETE FROM ${table}`;

      // @TODO: Check if sqlite_sequence exists then execute:
      //        DELETE FROM sqlite_sequence WHERE name='${table}';
      const result = yield _this28.driverExecuteQuery({
        query: truncateSingleQuery
      });
      return result;
    }));
  }

  truncateAllTables() {
    var _this29 = this;

    return this.runWithConnection(_asyncToGenerator(function* () {
      const tables = yield _this29.listTables();

      const truncateAllQuery = tables.map(function (table) {
        return `
          DELETE FROM ${table.name};
        `;
      }).join('');

      // @TODO: Check if sqlite_sequence exists then execute:
      //        DELETE FROM sqlite_sequence WHERE name='${table}';
      const result = yield _this29.driverExecuteQuery({ query: truncateAllQuery });
      return result;
    }));
  }

  parseRowQueryResult({ data, statement, changes }) {
    // Fallback in case the identifier could not reconize the command
    const isSelect = Array.isArray(data);
    const rows = data || [];

    return {
      rows,
      command: statement.type || isSelect && 'SELECT',
      fields: Object.keys(rows[0] || {}).map(name => ({ name })),
      rowCount: rows.length,
      affectedRows: changes || 0
    };
  }

  identifyCommands(queryText) {
    try {
      return identify(queryText, { strict: false });
    } catch (err) {
      return [];
    }
  }

  /**
   * 1. Various methods use driverExecutQuery to execute sql statements.
   * 2. driverExecuteQuery creates identifyStatementsRunQuery() which uses
   * the also created runQuery()
   * 3. driverExecuteQuery calls runWithConnection(identifyStatementsRunQuery)
   * 4. runWithConnection creates a node-sqlite3 db object which uses identifyStatementsRunQuery
   * to executes the sql statement and runQuery is given to node-sqlite3 to
   * return the results of the query
   * @private
   */
  driverExecuteQuery(queryArgs) {
    var _this30 = this;

    return _asyncToGenerator(function* () {
      const runQuery = function (connection, { executionType, text }) {
        return new Promise(function (resolve, reject) {
          const method = _this30.resolveExecutionType(executionType);
          // Callback used by node-sqlite3 to return results of query
          function queryCallback(err, data) {
            if (err) {
              return reject(err);
            }
            return resolve({
              data,
              lastID: this.lastID,
              changes: this.changes
            });
          }

          switch (method) {
            case 'run':
              {
                return connection.run(text, queryArgs.params || [], queryCallback);
              }
            case 'all':
              {
                return connection.all(text, queryArgs.params || [], queryCallback);
              }
            default:
              {
                throw new Error(`Unknown connection method "${method}"`);
              }
          }
        });
      };

      // Called in runWithConnection. connection is the node-sqlite3 db object
      const identifyStatementsRunQuery = (() => {
        var _ref3 = _asyncToGenerator(function* (connection) {
          const statements = _this30.identifyCommands(queryArgs.query);
          const results = statements.map(function (statement) {
            return runQuery(connection, statement).then(function (result) {
              return _extends({}, result, {
                statement
              });
            });
          });

          return queryArgs.multiple ? Promise.all(results) : Promise.resolve(results[0]);
        });

        return function identifyStatementsRunQuery(_x) {
          return _ref3.apply(this, arguments);
        };
      })();

      return _this30.connection.connection ? yield identifyStatementsRunQuery(_this30.connection.connection) : _this30.runWithConnection(identifyStatementsRunQuery);
    })();
  }

  runWithConnection(run) {
    var _this31 = this;

    return new Promise((resolve, reject) => {
      sqlite3.verbose();

      const db = new sqlite3.Database(this.connection.dbConfig.database, (() => {
        var _ref4 = _asyncToGenerator(function* (err) {
          if (err) {
            return reject(err);
          }

          // duration is given in nanoseconds
          db.on('profile', function (query, duration) {
            _this31.logs.push({
              query,
              duration,
              type: 'profile'
            });
          });

          try {
            db.serialize();
            return resolve(run(db));
          } catch (runErr) {
            reject(runErr);
          } finally {
            db.close();
          }
        });

        return function (_x2) {
          return _ref4.apply(this, arguments);
        };
      })());
    });
  }

  /**
   * @private
   */
  resolveExecutionType(executionType) {
    switch (executionType) {
      case 'MODIFICATION':
        return 'run';
      default:
        return 'all';
    }
  }

  /**
   * @private
   */
  checkUnsupported(exportOptions) {
    const unsupportedOptions = ['views', 'procedures', 'functions', 'rows'];
    const hasUnsupported = Object.keys(exportOptions).some(option => unsupportedOptions.includes(option));

    if (hasUnsupported) {
      throw new Error(`Unsupported properties passed: ${JSON.stringify(exportOptions)}`);
    }
  }
}

function configDatabase(server, database) {
  return {
    database: database.database
  };
}

export default SqliteFactory;
//# sourceMappingURL=SqliteProviderFactory.js.map