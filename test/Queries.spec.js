// @flow
import Queries from '../src/config/QueryManager';

async function queryFactory(queries, queryCount: number = 1) {
  const array = new Array(queryCount);
  for (let i = 0; i < array.length; i++) {
    array[i] = await queries.add({
      id: `test-id-${i + 1}`,
      type: 'sqlite',
      name: `test-query-${i + 1}`,
      database: '/Users/amila/Desktop/demo.sqlite'
    });
  }
  return Promise.all(array);
}

describe('Queries', function testQueries() {
  beforeEach(async () => {
    this.queries = new Queries();
    await queryFactory(this.queries, 3);
  });

  afterEach(async () => {
    await this.queries.removeAll();
  });

  it('should get all queries', async () => {
    const queries = await this.queries.getAll();
    expect(queries).toMatchSnapshot();
  });

  it('should delete a single query', async () => {
    const queries = await this.queries.getAll();
    const queryIdToDelete = queries[0].id;
    await this.queries.remove(queryIdToDelete);
    const newQueries = await this.queries.getAll();
    expect(newQueries).toMatchSnapshot();
  });

  it('should update a single query', async () => {
    const queries = await this.queries.getAll();
    const queryIdToDelete = queries[0].id;
    await this.queries.update(queryIdToDelete, {
      id: 'test-id-foo',
      name: 'test-query-foo',
      password: 'test-password',
      type: 'sqlite'
    });
    const newQueries = await this.queries.getAll();
    expect(newQueries).toMatchSnapshot();
  });

  it('should get a single query', async () => {
    const queries = await this.queries.getAll();
    const queryId = queries[2].id;
    const query = await this.queries.get(queryId);
    expect(query).toMatchSnapshot();
  });

  it('should perform basic validation', async () => {
    expect(await this.queries.validateBeforeCreation({
      id: 12,
      database: 'aJ@#LJ#@KL$KL@#sdf',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
    expect(await this.queries.validateBeforeCreation({
      id: 12,
      database: '/usr/foo',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
    expect(await this.queries.validateBeforeCreation({
      id: 'foo',
      database: '/usr/foo',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
    expect(await this.queries.validateBeforeCreation({
      id: 'foo',
      name: 'foo',
      database: '/usr/foo',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
    expect(await this.queries.validateBeforeCreation({
      id: 'foo',
      name: 'foo',
      database: '/usr/local/bin/npm',
      type: 'sqlite'
    }))
      .toMatchSnapshot();
  });

  it('should check if a sqlite file is valid or not', async () => {
    expect(await this.queries.validateBeforeCreation({
      id: 'foo',
      name: 'foo',
      database: '/Users/amila/Desktop/demo.sqlite',
      type: 'sqlite'
    }))
      .toEqual({ errorMessages: [], passed: true });
  });
});
