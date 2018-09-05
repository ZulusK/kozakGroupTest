const config = require('../config');
const log = require('../winston').getLogger({ name: 'rabbit' });
const amqp = require('amqplib');
const debug = require('debug')('app:rabbit');

let connection = null;
let channel = null;

function disconnect() {
  connection.close.bind(connection);
  log.info('closed');
}
async function bindToRoutingKey(routingKey, consumer, opt = { exclusive: true, durable: false }) {
  const qok = await channel.assertQueue('', opt);
  await channel.bindQueue(qok.queue, config.rabbit.exchange, routingKey);
  await channel.consume(qok.queue, consumer);
}
async function bindToQueue(queue, consumer, opt = {}) {
  await channel.consume(queue, consumer, opt);
}
function connect() {
  return amqp
    .connect(config.rabbit.host)
    .then(async (conn) => {
      log.info('CONNECTED to HOST');
      connection = conn;
      channel = await conn.createChannel();
      log.info('channel CREATED');
      await channel.assertExchange(config.rabbit.exchange, 'topic', {
        durable: true // if true, the exchange will survive broker restarts
      });
      log.info(`JOINED to exchange ${config.rabbit.exchange}`);
      await channel.assertQueue(config.rabbit.showOrder2DriverResultQueue, { durable: true });
      log.info(`CREATED queue ${config.rabbit.showOrder2DriverResultQueue}`);
    })
    .catch((err) => {
      log.error(err);
      debug(err);
      throw err;
    });
}

function sendToQueue(queue, data) {
  return channel.sendToQueue(queue, encode(data), {
    persistent: true
  });
}

function encode(data) {
  return Buffer.from(JSON.stringify(data));
}

function sendToExchange(route, data, opt = {}) {
  debug('SEND msg %O to %s', data, route);
  return channel.publish(config.rabbit.exchange, route, encode(data), opt);
}

module.exports = {
  connect,
  bindToQueue,
  bindToRoutingKey,
  sendToQueue,
  sendToExchange,
  disconnect
};
