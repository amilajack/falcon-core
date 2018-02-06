// @flow
import BaseManager from './BaseManager';
import type { ManagerInterface } from './ManagerInterface';

type queryType = {
  // The internal id for the query
  id: string,
  // The name of the query
  name: string,
  // The type of database which the query was created for
  databaseType: 'sqlite' | 'mysql' | 'postgres' | 'mssql',
  // The connection which the query belongs to
  connectionId: string,
  // The query's text
  query: string
};

export default class QueryManager<T> extends BaseManager implements ManagerInterface<T> {
  async add(query: queryType) {

  }

  async remove() {

  }

  async removeAll() {

  }

  async get() {

  }

  async getAll() {

  }
}
