const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { initSocket } = require("./sockets/chatSocket");

const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

initSocket(io);

server.listen(port, () => {
  console.log(`Chat app backend listening on port ${port}`);
});
