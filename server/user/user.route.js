const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../../config/param-validation');
const userCtrl = require('./user.controller');
const userAccessControl = require('./user.access');
const helpers = require('../helpers');
const auth = require('../../config/passport/index');

const router = express.Router(); // eslint-disable-line new-cap
const userRouter = express.Router();
router.use('/users', userRouter);

userRouter.route('/').post(validate(paramValidation.createUser), userCtrl.create);

userRouter
  .route('/:userId')
  .get(auth.jwtUserAccess, userAccessControl.get, userCtrl.get)
  .put(
    auth.jwtUserAccess,
    userAccessControl.update,
    validate(paramValidation.updateUser),
    userCtrl.update
  )
  .delete(auth.basicUser, userAccessControl.delete, userCtrl.delete);

userRouter.put(
  '/:userId/password',
  auth.basicUser,
  userAccessControl.updatePassword,
  validate(paramValidation.updateUserPassword),
  userCtrl.updatePassword
);

userRouter.param('userId', helpers.validators.validateId(userCtrl.load));

module.exports = router;
