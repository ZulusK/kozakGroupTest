const User = require('../../user/user.model');
const Worker = require('../../worker/worker.model');
const log = require('../../../config/winston').getLogger({ module });
const usersData = require('./usersData');
const workersData = require('./workersData');

async function fillUserDB() {
  const users = await Promise.all(usersData.map(x => new User(x).save()));
  await users[0].update({ additionalInfo: { isEmailConfirmed: true } });
  log.debug(`fill users db with ${users.length} docs`);
  return users;
}

async function fillWorkerDB() {
  const workers = await Promise.all(workersData.map(x => new Worker(x).save()));
  log.debug(`fill workers db with ${workers.length} docs`);
  return workers;
}

function fillAllDBs() {
  return clearAllDBs()
    .then(() => fillUserDB())
    .then(() => fillWorkerDB());
}
function clearUserDB() {
  return User.remove().exec();
}
function clearWorkerDB() {
  return Worker.remove().exec();
}

function clearAllDBs() {
  log.debug('clear all DBs');
  return Promise.all([clearUserDB(), clearWorkerDB()]);
}

module.exports = {
  fillAllDBs,
  fillUserDB,
  clearUserDB,
  clearWorkerDB,
  clearAllDBs
};
