const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    if (mongoose.connection.readyState === 1) return cachedConnection;
  }

  try {
    const opts = {
      bufferCommands: false, // disable buffering to avoid hanging in serverless
    };
    
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(process.env.MONGODB_URI, opts);
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // fallback or rethrow
    throw error;
  }
};

module.exports = connectDB;
