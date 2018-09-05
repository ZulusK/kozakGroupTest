const pug = require('pug');
const nodemailer = require('nodemailer');
const config = require('../../config/config');
const log = require('../../config/winston').getLogger({ name: 'mailer' });
const path = require('path');
const _ = require('lodash');

const resetPasswordTemplateFunc = pug.compileFile(
  path.join(config.resources, 'resetPasswordEmail.pug')
);

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

function sendPasswordResetEmail({ email, url, username }) {
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
}

module.exports = {
  // send mails only in production
  sendPasswordResetEmail: config.isProduction ? sendPasswordResetEmail : _.noop
};
