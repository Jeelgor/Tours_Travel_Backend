
const socketIo = require("socket.io");
let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: [
        "https://tours-travel-one.vercel.app",
        "http://localhost:5173",
        "https://tours-travel-backend-five.vercel.app",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

// Export `initializeSocket` and a function to get `io`
module.exports = {
  initializeSocket,
  getIo: () => io,
};
