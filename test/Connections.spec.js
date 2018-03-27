// @flow
/* eslint no-await-in-loop: 0 */
import path from 'path';
import Connections from '../src/config/ConnectionManager';

async function connectionFactory(connections, connectionCount: number = 1) {
  const array = new Array(connectionCount);
  for (let i = 0; i < array.length; i++) {
    array[i] = await connections.add({
      id: `test-id-${i + 1}`,
      type: 'sqlite',
      name: `test-connection-${i + 1}`,
      database: path.join(__dirname, 'databases/sqlite/demo.sqlite')
    });
  }
  return Promise.all(array);
}

function removeDatabaseProperty(object: Object): Object {
  const foo = { ...object };
  delete foo.database;
  assertDatabaseProperty(object);
  return foo;
}

function assertDatabaseProperty(object: Object): Object {
  expect(object).toHaveProperty('database');
  expect(object.database).toBeTruthy();
}

describe('Connections', function testConnections() {
  beforeEach(async () => {
    this.connections = new Connections();
    await connectionFactory(this.connections, 3);
  });

  afterEach(async () => {
    await this.connections.removeAll();
  });

  it('should get all connections', async () => {
    const connections = await this.connections.getAll();
    expect(connections.map(removeDatabaseProperty)).toMatchSnapshot();
  });

  it('should delete a single connection', async () => {
    const connections = await this.connections.getAll();
    const connectionIdToDelete = connections[0].id;
    await this.connections.remove(connectionIdToDelete);
    const newConnections = await this.connections.getAll();
    expect(newConnections.map(removeDatabaseProperty)).toMatchSnapshot();
  });

  it('should update a single connection', async () => {
    const connections = await this.connections.getAll();
    const connectionIdToDelete = connections[0].id;
    await this.connections.update(connectionIdToDelete, {
      id: 'test-id-foo',
      name: 'test-connection-foo',
      password: 'test-password',
      type: 'sqlite'
    });
    const newConnections = await this.connections.getAll();
    expect(newConnections.map(removeDatabaseProperty)).toMatchSnapshot();
  });

  it('should get a single connection', async () => {
    const connections = await this.connections.getAll();
    const connectionId = connections[2].id;
    const connection = await this.connections.get(connectionId);
    expect(removeDatabaseProperty(connection)).toMatchSnapshot();
  });

  it('should perform basic validation', async () => {
    try {
      await this.connections.add({
        id: 12,
        database: 'aJ@#LJ#@KL$KL@#sdf',
        type: 'sqlite'
      });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
    try {
      await this.connections.add({
        id: 12,
        database: '/usr/foo',
        type: 'sqlite'
      });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
    try {
      await this.connections.add({
        id: 12,
        database: '/usr/foo',
        type: 'sqlite'
      });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
    try {
      await this.connections.add({
        id: 'foo',
        name: 'foo',
        database: '/usr/foo',
        type: 'sqlite'
      });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
    try {
      await this.connections.add({
        id: 'foo',
        name: 'foo',
        database: '/usr/local/bin/npm',
        type: 'sqlite'
      });
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  it('should check if a sqlite file is valid or not', async () => {
    const database = path.join(__dirname, 'databases/sqlite/demo.sqlite');
    const conn = await this.connections.add({
      id: 'foo',
      name: 'foo',
      type: 'sqlite',
      database
    });
    conn.data.item = removeDatabaseProperty(conn.data.item);
    expect(conn).toMatchSnapshot();
  });
});
