// src/routes/user.routes.ts

import express, { Request, Response } from 'express';
import { authenticateJwt, roleCheck, AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { userService } from '../services/user.service';

const router = express.Router();

// Middleware for authentication
router.use(authenticateJwt);

// Get all users (admin only)
router.get('/', roleCheck([UserRole.VERMIETER]), async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const filter = role ? { role: role as UserRole } : undefined;
    const users = await userService.getUsers(filter);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user (admin only)
router.post('/', roleCheck([UserRole.VERMIETER]), async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const result = await userService.createUser(userData);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Update tenant's assigned unit (admin only)
router.put('/:userId/unit', roleCheck([UserRole.VERMIETER]), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { unitId } = req.body;
    const result = await userService.updateUserUnit(userId, unitId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Change password (for all users)
router.post('/change-password', async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Nicht authentifiziert' });
    }
    
    const result = await userService.changePassword(userId, currentPassword, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
