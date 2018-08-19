'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makePolyArgs = exports.getPolyKeys = exports.makeDeleteArgs = exports.makeUpdateArgs = exports.makeCreateArgs = exports.getPkFieldKey = undefined;

var _graphqlSequelize = require('@falcon-client/graphql-sequelize');

var _pluralize = require('pluralize');

var _graphql = require('graphql');

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const getPkFieldKey = exports.getPkFieldKey = model => Object.keys(model.attributes).find(key => {
  const attr = model.attributes[key];
  return attr.primaryKey;
});

const makeCreateArgs = exports.makeCreateArgs = model => {
  const fields = (0, _graphqlSequelize.attributeFields)(model);
  const pk = getPkFieldKey(model);

  delete fields[pk];

  return fields;
};

const makeUpdateArgs = exports.makeUpdateArgs = model => {
  const fields = (0, _graphqlSequelize.attributeFields)(model);

  return Object.keys(fields).reduce((acc, key) => {
    const field = fields[key];

    if (field.type instanceof _graphql.GraphQLNonNull) {
      field.type = field.type.ofType;
    }

    acc[key] = field;
    return acc;
  }, fields);
};

const makeDeleteArgs = exports.makeDeleteArgs = model => {
  const fields = (0, _graphqlSequelize.attributeFields)(model);
  const pk = getPkFieldKey(model);

  return { [pk]: fields[pk] };
};

const getPolyKeys = exports.getPolyKeys = (model, otherModel) => {
  const key = getPkFieldKey(model);
  const otherKey = getPkFieldKey(otherModel);

  if (otherKey === key) {
    return [key, otherKey, (0, _camelcase2.default)(`${(0, _pluralize.singular)(otherModel.name)}_${otherKey}`)];
  }

  return [key, otherKey, otherKey];
};

const makePolyArgs = exports.makePolyArgs = (model, otherModel) => {
  const [key, otherKey, otherKeyFormatted] = getPolyKeys(model, otherModel);
  const fields = (0, _graphqlSequelize.attributeFields)(model);
  const otherFields = (0, _graphqlSequelize.attributeFields)(otherModel);

  return {
    [key]: fields[key],
    [otherKeyFormatted]: otherFields[otherKey]
  };
};
//# sourceMappingURL=arguments.js.map