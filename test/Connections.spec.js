// @flow
import Connections from '../src/connections/Connections';

async function connectionFactory(connections, connectionCount: number = 1) {
  const array = new Array(connectionCount);
  for (let i = 0; i < array.length; i++) {
    array[i] = await connections.create({
      id: `test-id-${i + 1}`,
      name: `test-connection-${i + 1}`,
      password: 'test-password',
      type: 'sqlite'
    });
  }
  return Promise.all(array);
}

describe('Connections', function testConnections() {
  beforeEach(async () => {
    this.connections = new Connections();
    await connectionFactory(this.connections, 3);
  });

  afterEach(async () => {
    await this.connections.deleteAll();
  });

  it('should get all connections', async () => {
    const connections = await this.connections.getAll();
    expect(connections).toMatchSnapshot();
  });

  it('should delete a single connection', async () => {
    const connections = await this.connections.getAll();
    const connectionIdToDelete = connections[0].id;
    await this.connections.delete(connectionIdToDelete);
    const newConnections = await this.connections.getAll();
    expect(newConnections).toMatchSnapshot();
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
    expect(newConnections).toMatchSnapshot();
  });

  it('should get a single connection', async () => {
    const connections = await this.connections.getAll();
    const connectionId = connections[2].id;
    const connection = await this.connections.get(connectionId);
    expect(connection).toMatchSnapshot();
  });

  it('should perform basic validation', async () => {
    expect(await this.connections.validateBeforeCreation({
      id: 12,
      database: 'aJ@#LJ#@KL$KL@#sdf',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
    expect(await this.connections.validateBeforeCreation({
      id: 12,
      database: '/usr/foo',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
    expect(await this.connections.validateBeforeCreation({
      id: 'foo',
      database: '/usr/foo',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
    expect(await this.connections.validateBeforeCreation({
      id: 'foo',
      name: 'foo',
      database: '/usr/foo',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
    expect(await this.connections.validateBeforeCreation({
      id: 'foo',
      name: 'foo',
      database: '/usr/local/bin/npm',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
  });

  it('should check if a sqlite file is valid or not', async () => {
    expect(await this.connections.validateBeforeCreation({
      id: 'foo',
      name: 'foo',
      database: '/Users/amila/Desktop/demo.sqlite',
      type: 'sqlite'
    }))
      .toEqual([]);
  });
});
