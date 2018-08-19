'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mapType = mapType;
exports.toGraphQL = toGraphQL;

var _graphql2 = require('graphql');

var _jsonType = require('./types/jsonType');

var _jsonType2 = _interopRequireDefault(_jsonType);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let customTypeMapper;
/**
 * A function to set a custom mapping of types
 * @param {Function} mapFunc
 */
function mapType(mapFunc) {
  customTypeMapper = mapFunc;
}

/**
 * Checks the type of the sequelize data type and
 * returns the corresponding type in GraphQL
 * @param  {Object} sequelizeType
 * @param  {Object} sequelizeTypes
 * @return {Function} GraphQL type declaration
 */
function toGraphQL(sequelizeType, sequelizeTypes) {

  // did the user supply a mapping function?
  // use their mapping, if it returns truthy
  // else use our defaults
  if (customTypeMapper) {
    let result = customTypeMapper(sequelizeType);
    if (result) return result;
  }

  const {
    BOOLEAN,
    ENUM,
    FLOAT,
    CHAR,
    DECIMAL,
    DOUBLE,
    INTEGER,
    BIGINT,
    STRING,
    TEXT,
    UUID,
    DATE,
    DATEONLY,
    TIME,
    ARRAY,
    VIRTUAL,
    JSON
  } = sequelizeTypes;

  // Map of special characters
  const specialCharsMap = new Map([['¼', 'frac14'], ['½', 'frac12'], ['¾', 'frac34']]);

  if (sequelizeType instanceof BOOLEAN) return _graphql2.GraphQLBoolean;

  if (sequelizeType instanceof FLOAT || sequelizeType instanceof DOUBLE) return _graphql2.GraphQLFloat;

  if (sequelizeType instanceof INTEGER) {
    return _graphql2.GraphQLInt;
  }

  if (sequelizeType instanceof CHAR || sequelizeType instanceof STRING || sequelizeType instanceof TEXT || sequelizeType instanceof UUID || sequelizeType instanceof DATE || sequelizeType instanceof DATEONLY || sequelizeType instanceof TIME || sequelizeType instanceof BIGINT || sequelizeType instanceof DECIMAL) {
    return _graphql2.GraphQLString;
  }

  if (sequelizeType instanceof ARRAY) {
    let elementType = toGraphQL(sequelizeType.type, sequelizeTypes);
    return new _graphql2.GraphQLList(elementType);
  }

  if (sequelizeType instanceof ENUM) {
    return new _graphql2.GraphQLEnumType({
      name: 'tempEnumName',
      values: (0, _lodash2.default)(sequelizeType.values).mapKeys(sanitizeEnumValue).mapValues(v => ({ value: v })).value()
    });
  }

  if (sequelizeType instanceof VIRTUAL) {
    let returnType = sequelizeType.returnType ? toGraphQL(sequelizeType.returnType, sequelizeTypes) : _graphql2.GraphQLString;
    return returnType;
  }

  if (sequelizeType instanceof JSON) {
    return _jsonType2.default;
  }

  console.log(sequelizeType);

  if (sequelizeType.key === 'BLOB') {
    return _graphql.GraphQLString;
  }

  throw new Error(`Unable to convert ${sequelizeType.key || sequelizeType.toSql()} to a GraphQL type`);

  function sanitizeEnumValue(value) {
    return value.trim().replace(/([^_a-zA-Z0-9])/g, (_, p) => specialCharsMap.get(p) || ' ').split(' ').map((v, i) => i ? _lodash2.default.upperFirst(v) : v).join('').replace(/(^\d)/, '_$1');
  }
}
//# sourceMappingURL=typeMapper.js.map