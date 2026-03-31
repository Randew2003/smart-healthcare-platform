import mongoose from "mongoose";

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected (${mongoose.connection.name})`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
