const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to local URI (${MONGO_URI}): ${error.message}`);
    console.log(`[MongoDB] Starting In-Memory MongoDB Server fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] In-Memory Database running and connected at ${memoryUri}`);
    } catch (memErr) {
      console.error(`[MongoDB] In-Memory DB failed to start:`, memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
