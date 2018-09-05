const Joi = require('joi');
const path = require('path');

require('dotenv').config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  PORT: Joi.number().default(4040),
  IS_PROD: Joi.boolean().when('NODE_ENV', {
    is: Joi.string().equal('production'),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false)
  }),
  HOST: Joi.string().when('NODE_ENV', {
    is: Joi.string().equal('production'),
    then: Joi.string().default('some host'),
    otherwise: Joi.string().default('http://127.0.0.1:3000')
  })
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  isProduction: envVars.IS_PROD,
  port: envVars.PORT,
  host: envVars.HOST,
  resources: path.join(__dirname, '../public'),
  /* eslint-disable global-require */
  auth: require('./configs/auth'),
  log: require('./configs/log'),
  mongo: require('./configs/mongo'),
  acl: require('./configs/acl')
};

module.exports = config;
