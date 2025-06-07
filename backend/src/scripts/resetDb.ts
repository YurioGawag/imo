import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Property } from '../models/property.model';
import { Unit } from '../models/unit.model';
import { Notification } from '../models/notification.model';
import { Message } from '../models/message.model';
import { Meldung } from '../models/meldung.model';

const MONGODB_URI = 'mongodb://localhost:27017/house';

async function resetDb() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop the entire database
    await mongoose.connection.dropDatabase();
    console.log('Dropped database');

    // Close connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDb();
