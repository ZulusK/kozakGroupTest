const Worker = require('./worker.model');
const helpers = require('../helpers');
const log = require('../../config/winston').getLogger({ name: 'worker:ctrl' });
const debug = require('debug')('app:worker:ctrl');

/**
 * Load entity and append it to req
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 * @param {String} id - id of entity
 */
const load = (req, res, next, id) => Worker.get(id)
  .then((worker) => {
    req.$worker = worker; // eslint-disable-line no-param-reassign
    debug('LOAD worker %O', worker);
    return next();
  })
  .catch(e => next(e));

/**
 * Get entity by it's id
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 */
const get = (req, res) => {
  debug('GET worker %O', req.$worker);
  return res.json(req.$worker.toJSON());
};

/**
 * Create new entity
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 */
const create = async (req, res, next) => {
  try {
    const worker = new Worker({
      gender: req.body.gender,
      fullname: req.body.fullname,
      contacts: req.body.contacts,
      position: req.body.position,
      salary: req.body.salary
    });
    const savedWorker = await worker.save();
    log.info('new worker created %s', savedWorker.id);
    return res.json(savedWorker.toJSON());
  } catch (err) {
    return next(err);
  }
};
/**
 * Update entity by id
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 */
const update = async (req, res, next) => {
  try {
    const worker = req.$worker;
    helpers.updateObjectWithReq(req.body, worker, [
      'gender',
      'fullname',
      'contacts',
      'position',
      'salary'
    ]);
    const savedWorker = await worker.save();
    log.info('worker updated %s', savedWorker.id);
    return res.json(savedWorker.toJSON());
  } catch (err) {
    return next(err);
  }
};

const searchQueryList = [
  {
    path: 'fullname',
    type: helpers.searchQueryBuilder.fieldTypes.CONTAINS_WORDS
  },
  {
    path: 'salary',
    type: helpers.searchQueryBuilder.fieldTypes.EXACTLY
  },
  {
    path: 'gender',
    type: helpers.searchQueryBuilder.fieldTypes.EXACTLY
  },
  {
    path: 'position',
    type: helpers.searchQueryBuilder.fieldTypes.CONTAINS_FULL
  }
];

/**
 * List entities by quey
 * @param {Express.Request} req request object
 * @param {Express.Response} res response object
 * @param {Express.Next} next next middleware
 */
const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0, populate = false } = req.query;

    const paginatedResult = await Worker.list({
      limit,
      skip,
      populate,
      query: helpers.searchQueryBuilder.buildSearchQuery(req.query, searchQueryList)
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
    const worker = req.$worker;
    const deletedWorker = await worker.remove();
    log.info('delete worker %s', deletedWorker.id);
    return res.json(deletedWorker.toJSON());
  } catch (err) {
    return next(err);
  }
};
module.exports = {
  load,
  get,
  create,
  update,
  list,
  delete: remove
};
