import mongoose from "mongoose";
import schedule from "node-schedule";
import axios from "axios";

const mongodbURL = process.env.mongoDbUrl;
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongodbURL, opts).then((mongoose) => {
      console.log("mongoDB connected successfully.");
      schedule.scheduleJob("0 * * *", async function () {
        let doneChecking = await checkInactiveVisitor();
        if (doneChecking)
          console.log("Check inactive visitor done.[happens every 12AM]");
      });
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

async function checkInactiveVisitor() {
  return await axios.get("/api/etc", {
    params: {
      mode: "check-inactive-visitor",
    },
  });
}

export default dbConnect;
