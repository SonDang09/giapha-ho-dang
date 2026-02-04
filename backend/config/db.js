const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use in-memory MongoDB for demo if no valid URI
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI || mongoURI.includes('your_password')) {
      console.log('⚠️  Using demo mode - data will not persist');
      console.log('📝 Configure MONGODB_URI in .env for persistent storage');
      return null;
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    console.log('⚠️  Running in demo mode without database');
    return null;
  }
};

module.exports = connectDB;
