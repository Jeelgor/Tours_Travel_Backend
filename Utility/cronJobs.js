const cron = require("node-cron");
const { cancelExpiredBookings } = require("../Controller/BookingController");

// // Schedule the job to run every 2 minutes
// cron.schedule("*/2 * * * *", async () => {
//   console.log("⏳ Running scheduled job: cancelExpiredBookings");
//   try {
//     await cancelExpiredBookings();
//     console.log("✅ Expired bookings processed successfully.");
//   } catch (error) {
//     console.error("❌ Error during scheduled cancellation:", error);
//   }
// });
