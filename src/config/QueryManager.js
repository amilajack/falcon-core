// @flow
import BaseManager from './BaseManager';
import type { itemValidationType } from './BaseManager';
import type { ManagerInterface } from './ManagerInterface';
import type { databasesType } from '../database/provider_clients/ProviderInterface';

export type queryType = {
  // The internal id for the query
  id: string,
  // The name of the query
  name: string,
  // The type of database which the query was created for
  type: databasesType,
  // The connection which the query belongs to
  connectionId: string,
  // The query's text
  query: string
};

async function validateQuery(query: queryType): Promise<itemValidationType> {
  const Joi = await import('joi');
  const schema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    color: Joi.string(),
    database: Joi.string().file().file_exists().sqlite_valid()
      .required(),
    type: Joi.string().required()
  });

  const errors = Joi.validate(
    query,
    schema,
    {
      abortEarly: false
    }
  );

  if (errors.error) {
    if (errors.error.details.length > 0) {
      return {
        errorMessages: errors.error.details.map(detail => ({
          message: detail.message,
          fieldName: detail.context.label
        })),
        passed: false
      };
    }
  }

  return {
    errorMessages: [],
    passed: true
  };
}

export default class QueryManager<T> extends BaseManager implements ManagerInterface<T> {
  itemType = 'queries';

  async validateBeforeCreation(query: queryType): Promise<itemValidationType> {
    switch (query.type) {
      case 'sqlite': {
        return validateQuery(query);
      }
      default: {
        throw new Error(`Unknown database type "${this.itemType}". This probably means it is not supported`);
      }
    }
  }
}
