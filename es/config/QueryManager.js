import BaseManager, { FalconError } from './BaseManager';
import Joi from 'joi';


function validateQuery(query) {
  const schema = Joi.object().keys({
    id: Joi.string().required(),
    name: Joi.string().required(),
    type: Joi.string().required(),
    query: Joi.string().required(),
    color: Joi.string()
  });

  const errors = Joi.validate(query, schema, {
    abortEarly: false
  });

  if (errors.error) {
    if (errors.error.details.length > 0) {
      const errorsMessages = errors.error.details.map(detail => ({
        message: detail.message,
        fieldName: detail.context.label
      }));

      throw new FalconError(`Failed validation: ${JSON.stringify(errorsMessages)}`, { errors });
    }
  }
}

export default class QueryManager extends BaseManager {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.itemType = 'queries', _temp;
  }

  validateBeforeCreation(query) {
    switch (query.type) {
      case 'sqlite':
        {
          validateQuery(query);
          break;
        }
      default:
        {
          throw new Error(`Unknown database type "${this.itemType}". This probably means it is not supported`);
        }
    }
  }
}
//# sourceMappingURL=QueryManager.js.map