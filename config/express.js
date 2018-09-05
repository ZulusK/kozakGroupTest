const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
const httpStatus = require('http-status');
const expressWinston = require('express-winston');
const helmet = require('helmet');
const winstonInstance = require('./winston').expressWinstonInstance;
const routes = require('../server/routes');
const config = require('./config');
const APIError = require('../server/helpers/APIError');
const boolParser = require('express-query-boolean');
const auth = require('./passport/index');
const fileUpload = require('express-fileupload');
const helpers = require('../server/helpers/index');

const app = express();
if (config.env !== 'test') {
  app.use(logger('dev'));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(boolParser());
app.use(fileUpload());

app.use(auth.init());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable detailed API logging
if (config.log.express) {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(
    expressWinston.logger({
      meta: true,
      expressFormat: true,
      winstonInstance
    })
  );
}
// mount all routes on /api path
app.use('/api', routes);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  // console.log(err);
  next(helpers.errorConvertor.normalizeError(err));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.NOT_FOUND);
  return next(err);
});

// error handler, send stacktrace only during development
app.use((
  err,
  req,
  res,
  next // eslint-disable-line no-unused-vars
) => res.status(err.status).json({
  message: err.isPublic ? err.message : httpStatus[err.status],
  stack: config.env === 'development' ? err.stack : undefined
}));

module.exports = app;
