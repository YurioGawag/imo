import express, { Router, Response } from 'express';
import { authenticateJwt, AuthRequest, roleCheck } from '../middleware/auth.middleware';
import { Meldung, MeldungStatus } from '../models/meldung.model';
import { Message } from '../models/message.model';
import { User, UserRole } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { Types } from 'mongoose';
import { IMeldung, INote, IPopulatedMeldung, IUnit } from '../types/meldung.types';

const router = express.Router();

// Middleware to ensure user is a craftsman or landlord
router.use(roleCheck([UserRole.HANDWERKER, UserRole.VERMIETER]));

// Get craftsman dashboard (assigned reports)
router.get('/dashboard', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.userId;
    console.log('Fetching dashboard for handwerker:', userId);

    // Get all reports assigned to this craftsman
    const allMeldungen = await Meldung.find({
      assignedTo: userId
    })
    .populate('reporter', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .populate({
      path: 'unit',
      select: 'unitNumber',
      populate: {
        path: 'property',
        select: 'name vermieter',
        populate: {
          path: 'owner',
          select: 'firstName lastName email'
        }
      }
    });

    console.log('Found meldungen for handwerker:', {
      userId,
      count: allMeldungen.length,
      meldungIds: allMeldungen.map(m => m._id)
    });

    // Calculate statistics
    const openMeldungen = allMeldungen.filter(m => m.status === MeldungStatus.OFFEN);
    const inProgressMeldungen = allMeldungen.filter(m => m.status === MeldungStatus.IN_BEARBEITUNG);
    const completedMeldungen = allMeldungen.filter(m => m.status === MeldungStatus.HANDWERKER_ERLEDIGT);

    const dashboardData = {
      assignedMeldungen: allMeldungen,
      stats: {
        totalAssigned: allMeldungen.length,
        inProgress: inProgressMeldungen.length,
        completed: completedMeldungen.length,
        averageCompletionTime: 0
      }
    };

    console.log('Dashboard statistics:', {
      userId,
      stats: dashboardData.stats
    });

    res.json(dashboardData);
  } catch (error) {
    console.error('Error in /dashboard:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mark report as complete
router.put('/meldungen/:id/complete', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const { notes, actualCost } = req.body;

    if (!req.user?.userId) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.userId;
    const meldung = await Meldung.findOne({
      _id: req.params.id,
      assignedTo: userId
    });

    if (!meldung) {
      return res.status(404).json({ 
        message: 'Meldung not found or not assigned to you',
        requestedId: req.params.id,
        userId
      });
    }

    meldung.status = MeldungStatus.ABGESCHLOSSEN;
    meldung.completedAt = new Date();
    if (notes) meldung.notes = notes;
    if (actualCost) meldung.actualCost = actualCost;

    await meldung.save();

    // Create a completion message
    const message = new Message({
      meldung: meldung._id,
      sender: userId,
      content: `Meldung wurde abgeschlossen. ${notes ? `Notizen: ${notes}` : ''}`,
      readBy: [{ user: userId }] // Mark as read by sender
    });

    await message.save();

    res.json(meldung);
  } catch (error) {
    console.error('Error in /meldungen/:id/complete:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get report details
router.get('/meldungen/:id', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.userId;
    console.log('Fetching meldung details:', {
      meldungId: req.params.id,
      userId
    });

    const meldung = await Meldung.findOne({
      _id: req.params.id,
      assignedTo: userId
    })
    .populate('reporter', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName')
    .populate({
      path: 'unit',
      select: 'unitNumber',
      populate: {
        path: 'property',
        select: 'name vermieter',
        populate: {
          path: 'owner',
          select: 'firstName lastName email'
        }
      }
    });

    console.log('Meldung lookup result:', {
      meldungId: req.params.id,
      found: !!meldung,
      status: meldung?.status,
      unit: meldung?.unit?._id
    });

    if (!meldung) {
      return res.status(404).json({ 
        message: 'Meldung not found or not assigned to you',
        requestedId: req.params.id,
        userId
      });
    }

    res.json(meldung);
  } catch (error) {
    console.error('Error in /meldungen/:id:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Send message
router.post('/messages', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const { meldungId, content, attachments } = req.body;

    if (!req.user?.userId) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.userId;

    // Verify the report is assigned to this craftsman
    const meldung = await Meldung.findOne({
      _id: meldungId,
      assignedTo: userId
    });

    if (!meldung) {
      return res.status(404).json({ 
        message: 'Meldung not found or not assigned to you',
        requestedId: meldungId,
        userId
      });
    }

    const message = new Message({
      meldung: meldungId,
      sender: userId,
      content,
      attachments: attachments || [],
      readBy: [{ user: userId }] // Mark as read by sender
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName role');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error in /messages:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all assigned reports
router.get('/auftraege', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const meldungen = await Meldung.find({ assignedTo: req.user.userId })
      .populate({
        path: 'unit',
        populate: {
          path: 'property',
          select: 'name owner',
          populate: {
            path: 'owner',
            select: 'firstName lastName email'
          }
        }
      })
      .sort({ createdAt: -1 });

    res.json(meldungen);
  } catch (error) {
    console.error('Error fetching auftraege:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single report by ID
router.get('/auftraege/:id', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;
    const meldung = await Meldung.findOne({ _id: id, assignedTo: req.user.userId })
      .populate({
        path: 'unit',
        populate: {
          path: 'property',
          select: 'name owner',
          populate: {
            path: 'owner',
            select: 'firstName lastName email'
          }
        }
      });

    if (!meldung) {
      return res.status(404).json({ message: 'Auftrag nicht gefunden' });
    }

    res.json(meldung);
  } catch (error) {
    console.error('Error fetching auftrag:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update report status
router.put('/auftraege/:id/status', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status transition
    const meldung = await Meldung.findById(id)
      .populate({
        path: 'unit',
        populate: {
          path: 'property',
          populate: {
            path: 'owner',
            select: 'firstName lastName email'
          }
        }
      }) as IMeldung | null;

    if (!meldung) {
      return res.status(404).json({ message: 'Auftrag nicht gefunden' });
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      [MeldungStatus.OFFEN]: [MeldungStatus.IN_BEARBEITUNG],
      [MeldungStatus.IN_BEARBEITUNG]: [MeldungStatus.HANDWERKER_ERLEDIGT],
    };

    if (!validTransitions[meldung.status]?.includes(status)) {
      return res.status(400).json({
        message: `Ungültiger Status-Übergang von ${meldung.status} zu ${status}`
      });
    }

    // Update status
    meldung.status = status;
    
    // Add note
    if (notes) {
      if (!meldung.notes) {
        meldung.notes = [];
      }
      const newNote: INote = {
        text: notes,
        createdBy: new Types.ObjectId(req.user.userId),
        createdAt: new Date()
      };
      meldung.notes.push(newNote);
    }

    // If status is changed to HANDWERKER_ERLEDIGT, notify the landlord
    if (status === MeldungStatus.HANDWERKER_ERLEDIGT && meldung.unit?.property?.owner) {
      // Create notification
      await Notification.create({
        recipient: meldung.unit.property.owner._id,
        type: 'MELDUNG_COMPLETED_BY_HANDWERKER',
        title: 'Auftrag als erledigt markiert',
        message: `Der Auftrag "${meldung.title}" wurde vom Handwerker als erledigt markiert.`,
        meldung: meldung._id,
        createdAt: new Date()
      });
    }

    await meldung.save();

    res.json({ message: 'Status erfolgreich aktualisiert', meldung });
  } catch (error) {
    console.error('Error updating auftrag status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all craftsmen
router.get('/', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const handwerker = await User.find({ role: UserRole.HANDWERKER })
      .select('firstName lastName email');
    res.json(handwerker);
  } catch (error) {
    console.error('Error fetching handwerker:', error);
    res.status(500).json({ message: 'Error fetching handwerker list' });
  }
});

// Calculate statistics for dashboard
router.get('/stats', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.userId;
    const allMeldungen = await Meldung.find({
      assignedTo: userId
    });

    const completedMeldungen = allMeldungen.filter(
      m => m.status === MeldungStatus.ABGESCHLOSSEN && m.completedAt
    );

    // Calculate average completion time
    const avgCompletionTime = completedMeldungen.reduce((sum, m) => {
      const completionTime = new Date(m.completedAt!).getTime() - new Date(m.createdAt).getTime();
      return sum + completionTime / (1000 * 60 * 60 * 24); // Convert to days
    }, 0) / (completedMeldungen.length || 1);

    res.json({
      totalAssigned: allMeldungen.length,
      inProgress: allMeldungen.filter(m => m.status === MeldungStatus.IN_BEARBEITUNG).length,
      completed: completedMeldungen.length,
      averageCompletionTime: avgCompletionTime
    });
  } catch (error) {
    console.error('Error in /stats:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get craftsman profile
router.get('/profile', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user.userId)
      .select('firstName lastName email phone');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    });
  } catch (error) {
    console.error('Error fetching handwerker profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update craftsman profile
router.put('/profile', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { firstName, lastName, email, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, email, phone },
      { new: true }
    ).select('firstName lastName email phone');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    });
  } catch (error) {
    console.error('Error updating handwerker profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update report status
router.put('/meldungen/:id/status', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;

    if (!req.user?.userId) {
      console.log('No user ID in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.userId;
    const meldung = await Meldung.findOne({
      _id: req.params.id,
      assignedTo: userId
    })
    .populate({
      path: 'unit',
      populate: {
        path: 'property',
        populate: {
          path: 'owner'
        }
      }
    });

    if (!meldung) {
      return res.status(404).json({ 
        message: 'Meldung not found or not assigned to you',
        requestedId: req.params.id,
        userId
      });
    }

    // Update status
    meldung.status = status;
    
    // Add note if provided
    if (notes) {
      const note = {
        text: notes,
        createdBy: new Types.ObjectId(userId),
        createdAt: new Date()
      };
      meldung.notes.push(note);
    }

    await meldung.save();

    /* Temporarily commented out message and notification creation
    // Create a status update message
    const message = new Message({
      meldung: meldung._id,
      sender: userId,
      senderRole: 'handwerker',
      receiver: {
        role: 'vermieter',
        userId: meldung.unit.property.owner._id
      },
      content: `Status wurde auf ${status} geändert. ${notes ? `Notiz: ${notes}` : ''}`,
      readBy: [{ user: userId }] // Mark as read by sender
    });

    await message.save();

    // Create notification for property owner
    const populatedMeldung = await Meldung.findById(meldung._id)
      .populate({
        path: 'unit',
        populate: {
          path: 'property',
          populate: {
            path: 'owner'
          }
        }
      });

    if (!populatedMeldung) {
      throw new Error('Failed to populate meldung');
    }

    const notification = new Notification({
      recipient: populatedMeldung.unit.property.owner._id,
      type: 'MELDUNG_STATUS_UPDATE',
      content: `Status der Meldung #${meldung._id} wurde auf ${status} geändert`,
      relatedMeldung: meldung._id
    });

    await notification.save();
    */

    res.json(meldung);
  } catch (error) {
    console.error('Error in /meldungen/:id/status:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
