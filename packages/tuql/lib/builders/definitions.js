'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sequelize = require('sequelize');

var _pluralize = require('pluralize');

var _utils = require('../utils');

const transformColumnToType = column => {
  const c = column.toLowerCase();

  if (c.includes('int')) {
    return _sequelize.INTEGER;
  }

  if (c.includes('char') || c === 'clob' || c === 'text') {
    return _sequelize.TEXT;
  }

  if (c.includes('double') || c === 'real' || c === 'float') {
    return _sequelize.REAL;
  }

  if (c.includes('decimal') || c.includes('numeric') || c === 'boolean' || c === 'date' || c === 'datetime') {
    return _sequelize.NUMERIC;
  }

  return _sequelize.BLOB;
};

exports.default = (columns, tableName) => {
  return columns.reduce((acc, column) => {
    acc[(0, _utils.formatFieldName)(column.name)] = {
      type: transformColumnToType(column.type),
      primaryKey: column.pk === 1,
      field: column.name,
      allowNull: column.notnull === 0 || column.dflt_value !== null,
      defaultValue: column.dflt_value,
      autoIncrement: column.type === 'INTEGER' && column.pk === 1
    };

    return acc;
  }, {});
};
//# sourceMappingURL=definitions.js.map