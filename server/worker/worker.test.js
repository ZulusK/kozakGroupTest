const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const reqs = require('../tests/reqs');
const expects = require('../tests/expects');
const mongoose = require('mongoose');
const { userData, workerData } = require('../tests/validData');
const { testSuitsForWorker, defaultTestsForQueries } = require('../tests/testQueries');
const testTools = require('../tests/tools');
const faker = require('faker');
const _ = require('lodash');
const helpers = require('../helpers');
const dbFiller=require('../helpers/dbFiller')

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
  describe('# GET /api/workers/:id', testWorkerGetById);
  describe('# DELETE /api/workers/:id', testWorkerDelete);
  describe('# GET /api/workers', testWorkerList);
});

function testWorkerCreation() {
    after('clear workers db',(done)=>{
        dbFiller.clearWorkerDB().then(()=>done()).catch(done)
    })
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
    after('clear workers db',(done)=>{
        dbFiller.clearWorkerDB().then(()=>done()).catch(done)
    })
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
function testWorkerGetById() {
    after('clear workers db',(done)=>{
        dbFiller.clearWorkerDB().then(()=>done()).catch(done)
    })
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
  it('should return worker (valid id & token) ', (done) => {
    reqs.worker
      .getById({ workerId: worker.id, accessToken: env.user.access })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expects.worker.expectWorker(res.body, worker);
        done();
      })
      .catch(done);
  });
  describe('invalid id', () => {
    it('should return 404 ( new id )', (done) => {
      reqs.worker
        .getById({ workerId: ObjectId(), accessToken: env.user.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
          done();
        })
        .catch(done);
    });
    it('should return 400 ( invalid id )', (done) => {
      reqs.worker
        .getById({ workerId: 'not-an-id', accessToken: env.user.access })
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
        .getById({ workerId: worker.id, accessToken: 'Asd' })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( no auth )', (done) => {
      reqs.worker
        .getById({ workerId: worker.id })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
  });
}
function testWorkerDelete() {
    after('clear workers db',(done)=>{
        dbFiller.clearWorkerDB().then(()=>done()).catch(done)
    })
  let worker = {
    id: null
  };
  beforeEach('create worker', (done) => {
    reqs.worker
      .create({ data: workerData, accessToken: env.user.access })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        worker = res.body;
        done();
      })
      .catch(done);
  });

  it('should return 200 and deleted worker (valid id & token)', (done) => {
    reqs.worker
      .delete({ workerId: worker.id, accessToken: env.user.access })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        expects.worker.expectWorker(res.body, worker);
        done();
      })
      .catch(done);
  });
  it('should return 404 on getById after deleting', (done) => {
    reqs.worker
      .delete({ workerId: worker.id, accessToken: env.user.access })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.OK);
        return reqs.worker.getById({ workerId: worker.id, accessToken: env.user.access });
      })
      .then((res) => {
        expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
        done();
      })
      .catch(done);
  });
  describe('invalid id', () => {
    it('should return 404 ( new id )', (done) => {
      reqs.worker
        .delete({ workerId: ObjectId(), accessToken: env.user.access })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.NOT_FOUND);
          done();
        })
        .catch(done);
    });
    it('should return 400 ( invalid email )', (done) => {
      reqs.worker
        .delete({ workerId: 'not-an-id', accessToken: env.user.access })
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
        .delete({ workerId: worker.id, accessToken: 'Asd' })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
    it('should return 401 ( no auth )', (done) => {
      reqs.worker
        .delete({ workerId: worker.id })
        .then((res) => {
          expect(res.status).to.be.eq(httpStatus.UNAUTHORIZED);
          done();
        })
        .catch(done);
    });
  });
}
function testWorkerList() {
    after('clear workers db',(done)=>{
        dbFiller.clearWorkerDB().then(()=>done()).catch(done)
    })
  const NUM_OF_WORKERS = 20;
  const workers = [];
  before(`create ${NUM_OF_WORKERS} workers`, (done) => {
    const data = Array.from({ length: NUM_OF_WORKERS }, () => ({
      ...workerData,
      fullname: workerData.fullname+` ${faker.name.firstName()}`,
      salary: faker.commerce.price(),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      position: faker.name.jobTitle()
    }));
    Promise.all(data.map(d => reqs.worker.create({ data: d, accessToken: env.user.access })))
      .then((results) => {
        results.forEach((e, i) => {
          if (e.status === httpStatus.OK) {
            workers.push(e.body);
          }
        });
        done();
      })
      .catch(done);
  });
  describe('use query options', () => {
    defaultTestsForQueries.forEach((ts) => {
      it(`should return ${ts.expectedCode}, ( ${JSON.stringify(ts.query)} )`, (done) => {
        reqs.worker
          .get({ query: ts.query, accessToken: env.user.access })
          .then((res) => {
            expect(res.status).to.be.eq(ts.expectedCode);
            if (ts.expectedCode === httpStatus.OK) {
              expects.expectPaginatedBody({
                body: res.body,
                testForItems: item => expects.worker.expectWorker(item),
                query: ts.query,
                total: workers.length
              });
            }
            done();
          })
          .catch(done);
      });
    });
  });
  describe('use custom query', () => {
    describe('test search by fullname', () => {
      it('should return 200', (done) => {
        const nameToSearch = workers[0].fullname.split(' ')[0];
        const regexToSearch = helpers.searchQueryBuilder.buildContainsWordsQuery(nameToSearch);
        const expectedWorkers = _.filter(workers, w => regexToSearch.test(w.fullname));
        expect(expectedWorkers).to.have.length.at.least(1);
        reqs.worker
          .get({ query: { fullname: nameToSearch }, accessToken: env.user.access })
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.OK);
            expects.expectPaginatedBody({
              body: res.body,
              testForItems: item => expects.worker.expectWorker(item),
              total: expectedWorkers.length
            });
            done();
          })
          .catch(done);
      });
    });
    describe('test search by salary', () => {
      it('should return 200', (done) => {
        const salaryToSearch = workers[0].salary;
        const expectedWorkers = _.filter(workers, w => Math.abs(w.salary - salaryToSearch) < 1e-6);
        expect(expectedWorkers).to.have.length.at.least(1);
        reqs.worker
          .get({ query: { salary: salaryToSearch }, accessToken: env.user.access })
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.OK);
            expects.expectPaginatedBody({
              body: res.body,
              testForItems: item => expects.worker.expectWorker(item),
              total: expectedWorkers.length
            });
            done();
          })
          .catch(done);
      });
    });
    describe('test search by gender', () => {
      it('should return 200', (done) => {
        const genderToSearch = 'female';
        const expectedWorkers = _.filter(workers, w => w.gender === genderToSearch);
        expect(expectedWorkers).to.have.length.at.least(1);
        reqs.worker
          .get({ query: { gender: genderToSearch }, accessToken: env.user.access })
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.OK);
            expects.expectPaginatedBody({
              body: res.body,
              testForItems: item => expects.worker.expectWorker(item),
              total: expectedWorkers.length
            });
            done();
          })
          .catch(done);
      });
    });
    describe('test search by position', () => {
      it('should return 200', (done) => {
        const positionToSearch = workers[0].position;
        const regexToSearch = helpers.searchQueryBuilder.buildContainsFullQuery(positionToSearch);
        const expectedWorkers = _.filter(workers, w => regexToSearch.test(w.position));
        expect(expectedWorkers).to.have.length.at.least(1);
        reqs.worker
          .get({ query: { position: positionToSearch }, accessToken: env.user.access })
          .then((res) => {
            expect(res.status).to.be.eq(httpStatus.OK);
            expects.expectPaginatedBody({
              body: res.body,
              testForItems: item => expects.worker.expectWorker(item),
              total: expectedWorkers.length
            });
            done();
          })
          .catch(done);
      });
    });
  });
}
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
