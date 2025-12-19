require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
const initSocketServer = require("./src/sockets/socket.server");

const httpServer = require("http").createServer(app);

async function startServer() {
  await connectDB();

  require("./src/cron/expiryCron");

  initSocketServer(httpServer);

  httpServer.listen(3000, () => {
    console.log("Server is Started & is Ready to listen Requests");
  });
}

startServer();
