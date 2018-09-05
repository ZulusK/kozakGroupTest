const chai = require('chai');
const all = require('./all');

const expect = chai.expect;

const publicFields = ['id', 'username', 'email'];
const privateFields = ['password', '_id', '__v'];

const expectUser = (user, etaloneFields = {}) => {
  expect(user).to.be.an('object');
  expect(user).to.include.keys(publicFields);
  expect(user).to.not.include.keys(privateFields);
  Object.keys(etaloneFields).forEach((key) => {
    expect(user[key]).to.be.deep.eq(etaloneFields[key]);
  });
};

const expectUserUpdated = (user, newData) => {
  expectUser(user);
  all.expectObjectUpdated(user, newData);
};

// check access token of user is not outdated
const expectAccessTokenIsValid = (token, done) => {
  all.expectTokenIsValid('/api/auth/check-access', token, done);
};
// check refresh token of user is not outdated
const expectRefreshTokenIsValid = (token, done) => {
  all.expectTokenIsValid('/api/auth/check-refresh', token, done);
};

module.exports = {
  expectUser,
  expectUserUpdated,
  expectAccessTokenIsValid,
  expectRefreshTokenIsValid
};
