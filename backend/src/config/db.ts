import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...', {
      uri: process.env.MONGO_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//<credentials>@')
    });
    
    mongoose.set('debug', true);  // Debug-Modus aktivieren

    const conn = await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      retryWrites: true,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      }
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Setze Event-Listener für Verbindungsprobleme
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

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
