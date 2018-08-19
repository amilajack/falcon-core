'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _graphql = require('graphql');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _argsToFindOptions = require('./argsToFindOptions');

var _argsToFindOptions2 = _interopRequireDefault(_argsToFindOptions);

var _relay = require('./relay');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function whereQueryVarsToValues(o, vals) {
  _lodash2.default.forEach(o, (v, k) => {
    if (typeof v === 'function') {
      o[k] = o[k](vals);
    } else if (v && typeof v === 'object') {
      whereQueryVarsToValues(v, vals);
    }
  });
}

function resolverFactory(targetMaybeThunk, options = {}) {
  const contextToOptions = _lodash2.default.assign({}, resolverFactory.contextToOptions, options.contextToOptions);

  (0, _assert2.default)(options.include === undefined, 'Include support has been removed in favor of dataloader batching');
  if (options.before === undefined) options.before = options => options;
  if (options.after === undefined) options.after = result => result;
  if (options.handleConnection === undefined) options.handleConnection = true;

  return (() => {
    var _ref = _asyncToGenerator(function* (source, args, context, info) {
      let target = typeof targetMaybeThunk === 'function' && targetMaybeThunk.findAndCountAll === undefined ? yield _bluebird2.default.resolve(targetMaybeThunk(source, args, context, info)) : targetMaybeThunk,
          isModel = !!target.getTableName,
          isAssociation = !!target.associationType,
          association = isAssociation && target,
          model = isAssociation && target.target || isModel && target,
          type = info.returnType,
          list = options.list || type instanceof _graphql.GraphQLList;

      let targetAttributes = Object.keys(model.rawAttributes),
          findOptions = (0, _argsToFindOptions2.default)(args, targetAttributes);

      info = _extends({}, info, {
        type: type,
        source: source,
        target: target
      });

      context = context || {};

      if ((0, _relay.isConnection)(type)) {
        type = (0, _relay.nodeType)(type);
      }

      type = type.ofType || type;

      findOptions.attributes = targetAttributes;
      findOptions.logging = findOptions.logging || context.logging;
      findOptions.graphqlContext = context;

      _lodash2.default.each(contextToOptions, function (as, key) {
        findOptions[as] = context[key];
      });

      return _bluebird2.default.resolve(options.before(findOptions, args, context, info)).then(function (findOptions) {
        if (args.where && !_lodash2.default.isEmpty(info.variableValues)) {
          whereQueryVarsToValues(args.where, info.variableValues);
          whereQueryVarsToValues(findOptions.where, info.variableValues);
        }

        if (list && !findOptions.order) {
          findOptions.order = [[model.primaryKeyAttribute, 'ASC']];
        }

        if (association) {
          if (source.get(association.as) !== undefined) {
            // The user did a manual include
            const result = source.get(association.as);
            if (options.handleConnection && (0, _relay.isConnection)(info.returnType)) {
              return (0, _relay.handleConnection)(result, args);
            }

            return result;
          } else {
            return source[association.accessors.get](findOptions).then(function (result) {
              if (options.handleConnection && (0, _relay.isConnection)(info.returnType)) {
                return (0, _relay.handleConnection)(result, args);
              }
              return result;
            });
          }
        }

        return model[list ? 'findAll' : 'findOne'](findOptions);
      }).then(function (result) {
        return options.after(result, args, context, info);
      });
    });

    return function (_x, _x2, _x3, _x4) {
      return _ref.apply(this, arguments);
    };
  })();
}

resolverFactory.contextToOptions = {};

exports.default = resolverFactory;
//# sourceMappingURL=resolver.js.map