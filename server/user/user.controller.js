const User = require('./user.model');
const helpers = require('../helpers');
const log = require('../../config/winston').getLogger({ name: 'user:ctrl' });
const debug = require('debug')('app:user:ctrl');

/**
 * Load entity and append it to req
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 * @param {String} id - id of entity
 */
const load = (req, res, next, id) => User.get(id)
  .then((user) => {
    req.$user = user; // eslint-disable-line no-param-reassign
    debug('LOAD user %O', user);
    return next();
  })
  .catch(e => next(e));

/**
 * Get entity by it's id
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 */
const get = (req, res) => {
  debug('GET user %O', req.$user);
  return res.json(req.$user.toJSON());
};

/**
 * Create new entity
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.password - The password of user.
 */
const create = async (req, res, next) => {
  try {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    });
    const savedUser = await user.save();
    log.info('new user created %s', savedUser.id);
    return res.json({
      user: savedUser.toJSON(),
      tokens: await savedUser.genAuthTokens()
    });
  } catch (err) {
    return next(err);
  }
};
/**
 * Update entity by id
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 * @property {string} req.body.email - The email of user.
 * @property {string} req.body.username - The username of user.
 */
const update = async (req, res, next) => {
  try {
    const user = req.$user;
    helpers.updateObjectWithReq(req.body, user, ['username', 'email']);
    const savedUser = await user.save();
    log.info('user updated %s', savedUser.id);
    return res.json(savedUser.toJSON());
  } catch (err) {
    return next(err);
  }
};
/**
 * List entities by quey
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 * @property {string} req.query.skip - The email of user.
 * @property {string} req.query.limit - The username of user.
 */
const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0, populate = false } = req.query;
    const paginatedResult = await User.list({
      limit,
      skip,
      populate
    });
    return res.json({
      ...paginatedResult,
      docs: paginatedResult.docs.map(e => e.toJSON())
    });
  } catch (err) {
    return next(err);
  }
};
/**
 * Delete entity by it's id
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 */
const remove = async (req, res, next) => {
  try {
    const user = req.$user;
    const deletedUser = await user.remove();
    log.info('delete user %s', deletedUser.id);
    return res.json(deletedUser.toJSON());
  } catch (err) {
    return next(err);
  }
};
/**
 * Update user's password
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 * @property {string} req.body.password - The password of user.
 */
const updatePassword = async (req, res, next) => {
  try {
    const user = req.$user;
    helpers.updateObjectWithReq(req.body, user, ['password']);
    const savedUser = await user.save();
    log.info('user password updated %s', savedUser.id);
    return res.json(savedUser.toJSON());
  } catch (err) {
    return next(err);
  }
};
module.exports = {
  updatePassword,
  load,
  get,
  create,
  update,
  list,
  delete: remove
};
