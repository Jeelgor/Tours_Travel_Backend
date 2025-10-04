import { Queue } from "bullmq";
import { redisConnection } from "./redisClient";

export const bookingQueue = new Queue("bookingQueue", {
  connection: redisConnection,
});
