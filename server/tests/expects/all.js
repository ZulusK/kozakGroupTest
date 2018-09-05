const chai = require('chai'); // eslint-disable-line import/newline-after-import
const { expect } = chai;
const app = require('../../../index');
const _ = require('lodash');
const flatten = require('flat');
const request = require('supertest-as-promised');
const httpStatus = require('http-status');

// try to connect to server using JWT token
const expectTokenIsInvalid = (url, token, done) => {
  request(app)
    .get(url)
    .set('Authorization', `bearer ${token}`)
    .expect(httpStatus.UNAUTHORIZED)
    .then(() => {
      done();
    })
    .catch(done);
};
const expectAccessJWTToken = (token) => {
  expect(token).to.be.an('object');
  expect(token).have.all.keys(['token', 'expiredIn']);
  expect(token.token).to.be.a('string');
  expect(token.expiredIn).to.be.a('number');
  expect(token.expiredIn).to.be.least(Math.floor(Date.now() / 1000));
};
const expectRefreshJWTToken = (token) => {
  expect(token).to.be.an('object');
  expect(token).have.all.keys(['token', 'expiredIn']);
  expect(token.token).to.be.a('string');
  expect(token.expiredIn).to.be.a('number');
  expect(token.expiredIn).to.be.least(Math.floor(Date.now() / 1000));
};
// try to connect to server using JWT token
const expectTokenIsValid = (url, token, done) => {
  request(app)
    .get(url)
    .set('Authorization', `bearer ${token}`)
    .expect(httpStatus.OK)
    .then(() => {
      done();
    })
    .catch(done);
};
const expectObjectUpdated = (obj, eta) => {
  _.forIn(flatten(eta), (path) => {
    expect(_.get(obj, path)).to.be.eq(_.get(eta, path));
  });
};
const runTestCases = ({ testData, makeReq }) => {
  Object.keys(testData).forEach((param) => {
    describe(`Bad ${param}`, () => {
      testData[param].forEach((tc) => {
        it(`should return ${tc.expectedCode}, ( ${tc.description} )`, (done) => {
          makeReq(tc, done).catch(done);
        });
      });
    });
  });
};
const expectPaginatedBody = ({
  body, testForItems, skip = 0, limit = 50, total, query = {}
}) => {
  expect(body).to.be.an('object');
  expect(body).to.have.all.keys('docs', 'total', 'limit', 'offset');
  expect(body.docs).to.have.length.of.at.most(query.limit || limit);
  if (total) {
    expect(body.total).to.be.eq(total);
  }
  expect(body.limit).to.be.of.at.most(query.limit || limit);
  expect(body.offset).to.of.eq(query.skip || skip);
  body.docs.forEach(d => testForItems(d));
};
const expectAuthTokens = (tokens) => {
  expect(tokens).to.be.an('object');
  expect(tokens).have.all.keys(['access', 'refresh']);
  expectAccessJWTToken(tokens.access);
  expectRefreshJWTToken(tokens.refresh);
};

module.exports = {
  expectAuthTokens,
  expectTokenIsInvalid,
  expectAccessJWTToken,
  expectRefreshJWTToken,
  expectTokenIsValid,
  expectObjectUpdated,
  runTestCases,
  expectPaginatedBody
};
