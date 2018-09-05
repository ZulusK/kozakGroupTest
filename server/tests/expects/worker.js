const chai = require('chai');
const all = require('./all');

const expect = chai.expect;

const publicFields = ['id', 'fullname', 'position', 'salary', 'contacts', 'gender'];
const privateFields = ['_id', '__v'];

const expectWorker = (user, etaloneFields = {}) => {
  expect(user).to.be.an('object');
  expect(user).to.include.keys(publicFields);
  expect(user).to.not.include.keys(privateFields);
  Object.keys(etaloneFields).forEach((key) => {
    expect(user[key]).to.be.deep.eq(etaloneFields[key]);
  });
};

const expectWorkerUpdated = (user, newData) => {
  expectWorker(user);
  all.expectObjectUpdated(user, newData);
};

module.exports = {
  expectWorker,
  expectWorkerUpdated
};
