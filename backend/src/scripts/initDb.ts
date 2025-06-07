import mongoose from 'mongoose';
import { User, UserRole } from '../models/user.model';
import { Property } from '../models/property.model';
import { Unit } from '../models/unit.model';
import { Meldung, MeldungStatus } from '../models/meldung.model';
import { connectDB } from '../config/db';
import bcrypt from 'bcryptjs';

async function clearDatabase() {
  try {
    await mongoose.connection.dropDatabase();
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

async function createUsers() {
  try {
    // Create vermieter
    const vermieter = await User.create({
      email: 'vermieter@example.com',
      password: await bcrypt.hash('password123', 10),
      role: UserRole.VERMIETER,
      firstName: 'Max',
      lastName: 'Mustermann',
      phone: '+49123456789'
    });

    // Create handwerker
    const handwerker = await User.create({
      email: 'handwerker@example.com',
      password: await bcrypt.hash('password123', 10),
      role: UserRole.HANDWERKER,
      firstName: 'Hans',
      lastName: 'Weber',
      phone: '+49987654321'
    });

    // Create mieter
    const mieter1 = await User.create({
      email: 'mieter1@example.com',
      password: await bcrypt.hash('password123', 10),
      role: UserRole.MIETER,
      firstName: 'Anna',
      lastName: 'Schmidt',
      phone: '+49111222333'
    });

    const mieter2 = await User.create({
      email: 'mieter2@example.com',
      password: await bcrypt.hash('password123', 10),
      role: UserRole.MIETER,
      firstName: 'Lisa',
      lastName: 'Müller',
      phone: '+49444555666'
    });

    return { vermieter, handwerker, mieter1, mieter2 };
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

async function createProperties(vermieter: any) {
  try {
    // Create properties
    const property1 = await Property.create({
      name: 'Stadthaus Mitte',
      address: {
        street: 'Hauptstraße 1',
        city: 'Berlin',
        postalCode: '10115',
        country: 'Germany'
      },
      owner: vermieter._id,
      totalUnits: 4
    });

    const property2 = await Property.create({
      name: 'Parkresidenz',
      address: {
        street: 'Parkweg 15',
        city: 'Berlin',
        postalCode: '10117',
        country: 'Germany'
      },
      owner: vermieter._id,
      totalUnits: 6
    });

    return { property1, property2 };
  } catch (error) {
    console.error('Error creating properties:', error);
    throw error;
  }
}

async function createUnits(properties: any, mieter1: any, mieter2: any) {
  try {
    // Create units for property1
    const unit1 = await Unit.create({
      property: properties.property1._id,
      unitNumber: '101',
      floor: 1,
      squareMeters: 75,
      rooms: 3,
      monthlyRent: 1200,
      currentTenant: mieter1._id,
      status: 'occupied',
      features: ['Balkon', 'Einbauküche'],
      leaseStart: new Date('2023-01-01'),
      leaseEnd: new Date('2024-12-31')
    });

    const unit2 = await Unit.create({
      property: properties.property1._id,
      unitNumber: '102',
      floor: 1,
      squareMeters: 60,
      rooms: 2,
      monthlyRent: 900,
      currentTenant: mieter2._id,
      status: 'occupied',
      features: ['Einbauküche'],
      leaseStart: new Date('2023-02-01'),
      leaseEnd: new Date('2024-12-31')
    });

    // Update mieter with their assigned units
    await User.findByIdAndUpdate(mieter1._id, { assignedUnit: unit1._id });
    await User.findByIdAndUpdate(mieter2._id, { assignedUnit: unit2._id });

    return { unit1, unit2 };
  } catch (error) {
    console.error('Error creating units:', error);
    throw error;
  }
}

async function createMeldungen(units: any, mieter1: any, handwerker: any) {
  try {
    // Create meldungen
    const meldung1 = await Meldung.create({
      title: 'Heizung defekt',
      description: 'Die Heizung im Wohnzimmer funktioniert nicht mehr.',
      status: MeldungStatus.IN_BEARBEITUNG,
      priority: 'hoch',
      unit: units.unit1._id,
      reporter: mieter1._id,
      assignedTo: handwerker._id,
      images: []
    });

    return { meldung1 };
  } catch (error) {
    console.error('Error creating meldungen:', error);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    await connectDB();
    console.log('Connected to database');

    await clearDatabase();
    console.log('Database cleared');

    const users = await createUsers();
    console.log('Users created');

    const properties = await createProperties(users.vermieter);
    console.log('Properties created');

    const units = await createUnits(properties, users.mieter1, users.mieter2);
    console.log('Units created');

    const meldungen = await createMeldungen(units, users.mieter1, users.handwerker);
    console.log('Meldungen created');

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
