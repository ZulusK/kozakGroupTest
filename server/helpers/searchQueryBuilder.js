const _ = require('lodash');

const fieldTypes = {
  EXACTLY: 1,
  CONTAINS_WORDS: 2,
  CONTAINS_FULL: 3
};
Object.freeze(fieldTypes);

const buildContainsWordsQuery = (src, field = {}) => {
  const searchQuery = src
    .split(field.separator !== undefined ? field.separator : ' ')
    .map(x => `(?=.*${x})`)
    .join();
  return new RegExp(`^${searchQuery}.*$`, 'i');
};
const buildContainsFullQuery = src => new RegExp(`^.*${src}.*$`, 'i');
const appendSearchFieldToQuery = (srcQuery, field, resultQuery) => {
  const value = _.get(srcQuery, field.path);
  if (value !== undefined) {
    switch (field.type) {
      case fieldTypes.CONTAINS_WORDS:
        _.set(
          resultQuery,
          field.bindTo !== undefined ? field.bindTo : field.path,
          buildContainsWordsQuery(value, field)
        );
        break;
      case fieldTypes.CONTAINS_FULL:
        _.set(
          resultQuery,
          field.bindTo !== undefined ? field.bindTo : field.path,
          buildContainsFullQuery(value)
        );
        break;
      case fieldTypes.EXACTLY:
      default:
        _.set(resultQuery, field.bindTo !== undefined ? field.bindTo : field.path, value);
        break;
    }
  }
};

const buildSearchQuery = (srcQuery = {}, fields = []) => {
  const resultQuery = {};
  fields.forEach((field) => {
    appendSearchFieldToQuery(srcQuery, field, resultQuery);
  });
  return resultQuery;
};

module.exports = {
  buildContainsWordsQuery,
  fieldTypes,
  buildContainsFullQuery,
  buildSearchQuery
};
