const express = require('express');
const auth = require('../../config/passport/index');
const authCtrl = require('./auth.controller');
// const validate = require('express-validation');
// const paramValidation = require('../../config/param-validation');

const router = express.Router(); // eslint-disable-line new-cap
const authRoute = express.Router();
router.use('/auth', authRoute);

authRoute.post('/login', auth.basicUser, authCtrl.login);
authRoute.get('/login', auth.jwtUserAccess, authCtrl.get);
authRoute.get('/token', auth.jwtUserRefresh, authCtrl.genAccessToken);
authRoute.get('/check-access', auth.jwtUserAccess, authCtrl.check);
authRoute.get('/check-refresh', auth.jwtUserRefresh, authCtrl.check);

module.exports = authRoute;
