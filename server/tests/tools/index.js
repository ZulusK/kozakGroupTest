const dbFiller = require('../../helpers/dbFiller');

/* eslint-disable-next-line consistent-return */
function cleanup(done) {
  if (done) {
    dbFiller
      .clearAllDBs()
      .then(() => done())
      .catch(done);
  } else {
    return dbFiller.clear();
  }
}

function parseAuthBody(body, auth = {}) {
  auth.account = body.user;
  auth.access = body.tokens.access.token;
  auth.refresh = body.tokens.refresh.token;
  auth.refreshExpiredIn = body.tokens.refresh.expiredIn;
  auth.accessExpiredIn = body.tokens.access.expiredIn;
  return auth;
}

module.exports = {
  cleanup,
  parseAuthBody
};
