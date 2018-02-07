'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _electronStore = require('electron-store');

var _electronStore2 = _interopRequireDefault(_electronStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We can't import electron in jest so electron-store won't work.
// We need to use 'conf' as a drop-in replacement for electron-store
// in the testing environment
const FinalStore = process.env.NODE_ENV === 'test' ? require('conf') // eslint-disable-line
: _electronStore2.default;
class BaseManager {
  constructor() {
    this.store = new FinalStore({
      defaults: {
        connections: [],
        queries: []
      }
    });
  }
  /**
   * @private
   */


}
exports.default = BaseManager;
//# sourceMappingURL=BaseManager.js.map