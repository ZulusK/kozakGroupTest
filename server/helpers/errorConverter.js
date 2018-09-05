const expressValidation = require('express-validation');
const APIError = require('./APIError');
const _ = require('lodash');
const httpStatus = require('http-status');

const convertJoiError2Message = err => err.errors.map(ve => ({
  field: ve.field,
  message: ve.messages.map(vem => vem.replace(/^".*" /, '')).join('. ')
}));
const convertMongooseValidationError2Message = err => _.toPairs(err.errors).map(pair => ({
  field: pair[0],
  message: pair[1].message
}));

const convertMongooseError2Message = (err) => {
  if (err.message.startsWith('E11000 duplicate key error')) {
    return 'Duplicated field is not allowed';
  }
  return err.message;
};
const normalizeError = (err) => {
  if (err instanceof expressValidation.ValidationError) {
    const unifiedErrorMessage = convertJoiError2Message(err);
    return new APIError(unifiedErrorMessage, err.status, true);
  }
  if (err.name === 'MongoError') {
    const unifiedErrorMessage = convertMongooseError2Message(err);
    return new APIError(unifiedErrorMessage, httpStatus.BAD_REQUEST, true);
  }
  if (err.name === 'ValidationError') {
    const unifiedErrorMessage = convertMongooseValidationError2Message(err);
    return new APIError(unifiedErrorMessage, httpStatus.BAD_REQUEST, true);
  }
  if (!(err instanceof APIError)) {
    return new APIError(err.message, err.status, err.isPublic);
  }
  return err;
};

module.exports = {
  convertJoiError2Message,
  normalizeError
};
