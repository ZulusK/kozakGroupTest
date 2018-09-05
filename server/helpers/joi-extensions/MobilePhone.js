const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const config = require('../../../config/config');

function MobilePhoneExtension(joi) {
  return {
    base: joi.string(),
    name: 'string',
    language: {
      notPhoneNumber: 'The string {{value}} is not a valid phone number',
      notLocalPhoneNumber: 'The number {{value}} is not a valid phone number of {{cc}}',
      outOfFormat: 'The number {{value}} is not in a format "+CC0123456789"'
    },
    rules: [
      {
        name: 'isMobileNumber',
        validate(params, value, state, options) {
          if (!/^\+\d{1,3}\d{8,9}$/.test(value)) {
            return this.createError('string.outOfFormat', { value }, state, options);
          }
          const phone = phoneUtil.parseAndKeepRawInput(value, 'UA'); // TODO: replace UA -> SG
          if (!(phoneUtil.isValidNumber(phone) && phoneUtil.isPossibleNumber(phone))) {
            return this.createError('string.notPhoneNumber', { value }, state, options);
          }
          return phoneUtil.format(phone, PNF.E164);
        }
      },
      {
        name: 'isLocalMobileNumber',
        params: {
          options: joi.object().keys({
            cc: joi
              .string()
              .max(3)
              .min(2)
          })
        },
        validate(params, value, state, options) {
          if (!/^\+\d{1,3}\d{8,9}$/.test(value)) {
            return this.createError('string.outOfFormat', { value }, state, options);
          }
          const phone = phoneUtil.parseAndKeepRawInput(value, params.options.cc);
          if (config.env === 'development') {
            return phoneUtil.format(phone, PNF.E164);
          }
          if (!(phoneUtil.isValidNumber(phone) && phoneUtil.isPossibleNumber(phone))) {
            return this.createError('string.notPhoneNumber', { value }, state, options);
          }
          if (phoneUtil.getRegionCodeForNumber(phone) !== params.options.cc) {
            return this.createError(
              'string.notLocalPhoneNumber',
              { value, cc: params.options.cc },
              state,
              options
            );
          }
          // Format number in the national format.
          return phoneUtil.format(phone, PNF.E164);
        }
      }
    ]
  };
}

module.exports = MobilePhoneExtension;
