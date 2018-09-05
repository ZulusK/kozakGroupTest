const _ = require('lodash');
const validators = require('./validators');
const errorConvertor = require('./errorConverter');
const searchQueryBuilder = require('./searchQueryBuilder');

const updateObject = (src, doc, path) => {
  if (_.hasIn(src, path)) {
    _.set(doc, path, _.get(src, path));
  }
};
const updateObjectWithReq = (src, doc, paths) => {
  _.forEach(paths, p => updateObject(src, doc, p));
  return doc;
};

const toJSONOpt = {
  virtuals: true,
  minimize: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret.__v; // eslint-disable-line no-param-reassign
    ret.id = ret._id.toString(); // eslint-disable-line no-param-reassign
    delete ret._id; // eslint-disable-line no-param-reassign
  }
};
const toObjectOpt = toJSONOpt;

module.exports = {
  validators,
  searchQueryBuilder,
  toJSONOpt,
  toObjectOpt,
  errorConvertor,
  updateObjectWithReq
};
