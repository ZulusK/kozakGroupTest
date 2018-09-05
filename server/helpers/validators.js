const ObjectId = require('mongoose').Types.ObjectId;
const APIError = require('./APIError');
const httpStatus = require('http-status');

function validateId(callback) {
  return (req, res, next, id) => {
    if (!ObjectId.isValid(id)) {
      return next(
        new APIError(`Parameter ${id} is not a valid object id`, httpStatus.BAD_REQUEST, true)
      );
    }
    return callback(req, res, next, id);
  };
}

module.exports = {
  validateId
};
