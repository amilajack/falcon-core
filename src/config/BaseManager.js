// @flow
import Store from 'electron-store';

// We can't import electron in jest so electron-store won't work.
// We need to use 'conf' as a drop-in replacement for electron-store
// in the testing environment
const FinalStore = process.env.NODE_ENV === 'test'
  ? require('conf') // eslint-disable-line
  : Store;

export default class BaseManager {
  /**
   * @private
   */
  store = new FinalStore({
    defaults: {
      connections: [],
      queries: []
    }
  });
}
