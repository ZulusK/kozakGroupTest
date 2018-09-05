const _ = require('lodash');

const fieldTypes = {
  EXACTLY: 1,
  CONTAINS: 2
};
Object.freeze(fieldTypes);

const buildContainsQuery = (src, field) => {
  const searchQuery = src
    .split(field.separator || ' ')
    .map(x => `(?=.*${x})`)
    .join();
  return new RegExp(`^${searchQuery}.*$`, 'i');
};

const appendSearchFieldToQuery = (srcQuery, field, resultQuery) => {
  const value = _.get(srcQuery, field.path);
  if (value !== undefined) {
    switch (field.type) {
      case fieldTypes.CONTAINS:
        _.set(
          resultQuery,
          field.bindTo !== undefined || field.path,
          buildContainsQuery(value, field)
        );
        break;
      case fieldTypes.EXACTLY:
      default:
        _.set(resultQuery, field.bindTo !== undefined || field.path, value);
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
  fieldTypes,
  buildSearchQuery
};
