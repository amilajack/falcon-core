'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tableAssociations = exports.joinTableAssociations = undefined;

var _pluralize = require('pluralize');

var _utils = require('../utils');

const FK_SUFFIX_REGEX = /(_id|Id)$/;

const formJoinTableAssociations = (a, b, aKey, bKey, table) => {
  return [{
    from: a,
    to: b,
    type: 'belongsToMany',
    options: {
      through: table,
      foreignKey: aKey,
      timestamps: false
    }
  }, {
    from: b,
    to: a,
    type: 'belongsToMany',
    options: {
      through: table,
      foreignKey: bKey,
      timestamps: false
    }
  }];
};

const joinTableFromForeignKeys = (table, foreignKeys) => {
  const [{ table: a, from: aKey }, { table: b, from: bKey }] = foreignKeys;
  return formJoinTableAssociations(a, b, aKey, bKey, table);
};

const joinTableAssociations = exports.joinTableAssociations = (table, info, foreignKeys) => {
  if (foreignKeys.length) {
    return joinTableFromForeignKeys(table, foreignKeys);
  }

  const [a, b] = table.split('_').map(_pluralize.plural);
  const keys = info.map(column => column.name);
  const [aKey] = keys.filter(key => key.indexOf((0, _pluralize.singular)(a)) === 0);
  const [bKey] = keys.filter(key => key.indexOf((0, _pluralize.singular)(b)) === 0);

  return formJoinTableAssociations(a, b, aKey, bKey, table);
};

const tableAssociations = exports.tableAssociations = (table, info, foreignKeys) => {
  const associations = [];
  const fkColumns = foreignKeys.map(({ from }) => from);

  foreignKeys.forEach(({ table: otherTable, from }) => {
    associations.push({
      from: otherTable,
      to: table,
      type: 'hasMany',
      options: {
        foreignKey: (0, _utils.formatFieldName)(from)
      }
    });

    associations.push({
      from: table,
      to: otherTable,
      type: 'belongsTo',
      options: {
        foreignKey: (0, _utils.formatFieldName)(from)
      }
    });
  });

  info.filter(({ name, pk }) => !pk && !fkColumns.includes(name)).filter(({ name }) => {
    return FK_SUFFIX_REGEX.test(name);
  }).forEach(column => {
    const root = column.name.replace(FK_SUFFIX_REGEX, '');

    associations.push({
      from: (0, _pluralize.plural)(root),
      to: table,
      type: 'hasMany',
      options: {
        foreignKey: column.name
      }
    });

    associations.push({
      from: table,
      to: (0, _pluralize.plural)(root),
      type: 'belongsTo',
      options: {
        foreignKey: column.name
      }
    });
  });

  return associations;
};
//# sourceMappingURL=associations.js.map