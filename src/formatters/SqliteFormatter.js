// @flow
// eslint-disable-next-line
import sqliteFormatter from '@falcon-client/sql-formatter';

export default function SqliteFormatter(sql: string) {
  return sqliteFormatter.format(sql);
}
