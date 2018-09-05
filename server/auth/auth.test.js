const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const reqs = require('../tests/reqs');
const expects = require('../tests/expects');
const mongoose = require('mongoose');
const { userData, driverData } = require('../tests/validData');
const testTools = require('../tests/tools');
const config = require('../../config/config');

const expect = chai.expect;

chai.config.includeStack = true;
after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

const env = {
  driver: {
    reqs: reqs.driver,
    expects: expects.driver,
    data: driverData
  },
  user: {
    reqs: reqs.user,
    expects: expects.user,
    data: userData
  }
};
describe('## Auth APIs', () => {
  before('clean DB', testTools.cleanup);
  after('clean DB', testTools.cleanup);
  Object.keys(env).forEach((key) => {
    before(`create ${key}`, (done) => {
      env[key].reqs
        .create(env[key].data)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          done();
        })
        .catch(done);
    });
    describe(key, () => {
      describe('# POST /api/auth/login', testLogin(key, env[key]));
      describe('# GET /api/auth/login', testGetInfo(key, env[key]));
      describe('# GET /api/auth/token', testUpdateAccessToken(key, env[key]));
      describe('# POST /api/auth/check-access', testCheckAccessToken(key, env[key]));
      describe('# POST /api/auth/check-refresh', testCheckRefreshToken(key, env[key]));
      describe('# POST /api/auth/reset-password', testSendMailWithResetPasswordLink(key, env[key]));
      describe('# GET /api/auth/reset-password', testGetTokenForPasswordReset(key, env[key]));
      describe('# PUT /api/auth/reset-password', testResetPassword(key, env[key]));
    });
  });
});
function copyAccount(ts) {
  const copy = Object.assign({}, ts);
  delete copy.password;
  return copy;
}
function testLogin(name, ts) {
  return () => {
    it(`should return valid ${name} info`, (done) => {
      const etalone = copyAccount(ts.data);
      ts.reqs
        .login(ts.data)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          ts.expects.expect(res.body[name], etalone);
          done();
        })
        .catch(done);
    });
    it('should return JWT tokens', (done) => {
      ts.reqs
        .login(ts.data)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expects.expectAuthTokens(res.body.tokens);
          done();
        })
        .catch(done);
    });
    it('should not fail, verify refresh token', (done) => {
      ts.reqs
        .login(ts.data)
        .then((res) => {
          ts.expects.expectRefreshTokenIsValid(res.body.tokens.refresh.token, done);
        })
        .catch(done);
    });
    it('should not fail, verify refresh token', (done) => {
      ts.reqs
        .login(ts.data)
        .then((res) => {
          ts.expects.expectRefreshTokenIsValid(res.body.tokens.refresh.token, done);
        })
        .catch(done);
    });
    it(`should return 401, no such ${name}`, (done) => {
      ts.reqs
        .login({
          ...ts.data,
          password: 'aaaaWer$ty124'
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
  };
}

function testGetInfo(name, ts) {
  return () => {
    let accessToken = null;
    beforeEach((done) => {
      ts.reqs
        .login(ts.data)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          accessToken = res.body.tokens.access;
          done();
        })
        .catch(done);
    });
    it('should return valid user info', (done) => {
      const etalone = copyAccount(ts.data);
      ts.reqs
        .getInfo(accessToken.token)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          ts.expects.expect(res.body, etalone);
          done();
        })
        .catch(done);
    });
    it('should reject 401, use invalid token', (done) => {
      ts.reqs
        .getInfo('this.is.not.a.token')
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should reject 401, use outdated token', (done) => {
      setTimeout(() => {
        ts.reqs
          .getInfo(accessToken.token)
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
            done();
          })
          .catch(done);
      }, accessToken.expiredIn * 1000 - new Date().getTime());
    });
  };
}

function testUpdateAccessToken(name, ts) {
  return () => {
    let authData = {
      [name]: null,
      refresh: null,
      access: null,
      refreshExpiredIn: null,
      accessExpiredIn: null
    };
    beforeEach(`login ${name}`, (done) => {
      ts.reqs
        .login(ts.data)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          authData = testTools.parseAuthBody(res.body);
          done();
        })
        .catch(done);
    });
    it('should return valid JWT token', (done) => {
      ts.reqs
        .updateToken(authData.refresh)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expects.expectAccessJWTToken(res.body);
          ts.expects.expectAccessTokenIsValid(res.body.token, done);
        })
        .catch(done);
    });
    it('should fail, use outdated token', () => {
      setTimeout(() => {
        ts.reqs.updateToken(authData.refresh).then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        });
      }, authData.refreshExpiredIn * 1000 - new Date().getTime());
    });
    it('should reject, used invalid token', (done) => {
      ts.reqs
        .updateToken('bearer not-a-token-at-all')
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
  };
}

function testCheckAccessToken(name, ts) {
  return () => {
    let authData = {
      [name]: null,
      refresh: null,
      accessExpiredIn: null
    };
    beforeEach(`login ${name}`, (done) => {
      ts.reqs
        .login(ts.data)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          authData = testTools.parseAuthBody(res.body);
          done();
        })
        .catch(done);
    });
    it('should not reject, used valid token', (done) => {
      ts.reqs
        .checkAccessToken(authData.access)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid token', (done) => {
      ts.reqs
        .checkAccessToken('invalid')
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should reject, used outdated token', (done) => {
      setTimeout(() => {
        ts.reqs
          .checkAccessToken(authData.access)
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
            done();
          })
          .catch(done);
      }, authData.accessExpiredIn * 1000 - new Date().getTime());
    });
  };
}

