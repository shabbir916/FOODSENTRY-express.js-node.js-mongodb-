require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");
const initSocketServer = require("./src/sockets/socket.server");
const http = require("http");

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

async function startServer() {
  try {
    await connectDB();

    require("./src/cron/expiryCron");

    initSocketServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(
        `Server started on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
