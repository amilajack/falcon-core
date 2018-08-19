'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphql = require('graphql');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _language = require('graphql/language');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const astToJson = {
  [_language.Kind.INT](ast) {
    return _graphql.GraphQLInt.parseLiteral(ast);
  },
  [_language.Kind.FLOAT](ast) {
    return _graphql.GraphQLFloat.parseLiteral(ast);
  },
  [_language.Kind.BOOLEAN](ast) {
    return _graphql.GraphQLBoolean.parseLiteral(ast);
  },
  [_language.Kind.STRING](ast) {
    return _graphql.GraphQLString.parseLiteral(ast);
  },
  [_language.Kind.ENUM](ast) {
    return String(ast.value);
  },
  [_language.Kind.LIST](ast) {
    return ast.values.map(astItem => {
      return JSONType.parseLiteral(astItem);
    });
  },
  [_language.Kind.OBJECT](ast) {
    let obj = {};
    ast.fields.forEach(field => {
      obj[field.name.value] = JSONType.parseLiteral(field.value);
    });
    return obj;
  },
  [_language.Kind.VARIABLE](ast) {
    /*
    this way converted query variables would be easily
    converted to actual values in the resolver.js by just
    passing the query variables object in to function below.
    We can`t convert them just in here because query variables
    are not accessible from GraphQLScalarType's parseLiteral method
    */
    return _lodash2.default.property(ast.name.value);
  }
};

const JSONType = new _graphql.GraphQLScalarType({
  name: 'SequelizeJSON',
  description: 'The `JSON` scalar type represents raw JSON as values.',
  serialize: value => value,
  parseValue: value => typeof value === 'string' ? JSON.parse(value) : value,
  parseLiteral: ast => {
    const parser = astToJson[ast.kind];
    return parser ? parser.call(undefined, ast) : null;
  }
});

exports.default = JSONType;
//# sourceMappingURL=jsonType.js.map