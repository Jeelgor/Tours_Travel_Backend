const { sendBookingUpdate } = require("../realtime/socket");

module.exports = {
  sendBookingUpdate,
  initializeSocket: () => {},
  getIo: () => null,
};
