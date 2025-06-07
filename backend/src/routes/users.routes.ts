import express, { Request } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { User } from '../models/user.model';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

const router = express.Router();

// Get user profile
router.get('/profile', authenticateJwt, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Serverfehler beim Abrufen des Profils' });
  }
});

// Update user profile
router.put('/profile', authenticateJwt, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    // Überprüfe, ob die E-Mail bereits verwendet wird
    const existingUser = await User.findOne({ email, _id: { $ne: req.user?._id } });
    if (existingUser) {
      return res.status(400).json({ message: 'Diese E-Mail-Adresse wird bereits verwendet' });
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        firstName,
        lastName,
        email,
        phone,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Serverfehler beim Aktualisieren des Profils' });
  }
});

export default router;
