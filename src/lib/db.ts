// ============================================================
// NEXTRADE PRO — MongoDB Connection
// REPLACE THE URI BELOW WITH YOUR MONGODB CONNECTION LINK
// ============================================================
import mongoose from 'mongoose';

// >>> PASTE YOUR MONGODB URI HERE <<<
const MONGO_URI = 'mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/nextrade?retryWrites=true&w=majority';

const globalForMongoose = globalThis as unknown as {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
};

async function connectDB() {
  if (globalForMongoose.mongoose?.conn) return globalForMongoose.mongoose.conn;

  if (!globalForMongoose.mongoose) {
    globalForMongoose.mongoose = { conn: null, promise: null };
  }

  try {
    globalForMongoose.mongoose.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    });
    globalForMongoose.mongoose.conn = await globalForMongoose.mongoose.promise;
    console.log('MongoDB connected');
    return globalForMongoose.mongoose.conn;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    throw e;
  }
}

export default connectDB;