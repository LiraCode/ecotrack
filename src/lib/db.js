'use strict';

const mongoose = require('mongoose');

// Obter a URI do MongoDB das variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI;


// Global cache for mongoose connection
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}



if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Connect to MongoDB
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
async function connectToMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoIndex: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB connected");
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectToMongoDB;