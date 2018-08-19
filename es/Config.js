var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import uuid from 'uuid';
import * as utils from './Utils';

const EMPTY_CONFIG = { servers: [] };

function sanitizeServers(data) {
  return data.servers.map(server => {
    const srv = _extends({}, server);

    // ensure all server has an unique id
    if (!('id' in srv)) {
      srv.id = uuid.v4();
    }

    // ensure all servers has the new fileld SSL
    if (srv.ssl === undefined) {
      srv.ssl = false;
    }

    return srv;
  });
}

/**
 * Prepare the configuration file sanitizing and validating all fields availbale
 */
export let prepare = (() => {
  var _ref = _asyncToGenerator(function* () {
    const filename = utils.getConfigPath();
    const fileExistsResult = yield utils.fileExists(filename);
    if (!fileExistsResult) {
      yield utils.writeJSONFile(filename, EMPTY_CONFIG);
    }

    const result = yield utils.readJSONFile(filename);

    result.servers = sanitizeServers(result);

    yield utils.writeJSONFile(filename, result);

    // @TODO: Validate whole configuration file
    // if (!configValidate(result)) {
    //   throw new Error('Invalid ~/.sqlectron.json file format');
    // }
  });

  return function prepare() {
    return _ref.apply(this, arguments);
  };
})();

export function prepareSync() {
  const filename = utils.getConfigPath();
  const fileExistsResult = utils.fileExistsSync(filename);
  if (!fileExistsResult) {
    utils.writeJSONFileSync(filename, EMPTY_CONFIG);
  }

  const result = utils.readJSONFileSync(filename);

  result.servers = sanitizeServers(result);

  utils.writeJSONFileSync(filename, result);

  // TODO: Validate whole configuration file
  // if (!configValidate(result)) {
  //   throw new Error('Invalid ~/.sqlectron.json file format');
  // }
}

export function get() {
  const filename = utils.getConfigPath();
  return utils.readJSONFile(filename);
}

export function getSync() {
  const filename = utils.getConfigPath();
  return utils.readJSONFileSync(filename);
}

export function save(data) {
  const filename = utils.getConfigPath();
  return utils.writeJSONFile(filename, data);
}
//# sourceMappingURL=Config.js.map