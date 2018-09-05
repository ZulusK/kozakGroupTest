const Joi = require('joi');

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  JWT_REFRESH_EXP: Joi.number()
    .when('NODE_ENV', {
      is: Joi.string().equal('test'),
      then: Joi.number().default(3),
      otherwise: Joi.number().default(60 * 60 * 24 * 30) //  30 days
    })
    .description('Lifetime of JWT refresh token'),
  JWT_ACCESS_EXP: Joi.number()
    .when('NODE_ENV', {
      is: Joi.string().equal('test'),
      then: Joi.number().default(3),
      otherwise: Joi.number().default(60 * 60) // 1 hour
    })
    .description('Lifetime of JWT access token'),
  JWT_SECRET_ACCESS_USER: Joi.string()
    .default()
    .description('JWT Secret required to sign'),
  JWT_SECRET_REFRESH_USER: Joi.string()
    .required()
    .description('JWT Secret required to sign')
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  jwtSecretAccessUser: envVars.JWT_SECRET_ACCESS_USER,
  jwtSecretRefreshUser: envVars.JWT_SECRET_REFRESH_USER,
  jwtSecretAccessDriver: envVars.JWT_SECRET_ACCESS_DRIVER,
  jwtSecretRefreshDriver: envVars.JWT_SECRET_REFRESH_DRIVER,
  jwtExpAccess: envVars.JWT_ACCESS_EXP,
  jwtExpRefresh: envVars.JWT_REFRESH_EXP
};

module.exports = config;
