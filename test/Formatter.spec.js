// @flow
import SqliteFormatter from '../src/formatters/SqliteFormatter';

describe('Formatters', () => {
  it('should format Sqlite', () => {
    expect(
      SqliteFormatter('SELECT * FROM users')
    ).toEqual('SELECT * FROM users');
  });
});
