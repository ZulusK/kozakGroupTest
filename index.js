const config = require("./config/config");
const app = require("./config/express");
const log = require("./config/winston").getLogger({ name: "index" });
const http = require("http");
const mongo = require("./server/services/mongo");

// connect to MongoDB
mongo.connect();

const server = http.createServer(app);

process.on("SIGINT", disconnect);
process.on("SIGTERM", disconnect);
process.on("exit", disconnect);

function disconnect(exitCode) {
  if (exitCode !== 0) {
    log.error(`exit code ${exitCode}`);
  } else {
    log.info(`exit code ${exitCode}`);
  }
  server.close();
  log.info("Server stopped");
  process.exit(exitCode);
}
// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.port
  server.listen(config.port, () => {
    log.info(`server started on port ${config.port} (${config.env})`);
  });
}

module.exports = app;
