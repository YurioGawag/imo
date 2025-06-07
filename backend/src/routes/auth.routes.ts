import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authenticateJwt, AuthRequest } from '../middleware/auth.middleware';
import { User, UserRole } from '../models/user.model';
import { tenantService } from '../services/tenant.service';
import { sendEmail, loadEmailTemplate } from '../utils/email';

const router = express.Router();

// Login route
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-Mail und Passwort sind erforderlich' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('User logged in successfully:', { id: user._id, email: user.email, role: user.role });

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    console.log('Updated last login for user:', email);

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in /login:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify token route
router.get('/verify', authenticateJwt, async (req: AuthRequest, res: Response) => {
  try {
    console.log('Token verification request for user:', req.user?.userId);
    
    if (!req.user?.userId) {
      console.log('Token verification failed: No user ID in token');
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      console.log('Token verification failed: User not found:', req.user.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Token verified successfully for user:', { id: user._id, email: user.email, role: user.role });
    res.json({ user });
  } catch (error) {
    console.error('Error in /verify:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mieter Account aktivieren
router.post('/mieter/activate', async (req, res) => {
  try {
    const { token, password } = req.body;
    const { tenant, user } = await tenantService.activateTenant(token, password);
    res.json({ message: 'Account erfolgreich aktiviert' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Request password reset
router.post('/request-password-reset', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'E-Mail ist erforderlich' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'https://immofox.io'}/reset-password/${token}`;
    const html = loadEmailTemplate('password-reset', { resetUrl });

    try {
      await sendEmail({ to: user.email, subject: 'Passwort zurücksetzen', html });
    } catch (err) {
      console.error('Error sending reset email:', err);
    }

    res.json({ message: 'Password-Reset-E-Mail gesendet' });
  } catch (error) {
    console.error('Error in /request-password-reset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token und Passwort sind erforderlich' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Ungültiger oder abgelaufener Token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Passwort erfolgreich zurückgesetzt' });
  } catch (error) {
    console.error('Error in /reset-password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
