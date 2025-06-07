import express from 'express';
import { authenticateJwt, AuthRequest, roleCheck } from '../middleware/auth.middleware';
import { Property } from '../models/property.model';
import { Unit } from '../models/unit.model';
import { Meldung, MeldungStatus } from '../models/meldung.model';
import { User, UserRole } from '../models/user.model';
import { Message } from '../models/message.model';
import { Types } from 'mongoose';
import { tenantService } from '../services/tenant.service';
import { Tenant } from '../models/tenant.model';
import { sendEmail } from '../utils/email';
import { uploadCsv } from '../middleware/csvUpload';
import { importCsv } from '../utils/csvImport';
import * as crypto from 'crypto';
import { HttpError } from '../utils/httpError';

const router = express.Router();

// Middleware für Vermieter-Routen
const vermieterMiddleware = roleCheck([UserRole.VERMIETER]);

// Types für die Property-Route
interface PopulatedUnit {
  _id: Types.ObjectId;
  currentTenant?: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
  };
  [key: string]: any;
}

interface TenantInfo {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

// Get landlord dashboard data
router.get('/dashboard', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    // Get all properties owned by landlord
    const properties = await Property.find({ owner: req.user.userId });
    const propertyIds = properties.map(p => p._id);

    // Get all units in these properties
    const units = await Unit.find({ property: { $in: propertyIds } });
    
    // Get all reports for these units
    const meldungen = await Meldung.find({
      unit: { $in: units.map(u => u._id) }
    });

    // Calculate KPIs
    const totalProperties = properties.length;
    const totalUnits = units.length;
    const occupiedUnits = units.filter(u => u.status === 'occupied').length;
    const totalMonthlyRent = units.reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0);
    const openMeldungen = meldungen.filter(m => m.status !== MeldungStatus.ABGESCHLOSSEN).length;

