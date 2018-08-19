#!/usr/bin/env node
'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressGraphql = require('express-graphql');

var _expressGraphql2 = _interopRequireDefault(_expressGraphql);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _commandLineArgs = require('command-line-args');

var _commandLineArgs2 = _interopRequireDefault(_commandLineArgs);

var _commandLineUsage = require('command-line-usage');

var _commandLineUsage2 = _interopRequireDefault(_commandLineUsage);

var _graphql = require('graphql');

var _schema = require('../builders/schema');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FilePath = path => {
  if (!_fs2.default.existsSync(path)) {
    console.log('');
    console.error(` > File does not exist: ${path}`);
    process.exit();
  }

  return _fs2.default.realpathSync(path);
};

const optionDefinitions = [{
  name: 'graphiql',
  alias: 'g',
  type: Boolean,
  description: 'Enable graphiql UI'
}, {
  name: 'db',
  type: FilePath,
  defaultValue: 'database.sqlite',
  description: 'Path to the sqlite database you want to create a graphql endpoint for'
}, {
  name: 'infile',
  type: FilePath,
  description: 'Path to a sql file to bootstrap an in-memory database with'
}, {
  name: 'port',
  alias: 'p',
  type: Number,
  defaultValue: 4000,
  description: 'Port to run on (Default: 4000)'
}, {
  name: 'schema',
  alias: 's',
  type: Boolean,
  description: 'Write string representation of schema to stdout'
}, { name: 'help', alias: 'h', type: Boolean, description: 'This help output' }];

const options = (0, _commandLineArgs2.default)(optionDefinitions);

if (options.help) {
  const usage = (0, _commandLineUsage2.default)([{
    header: 'tuql',
    content: '[underline]{tuql} turns just about any sqlite database into a graphql endpoint, including inferring associations'
  }, {
    header: 'Basic usage',
    content: 'tuql --db path/to/db.sqlite'
  }, {
    header: 'Options',
    optionList: optionDefinitions
  }, {
    content: 'Project home: [underline]{https://github.com/bradleyboy/tuql}'
  }]);
  console.log(usage);
  process.exit();
}

const promise = options.infile ? (0, _schema.buildSchemaFromInfile)(options.infile) : (0, _schema.buildSchemaFromDatabase)(options.db);

if (options.schema) {
  promise.then(schema => process.stdout.write((0, _graphql.printSchema)(schema)));
} else {
  const app = (0, _express2.default)();

  const message = options.infile ? `Creating in-memory database with ${options.infile}` : `Reading schema from ${options.db}`;

  console.log('');
  console.log(` > ${message}`);

  promise.then(schema => {
    app.use('/graphql', (0, _cors2.default)(), (0, _expressGraphql2.default)({
      schema,
      graphiql: options.graphiql
    }));

    app.listen(options.port, () => console.log(` > Running at http://localhost:${options.port}/graphql`));
  });
}
//# sourceMappingURL=index.js.map