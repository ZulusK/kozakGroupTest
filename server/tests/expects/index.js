const all = require('./all');
const user = require('./user');
const worker = require('./worker');

module.exports = {
  ...all,
  worker,
  user
};
