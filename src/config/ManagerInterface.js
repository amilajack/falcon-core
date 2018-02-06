// @flow
export interface ManagerInterface<T> {
  add: (item: T) => Promise<void>,
  remove: (itemId: string) => Promise<void>,
  removeAll: () => Promise<void>,
  get: (itemId: string) => Promise<T>,
  getAll: () => Promise<Array<T>>,
}
