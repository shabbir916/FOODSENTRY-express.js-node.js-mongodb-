require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/db/db");
const initSocketServer = require("./src/sockets/socket.server");

const PORT = process.env.PORT || 10000; // Render injects PORT automatically

const httpServer = http.createServer(app);

async function startServer() {
  try {
    await connectDB();
    console.log("Database connected successfully");

    require("./src/cron/expiryCron");

    initSocketServer(httpServer);

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Server running on port ${PORT} in ${
          process.env.NODE_ENV || "development"
        } mode`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
