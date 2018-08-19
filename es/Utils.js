'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.homedir = homedir;
exports.getConfigPath = getConfigPath;
exports.fileExists = fileExists;
exports.fileExistsSync = fileExistsSync;
exports.writeFile = writeFile;
exports.writeJSONFile = writeJSONFile;
exports.writeJSONFileSync = writeJSONFileSync;
exports.resolveHomePathToAbsolute = resolveHomePathToAbsolute;
exports.readFile = readFile;
exports.readJSONFile = readJSONFile;
exports.readJSONFileSync = readJSONFileSync;
exports.getPort = getPort;
exports.createCancelablePromise = createCancelablePromise;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _portfinder = require('portfinder');

var _portfinder2 = _interopRequireDefault(_portfinder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function homedir() {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || 'HOME';
}

function getConfigPath() {
  return process.env.NODE_ENV === 'test' ? _path2.default.join(__dirname, '..', 'test', 'fixtures', '.tmp.sqlectron.json') : _path2.default.join(homedir(), '.sqlectron.json');
}

function fileExists(filename) {
  return new Promise(resolve => {
    _fs2.default.stat(filename, (err, stats) => {
      if (err) return resolve(false);
      return resolve(stats.isFile());
    });
  });
}

function fileExistsSync(filename) {
  try {
    return _fs2.default.statSync(filename).isFile();
  } catch (e) {
    return false;
  }
}

function writeFile(filename, data) {
  return new Promise((resolve, reject) => {
    _fs2.default.writeFile(filename, data, err => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

function writeJSONFile(filename, data) {
  return writeFile(filename, JSON.stringify(data, null, 2));
}

function writeJSONFileSync(filename, data) {
  return _fs2.default.writeFileSync(filename, JSON.stringify(data, null, 2));
}

function resolveHomePathToAbsolute(filename) {
  if (!/^~\//.test(filename)) {
    return filename;
  }

  return _path2.default.join(homedir(), filename.substring(2));
}

function readFile(filename) {
  const filePath = resolveHomePathToAbsolute(filename);
  return new Promise((resolve, reject) => {
    _fs2.default.readFile(_path2.default.resolve(filePath), (err, data) => {
      if (err) return reject(err);
      return resolve(data.toString());
    });
  });
}

function readJSONFile(filename) {
  return readFile(filename).then(data => JSON.parse(data));
}

function readJSONFileSync(filename) {
  const filePath = resolveHomePathToAbsolute(filename);
  const data = _fs2.default.readFileSync(_path2.default.resolve(filePath), { enconding: 'utf-8' });
  return JSON.parse(data.toString());
}

function getPort() {
  return new Promise((resolve, reject) => {
    _portfinder2.default.getPort({ host: 'localhost' }, (err, port) => {
      if (err) return reject(err);
      return resolve(port);
    });
  });
}

const wait = time => new Promise(resolve => setTimeout(resolve, time));

function createCancelablePromise(error, timeIdle = 100) {
  let canceled = false;
  let discarded = false;

  return {
    wait() {
      return _asyncToGenerator(function* () {
        while (!canceled && !discarded) {
          yield wait(timeIdle);
        }

        if (canceled) {
          const err = new Error(error.message || 'Promise canceled.');

          Object.getOwnPropertyNames(error).forEach(function (key) {
            return err[key] = error[key];
          });

          throw new Error(err);
        }
      })();
    },
    cancel() {
      canceled = true;
    },
    discard() {
      discarded = true;
    }
  };
}
//# sourceMappingURL=Utils.js.map