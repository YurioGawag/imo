import mongoose from 'mongoose';
import { User, UserRole } from '../models/user.model';
import { Property } from '../models/property.model';
import { Unit } from '../models/unit.model';
import { Notification, NotificationType, NotificationPriority } from '../models/notification.model';
import bcryptjs from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/house';

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all collections
    await User.deleteMany({});
    await Property.deleteMany({});
    await Unit.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared all collections');

    // Create users
    const vermieter = await User.create({
      email: 'vermieter@example.com',
      password: await bcryptjs.hash('Vermieter123!', 10),
      firstName: 'Max',
      lastName: 'Mustermann',
      role: UserRole.VERMIETER
    });

    const mieter = await User.create({
      email: 'mieter@example.com',
      password: await bcryptjs.hash('Mieter123!', 10),
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.MIETER
    });

    const handwerker = await User.create({
      email: 'handwerker@example.com',
      password: await bcryptjs.hash('Handwerker123!', 10),
      firstName: 'Bob',
      lastName: 'Builder',
      role: UserRole.HANDWERKER
    });

    console.log('Created users');

    // Create property
    const property = await Property.create({
      name: 'Musterhaus 1',
      address: {
        street: 'Musterstraße 1',
        postalCode: '12345',
        city: 'Musterstadt'
      },
      totalUnits: 10,
      owner: vermieter._id
    });

    console.log('Created property');

    // Create unit
    const unit = await Unit.create({
      unitNumber: 'A1',
      floor: 1,
      squareMeters: 75,
      rooms: 3,
      property: property._id,
      currentTenant: mieter._id,
      monthlyRent: 1200,
      status: 'occupied'
    });

    console.log('Created unit');

    // Create notifications
    await Notification.create({
      title: 'Willkommen!',
      message: 'Willkommen in unserem neuen Hausverwaltungssystem.',
      type: NotificationType.ANNOUNCEMENT,
      priority: NotificationPriority.MEDIUM,
      property: property._id,
      createdBy: vermieter._id,
      readBy: []
    });

    await Notification.create({
      title: 'Wartungsarbeiten',
      message: 'Am nächsten Montag wird der Schornsteinfeger kommen.',
      type: NotificationType.MAINTENANCE,
      priority: NotificationPriority.HIGH,
      property: property._id,
      createdBy: vermieter._id,
      date: new Date('2024-01-15T10:00:00'),
      readBy: []
    });

    console.log('Created notifications');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
