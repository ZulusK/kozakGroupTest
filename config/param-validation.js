const JoiExt = require('../server/helpers/joi-extensions');
const config = require('./config');

const Joi = require('joi').extend([
  JoiExt.Email,
  JoiExt.ObjectId,
  JoiExt.Password,
  JoiExt.MobilePhone
]);

const DEFAULT_GET_QUERY = {
  skip: Joi.number().min(0),
  limit: Joi.number()
    .min(1)
    .max(100),
  populate: Joi.boolean()
};

// POST /api/users
exports.createUser = {
  body: {
    email: Joi.string()
      .isEmail()
      .required(),
    password: Joi.string()
      .trim()
      .min(8)
      .max(20)
      .isPassword()
      .required(),
    username: Joi.string()
      .trim()
      .min(2)
      .max(30)
      .regex(/^\w+$/)
      .required()
  }
};
// GET /api/users
exports.listUsers = {
  query: {
    ...DEFAULT_GET_QUERY
  }
};
// PUT /api/users/:id
exports.updateUser = {
  body: {
    email: Joi.string().isEmail(),
    password: Joi.any().forbidden(),
    username: Joi.string()
      .trim()
      .min(2)
      .regex(/^\w+$/)
      .max(30)
  }
};
// PUT /api/users/:id/password
exports.updateUserPassword = {
  body: {
    password: Joi.string()
      .required()
      .trim()
      .min(8)
      .max(20)
      .isPassword()
  }
};
// POST /api/workers
exports.creatWorker = {
  body: {
    gender: Joi.string()
      .trim()
      .valid('male', 'female'),
    contacts: Joi.object().keys({
      email: Joi.string().isEmail(),
      mobileNumber: Joi.string().isMobileNumber()
    }),
    fullname: Joi.string()
      .trim()
      .min(2)
      .max(40)
      .regex(/^[a-zA-Z. ]*$/)
      .required(),
    position: Joi.string()
      .trim()
      .min(2)
      .max(40)
      .required(),
    salary: Joi.number()
      .min(0)
      .required()
  }
};
// PUT /api/workers/:id
exports.updateWorker = {
  body: {
    gender: Joi.string()
      .trim()
      .valid('male', 'female'),
    contacts: Joi.object().keys({
      email: Joi.string().isEmail(),
      mobileNumber: Joi.string().isMobileNumber()
    }),
    fullname: Joi.string()
      .trim()
      .min(2)
      .max(40)
      .regex(/^[a-zA-Z. ]*$/)
      .required(),
    position: Joi.string()
      .trim()
      .min(2)
      .max(40)
      .required(),
    salary: Joi.number()
      .min(0)
      .required()
  }
};
// GET /api/workers
exports.listWorkers = {
  query: {
    ...DEFAULT_GET_QUERY,
    fullname: Joi.string()
      .trim()
      .max(40),
    position: Joi.string()
      .trim()
      .max(40),
    salary: Joi.number().min(0),
    gender: Joi.string()
      .trim()
      .valid('male', 'female')
  }
};
