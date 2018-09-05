const ACE = require('../services/ace');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

function checkAccessToUser(action) {
  return async (req, res, next) => {
    if (
      req.user
      && (await ACE.checkAccess('user', action, {
        user: req.$user,
        _user: req.user
      }))
    ) {
      return next();
    }
    return next(new APIError(null, httpStatus.FORBIDDEN, false));
  };
}

const update = checkAccessToUser('user:update');
const updatePassword = checkAccessToUser('user:update:password');
const remove = checkAccessToUser('user:delete');
const get = checkAccessToUser('user:get');
const list = checkAccessToUser('user:list');

module.exports = {
  update,
  updatePassword,
  delete: remove,
  list,
  get
};
