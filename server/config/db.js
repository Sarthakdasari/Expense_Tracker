const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
      autoIndex: true,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n[MongoDB Connection Error]: ${error.message}`);
    console.error(
      'Tip: Ensure MongoDB is running locally, or update MONGO_URI in server/.env with your MongoDB Atlas connection string (e.g. mongodb+srv://...).\n'
    );
    process.exit(1);
  }
};

module.exports = connectDB;
