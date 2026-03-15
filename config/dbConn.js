import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
  } catch (error) {
    console.error("DB Connection Error:", error);
    process.exit(1); // stop app if DB fails
  }
};

export default connectDB;
