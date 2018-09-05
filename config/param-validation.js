const JoiExt = require('../server/helpers/joi-extensions');
const config = require('./config');

const Joi = require('joi').extend([JoiExt.Email, JoiExt.ObjectId, JoiExt.Password]);

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
      .required()
      .max(30)
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
    name: Joi.string()
      .trim()
      .min(2)
      .max(20)
      .required()
  }
};
// PUT /api/workers/:id
exports.updateWorker = {
  body: {
    name: Joi.string()
      .trim()
      .min(2)
      .max(20)
  }
};
// GET /api/workers
exports.listWorkers = {
  query: {
    ...DEFAULT_GET_QUERY
  }
};