function testCheckRefreshToken(name, ts) {
  return () => {
    let authData = {
      [name]: null,
      refresh: null,
      accessExpiredIn: null
    };
    beforeEach(`login ${name}`, (done) => {
      ts.reqs
        .login(ts.data)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          authData = testTools.parseAuthBody(res.body);
          done();
        })
        .catch(done);
    });
    it('should not reject, used valid token', (done) => {
      ts.reqs
        .checkRefreshToken(authData.refresh)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          done();
        })
        .catch(done);
    });
    it('should reject, used invalid token', (done) => {
      ts.reqs
        .checkRefreshToken('invalid')
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should reject, used outdated token', (done) => {
      setTimeout(function () {
        ts.reqs
          .checkRefreshToken(authData.refresh)
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
            done();
          })
          .catch(done);
      }, authData.refreshExpiredIn * 1000 - new Date().getTime());
    });
  };
}

function testSendMailWithResetPasswordLink(name, ts) {
  return () => {
    it('should return 200 ( valid user id )', (done) => {
      ts.reqs
        .sendMailWithResetPasswordLink(ts.data.email)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expect(res.body.status).to.be.eq('ok');
          done();
        })
        .catch(done);
    });
    it('should return 400 ( do not wait for timeout )', (done) => {
      ts.reqs
        .sendMailWithResetPasswordLink(ts.data.email)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
    it('should be able to login, after send mail with reset link', (done) => {
      setTimeout(() => {
        ts.reqs
          .sendMailWithResetPasswordLink(ts.data.email)
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.OK);
            return ts.reqs.login(ts.data);
          })
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.OK);
            done();
          })
          .catch(done);
      }, config.auth.passwordResetTokenExp);
    });
    it(`should return 400 ( invalid ${name} email )`, (done) => {
      ts.reqs
        .sendMailWithResetPasswordLink('invalid')
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
    it(`should return 404 ( no such ${name} asociated with email )`, (done) => {
      ts.reqs
        .sendMailWithResetPasswordLink('newMail@gmail.com')
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
          done();
        })
        .catch(done);
    });
  };
}

function testGetTokenForPasswordReset(name, ts) {
  return () => {
    let resetPasswordToken = null;
    beforeEach('wait for timeout', (done) => {
      setTimeout(() => done(), config.auth.passwordResetTokenExp);
    });
    beforeEach('get new reset password token', (done) => {
      ts.reqs
        .sendMailWithResetPasswordLink(ts.data.email)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          resetPasswordToken = res.body.token;
          done();
        })
        .catch(done);
    });
    it('should return 200 ( valid token )', (done) => {
      ts.reqs
        .getPasswordResetToken(resetPasswordToken)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.all.keys('token', 'expiredIn');
          expect(res.body.token).to.be.a('string');
          expect(res.body.expiredIn).to.be.a('number');
          done();
        })
        .catch(done);
    });
    it('should return 400 ( token from email outdated )', (done) => {
      setTimeout(() => {
        ts.reqs
          .getPasswordResetToken(resetPasswordToken)
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
            done();
          })
          .catch(done);
      }, config.auth.passwordResetTokenExp + 100);
    });
    it('should be able to login, after send mail with reset link', (done) => {
      ts.reqs
        .getPasswordResetToken(resetPasswordToken)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          return ts.reqs.login(ts.data);
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          done();
        })
        .catch(done);
    });
    it('should return 400 ( invalid token )', (done) => {
      setTimeout(() => {
        ts.reqs
          .getPasswordResetToken('invalid')
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
            done();
          })
          .catch(done);
      }, config.auth.passwordResetTokenExp + 100);
    });
  };
}

function testResetPassword(name, ts) {
  return () => {
    let resetPasswordToken = null;
    let authTokenResetPassword = null;
    const NEW_PASSWORD = 'azSd2@!ssdf';
    beforeEach('wait for timeout', (done) => {
      setTimeout(() => done(), config.auth.passwordResetTokenExp);
    });
    beforeEach('gen new reset password token', (done) => {
      ts.reqs
        .sendMailWithResetPasswordLink(ts.data.email)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          resetPasswordToken = res.body.token;
          done();
        })
        .catch(done);
    });
    beforeEach('get new jwt reset password token', (done) => {
      ts.reqs
        .getPasswordResetToken(resetPasswordToken)
        .then((res) => {
          authTokenResetPassword = res.body.token;
          done();
        })
        .catch(done);
    });
    it('should return 200 ( valid token )', (done) => {
      ts.reqs
        .resetPassword({ token: authTokenResetPassword, data: { password: NEW_PASSWORD } })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          done();
        })
        .catch(done);
    });
    it('should return 200 ( invalid password )', (done) => {
      ts.reqs
        .resetPassword({ token: authTokenResetPassword, data: { password: 'invalid' } })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
    it('should return 400 ( jwt token outdated )', (done) => {
      setTimeout(() => {
        ts.reqs
          .resetPassword({ token: authTokenResetPassword, data: { password: NEW_PASSWORD } })
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
            done();
          })
          .catch(done);
      }, config.auth.jwtPasswordResetExp + 100);
    });
    it('should not be able to login, after send mail with reset link', (done) => {
      ts.reqs
        .resetPassword({ token: authTokenResetPassword, data: { password: NEW_PASSWORD } })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          return ts.reqs.login(ts.data);
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
  };
}
