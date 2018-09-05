const mailer = require('../helpers/mailer');

const login = (req, res) => res.json({
  user: req.user.toJSON(),
  tokens: req.user.genAuthTokens()
});
const get = (req, res) => res.json(req.user.toJSON());

const check = (req, res) => res.json({
  status: true
});

const genAccessToken = (req, res) => res.json(req.user.genJWTAccessToken());

module.exports = {
  login,
  get,
  check,
  genAccessToken
};
