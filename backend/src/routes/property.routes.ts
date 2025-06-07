// src/routes/property.routes.ts

import express from 'express';
import { roleCheck } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Gemeinsame Middleware für Authentifizierung
router.use(roleCheck([UserRole.VERMIETER]));

export default router;
