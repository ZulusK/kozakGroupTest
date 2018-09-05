const mongoose = require('mongoose');

function ObjectIdExtension(joi) {
  return {
    base: joi.string(),
    name: 'string',
    language: {
      thisIsNotObjectId: 'The string {{value}} is not an objectId'
    },
    rules: [
      {
        name: 'isObjectId',
        validate(params, value, state, options) {
          if (mongoose.Types.ObjectId.isValid(value)) {
            return value;
          }
          return this.createError('string.thisIsNotObjectId', { value }, state, options);
        }
      }
    ]
  };
}

module.exports = ObjectIdExtension;
