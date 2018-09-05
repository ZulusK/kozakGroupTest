const config = require('../../../config/config');

function PasswordExtension(joi) {
  return {
    base: joi.string(),
    name: 'string',
    language: {
      noUpperCase: 'missing uppercase letter',
      noLowerCase: 'missing lowercase letter',
      noDigits: 'missing digits',
      noSpecial: 'missing special symbols',
      invalid:
        'must contains at least one upper and lower case letters, one digit and special symbol'
    },
    rules: [
      {
        name: 'isPassword',
        validate(params, value, state, options) {
          if (!/.*[a-z].*/.test(value)) {
            return this.createError('string.noLowerCase', { value }, state, options);
          }
          if (!/.*[A-Z].*/.test(value)) {
            return this.createError('string.noUpperCase', { value }, state, options);
          }
          if (!/.*\d.*/.test(value)) {
            return this.createError('string.noDigits', { value }, state, options);
          }
          if (!/.*[!@#$%^&*].*/.test(value)) {
            return this.createError('string.noSpecial', { value }, state, options);
          }
          if (!config.validation.passwordRegex.test(value)) {
            return this.createError('string.invalid', { value }, state, options);
          }
          return value;
        }
      }
    ]
  };
}

module.exports = PasswordExtension;
