const mongoose = require('mongoose');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const bcrypt = require('bcrypt');
const privatePaths = require('../helpers/mongoose-plugins/private-paths');
const mongoosePaginate = require('mongoose-paginate');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const { toJSONOpt, toObjectOpt } = require('../helpers');
const debug = require('debug')('app:user:model');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    password: {
      private: true,
      type: String,
      trim: true,
      required: true
    },
    jwtSecret: {
      private: true,
      type: String
    }
  },
  { timestamps: true }
);

UserSchema.set('toJSON', toJSONOpt);
UserSchema.set('toObject', toObjectOpt);

// Hash the user's password before inserting a new user
UserSchema.pre('save', function preSave(next) {
  if (this.isModified('password') || this.isNew) {
    bcrypt
      .hash(this.password, 10)
      .then((hp) => {
        this.password = hp;
        return bcrypt.genSalt(8);
      })
      .then((salt) => {
        this.jwtSecret = salt;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});
/**
 * Generate auth JWT tokens
 */

function genAuthTokens() {
  return {
    access: this.genJWTAccessToken(),
    refresh: this.genJWTRefreshToken()
  };
}
// Generate access token
function genJWTRefreshToken() {
  return {
    expiredIn: config.auth.jwtExpRefresh + Math.floor(new Date().getTime() / 1000),
    token: jwt.sign({ id: this.id, secret: this.jwtSecret }, config.auth.jwtSecretRefreshUser, {
      expiresIn: config.auth.jwtExpRefresh
    })
  };
}
// Generate refresh token
function genJWTAccessToken() {
  return {
    expiredIn: config.auth.jwtExpAccess + Math.floor(new Date().getTime() / 1000),
    token: jwt.sign({ id: this.id, secret: this.jwtSecret }, config.auth.jwtSecretAccessUser, {
      expiresIn: config.auth.jwtExpAccess
    })
  };
}
// Compare password input to password saved in database
function comparePassword(pw) {
  return bcrypt.compare(pw, this.password);
}

UserSchema.methods.genAuthTokens = genAuthTokens;
UserSchema.methods.genJWTAccessToken = genJWTAccessToken;
UserSchema.methods.genJWTRefreshToken = genJWTRefreshToken;
UserSchema.methods.comparePassword = comparePassword;

/**
 * Statics
 */
UserSchema.statics = {
  /** Get user by his email and password
   * @param {string} password - password of user
   * @param {string} email - email of user
   * @returns {Promise<User,APIError}
   */
  async getByCredentials({ email, password }) {
    debug('GET BY CRED %O', { email, password });
    const user = await this.findOne({ email }).exec();
    if (user && (await user.comparePassword(password))) {
      return user;
    }
    const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
    throw err;
  },
  /**
   * Get user by token's payload
   * @param {object} payload decoded token info
   */
  async getByToken(payload) {
    debug('GET BY TOKEN %O', payload);
    return this.findOne({ _id: payload.id, jwtSecret: `${payload.secret}` });
  },
  /**
   * Get entity by it's id
   * @param {ObjectId} id - The objectId of entity.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        debug('GET %O', user);
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists', httpStatus.NOT_FOUND, true);
        return Promise.reject(err);
      });
  },

  /**
   * List entities in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @param {object} query - query to search
   * @returns {Promise<PaginationResult<User>}
   */
  list({ skip = 0, limit = 50, query = {} } = {}) {
    debug('LIST %O, limit %s, skip %s', query, limit, skip);
    return this.paginate(query, {
      sort: { email: -1 },
      limit: +limit,
      offset: +skip
    });
  }
};

UserSchema.plugin(privatePaths);
UserSchema.plugin(mongoosePaginate);

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
