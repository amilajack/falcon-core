'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSchemaFromInfile = exports.buildSchemaFromDatabase = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _graphql = require('graphql');

var _graphqlSequelize = require('@falcon-client/graphql-sequelize');

var _graphqlSequelize2 = _interopRequireDefault(_graphqlSequelize);

var _pluralize = require('pluralize');

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _definitions = require('./definitions');

var _definitions2 = _interopRequireDefault(_definitions);

var _utils = require('../utils');

var _associations = require('./associations');

var _arguments = require('./arguments');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

console.log(_graphqlSequelize2.default, _graphqlSequelize.defaultArgs, _graphqlSequelize.defaultListArgs);

const GenericResponseType = new _graphql.GraphQLObjectType({
  name: 'GenericResponse',
  fields: {
    success: { type: _graphql.GraphQLBoolean }
  }
});

const buildSchemaFromDatabase = exports.buildSchemaFromDatabase = databaseFile => new Promise((() => {
  var _ref = _asyncToGenerator(function* (resolve, reject) {
    const db = new _sequelize2.default({
      dialect: 'sqlite',
      storage: databaseFile,
      logging: false,
      operatorsAliases: _sequelize2.default.Op
    });

    resolve((yield build(db)));
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})());

const buildSchemaFromInfile = exports.buildSchemaFromInfile = infile => new Promise((() => {
  var _ref2 = _asyncToGenerator(function* (resolve, reject) {
    const db = new _sequelize2.default({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      operatorsAliases: _sequelize2.default.Op
    });

    const contents = _fs2.default.readFileSync(infile);
    const statements = contents.toString().split(/\r?\n|\r/g).filter(function (s) {
      return s.length;
    });

    for (const stmt of statements) {
      yield db.query(stmt);
    }

    resolve((yield build(db)));
  });

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})());

const build = db => new Promise((() => {
  var _ref3 = _asyncToGenerator(function* (resolve, reject) {
    const models = {};
    let associations = [];

    const tables = yield db.query('SELECT name FROM sqlite_master WHERE type = "table" AND name NOT LIKE "sqlite_%"');

    for (const table of tables) {
      const [info, infoMeta] = yield db.query(`PRAGMA table_info("${table}")`);
      const foreignKeys = yield db.query(`PRAGMA foreign_key_list("${table}")`);

      if ((0, _utils.isJoinTable)(table, tables)) {
        associations = associations.concat((0, _associations.joinTableAssociations)(table, info, foreignKeys));
      } else {
        models[table] = db.define(table, (0, _definitions2.default)(info, table), {
          timestamps: false,
          tableName: table
        });

        associations = associations.concat((0, _associations.tableAssociations)(table, info, foreignKeys));
      }
    }

    associations.forEach(function ({ from, to, type, options }) {
      const key = type === 'belongsTo' ? (0, _pluralize.singular)(to) : to;
      const fromKey = (0, _utils.findModelKey)(from, models);
      const toKey = (0, _utils.findModelKey)(to, models);
      models[fromKey][key] = models[fromKey][type](models[toKey], options);
    });

    const types = {};
    const mutations = {};
    const queries = {};

    Object.keys(models).forEach(function (key) {
      const model = models[key];
      const fieldAssociations = {
        hasMany: associations.filter(function ({ type }) {
          return type === 'hasMany';
        }).filter(function ({ from }) {
          return from === key;
        }).map(function ({ to }) {
          return models[to];
        }),
        belongsTo: associations.filter(function ({ type }) {
          return type === 'belongsTo';
        }).filter(function ({ from }) {
          return from === key;
        }).map(function ({ to }) {
          return models[to];
        }),
        belongsToMany: associations.filter(function ({ type }) {
          return type === 'belongsToMany';
        }).map(function ({ from, to }) {
          return [from, to];
        }).filter(function (sides) {
          return sides.includes(key);
        })
      };

      const type = new _graphql.GraphQLObjectType({
        name: (0, _utils.formatTypeName)(model.name),
        fields() {
          const fields = (0, _graphqlSequelize.attributeFields)(model);

          fieldAssociations.hasMany.forEach(associatedModel => {
            fields[(0, _utils.formatFieldName)(associatedModel.name)] = {
              type: new _graphql.GraphQLList(types[associatedModel.name]),
              args: (0, _graphqlSequelize.defaultListArgs)(model[associatedModel.name]),
              resolve: (0, _graphqlSequelize.resolver)(model[associatedModel.name])
            };
          });

          fieldAssociations.belongsTo.forEach(associatedModel => {
            const fieldName = (0, _pluralize.singular)(associatedModel.name);
            fields[(0, _utils.formatFieldName)(fieldName)] = {
              type: types[associatedModel.name],
              resolve: (0, _graphqlSequelize.resolver)(model[fieldName])
            };
          });

          fieldAssociations.belongsToMany.forEach(sides => {
            const [other] = sides.filter(side => side !== model.name);
            fields[(0, _utils.formatFieldName)(other)] = {
              type: new _graphql.GraphQLList(types[other]),
              resolve: (0, _graphqlSequelize.resolver)(model[other])
            };
          });

          return fields;
        }
      });

      types[key] = type;

      queries[(0, _utils.formatFieldName)(key)] = {
        type: new _graphql.GraphQLList(type),
        args: (0, _graphqlSequelize.defaultListArgs)(model),
        resolve: (0, _graphqlSequelize.resolver)(model)
      };

      queries[(0, _pluralize.singular)((0, _utils.formatFieldName)(key))] = {
        type,
        args: (0, _graphqlSequelize.defaultArgs)(model),
        resolve: (0, _graphqlSequelize.resolver)(model)
      };

      mutations[`create${type}`] = {
        type,
        args: (0, _arguments.makeCreateArgs)(model),
        resolve: (() => {
          var _ref4 = _asyncToGenerator(function* (obj, values, info) {
            const thing = yield model.create(values);
            return thing;
          });

          return function resolve(_x7, _x8, _x9) {
            return _ref4.apply(this, arguments);
          };
        })()
      };

      mutations[`update${type}`] = {
        type,
        args: (0, _arguments.makeUpdateArgs)(model),
        resolve: (() => {
          var _ref5 = _asyncToGenerator(function* (obj, values, info) {
            const pkKey = (0, _arguments.getPkFieldKey)(model);

            const thing = yield model.findOne({
              where: { [pkKey]: values[pkKey] }
            });

            yield thing.update(values);

            return thing;
          });

          return function resolve(_x10, _x11, _x12) {
            return _ref5.apply(this, arguments);
          };
        })()
      };

      mutations[`delete${type}`] = {
        type: GenericResponseType,
        args: (0, _arguments.makeDeleteArgs)(model),
        resolve: (() => {
          var _ref6 = _asyncToGenerator(function* (obj, values, info) {
            const thing = yield model.findOne({
              where: values
            });

            yield thing.destroy();

            return {
              success: true
            };
          });

          return function resolve(_x13, _x14, _x15) {
            return _ref6.apply(this, arguments);
          };
        })()
      };

      fieldAssociations.belongsToMany.forEach(function (sides) {
        const [other] = sides.filter(function (side) {
          return side !== model.name;
        });
        const nameBits = [(0, _utils.formatTypeName)(model.name), (0, _utils.formatTypeName)(other)];

        ['add', 'remove'].forEach(function (prefix) {
          const connector = prefix === 'add' ? 'To' : 'From';
          const name = `${prefix}${nameBits.join(connector)}`;
          mutations[name] = {
            type: GenericResponseType,
            args: (0, _arguments.makePolyArgs)(model, models[other]),
            resolve: (() => {
              var _ref7 = _asyncToGenerator(function* (obj, values, info) {
                const key = (0, _arguments.getPkFieldKey)(model);
                const [,, otherArgumentKey] = (0, _arguments.getPolyKeys)(model, models[other]);

                const thingOne = yield model.findById(values[key]);
                const thingTwo = yield models[other].findById(values[otherArgumentKey]);

                const method = `${prefix}${(0, _utils.pascalCase)((0, _pluralize.singular)(other))}`;

                yield thingOne[method](thingTwo);

                return {
                  success: true
                };
              });

              return function resolve(_x16, _x17, _x18) {
                return _ref7.apply(this, arguments);
              };
            })()
          };
        });
      });
    });

    const query = new _graphql.GraphQLObjectType({
      name: 'Query',
      fields: queries
    });

    const mutation = new _graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: mutations
    });

    resolve(new _graphql.GraphQLSchema({
      query,
      mutation
    }));
  });

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})());
//# sourceMappingURL=schema.js.map