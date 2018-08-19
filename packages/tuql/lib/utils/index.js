'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatFieldName = exports.findModelKey = exports.pascalCase = exports.formatTypeName = exports.isJoinTable = undefined;

var _pluralize = require('pluralize');

var _camelcase = require('camelcase');

var _camelcase2 = _interopRequireDefault(_camelcase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const isJoinTable = exports.isJoinTable = (tableName, tableList) => {
  const sides = tableName.split('_').map(_pluralize.plural);

  if (sides.length !== 2) {
    return false;
  }

  const [one, two] = sides;

  return tableList.includes(one) && tableList.includes(two);
};

const formatTypeName = exports.formatTypeName = name => {
  return pascalCase((0, _pluralize.singular)(name));
};

const pascalCase = exports.pascalCase = string => {
  const cameled = (0, _camelcase2.default)(string);
  return cameled.substr(0, 1).toUpperCase() + cameled.substr(1);
};

const findModelKey = exports.findModelKey = (key, models) => {
  if (models[key]) {
    return key;
  }

  const pluralKey = (0, _pluralize.plural)(key);

  if (models[pluralKey]) {
    return pluralKey;
  }

  const singularKey = (0, _pluralize.singular)(key);

  if (models[singularKey]) {
    return singularKey;
  }

  throw Error(`Model with ${key} does not exist`);
};

const formatFieldName = exports.formatFieldName = _camelcase2.default;
//# sourceMappingURL=index.js.map