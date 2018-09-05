const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const mongoosePaginate = require('mongoose-paginate');
const privatePaths = require('../helpers/mongoose-plugins/private-paths');
const debug = require('debug')('app:worker:model');
const { toJSONOpt, toObjectOpt } = require('../helpers');

/**
 * Store Schema
 */
const WorkerSchema = new mongoose.Schema({}, { timestamps: true });

WorkerSchema.index({});

WorkerSchema.set('toJSON', toJSONOpt);
WorkerSchema.set('toObject', toObjectOpt);

/**
 * Statics
 */
WorkerSchema.statics = {
  /**
   * Get worker
   * @param {ObjectId} id - The objectId of entity.
   * @returns {Promise<Worker, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((worker) => {
        debug('GET %O', worker);
        if (worker) {
          return worker;
        }
        const err = new APIError('No such worker exists!', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },
  /**
   * List entities in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @returns {Promise<PaginationResult<Worker>}
   */
  list({
    skip = 0, limit = 50, populate = false, query = {}
  } = {}) {
    debug('LIST %O, limit %s, skip %s', query, limit, skip);
    return this.paginate(query, {
      sort: { createdAt: -1 },
      limit: +limit,
      offset: +skip,
      populate: populate ? [] : undefined
    });
  }
};
WorkerSchema.plugin(privatePaths);
WorkerSchema.plugin(mongoosePaginate);

/**
 * @typedef Worker
 */
module.exports = mongoose.model('Worker', WorkerSchema);
