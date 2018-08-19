function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

import fs from 'fs';
import path from 'path';
import pf from 'portfinder';

export function homedir() {
  return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || 'HOME';
}

export function getConfigPath() {
  return process.env.NODE_ENV === 'test' ? path.join(__dirname, '..', 'test', 'fixtures', '.tmp.sqlectron.json') : path.join(homedir(), '.sqlectron.json');
}

export function fileExists(filename) {
  return new Promise(resolve => {
    fs.stat(filename, (err, stats) => {
      if (err) return resolve(false);
      return resolve(stats.isFile());
    });
  });
}

export function fileExistsSync(filename) {
  try {
    return fs.statSync(filename).isFile();
  } catch (e) {
    return false;
  }
}

export function writeFile(filename, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filename, data, err => {
      if (err) return reject(err);
      return resolve();
    });
  });
}

export function writeJSONFile(filename, data) {
  return writeFile(filename, JSON.stringify(data, null, 2));
}

export function writeJSONFileSync(filename, data) {
  return fs.writeFileSync(filename, JSON.stringify(data, null, 2));
}

export function resolveHomePathToAbsolute(filename) {
  if (!/^~\//.test(filename)) {
    return filename;
  }

  return path.join(homedir(), filename.substring(2));
}

export function readFile(filename) {
  const filePath = resolveHomePathToAbsolute(filename);
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(filePath), (err, data) => {
      if (err) return reject(err);
      return resolve(data.toString());
    });
  });
}

export function readJSONFile(filename) {
  return readFile(filename).then(data => JSON.parse(data));
}

export function readJSONFileSync(filename) {
  const filePath = resolveHomePathToAbsolute(filename);
  const data = fs.readFileSync(path.resolve(filePath), { enconding: 'utf-8' });
  return JSON.parse(data.toString());
}

export function getPort() {
  return new Promise((resolve, reject) => {
    pf.getPort({ host: 'localhost' }, (err, port) => {
      if (err) return reject(err);
      return resolve(port);
    });
  });
}

const wait = time => new Promise(resolve => setTimeout(resolve, time));

export function createCancelablePromise(error, timeIdle = 100) {
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