// @flow
import sqliteFormatter from '@falcon-client/sql-formatter';

export default function SqliteFormatter(sql: string, numSpaces: number = 2) {
  return sqliteFormatter.format(sql, {
    indent: numSpaces
  });
}