    res.json({
      kpis: {
        totalProperties,
        totalUnits,
        occupiedUnits,
        occupancyRate: totalUnits ? (occupiedUnits / totalUnits * 100).toFixed(1) : 0,
        totalMonthlyRent,
        openMeldungen
      },
      recentMeldungen: await Meldung.find({
        unit: { $in: units.map(u => u._id) }
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('unit')
        .populate('reporter', 'firstName lastName')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all completed meldungen for vermieter's properties
router.get('/meldungen/abgeschlossen', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    // Find all properties owned by the vermieter
    const properties = await Property.find({ owner: req.user.userId });
    
    // Find all units in these properties
    const units = await Unit.find({ 
      property: { $in: properties.map(p => p._id) } 
    });

    // Find all completed meldungen for these units
    const meldungen = await Meldung.find({ 
      unit: { $in: units.map(u => u._id) },
      status: MeldungStatus.ABGESCHLOSSEN
    })
    .populate({
      path: 'unit',
      populate: {
        path: 'property',
        model: 'Property'
      }
    })
    .populate('reporter', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .sort({ updatedAt: -1 });

    res.json(meldungen);
  } catch (error) {
    console.error('Error fetching completed meldungen:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all meldungen for vermieter's properties
router.get('/meldungen', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    // Find all properties owned by the vermieter
    const properties = await Property.find({ owner: req.user.userId });
    
    // Find all units in these properties
    const units = await Unit.find({ 
      property: { $in: properties.map(p => p._id) } 
    });

    // Find all meldungen for these units
    const meldungen = await Meldung.find({ 
      unit: { $in: units.map(u => u._id) } 
    })
    .populate('unit')
    .populate('reporter', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.json(meldungen);
  } catch (error) {
    console.error('Error fetching meldungen:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific meldung
router.get('/meldungen/:id', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    // Find all properties owned by the vermieter
    const properties = await Property.find({ owner: req.user.userId });
    
    // Find all units in these properties
    const units = await Unit.find({ 
      property: { $in: properties.map(p => p._id) } 
    });

    // Find the specific meldung and verify it belongs to one of vermieter's units
    const meldung = await Meldung.findOne({ 
      _id: req.params.id,
      unit: { $in: units.map(u => u._id) } 
    })
    .populate('unit')
    .populate('reporter', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName');

    if (!meldung) {
      return res.status(404).json({ message: 'Meldung not found' });
    }

    res.json(meldung);
  } catch (error) {
    console.error('Error fetching meldung:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all properties for landlord
router.get('/properties', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const properties = await Property.find({ owner: req.user.userId });
    return res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific property with units
router.get('/properties/:id', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const units = await Unit.find({ property: property._id })
      .populate('currentTenant', 'firstName lastName email');

    res.json({
      property,
      units
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new property
router.post('/properties', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    console.log('Creating property with data:', req.body);  // Log request data

    const property = new Property({
      ...req.body,
      owner: req.user.userId
    });

    await property.save();
    res.status(201).json(property);
  } catch (error: any) {  // Type assertion für error
    console.error('Error creating property:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add unit to property
router.post('/properties/:id/units', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const property = await Property.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const unit = new Unit({
      ...req.body,
      property: property._id
    });

    await unit.save();

    // Update property total units
    property.totalUnits = (property.totalUnits || 0) + 1;
    await property.save();

    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign report to craftsman
router.put('/meldungen/:id/assign', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const { handwerkerId, priority } = req.body;

    // Verify the craftsman exists and has the correct role
    const handwerker = await User.findOne({
      _id: handwerkerId,
      role: UserRole.HANDWERKER
    });

    if (!handwerker) {
      return res.status(404).json({ message: 'Craftsman not found' });
    }

    // Find the report and verify ownership through property chain
    const meldung = await Meldung.findById(req.params.id)
      .populate({
        path: 'unit',
        populate: {
          path: 'property',
          match: { owner: req.user.userId }
        }
      });

    if (!meldung || !meldung.unit || !(meldung.unit as any).property) {
      return res.status(404).json({ message: 'Report not found' });
    }

    meldung.assignedTo = handwerkerId;
    if (priority) meldung.priority = priority;
    meldung.status = MeldungStatus.IN_BEARBEITUNG;

    await meldung.save();
    res.json(meldung);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update meldung status
router.put('/meldungen/:id/status', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const { status } = req.body;
    const meldung = await Meldung.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName')
      .populate('reporter', 'firstName lastName');

    if (!meldung) {
      return res.status(404).json({ message: 'Meldung nicht gefunden' });
    }

    // Validiere Status-Übergänge
    if (status === MeldungStatus.HANDWERKER_ERLEDIGT) {
      if (!meldung.assignedTo) {
        return res.status(400).json({ 
          message: 'Meldung muss einem Handwerker zugewiesen sein' 
        });
      }
    }

    meldung.status = status;
    await meldung.save();

    res.json(meldung);
  } catch (error) {
    console.error('Error updating meldung status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all handwerker
router.get('/handwerker', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const handwerker = await User.find({ role: UserRole.HANDWERKER })
      .select('firstName lastName email')
      .sort({ lastName: 1, firstName: 1 });

    res.json(handwerker);
  } catch (error) {
    console.error('Error fetching handwerker:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create handwerker
router.post('/handwerker', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const { firstName, lastName, email, phone, specialization } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !specialization) {
      return res.status(400).json({ message: 'Alle Pflichtfelder müssen ausgefüllt sein' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Diese E-Mail-Adresse wird bereits verwendet' });
    }

    // Generate a random password for the handwerker
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Create the handwerker user
    const handwerker = new User({
      firstName,
      lastName,
      email,
      phone,
      specialization,
      role: UserRole.HANDWERKER,
      password: tempPassword // will be hashed by the schema pre-save middleware
    });

    await handwerker.save();

    // Send invitation email
    await sendEmail({
      to: email,
      subject: 'Einladung als Handwerker',
      html: `
        <h1>Willkommen bei der Hausverwaltung!</h1>
        <p>Sie wurden als Handwerker eingeladen.</p>
        <p>Ihre Zugangsdaten:</p>
        <p>E-Mail: ${email}</p>
        <p>Temporäres Passwort: ${tempPassword}</p>
        <p>Bitte ändern Sie Ihr Passwort nach dem ersten Login.</p>
      `
    });

    // Return handwerker without sensitive data
    const handwerkerResponse = {
      _id: handwerker._id,
      firstName: handwerker.firstName,
      lastName: handwerker.lastName,
      email: handwerker.email,
      phone: handwerker.phone,
      specialization: handwerker.specialization
    };

    res.status(201).json(handwerkerResponse);
  } catch (error) {
    console.error('Error creating handwerker:', error);
    res.status(500).json({ message: 'Fehler beim Anlegen des Handwerkers' });
  }
});

// Get chat contacts for landlord
router.get('/chat/contacts', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    // Get all properties owned by landlord
    const properties = await Property.find({ owner: req.user.userId });
    const propertyIds = properties.map(p => p._id);

    // Get all units in these properties
    const units = await Unit.find({ property: { $in: propertyIds } });
    const unitIds = units.map(u => u._id);

    // Get all tenants from these units
    const tenants = await User.find({
      role: UserRole.MIETER,
      assignedUnit: { $in: unitIds }
    })
    .select('firstName lastName role assignedUnit')
    .populate({
      path: 'assignedUnit',
      select: 'number'
    });

    // Get all handwerker who have worked on meldungen for these units
    const meldungen = await Meldung.find({ unit: { $in: unitIds } });
    const handwerkerIds = [...new Set(meldungen.map(m => m.assignedTo).filter(id => id))];
    const handwerker = await User.find({
      _id: { $in: handwerkerIds },
      role: UserRole.HANDWERKER
    }).select('firstName lastName role');

    // Combine and format contacts
    const contacts = [
      ...tenants.map(tenant => ({
        _id: tenant._id,
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        role: tenant.role,
        unitNumber: (tenant.assignedUnit as any)?.number || '',
      })),
      ...handwerker.map(hw => ({
        _id: hw._id,
        firstName: hw.firstName,
        lastName: hw.lastName,
        role: hw.role,
      }))
    ];

    // Remove duplicates based on _id
    const uniqueContacts = contacts.filter((contact, index, self) =>
      index === self.findIndex((c) => c._id.toString() === contact._id.toString())
    );

    res.json(uniqueContacts);
  } catch (error) {
    console.error('Error fetching chat contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Message routes
router.post('/messages', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const { content, meldungId } = req.body;

    // Verify the meldung exists and belongs to a property managed by this landlord
    const meldung = await Meldung.findOne({
      _id: meldungId,
      property: { $in: await Property.find({ owner: req.user.userId }).select('_id') }
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
    await message.populate('sender', 'firstName lastName');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Error creating message' });
  }
});

// Get messages for a specific meldung
router.get('/messages/:meldungId', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const { meldungId } = req.params;

    // Verify the meldung exists and belongs to a property managed by this landlord
    const meldung = await Meldung.findOne({
      _id: meldungId,
      property: { $in: await Property.find({ owner: req.user.userId }).select('_id') }
    });

    if (!meldung) {
      return res.status(404).json({ message: 'Meldung not found' });
    }

    // Get messages for this meldung
    const messages = await Message.find({ meldung: meldungId })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Get handwerker list for vermieter's properties
router.get('/handwerker', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    // Find all properties owned by the vermieter
    const properties = await Property.find({ owner: req.user.userId });
    
    // Find all handwerker assigned to these properties
    const handwerker = await User.find({ 
      role: UserRole.HANDWERKER,
      assignedProperties: { $in: properties.map(p => p._id) }
    })
    .select('firstName lastName email phone specialization rating');

    res.json(handwerker);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vermieter profile
router.get('/profile', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('GET /profile called with user:', req.user);

    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const user = await User.findById(req.user.userId)
      .select('-password');

    console.log('Found user:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Error in GET /profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update vermieter profile
router.put('/profile', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const { firstName, lastName, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, email, phone },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mieter einer Wohneinheit zuweisen
router.post('/properties/:propertyId/units/:unitId/tenant', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('Received tenant assignment request:', {
      params: req.params,
      body: req.body,
      userId: req.user?.userId
    });

    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const { propertyId, unitId } = req.params;

    // Validate Mongo ObjectIds early to give clear errors
    if (!Types.ObjectId.isValid(propertyId)) {
      console.log('Invalid property ID format:', propertyId);
      return res.status(400).json({ message: 'Ungültige Immobilien-ID' });
    }
    if (!Types.ObjectId.isValid(unitId)) {
      console.log('Invalid unit ID format:', unitId);
      return res.status(400).json({ message: 'Ungültige Wohneinheit-ID' });
    }
    const {
      firstName = '',
      lastName = '',
      email = '',
      phone = '',
      moveInDate,
    } = req.body;

    // trim string fields
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    // Validate required fields
    if (!trimmedFirst || !trimmedLast || !trimmedEmail || !trimmedPhone || !moveInDate) {
      console.log('Missing required fields:', { firstName: trimmedFirst, lastName: trimmedLast, email: trimmedEmail, phone: trimmedPhone, moveInDate });
      return res.status(400).json({ message: 'Alle Felder müssen ausgefüllt sein' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      console.log('Invalid email format:', trimmedEmail);
      return res.status(400).json({ message: 'Ungültige E-Mail-Adresse' });
    }

    // Check if property belongs to landlord
    const property = await Property.findOne({
      _id: propertyId,
      owner: req.user.userId
    });

    if (!property) {
      console.log('Property not found or not owned by user:', {
        propertyId,
        userId: req.user.userId
      });
      return res.status(404).json({ message: 'Immobilie nicht gefunden' });
    }

    // Verify the unit belongs to this property
    const unit = await Unit.findOne({ _id: unitId, property: propertyId });
    if (!unit) {
      console.log('Unit not found or not part of property', { unitId, propertyId });
      return res.status(404).json({ message: 'Wohneinheit nicht gefunden' });
    }

    if (unit.currentTenant) {
      console.log('Unit already occupied', { unitId });
      return res.status(409).json({ message: 'Wohneinheit bereits belegt' });
    }

    if (unit.pendingTenant) {
      console.log('Pending tenant invitation exists', { unitId, pendingTenant: unit.pendingTenant });
      return res.status(409).json({ message: 'Für diese Wohneinheit besteht bereits eine ausstehende Einladung' });
    }

    // Stelle sicher, dass das Datum korrekt formatiert ist
    let parsedMoveInDate;
    try {
      // Versuche das Datum zu parsen
      parsedMoveInDate = new Date(moveInDate);
      
      // Überprüfe, ob das Datum gültig ist
      if (isNaN(parsedMoveInDate.getTime())) {
        throw new Error('Ungültiges Datum');
      }
    } catch (err) {
      console.error('Invalid date format:', moveInDate);
      return res.status(400).json({ message: 'Ungültiges Datumsformat für Einzugsdatum' });
    }

    // Create tenant and assign to unit
    console.log('Creating tenant with data:', {
      propertyId,
      unitId,
      tenant: {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        phone: trimmedPhone,
        moveInDate: parsedMoveInDate.toISOString(),
      },
    });

    const tenant = await tenantService.createTenant(propertyId, unitId, {
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: trimmedEmail,
      phone: trimmedPhone,
      moveInDate: parsedMoveInDate,
    });

    console.log('Tenant created successfully:', tenant);
    res.status(201).json(tenant);
  } catch (error: any) {
    console.error('Error in tenant assignment:', error);

    if (error instanceof HttpError) {
      return res.status(error.status).json({ message: error.message });
    }

    if (error.code === 11000 || /duplicate key/i.test(error.message)) {
      return res.status(409).json({ message: 'Ein Mieter mit dieser E-Mail existiert bereits' });
    }

    if (/nicht gefunden|not found/i.test(error.message)) {
      return res.status(404).json({ message: error.message });
    }

    const status = error.message?.includes('existiert bereits') ? 409 : 400;
    res.status(status).json({ message: error.message });
  }
});

// TEMP: Reset tenant assignment
router.post('/properties/:propertyId/units/:unitId/reset', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    const { propertyId, unitId } = req.params;

    // Find unit
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Delete pending tenant if exists
    if (unit.pendingTenant) {
      await Tenant.findByIdAndDelete(unit.pendingTenant);
      unit.pendingTenant = undefined;
    }

    // Reset current tenant
    unit.currentTenant = undefined;
    unit.status = 'vacant';
    await unit.save();

    res.json({ message: 'Unit reset successful' });
  } catch (error) {
    console.error('Error resetting unit:', error);
    res.status(500).json({ message: 'Error resetting unit' });
  }
});

// Get available units for a property
router.get('/properties/:propertyId/available-units', authenticateJwt, vermieterMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const property = await Property.findOne({ _id: req.params.propertyId, owner: req.user.userId });
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const units = await Unit.find({ property: property._id, status: 'vacant' }).select('unitNumber');
    res.json(units);
  } catch (error) {
    console.error('Error fetching available units:', error);
    res.status(500).json({ message: 'Error fetching available units' });
  }
});

// CSV import for properties, units and tenants
router.post('/import/csv', authenticateJwt, vermieterMiddleware, uploadCsv.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized - User ID missing' });
    }

    const created = await importCsv(req.file.buffer.toString('utf8'), req.user.userId);
    res.json({ imported: created.length });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ message: 'Import error' });
  }
});

export default router;
