// Optional BullMQ background booking queue
// Connection to Redis can be configured when REDIS_URL is provided
const { Queue } = require("bullmq");

let bookingQueue = null;

if (process.env.REDIS_URL) {
  try {
    const IORedis = require("ioredis");
    const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
    bookingQueue = new Queue("bookingQueue", { connection });
    console.log("BullMQ booking queue initialized");
  } catch (err) {
    console.warn("Redis/BullMQ not initialized:", err.message);
  }
}

module.exports = { bookingQueue };
