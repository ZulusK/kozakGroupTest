const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const reqs = require('../tests/reqs');
const expects = require('../tests/expects');
const mongoose = require('mongoose');
const { userData, workerData } = require('../tests/validData');
const { testSuitsForWorker } = require('../tests/testQueries');
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

const env = {
  user: {
    data: userData,
    account: null,
    access: null,
    refresh: null,
    refreshExpiredIn: null,
    accessExpiredIn: null
  }
};

describe('## Worker APIs', () => {
  before('clean DB', testTools.cleanup);
  before('create user', (done) => {
    reqs.user
      .create(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        testTools.parseAuthBody(res.body, env.user);
        done();
      })
      .catch(done);
  });
  beforeEach('login user', (done) => {
    reqs.user
      .login(env.user.data)
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        testTools.parseAuthBody(res.body, env.user);
        done();
      })
      .catch(done);
  });
  after('clean DB', testTools.cleanup);
  describe('# POST /api/workers', testWorkerCreation);
  describe('# PUT /api/workers/:id', testWorkerUpdate);
  //   describe('# GET /api/workers/:id', testWorkerGetById);
  //   describe('# DELETE /api/workers/:id', testWorkerDelete);
});
function testWorkerCreation() {
  describe('valid data', () => {
    it('should create a new user (valid info)', (done) => {
      reqs.worker
        .create({ data: workerData, accessToken: env.user.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.OK);
          expects.worker.expectWorker(res.body);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( no token )', (done) => {
      reqs.worker
        .create({ data: workerData, accessToken: null })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( invalid token )', (done) => {
      reqs.worker
        .create({ data: workerData, accessToken: 'invalid' })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
  });
  expects.runTestCases({ testData: testSuitsForWorker, makeReq: runTestCaseCreation });
}
function testWorkerUpdate() {
  let worker = {
    id: null
  };
  before('create worker', (done) => {
    reqs.worker
      .create({ data: workerData, accessToken: env.user.access })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        worker = res.body;
        done();
      })
      .catch(done);
  });

  describe('invalid id', () => {
    it('should return 404 ( new id )', (done) => {
      reqs.worker
        .update({ workerId: ObjectId(), accessToken: env.user.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
          done();
        })
        .catch(done);
    });
    it('should return 400 ( invalid id )', (done) => {
      reqs.worker
        .update({ workerId: 'not-an-id', accessToken: env.user.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
  });
  describe('invalid token', () => {
    it('should return 401 ( bad token )', (done) => {
      reqs.worker
        .update({ workerId: worker.id, accessToken: 'Asd' })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( no auth )', (done) => {
      reqs.worker
        .update({ workerId: worker.id })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
  });
  describe('test each property', () => {
    const runTestCaseUpdate = (tc, done) => reqs.worker
      .update({
        workerId: worker.id,
        data: {
          ...workerData,
          ...tc.data
        },
        accessToken: env.user.access
      })
      .then((res) => {
        if (res.status !== tc.expectedCode) {
          console.log(res.body);
        }
        expect(res.status).to.be.eq(tc.expectedCode);
        if (tc.expectedCode === httpStatus.OK) {
          expects.worker.expectWorkerUpdated(res.body, tc.data);
        }
        done();
      });
    expects.runTestCases({ testData: testSuitsForWorker, makeReq: runTestCaseUpdate });
  });
}
// function testWorkerGetById() {
//   const auth = {
//     access: null,
//     user: null,
//     refresh: null
//   };
//   before('login or create user', (done) => {
//     reqs.user
//       .create(userData)
//       .then((res) => {
//         testTools.parseAuthBody(res.body, auth);
//         done();
//       })
//       .catch(done);
//   });
//   after('clean DB', testTools.cleanup);
//   it('should return user (valid id & token) ', (done) => {
//     reqs.user
//       .getById({ workerId:worker.id, accessToken: env.user.access })
//       .then((res) => {
//         expect(res.status).to.be.eq(httpStatus.OK);
//         expects.user.expectUser(res.body, copyUser(userData));
//         done();
//       })
//       .catch(done);
//   });
//   describe('invalid id', () => {
//     it('should return 404 ( new id )', (done) => {
//       reqs.user
//         .getById({ workerId: ObjectId(), accessToken: env.user.access })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
//           done();
//         })
//         .catch(done);
//     });
//     it('should return 400 ( invalid id )', (done) => {
//       reqs.user
//         .getById({ workerId: 'not-an-id', accessToken: env.user.access })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
//           done();
//         })
//         .catch(done);
//     });
//   });
//   describe('invalid token', () => {
//     it('should return 401 ( bad token )', (done) => {
//       reqs.user
//         .getById({ workerId:worker.id, accessToken: 'Asd' })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
//           done();
//         })
//         .catch(done);
//     });
//     it('should return 401 ( no auth )', (done) => {
//       reqs.user
//         .getById({ workerId: worker.id })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
//           done();
//         })
//         .catch(done);
//     });

//     it('should return 403 ( user is not an owner of account )', (done) => {
//       reqs.user
//         .create({
//           ...userData,
//           email: 'newUser@gmail.com'
//         })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.OK);
//           return reqs.user.getById({
//             workerId:worker.id,
//             accessToken: res.body.tokens.access.token
//           });
//         })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.FORBIDDEN);
//           done();
//         })
//         .catch(done);
//     });
//   });
// }
// function testWorkerDelete() {
//   const auth = {
//     access: null,
//     user: null,
//     refresh: null
//   };
//   beforeEach('login or create user', (done) => {
//     reqs.user
//       .createOrLogin(userData)
//       .then((res) => {
//         testTools.parseAuthBody(res.body, auth);
//         done();
//       })
//       .catch(done);
//   });
//   after('clean DB', testTools.cleanup);
//   it('should return 200 and deleted user (valid id & auth)', (done) => {
//     reqs.user
//       .delete({ workerId:worker.id, ...userData })
//       .then((res) => {
//         expect(res.status).to.be.eq(httpStatus.OK);
//         expects.user.expectUser(res.body, copyUser(userData));
//         done();
//       })
//       .catch(done);
//   });
//   it('should return 404 on getById after deleting', (done) => {
//     reqs.user
//       .delete({ workerId:worker.id, ...userData })
//       .then((res) => {
//         expect(res.status).to.be.eq(httpStatus.OK);
//         return reqs.user.getById({ workerId:worker.id, accessToken: env.user.access });
//       })
//       .then((res) => {
//         expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
//         done();
//       })
//       .catch(done);
//   });
//   describe('invalid id', () => {
//     it('should return 404 ( new id )', (done) => {
//       reqs.user
//         .delete({ workerId: ObjectId(), ...userData })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
//           done();
//         })
//         .catch(done);
//     });
//     it('should return 400 ( invalid email )', (done) => {
//       reqs.user
//         .delete({ workerId: 'not-an-id', ...userData })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.BAD_REQUEST);
//           done();
//         })
//         .catch(done);
//     });
//   });
//   describe('invalid credentials', () => {
//     it('should return 401 ( bad email )', (done) => {
//       reqs.user
//         .delete({ workerId:worker.id, ...userData, email: 'invalid@mail.com' })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
//           done();
//         })
//         .catch(done);
//     });
//     it('should return 401 ( use access token instead of email & password )', (done) => {
//       reqs.user
//         .delete({ workerId:worker.id, accessToken: env.user.access })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
//           done();
//         })
//         .catch(done);
//     });
//     it('should return 401 ( bad password )', (done) => {
//       reqs.user
//         .delete({ workerId:worker.id, ...userData, password: 'invalid' })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
//           done();
//         })
//         .catch(done);
//     });
//     it('should return 401 ( no auth )', (done) => {
//       reqs.user
//         .delete({ workerId: worker.id })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
//           done();
//         })
//         .catch(done);
//     });

//     it('should return 403 ( user is not an owner of account )', (done) => {
//       reqs.user
//         .create({
//           ...userData,
//           email: 'newUser@gmail.com'
//         })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.OK);
//           return reqs.user.delete({
//             workerId: res.body.user.id,
//             ...userData
//           });
//         })
//         .then((res) => {
//           expect(res.status).to.be.eq(httpStatus.FORBIDDEN);
//           done();
//         })
//         .catch(done);
//     });
//   });
// }
function runTestCaseCreation(testCase, done) {
  return reqs.worker
    .create({
      data: {
        ...workerData,
        ...testCase.data
      },
      accessToken: env.user.access
    })
    .then((res) => {
      expect(res.status).to.be.eq(testCase.expectedCode);
      done();
    });
}
