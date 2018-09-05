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
  user: {
    expects: expects.user,
    data: userData
  }
};
describe('## Auth APIs', () => {
  before('clean DB', testTools.cleanup);
  after('clean DB', testTools.cleanup);
  before('create user', (done) => {
    reqs.user
      .create(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        done();
      })
      .catch(done);
  });
  describe('# POST /api/auth/login', testLogin);
  describe('# GET /api/auth/login', testGetInfo);
  describe('# GET /api/auth/token', testUpdateAccessToken);
  describe('# POST /api/auth/check-access', testCheckAccessToken);
  describe('# POST /api/auth/check-refresh', testCheckRefreshToken);
});
function copyAccount(ts) {
  const copy = Object.assign({}, ts);
  delete copy.password;
  return copy;
}

function testLogin() {
  it("should return valid user's info", (done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expects.user.expectUser(res.body.user, copyAccount(env.user.data));
        done();
      })
      .catch(done);
  });
  it('should return JWT tokens', (done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expects.expectAuthTokens(res.body.tokens);
        done();
      })
      .catch(done);
  });
  it('should not fail, verify refresh token', (done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expects.user.expectRefreshTokenIsValid(res.body.tokens.refresh.token, done);
      })
      .catch(done);
  });
  it('should not fail, verify refresh token', (done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expects.user.expectRefreshTokenIsValid(res.body.tokens.refresh.token, done);
      })
      .catch(done);
  });
  it('should return 401, no such user', (done) => {
    reqs.user
      .login({
        ...env.user.data,
        password: 'aaaaWer$ty124'
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        done();
      })
      .catch(done);
  });
}

function testGetInfo() {
  let accessToken = null;
  beforeEach((done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        accessToken = res.body.tokens.access;
        done();
      })
      .catch(done);
  });
  it('should return valid user info', (done) => {
    const etalone = copyAccount(env.user.data);
    reqs.user
      .getInfo(accessToken.token)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expects.user.expectUser(res.body, etalone);
        done();
      })
      .catch(done);
  });
  it('should reject 401, use invalid token', (done) => {
    reqs.user
      .getInfo('this.is.not.a.token')
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        done();
      })
      .catch(done);
  });
  it('should reject 401, use outdated token', (done) => {
    setTimeout(() => {
      reqs.user
        .getInfo(accessToken.token)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    }, accessToken.expiredIn * 1000 - new Date().getTime());
  });
}

function testUpdateAccessToken() {
  let authData = {
    user: null,
    refresh: null,
    access: null,
    refreshExpiredIn: null,
    accessExpiredIn: null
  };
  beforeEach('login user', (done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        authData = testTools.parseAuthBody(res.body);
        done();
      })
      .catch(done);
  });
  it('should return valid JWT token', (done) => {
    reqs.user
      .updateToken(authData.refresh)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expects.expectAccessJWTToken(res.body);
        expects.user.expectAccessTokenIsValid(res.body.token, done);
      })
      .catch(done);
  });
  it('should fail, use outdated token', () => {
    setTimeout(() => {
      reqs.user.updateToken(authData.refresh).then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
      });
    }, authData.refreshExpiredIn * 1000 - new Date().getTime());
  });
  it('should reject, used invalid token', (done) => {
    reqs.user
      .updateToken('bearer not-a-token-at-all')
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        done();
      })
      .catch(done);
  });
}

function testCheckAccessToken() {
  let authData = {
    user: null,
    refresh: null,
    accessExpiredIn: null
  };
  beforeEach('login user', (done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        authData = testTools.parseAuthBody(res.body);
        done();
      })
      .catch(done);
  });
  it('should not reject, used valid token', (done) => {
    reqs.user
      .checkAccessToken(authData.access)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        done();
      })
      .catch(done);
  });
  it('should reject, used invalid token', (done) => {
    reqs.user
      .checkAccessToken('invalid')
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        done();
      })
      .catch(done);
  });
  it('should reject, used outdated token', (done) => {
    setTimeout(() => {
      reqs.user
        .checkAccessToken(authData.access)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    }, authData.accessExpiredIn * 1000 - new Date().getTime());
  });
}

function testCheckRefreshToken() {
  let authData = {
    user: null,
    refresh: null,
    accessExpiredIn: null
  };
  beforeEach('login user', (done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        authData = testTools.parseAuthBody(res.body);
        done();
      })
      .catch(done);
  });
  it('should not reject, used valid token', (done) => {
    reqs.user
      .checkRefreshToken(authData.refresh)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        done();
      })
      .catch(done);
  });
  it('should reject, used invalid token', (done) => {
    reqs.user
      .checkRefreshToken('invalid')
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
        done();
      })
      .catch(done);
  });
  it('should reject, used outdated token', (done) => {
    setTimeout(function () {
      reqs.user
        .checkRefreshToken(authData.refresh)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    }, authData.refreshExpiredIn * 1000 - new Date().getTime());
  });
}
