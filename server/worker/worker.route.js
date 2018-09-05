const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const workerCtrl = require('./worker.controller');
const workerAccessControl = require('./worker.access');
const helpers = require('../helpers');
const auth = require('../../config/passport/index');

const router = express.Router();
const workerRoute = express.Router();
router.use('/workers', workerRoute);

workerRoute
  .route('/')
  .get(
    auth.jwtUserAccess,
    workerAccessControl.list,
    validate(paramValidation.listWorkers),
    workerCtrl.list
  )
  .post(
    auth.jwtUserAccess,
    workerAccessControl.create,
    validate(paramValidation.creatWorker),
    workerCtrl.create
  );

workerRoute
  .route('/:workerId')
  .get(auth.jwtUserAccess, workerAccessControl.get, workerCtrl.get)
  .put(
    auth.jwtUserAccess,
    workerAccessControl.update,
    validate(paramValidation.updateWorker),
    workerCtrl.update
  )
  .delete(auth.jwtUserAccess, workerAccessControl.delete, workerCtrl.delete);

workerRoute.param('workerId', helpers.validators.validateId(workerCtrl.load));

module.exports = router;
