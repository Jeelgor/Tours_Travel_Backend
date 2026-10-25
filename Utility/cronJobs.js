const cron = require("node-cron");
const { cancelExpiredBookings } = require("../Controller/BookingController");

const startCronJobs = () => {
  cron.schedule("*/2 * * * *", async () => {
    try {
      await cancelExpiredBookings();
    } catch (error) {
      console.error("❌ Error during scheduled cancellation:", error);
    }
  });
  console.log("⏰ Background cron jobs started.");
};

module.exports = { startCronJobs };
