const mongoose = require('mongoose');
const util = require('util');
const config = require('../../config/config');
const log = require('../../config/winston').getLogger({ name: 'mongo' });
const debug = require('debug')('mongo');

mongoose.Promise = Promise;
// print mongoose logs in dev env
if (config.mongo.debug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}
// connect to mongo db
function connect() {
  mongoose
    .connect(
      config.mongo.host,
      {
        useNewUrlParser: true,
        keepAlive: 1
        // pass: config.mongo.password ,
        // user: config.mongo.user
      }
    )
    .then(() => {
      log.info('connected to database');
      // TODO: remove this
      if (config.env === 'development') {
        // await filler.fillAllDBs();
      }
    })
    .catch((err) => {
      log.error(err);
      throw new Error(`unable to connect to database: ${config.mongo.uri}`);
    });
}

module.exports = {
  connect
};
