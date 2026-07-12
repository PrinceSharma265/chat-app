const { createMessage } = require("../models/messageModel");

function initSocket(io) {
  const onlineUsers = {};

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("user_join", ({ username } = {}) => {
      if (typeof username === "string" && username.trim() !== "") {
        onlineUsers[socket.id] = username.trim();
        console.log(`User joined: ${onlineUsers[socket.id]}`);
        io.emit("online_users", Object.values(onlineUsers));
      }
    });

    socket.on("typing_start", ({ username } = {}) => {
      console.log(`[typing_start] received from ${socket.id}:`, username);
      if (typeof username === "string" && username.trim() !== "") {
        socket.broadcast.emit("user_typing", { username: username.trim() });
        console.log(`[typing_start] broadcasted to others`);
      }
    });

    socket.on("typing_stop", ({ username } = {}) => {
      console.log(`[typing_stop] received from ${socket.id}:`, username);
      if (typeof username === "string" && username.trim() !== "") {
        socket.broadcast.emit("user_stopped_typing", { username: username.trim() });
      }
    });

    socket.on("send_message", (payload) => {
      try {
        const { username, text } = payload || {};

        if (typeof username !== "string" || typeof text !== "string" || username.trim() === "" || text.trim() === "") {
          socket.emit("error_message", { error: "username and text are required" });
          return;
        }

        const message = createMessage({ username: username.trim(), text: text.trim() });
        io.emit("receive_message", message);
      } catch (error) {
        console.error(error);
        socket.emit("error_message", { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      const username = onlineUsers[socket.id] || "unknown user";
      delete onlineUsers[socket.id];
      io.emit("online_users", Object.values(onlineUsers));
      console.log(`User disconnected: ${username}`);
    });
  });
}

module.exports = { initSocket };