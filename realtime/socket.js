let ioInstance;

const setupSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

const sendBookingUpdate = (booking) => {
  console.log(booking, "from socket");
  if (ioInstance) {
    ioInstance.emit("bookingConfirmed", booking);
  }
};

module.exports = {
  setupSocket,
  sendBookingUpdate,
};  
