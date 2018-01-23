'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let PostgresqlProviderFactory = (() => {
  var _ref3 = _asyncToGenerator(function* (server, database) {
    const dbConfig = configDatabase(server, database);
    const logger = (0, _Logger2.default)('db:clients:postgresql');
    logger().debug('create driver client for postgres with config %j', dbConfig);

    const connection = {
      pool: new _pg2.default.Pool(dbConfig)
    };

    logger().debug('connected');

    const provider = new PostgresqlProvider(server, database, connection);
    yield provider.getSchema();

    return provider;
  });

  return function PostgresqlProviderFactory(_x, _x2) {
    return _ref3.apply(this, arguments);
  };
})();

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _sqlQueryIdentifier = require('sql-query-identifier');

var _BaseProvider = require('./BaseProvider');

var _BaseProvider2 = _interopRequireDefault(_BaseProvider);

var _Logger = require('../../Logger');

var _Logger2 = _interopRequireDefault(_Logger);

var _Utils = require('../../Utils');

var _Errors = require('../../Errors');

var _Errors2 = _interopRequireDefault(_Errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* eslint-disable */
// @TODO: Add flow annotation


/**
 * Do not convert DATE types to JS date.
 * It gnores of applying a wrong timezone to the date.
 *
 * @TODO: Do not convert as well these same types with array
 *        (types 1115, 1182, 1185)
 */
_pg2.default.types.setTypeParser(1082, 'text', val => val); // date
_pg2.default.types.setTypeParser(1114, 'text', val => val); // timestamp without timezone
_pg2.default.types.setTypeParser(1184, 'text', val => val); // timestamp

let PostgresqlProvider = class PostgresqlProvider extends _BaseProvider2.default {

  constructor(server, database, connection) {
    super(server, database);
    this.pgErrors = {
      CANCELED: '57014'
    };
    this.connection = connection;
  }

  disconnect() {
    this.connection.pool.end();
  }

  listTables(filter) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const schemaFilter = _this.buildSchemaFilter(filter, 'table_schema');
      const sql = `
      SELECT
        table_schema as schema,
        table_name as name
      FROM information_schema.tables
      WHERE table_type NOT LIKE '%VIEW%'
      ${schemaFilter ? `AND ${schemaFilter}` : ''}
      ORDER BY table_schema, table_name
    `;

      const data = yield _this.driverExecuteQuery({ query: sql });

      return data.rows;
    })();
  }

  listViews(filter) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const schemaFilter = _this2.buildSchemaFilter(filter, 'table_schema');
      const sql = `
      SELECT
        table_schema as schema,
        table_name as name
      FROM information_schema.views
      ${schemaFilter ? `WHERE ${schemaFilter}` : ''}
      ORDER BY table_schema, table_name
    `;

      const data = yield _this2.driverExecuteQuery({ query: sql });

      return data.rows;
    })();
  }

  listRoutines(filter) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const schemaFilter = _this3.buildSchemaFilter(filter, 'routine_schema');
      const sql = `
      SELECT
        routine_schema,
        routine_name,
        routine_type
      FROM information_schema.routines
      ${schemaFilter ? `WHERE ${schemaFilter}` : ''}
      GROUP BY routine_schema, routine_name, routine_type
      ORDER BY routine_schema, routine_name
    `;

      const data = yield _this3.driverExecuteQuery({ query: sql });

      return data.rows.map(function (row) {
        return {
          schema: row.routine_schema,
          routineName: row.routine_name,
          routineType: row.routine_type
        };
      });
    })();
  }

  listTableColumns(database, table, defaultSchema) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this4.getSchema());
      const sql = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = $1
      AND table_name = $2
    `;

      const params = [schema, table];

      const data = yield _this4.driverExecuteQuery({
        query: sql,
        params
      });

      return data.rows.map(function (row) {
        return {
          columnName: row.column_name,
          dataType: row.data_type
        };
      });
    })();
  }

  listTableTriggers(table, defaultSchema) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this5.getSchema());
      const sql = `
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_schema = $1
      AND event_object_table = $2
    `;
      const params = [schema, table];
      const data = yield _this5.driverExecuteQuery({ query: sql, params });
      return data.rows.map(function (row) {
        return row.trigger_name;
      });
    })();
  }

  listTableIndexes(table, defaultSchema) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this6.getSchema());
      const sql = `
      SELECT indexname as index_name
      FROM pg_indexes
      WHERE schemaname = $1
      AND tablename = $2
    `;
      const params = [schema, table];
      const data = yield _this6.driverExecuteQuery({ query: sql, params });

      return data.rows.map(function (row) {
        return row.index_name;
      });
    })();
  }

  listSchemas(filter) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const schemaFilter = _this7.buildSchemaFilter(filter);
      const sql = `
      SELECT schema_name
      FROM information_schema.schemata
      ${schemaFilter ? `WHERE ${schemaFilter}` : ''}
      ORDER BY schema_name
    `;
      const data = yield _this7.driverExecuteQuery({ query: sql });

      return data.rows.map(function (row) {
        return row.schema_name;
      });
    })();
  }

  getTableReferences(table, defaultSchema) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this8.getSchema());
      const sql = `
      SELECT ctu.table_name AS referenced_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.constraint_table_usage AS ctu
      ON ctu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
      AND tc.table_schema = $2
    `;
      const params = [table, schema];
      const data = yield _this8.driverExecuteQuery({ query: sql, params });

      return data.rows.map(function (row) {
        return row.referenced_table_name;
      });
    })();
  }

  getTableColumns(database, table, defaultSchema) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this9.getSchema());
      const sql = `
      SELECT
        tc.constraint_name,
        kcu.column_name,
        CASE WHEN tc.constraint_type LIKE '%FOREIGN%' THEN ctu.table_name
        ELSE NULL
        END AS referenced_table_name,
        tc.constraint_type
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        USING (constraint_schema, constraint_name)
      JOIN information_schema.constraint_table_usage as ctu
        USING (constraint_schema, constraint_name)
      WHERE tc.table_name = $1
      AND tc.table_schema = $2
      AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY')

    `;
      const params = [table, schema];
      const data = yield _this9.driverExecuteQuery({ query: sql, params });

      return data.rows.map(function (row) {
        return {
          constraintName: row.constraint_name,
          columnName: row.column_name,
          referencedTable: row.referenced_table_name,
          keyType: row.constraint_type
        };
      });
    })();
  }

  query(queryText) {
    let pid = null;
    let canceling = false;
    const cancelable = (0, _Utils.createCancelablePromise)(_extends({}, _Errors2.default.CANCELED_BY_USER, {
      sqlectronError: 'CANCELED_BY_USER'
    }));

    return {
      execute() {
        var _this10 = this;

        return this.runWithConnection(_asyncToGenerator(function* () {
          // const connectionClient = { connection };

          const dataPid = yield _this10.driverExecuteQuery({
            query: 'SELECT pg_backend_pid() AS pid'
          });

          pid = dataPid.rows[0].pid;

          try {
            const data = yield Promise.race([cancelable.wait(), _this10.executeQuery(_this10.connection, queryText)]);

            pid = null;

            return data;
          } catch (err) {
            if (canceling && err.code === _this10.pgErrors.CANCELED) {
              canceling = false;
              err.sqlectronError = 'CANCELED_BY_USER';
            }

            throw err;
          } finally {
            cancelable.discard();
          }
        }));
      },

      cancel() {
        var _this11 = this;

        return _asyncToGenerator(function* () {
          if (!pid) {
            throw new Error('Query not ready to be canceled');
          }

          canceling = true;
          try {
            const data = yield _this11.driverExecuteQuery({
              query: `SELECT pg_cancel_backend(${pid});`
            });

            if (!data.rows[0].pg_cancel_backend) {
              throw new Error(`Failed canceling query with pid ${pid}.`);
            }

            cancelable.cancel();
          } catch (err) {
            canceling = false;
            throw err;
          }
        })();
      }
    };
  }

  executeQuery(queryText) {
    var _this12 = this;

    return _asyncToGenerator(function* () {
      const data = yield _this12.driverExecuteQuery({
        query: queryText,
        multiple: true
      });
      const commands = _this12.identifyCommands(queryText).map(function (item) {
        return item.type;
      });

      return data.map(function (result, index) {
        return _this12.parseRowQueryResult(result, commands[index]);
      });
    })();
  }

  listDatabases(filter) {
    var _this13 = this;

    return _asyncToGenerator(function* () {
      const databaseFilter = _this13.buildDatabseFilter(filter, 'datname');
      const sql = `
      SELECT datname
      FROM pg_database
      WHERE datistemplate = $1
      ${databaseFilter ? `AND ${databaseFilter}` : ''}
      ORDER BY datname
    `;
      const params = [false];
      const data = yield _this13.driverExecuteQuery({ query: sql, params });
      return data.rows.map(function (row) {
        return row.datname;
      });
    })();
  }

  getQuerySelectTop(table, limit, defaultSchema) {
    var _this14 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this14.getSchema());
      return `SELECT * FROM ${_this14.wrapIdentifier(schema)}.${_this14.wrapIdentifier(table)} LIMIT ${limit}`;
    })();
  }

  getTableCreateScript(table, defaultSchema) {
    var _this15 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this15.getSchema());
      // Reference http://stackoverflow.com/a/32885178
      const sql = `
      SELECT
        'CREATE TABLE ' || quote_ident(tabdef.schema_name) || '.' || quote_ident(tabdef.table_name) || E' (\n' ||
        array_to_string(
          array_agg(
            '  ' || quote_ident(tabdef.column_name) || ' ' ||  tabdef.type || ' '|| tabdef.not_null
          )
          , E',\n'
        ) || E'\n);\n' ||
        CASE WHEN tc.constraint_name IS NULL THEN ''
            ELSE E'\nALTER TABLE ' || quote_ident($2) || '.' || quote_ident(tabdef.table_name) ||
            ' ADD CONSTRAINT ' || quote_ident(tc.constraint_name)  ||
            ' PRIMARY KEY ' || '(' || substring(constr.column_name from 0 for char_length(constr.column_name)-1) || ')'
        END AS createtable
      FROM
      ( SELECT
          c.relname AS table_name,
          a.attname AS column_name,
          pg_catalog.format_type(a.atttypid, a.atttypmod) AS type,
          CASE
            WHEN a.attnotnull THEN 'NOT NULL'
          ELSE 'NULL'
          END AS not_null,
          n.nspname as schema_name
        FROM pg_class c,
        pg_attribute a,
        pg_type t,
        pg_namespace n
        WHERE c.relname = $1
        AND a.attnum > 0
        AND a.attrelid = c.oid
        AND a.atttypid = t.oid
        AND n.oid = c.relnamespace
        AND n.nspname = $2
        ORDER BY a.attnum DESC
      ) AS tabdef
      LEFT JOIN information_schema.table_constraints tc
      ON  tc.table_name       = tabdef.table_name
      AND tc.table_schema     = tabdef.schema_name
      AND tc.constraint_Type  = 'PRIMARY KEY'
      LEFT JOIN LATERAL (
        SELECT column_name || ', ' AS column_name
        FROM   information_schema.key_column_usage kcu
        WHERE  kcu.constraint_name = tc.constraint_name
        AND kcu.table_name = tabdef.table_name
        AND kcu.table_schema = tabdef.schema_name
        ORDER BY ordinal_position
      ) AS constr ON true
      GROUP BY tabdef.schema_name, tabdef.table_name, tc.constraint_name, constr.column_name;
    `;
      const params = [table, schema];
      const data = yield _this15.driverExecuteQuery({ query: sql, params });
      return data.rows.map(function (row) {
        return row.createtable;
      });
    })();
  }

  getViewCreateScript(view, defaultSchema) {
    var _this16 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this16.getSchema());
      const createViewSql = `CREATE OR REPLACE VIEW ${_this16.wrapIdentifier(schema)}.${view} AS`;
      const sql = 'SELECT pg_get_viewdef($1::regclass, true)';
      const params = [view];
      const data = yield _this16.driverExecuteQuery({ query: sql, params });
      return data.rows.map(function (row) {
        return `${createViewSql}\n${row.pg_get_viewdef}`;
      });
    })();
  }

  getRoutineCreateScript(routine, _, defaultSchema) {
    var _this17 = this;

    return _asyncToGenerator(function* () {
      const schema = defaultSchema || (yield _this17.getSchema());
      const sql = `
      SELECT pg_get_functiondef(p.oid)
      FROM pg_proc p
      LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
      WHERE proname = $1
      AND n.nspname = $2
    `;
      const params = [routine, schema];
      const data = yield _this17.driverExecuteQuery({ query: sql, params });

      return data.rows.map(function (row) {
        return row.pg_get_functiondef;
      });
    })();
  }

  wrapIdentifier(value) {
    if (value === '*') {
      return value;
    }

    const matched = value.match(/(.*?)(\[[0-9]\])/); // eslint-disable-line no-useless-escape

    return matched ? this.wrapIdentifier(matched[1]) + matched[2] : `"${value.replace(/"/g, '""')}"`;
  }

  getSchema() {
    var _this18 = this;

    return _asyncToGenerator(function* () {
      const sql = 'SELECT current_schema() AS schema';
      const data = yield _this18.driverExecuteQuery({ query: sql });
      return data.rows[0].schema;
    })();
  }

  truncateAllTables(schema) {
    var _this19 = this;

    return _asyncToGenerator(function* () {
      return _this19.runWithConnection(_asyncToGenerator(function* () {
        const sql = `
        SELECT quote_ident(table_name) as table_name
        FROM information_schema.tables
        WHERE table_schema = $1
        AND table_type NOT LIKE '%VIEW%'
      `;

        const params = [schema];

        const data = yield _this19.driverExecuteQuery({ query: sql, params });

        const truncateAll = data.rows.map(function (row) {
          return `
          TRUNCATE TABLE ${_this19.wrapIdentifier(schema)}.${_this19.wrapIdentifier(row.table_name)}
          RESTART IDENTITY CASCADE;
        `;
        }).join('');

        yield _this19.driverExecuteQuery({
          query: truncateAll,
          multiple: true
        });
      }));
    })();
  }

  parseRowQueryResult(data, command) {
    const isSelect = data.command === 'SELECT';
    return {
      command: command || data.command,
      rows: data.rows,
      fields: data.fields,
      rowCount: isSelect ? data.rowCount : undefined,
      affectedRows: !isSelect && !isNaN(data.rowCount) ? data.rowCount : undefined
    };
  }

  identifyCommands(queryText) {
    try {
      return (0, _sqlQueryIdentifier.identify)(queryText);
    } catch (err) {
      return [];
    }
  }

  driverExecuteQuery(queryArgs) {
    const runQuery = () => {
      const args = {
        text: queryArgs.query,
        values: queryArgs.params,
        multiResult: queryArgs.multiple
      };

      // node-postgres has support for Promise query
      // but that always returns the "fields" property empty
      return new Promise((resolve, reject) => {
        this.connection.query(args, (err, data) => {
          if (err) return reject(err);
          return resolve(data);
        });
      });
    };

    return this.connection ? runQuery() : this.runWithConnection(runQuery);
  }

  runWithConnection(run) {
    var _this20 = this;

    return _asyncToGenerator(function* () {
      yield _this20.connection.pool.connect();

      try {
        return yield run();
      } finally {
        _this20.connection.release();
      }
    })();
  }
};


function configDatabase(server, database) {
  const config = {
    host: server.config.host,
    port: server.config.port,
    user: server.config.user,
    password: server.config.password,
    database: database.database,
    max: 5 // max idle connections per time (30 secs)
  };

  if (server.sshTunnel) {
    config.host = server.config.localHost;
    config.port = server.config.localPort;
  }

  if (server.config.ssl) {
    config.ssl = server.config.ssl;
  }

  return config;
}

exports.default = PostgresqlProviderFactory;
//# sourceMappingURL=PostgresqlProviderFactory.js.map