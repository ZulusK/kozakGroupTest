const ACE = require('../services/ace');
const APIError = require('../helpers/APIError');
const httpStatus = require('http-status');

function checkAccessToWorker(action) {
  return async (req, res, next) => {
    if (
      req.user
      && (await ACE.checkAccess('user', action, {
        _user: req.user,
        worker: req.$worker
      }))
    ) {
      return next();
    }
    return next(new APIError(null, httpStatus.FORBIDDEN, false));
  };
}

const create = checkAccessToWorker('worker:create');
const get = checkAccessToWorker('worker:get');
const list = checkAccessToWorker('worker:list');
const update = checkAccessToWorker('worker:update');
const remove = checkAccessToWorker('worker:delete');

module.exports = {
  update,
  list,
  delete: remove,
  get,
  create
};
