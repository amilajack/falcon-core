'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _BaseProvider = require('./BaseProvider');

var _BaseProvider2 = _interopRequireDefault(_BaseProvider);

var _Tunnel = require('../Tunnel');

var _Tunnel2 = _interopRequireDefault(_Tunnel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class SshProvider extends _BaseProvider2.default {
  connect() {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (_this.database.connecting) {
        throw new Error('There is already a connection in progress for this server. Aborting this new request.');
      }

      if (_this.database.connecting) {
        throw new Error('There is already a connection in progress for this database. Aborting this new request.');
      }

      try {
        _this.database.connecting = true;

        // terminate any previous lost connection for this DB
        if (_this.database.connection) {
          _this.database.connection.disconnect();
        }

        // reuse existing tunnel
        if (_this.server.config.ssh && !_this.server.sshTunnel) {
          logger().debug('creating ssh tunnel');
          _this.server.sshTunnel = yield (0, _Tunnel2.default)(_this.server.config);

          const { address, port } = _this.server.sshTunnel.address();
          logger().debug('ssh forwarding through local connection %s:%d', address, port);

          _this.server.config.localHost = address;
          _this.server.config.localPort = port;
        }

        const driver = clients[_this.server.config.client];

        const [connection] = yield Promise.all([driver(_this.server, _this.database), _this.handleSSHError(_this.server.sshTunnel)]);

        _this.database.connection = connection;
      } catch (err) {
        logger().error('Connection error %j', err);
        _this.disconnect();
        throw err;
      } finally {
        _this.database.connecting = false;
      }
    })();
  }

  handleSSHError(sshTunnel) {
    return new Promise((resolve, reject) => {
      if (!sshTunnel) {
        return resolve(true);
      }

      sshTunnel.on('success', resolve);
      sshTunnel.on('error', error => {
        logger().error('ssh error %j', error);
        reject(error);
      });

      return resolve(true);
    });
  }
}
exports.default = SshProvider;
//# sourceMappingURL=SshProvider.js.map