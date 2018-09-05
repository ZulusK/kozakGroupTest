const passport = require('passport');
const bearer = require('./bearer');
const basic = require('./basic');
const config = require('../config');
const User = require('../../server/user/user.model');
const APIError = require('../../server/helpers/APIError');
const httpStatus = require('http-status');

/**
 * Wraps passport authenticate method and adds APIError support
 * @param {string|string[]} kind  - name of strategy to use
 */

function wrapUser(bindTo) {
  return user => ({
    bindTo,
    user
  });
}

function passportWrapper(strategy) {
  // eslint-disable-next-line max-len
  return (req, res, next) => passport.authenticate(strategy, { session: false }, (err, wrappedUser) => {
    if (err) {
      return next(err);
    }
    if (!wrappedUser) {
      return next(new APIError('Unauthorized', httpStatus.UNAUTHORIZED, false));
    }
    req[wrappedUser.bindTo] = wrappedUser.user;
    return next();
  })(req, res, next);
}

function init() {
  passport.use(
    'jwt.a.u',
    bearer.createStrategy({
      getByToken: payload => User.getByToken(payload),
      secretOrKey: config.auth.jwtSecretAccessUser,
      wrapUser: wrapUser('user')
    })
  );
  passport.use(
    'jwt.r.u',
    bearer.createStrategy({
      getByToken: payload => User.getByToken(payload),
      secretOrKey: config.auth.jwtSecretRefreshUser,
      wrapUser: wrapUser('user')
    })
  );
  passport.use(
    'basic.u',
    basic.createStrategy({
      getByCredentials: (email, password) => User.getByCredentials({
        email,
        password
      }),
      wrapUser: wrapUser('user')
    })
  );
  return passport.initialize();
}

const jwtUserAccess = passportWrapper('jwt.a.u');
const jwtUserRefresh = passportWrapper('jwt.r.u');
const basicUser = passportWrapper('basic.u');

module.exports = {
  jwtUserAccess,
  jwtUserRefresh,
  basicUser,
  init
};
