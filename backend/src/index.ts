import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import path from 'path';
import express from 'express';

dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/house';
    
    console.log('Attempting to connect to MongoDB...');
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    } as any;

    await mongoose.connect(mongoUri, options);
    console.log('MongoDB connected successfully');
    
  } catch (error: any) {
    console.error('MongoDB connection error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    process.exit(1);
  }
};

connectDB();

const port = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
