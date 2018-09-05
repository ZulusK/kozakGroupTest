const mongoose = require('mongoose');
const util = require('util');
const config = require('../../config/config');
const log = require('../../config/winston').getLogger({ name: 'mongo' });
const debug = require('debug')('app:mongo');

mongoose.Promise = Promise;
// print mongoose logs in dev env
if (config.mongo.debug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}
const onMongoConnectionError = (err) => {
  if (err) {
    log.error(err);
    throw new Error(`unable to connect to database: ${config.mongo.uri}`);
  } else {
    log.info('connected to database');
    // TODO: remove this
    if (config.env === 'development') {
      // await filler.fillAllDBs();
    }
  }
};
// connect to mongo db
const connect = () => {
  mongoose.connect(
    config.mongo.host,
    {
      useNewUrlParser: true,
      keepAlive: 1,
      pass: config.mongo.password,
      user: config.mongo.user
    },
    onMongoConnectionError
  );
};

module.exports = {
  connect
};
