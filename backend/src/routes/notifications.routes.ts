import express from 'express';
import { authenticateJwt, roleCheck } from '../middleware/auth.middleware';
import { Notification } from '../models/notification.model';
import { Property } from '../models/property.model';
import { Unit } from '../models/unit.model';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Neue Benachrichtigung erstellen
router.post('/', authenticateJwt, async (req: any, res) => {
  console.log('POST /notifications called with:', {
    body: req.body,
    userId: req.user.userId,
    role: req.user.role,
    headers: req.headers
  });

  try {
    const { title, message, propertyId, type, priority, date } = req.body;

    console.log('Extracted fields:', { title, message, propertyId, type, priority, date });

    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!message) missingFields.push('message');
    if (!propertyId) missingFields.push('propertyId');
    if (!type) missingFields.push('type');

    if (missingFields.length > 0) {
      console.log('Validation failed. Missing fields:', missingFields);
      return res.status(400).json({ 
        message: `Fehlende Felder: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    const property = await Property.findOne({
      _id: propertyId,
      owner: req.user.userId
    });

    if (!property) {
      return res.status(403).json({ message: 'Keine Berechtigung für diese Immobilie' });
    }

    const notification = new Notification({
      title,
      message,
      property: propertyId,
      type,
      priority,
      date,
      createdBy: req.user.userId
    });

    console.log('Creating notification:', notification);

    await notification.save();
    
    const populatedNotification = await notification.populate('createdBy', 'firstName lastName');
    
    console.log('Created notification:', populatedNotification);
    res.status(201).json(populatedNotification);
  } catch (error: any) {  
    console.error('Error creating notification:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message || 'Unknown error'  
    });
  }
});

// Vermieter: Benachrichtigungen für eine Immobilie abrufen
router.get('/property/:propertyId', authenticateJwt, roleCheck([UserRole.VERMIETER]), async (req: any, res) => {
  console.log('GET /property/:propertyId called with:', {
    propertyId: req.params.propertyId,
    userId: req.user.userId,
    role: req.user.role
  });

  try {
    const property = await Property.findOne({
      _id: req.params.propertyId,
      owner: req.user.userId
    });

    console.log('Found property:', property);

    if (!property) {
      return res.status(403).json({ message: 'Keine Berechtigung für diese Immobilie' });
    }

    const notifications = await Notification.find({ property: req.params.propertyId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    console.log('Found notifications:', notifications);
    res.json(notifications);
  } catch (error: any) {  
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message || 'Unknown error'  
    });
  }
});

// Mieter: Benachrichtigungen für die eigene Wohnung abrufen
router.get('/tenant', authenticateJwt, roleCheck([UserRole.MIETER]), async (req: any, res) => {
  console.log('GET /tenant called with:', {
    userId: req.user.userId,
    role: req.user.role
  });

  try {
    const unit = await Unit.findOne({ currentTenant: req.user.userId });
    console.log('Found unit:', unit);

    if (!unit) {
      return res.status(404).json({ message: 'Keine Wohnung gefunden' });
    }

    const notifications = await Notification.find({ property: unit.property })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'firstName lastName');

    console.log('Found notifications:', notifications);
    res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching tenant notifications:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message || 'Unknown error'
    });
  }
});

// Benachrichtigung als gelesen markieren
router.put('/:id/read', authenticateJwt, async (req: any, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const userId = req.user.userId;
    const alreadyRead = notification.readBy.some(
      (r: any) => r.user && r.user.toString() === userId
    );

    if (!alreadyRead) {
      notification.readBy.push({ user: userId, readAt: new Date() });
      await notification.save();
    }

    res.json(notification);
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking as read' });
  }
});

export default router;
