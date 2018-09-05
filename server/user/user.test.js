const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const reqs = require('../tests/reqs');
const expects = require('../tests/expects');
const mongoose = require('mongoose');
const { userData } = require('../tests/validData');
const { testSuitsForUser, testSuitsForUserPassword } = require('../tests/testQueries');
const testTools = require('../tests/tools');

const ObjectId = mongoose.Types.ObjectId;
const expect = chai.expect;
chai.config.includeStack = true;

after((done) => {
  // required because https://github.com/Automattic/mongoose/issues/1251#issuecomment-65793092
  mongoose.models = {};
  mongoose.modelSchemas = {};
  mongoose.connection.close();
  done();
});

function copyUser(store) {
  const copy = Object.assign({}, store);
  delete copy.updatedAt;
  delete copy.password;
  return copy;
}

describe('## User APIs', () => {
  before('clean DB', testTools.cleanup);
  after('clean DB', testTools.cleanup);
  describe('# POST /api/users', testUserCreation);
  describe('# PUT /api/users/:id', testUserUpdate);
  describe('# GET /api/users/:id', testUserGetById);
  describe('# DELETE /api/users/:id', testUserDelete);
});

function testUserCreation() {
  afterEach('clean DB', testTools.cleanup);
  describe('valid data', () => {
    it('should create a new user (valid info) ', (done) => {
      reqs.user
        .create(userData)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expects.user.expectUser(res.body.user, copyUser(userData));
          done();
        })
        .catch(done);
    });
    it('should return 400, ( used email ) ', (done) => {
      reqs.user
        .create(userData)
        .then(() => reqs.user.create(userData))
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
    it('should return JWT tokens', (done) => {
      reqs.user
        .create(userData)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expects.expectAuthTokens(res.body.tokens);
          done();
        })
        .catch(done);
    });
    it('should not fail, verify access token', (done) => {
      reqs.user
        .create(userData)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expects.user.expectAccessTokenIsValid(res.body.tokens.access.token, done);
        })
        .catch(done);
    });
    it('should not fail, verify refresh token', (done) => {
      reqs.user
        .create(userData)
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expects.user.expectRefreshTokenIsValid(res.body.tokens.refresh.token, done);
        })
        .catch(done);
    });
  });
  expects.runTestCases({ testData: testSuitsForUser, makeReq: runTestCaseCreation });
}
function testUserUpdate() {
  const auth = {
    access: null,
    account:null,
    refresh: null
  };
  beforeEach('login or create user', (done) => {
    reqs.user
      .createOrLogin(userData)
      .then((res) => {
        testTools.parseAuthBody(res.body, auth);
        done();
      })
      .catch(done);
  });
  afterEach('clean DB', testTools.cleanup);
  describe('invalid id', () => {
    it('should return 404 ( new id )', (done) => {
      reqs.user
        .update({ userId: ObjectId(), accessToken: auth.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
          done();
        })
        .catch(done);
    });
    it('should return 400 ( invalid id )', (done) => {
      reqs.user
        .update({ userId: 'not-an-id', accessToken: auth.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
  });
  describe('invalid token', () => {
    it('should return 401 ( bad token )', (done) => {
      reqs.user
        .update({ userId: auth.account.id, accessToken: 'Asd' })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( no auth )', (done) => {
      reqs.user
        .update({ userId: auth.account.id })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });

    it('should return 403 ( user is not an owner of account )', (done) => {
      reqs.user
        .create({
          ...userData,
          email: 'newUser@gmail.com'
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          return reqs.user.update({
            userId: auth.account.id,
            accessToken: res.body.tokens.access.token
          });
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.FORBIDDEN);
          done();
        })
        .catch(done);
    });
  });
  describe('test each property', () => {
    const runTestCaseUpdate = (tc, done) => reqs.user
      .update({
        userId: auth.account.id,
        data: tc.data,
        accessToken: auth.access
      })
      .then((res) => {
        expect(res.status).to.be.eq(tc.expectedCode);
        if (tc.expectedCode === httpStatus.OK) {
          expects.user.expectUserUpdated(res.body, tc.data);
        }
        done();
      });
    expects.runTestCases({ testData: testSuitsForUser, makeReq: runTestCaseUpdate });
    const runTestCaseUpdatePassword = (tc, done) => reqs.user
      .updatePassword({
        userId: auth.account.id,
        data: tc.data,
        email: userData.email,
        password: userData.password
      })
      .then((res) => {
        expect(res.status).to.be.eq(tc.expectedCode);
        done();
      });
    expects.runTestCases({
      testData: testSuitsForUserPassword,
      makeReq: runTestCaseUpdatePassword
    });
    it('should return 400, ( used email ) ', (done) => {
      const newEmail = 'newEmail123@mail.com';
      reqs.user
        .create({
          ...userData,
          email: newEmail
        })
        .then(() => reqs.user.update({
          userId: auth.account.id,
          data: {
            email: newEmail
          },
          accessToken: auth.access
        }))
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
  });
  describe('test password updating', () => {
    it('should reject all tokens after password updating', (done) => {
      reqs.user
        .updatePassword({
          userId: auth.account.id,
          email: userData.email,
          password: userData.password,
          data: {
            password: 'newPassw@rd123'
          }
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expects.expectTokenIsInvalid('/api/auth/check-access', auth.access, done);
        })
        .catch(done);
    });
  });
}
function testUserGetById() {
  const auth = {
    access: null,
    account:null,
    refresh: null
  };
  before('login or create user', (done) => {
    reqs.user
      .create(userData)
      .then((res) => {
        testTools.parseAuthBody(res.body, auth);
        done();
      })
      .catch(done);
  });
  after('clean DB', testTools.cleanup);
  it('should return user (valid id & token) ', (done) => {
    reqs.user
      .getById({ userId: auth.account.id, accessToken: auth.access })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expects.user.expectUser(res.body, copyUser(userData));
        done();
      })
      .catch(done);
  });
  describe('invalid id', () => {
    it('should return 404 ( new id )', (done) => {
      reqs.user
        .getById({ userId: ObjectId(), accessToken: auth.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
          done();
        })
        .catch(done);
    });
    it('should return 400 ( invalid id )', (done) => {
      reqs.user
        .getById({ userId: 'not-an-id', accessToken: auth.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
  });
  describe('invalid token', () => {
    it('should return 401 ( bad token )', (done) => {
      reqs.user
        .getById({ userId: auth.account.id, accessToken: 'Asd' })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( no auth )', (done) => {
      reqs.user
        .getById({ userId: auth.account.id })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });

    it('should return 403 ( user is not an owner of account )', (done) => {
      reqs.user
        .create({
          ...userData,
          email: 'newUser@gmail.com'
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          return reqs.user.getById({
            userId: auth.account.id,
            accessToken: res.body.tokens.access.token
          });
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.FORBIDDEN);
          done();
        })
        .catch(done);
    });
  });
}
function testUserDelete() {
  const auth = {
    access: null,
    account:null,
    refresh: null
  };
  beforeEach('login or create user', (done) => {
    reqs.user
      .createOrLogin(userData)
      .then((res) => {
        testTools.parseAuthBody(res.body, auth);
        done();
      })
      .catch(done);
  });
  after('clean DB', testTools.cleanup);
  it('should return 200 and deleted user (valid id & auth)', (done) => {
    reqs.user
      .delete({ userId: auth.account.id, ...userData })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expects.user.expectUser(res.body, copyUser(userData));
        done();
      })
      .catch(done);
  });
  it('should return 404 on getById after deleting', (done) => {
    reqs.user
      .delete({ userId: auth.account.id, ...userData })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        return reqs.user.getById({ userId: auth.account.id, accessToken: auth.access });
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
        done();
      })
      .catch(done);
  });
  describe('invalid id', () => {
    it('should return 404 ( new id )', (done) => {
      reqs.user
        .delete({ userId: ObjectId(), ...userData })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
          done();
        })
        .catch(done);
    });
    it('should return 400 ( invalid email )', (done) => {
      reqs.user
        .delete({ userId: 'not-an-id', ...userData })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
  });
  describe('invalid credentials', () => {
    it('should return 401 ( bad email )', (done) => {
      reqs.user
        .delete({ userId: auth.account.id, ...userData, email: 'invalid@mail.com' })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( use access token instead of email & password )', (done) => {
      reqs.user
        .delete({ userId: auth.account.id, accessToken: auth.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( bad password )', (done) => {
      reqs.user
        .delete({ userId: auth.account.id, ...userData, password: 'invalid' })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( no auth )', (done) => {
      reqs.user
        .delete({ userId: auth.account.id })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });

    it('should return 403 ( user is not an owner of account )', (done) => {
      reqs.user
        .create({
          ...userData,
          email: 'newUser@gmail.com'
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          return reqs.user.delete({
            userId: res.body.user.id,
            ...userData
          });
        })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.FORBIDDEN);
          done();
        })
        .catch(done);
    });
  });
}
function runTestCaseCreation(testCase, done) {
  return reqs.user
    .create({
      ...userData,
      ...testCase.data
    })
    .then((res) => {
      expect(res.status).to.be.eq(testCase.expectedCode);
      done();
    });
}
