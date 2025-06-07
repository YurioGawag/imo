import express from 'express';
import { User, UserRole, IUser, IUserBase, UserDocument } from '../models/user.model';
import { Meldung, MeldungStatus } from '../models/meldung.model';
import { Message } from '../models/message.model';
import { Notification } from '../models/notification.model';
import { Unit } from '../models/unit.model';
import { upload } from '../middleware/upload';
import { NotificationType } from '../models/notification.model';
import { roleCheck } from '../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';

const router = express.Router();

interface PropertyAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Property {
  _id: string;
  name: string;
  address: PropertyAddress;
}

interface PopulatedUnit {
  _id: string;
  unitNumber: string;
  floor?: number;
  squareMeters: number;
  rooms: number;
  monthlyRent: number;
  leaseStart?: Date;
  leaseEnd?: Date;
  property: Property;
}

// Middleware to ensure user is a tenant
router.use(roleCheck([UserRole.MIETER]));

// Types für Population
interface PopulatedUser extends Omit<IUserBase, 'assignedUnit'> {
  assignedUnit?: PopulatedUnit;
}

// Get tenant dashboard data
router.get('/dashboard', async (req: any, res) => {
  try {
    // Find tenant's unit
    const unit = await Unit.findOne({ currentTenant: req.user.userId })
      .populate<{ property: Property }>({
        path: 'property',
        select: 'name address'
      });

    if (!unit) {
      return res.status(404).json({ message: 'No unit found for tenant' });
    }

    // Find tenant's reports
    const meldungen = await Meldung.find({ reporter: req.user.userId })
      .sort({ createdAt: -1 })
      .populate<{ assignedTo: IUser }>('assignedTo', 'firstName lastName');

    res.json({
      unit,
      meldungen
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all meldungen for tenant
router.get('/meldungen', async (req: any, res) => {
  try {
    const meldungen = await Meldung.find({ reporter: req.user.userId })
      .sort({ createdAt: -1 })
      .populate<{ assignedTo: IUser }>('assignedTo', 'firstName lastName')
      .populate<{ unit: PopulatedUnit }>({
        path: 'unit',
        populate: {
          path: 'property',
          populate: {
            path: 'owner',
            select: 'firstName lastName'
          }
        }
      });

    res.json(meldungen);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new maintenance report
router.post('/meldungen', upload.array('images', 5), async (req: any, res) => {
  try {
    const { title, description } = req.body;
    const files = req.files as Express.Multer.File[];

    // Get tenant's unit
    const unit = await Unit.findOne({ currentTenant: req.user.userId });
    if (!unit) {
      // Delete uploaded files if unit not found
      if (files) {
        files.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
      return res.status(404).json({ message: 'No unit found for tenant' });
    }

    // Process uploaded images
    const images = files ? files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    })) : [];

    const meldung = new Meldung({
      title,
      description,
      unit: unit._id,
      reporter: req.user.userId,
      images
    });

    await meldung.save();

    // Populate the response
    const populatedMeldung = await Meldung.findById(meldung._id)
      .populate<{ unit: PopulatedUnit }>({
        path: 'unit',
        populate: {
          path: 'property',
          select: 'name address.street address.city address.postalCode address.country'
        }
      })
      .populate<{ reporter: IUser }>('reporter', 'firstName lastName')
      .populate<{ assignedTo: IUser }>('assignedTo', 'firstName lastName');

    res.status(201).json(populatedMeldung);
  } catch (error) {
    console.error('Error creating meldung:', error);
    // Delete uploaded files if there was an error
    if (req.files) {
      (req.files as Express.Multer.File[]).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Get single meldung with details
router.get('/meldungen/:meldungId', async (req: any, res) => {
  try {
    const meldung = await Meldung.findOne({
      _id: req.params.meldungId,
      reporter: req.user.userId
    })
      .populate<{ assignedTo: IUser }>('assignedTo', 'firstName lastName')
      .populate<{ unit: PopulatedUnit }>({
        path: 'unit',
        populate: {
          path: 'property',
          populate: {
            path: 'owner',
            select: 'firstName lastName'
          }
        }
      });

    if (!meldung) {
      return res.status(404).json({ message: 'Meldung not found' });
    }

    // Get messages for this report
    const messages = await Message.find({ meldung: meldung._id })
      .populate<{ sender: IUser }>('sender', 'firstName lastName role')
      .sort({ createdAt: 1 });

    res.json({
      meldung,
      messages
    });
  } catch (error) {
    console.error('Error fetching meldung:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meldung status (nur für Abschluss)
router.put('/meldungen/:id/status', async (req: any, res) => {
  try {
    const { status } = req.body;
    const meldung = await Meldung.findById(req.params.id)
      .populate<{ assignedTo: IUser }>('assignedTo', 'firstName lastName');

    if (!meldung) {
      return res.status(404).json({ message: 'Meldung nicht gefunden' });
    }

    // Mieter dürfen nur auf ABGESCHLOSSEN setzen und nur wenn HANDWERKER_ERLEDIGT
    if (status !== MeldungStatus.ABGESCHLOSSEN) {
      return res.status(400).json({ 
        message: 'Mieter können Meldungen nur als abgeschlossen markieren' 
      });
    }

    if (meldung.status !== MeldungStatus.HANDWERKER_ERLEDIGT) {
      return res.status(400).json({ 
        message: 'Meldung muss erst vom Handwerker als erledigt markiert werden' 
      });
    }

    meldung.status = status;
    await meldung.save();

    res.json(meldung);
  } catch (error) {
    console.error('Error updating meldung status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get new meldung template
router.get('/meldungen/new', async (req: any, res) => {
  try {
    // Find tenant's unit
    const user = await User.findById(req.user.userId)
      .populate<{ assignedUnit: PopulatedUnit }>({
        path: 'assignedUnit',
        select: 'unitNumber floor squareMeters rooms monthlyRent property',
        populate: {
          path: 'property',
          select: 'name address'
        }
      });

    if (!user || !user.assignedUnit) {
      return res.status(404).json({ message: 'No unit found for tenant' });
    }

    // Create template for new meldung
    const meldung = {
      title: '',
      description: '',
      status: MeldungStatus.OFFEN,
      reporter: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName
      },
      unit: user.assignedUnit,
      createdAt: new Date().toISOString(),
      images: []
    };

    res.json({ meldung });
  } catch (error) {
    console.error('Error creating new meldung template:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Message routes
router.post('/messages', async (req: any, res) => {
  try {
    const { content, meldungId } = req.body;

    // Verify the meldung exists and belongs to this tenant
    const meldung = await Meldung.findOne({
      _id: meldungId,
      reporter: req.user.userId
    });

    if (!meldung) {
      return res.status(404).json({ message: 'Meldung not found' });
    }

    // Create the message
    const message = await Message.create({
      meldung: meldungId,
      sender: req.user.userId,
      content,
    });

    // Populate sender information
    await message.populate<{ sender: IUser }>('sender', 'firstName lastName');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Error creating message' });
  }
});

// Get messages for a specific meldung
router.get('/messages/:meldungId', async (req: any, res) => {
  try {
    const { meldungId } = req.params;

    // Verify the meldung exists and belongs to this tenant
    const meldung = await Meldung.findOne({
      _id: meldungId,
      reporter: req.user.userId
    });

    if (!meldung) {
      return res.status(404).json({ message: 'Meldung not found' });
    }

    // Get messages for this meldung
    const messages = await Message.find({ meldung: meldungId })
      .populate<{ sender: IUser }>('sender', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Get tenant profile
router.get('/profile', async (req: any, res) => {
  try {
    // Lade den kompletten User
    const user = await User.findById(req.user.userId)
      .populate<{ assignedUnit: PopulatedUnit }>({
        path: 'assignedUnit',
        select: 'unitNumber floor squareMeters rooms monthlyRent leaseStart leaseEnd property',
        populate: {
          path: 'property',
          select: 'name address.street address.city address.postalCode address.country'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Basic profile data
    const profileData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone
    };

    // Add unit data if available
    if (user.assignedUnit && 'property' in user.assignedUnit) {
      return res.json({
        ...profileData,
        unit: {
          unitNumber: user.assignedUnit.unitNumber,
          floor: user.assignedUnit.floor,
          squareMeters: user.assignedUnit.squareMeters,
          rooms: user.assignedUnit.rooms,
          monthlyRent: user.assignedUnit.monthlyRent,
          leaseStart: user.assignedUnit.leaseStart,
          leaseEnd: user.assignedUnit.leaseEnd,
          property: {
            name: user.assignedUnit.property.name,
            address: {
              street: user.assignedUnit.property.address.street,
              city: user.assignedUnit.property.address.city,
              postalCode: user.assignedUnit.property.address.postalCode,
              country: user.assignedUnit.property.address.country
            }
          }
        }
      });
    }

    // Return profile without unit data
    return res.json({
      ...profileData,
      unit: undefined
    });

  } catch (error) {
    console.error('Error fetching tenant profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update tenant profile
router.put('/profile', async (req: any, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    // Lade und update den User
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;
    
    await user.save();

    // Hole aktualisierten User mit Unit-Daten
    const updatedUser = await User.findById(user._id)
      .populate<{ assignedUnit: PopulatedUnit }>({
        path: 'assignedUnit',
        select: 'unitNumber floor squareMeters rooms monthlyRent leaseStart leaseEnd property',
        populate: {
          path: 'property',
          select: 'name address.street address.city address.postalCode address.country'
        }
      });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    // Basic profile data
    const profileData = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone
    };

    // Add unit data if available
    if (updatedUser.assignedUnit && 'property' in updatedUser.assignedUnit) {
      return res.json({
        ...profileData,
        unit: {
          unitNumber: updatedUser.assignedUnit.unitNumber,
          floor: updatedUser.assignedUnit.floor,
          squareMeters: updatedUser.assignedUnit.squareMeters,
          rooms: updatedUser.assignedUnit.rooms,
          monthlyRent: updatedUser.assignedUnit.monthlyRent,
          leaseStart: updatedUser.assignedUnit.leaseStart,
          leaseEnd: updatedUser.assignedUnit.leaseEnd,
          property: {
            name: updatedUser.assignedUnit.property.name,
            address: {
              street: updatedUser.assignedUnit.property.address.street,
              city: updatedUser.assignedUnit.property.address.city,
              postalCode: updatedUser.assignedUnit.property.address.postalCode,
              country: updatedUser.assignedUnit.property.address.country
            }
          }
        }
      });
    }

    // Return profile without unit data
    return res.json({
      ...profileData,
      unit: undefined
    });

  } catch (error) {
    console.error('Error updating tenant profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
