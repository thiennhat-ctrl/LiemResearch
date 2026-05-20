import mongoose from 'mongoose';

export async function connectDb() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/liemresearch';
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
