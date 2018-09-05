const nodemailer = require('nodemailer');
const pug = require('pug');
const config = require('../../config/config');
const log = require('../../config/winston').getLogger({ name: 'mailer' });
const _ = require('lodash');

const resetPasswordTemplateFunc = pug.compileFile(config.resources.resetPasswordTemplate);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  tls: {
    rejectUnauthorized: false
  },
  auth: {
    user: config.auth.emailAddress,
    pass: config.auth.emailPassword
  }
});

transporter.verify((error) => {
  if (error) {
    log.error('Server cannot send messages');
    log.error(error);
    throw error;
  } else {
    log.info('Server is ready to send messages');
  }
});

const sendPasswordResetEmail = ({ email, url, username }) => {
  const renderedText = resetPasswordTemplateFunc({
    email,
    username,
    url
  });
  const mail = {
    from: config.auth.emailAddress,
    to: email,
    subject: 'Reset your password',
    html: renderedText
  };
  log.info(`Sent mail to ${email}`);
  transporter.sendMail(mail);
};

module.exports = {
  // send mails only in production
  sendPasswordResetEmail: config.isProduction ? sendPasswordResetEmail : _.noop
};
