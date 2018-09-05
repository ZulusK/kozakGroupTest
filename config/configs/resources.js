const path = require('path');

const config = {
  resetPasswordTemplate: path.join(__dirname, '../../public/resetPasswordEmail.pug')
};

module.exports = config;
