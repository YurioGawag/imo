// src/routes/unit.routes.ts

import express, { Request, Response } from 'express';
import { authenticateJwt, roleCheck } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { unitService } from '../services/unit.service';

const router = express.Router();

// Gemeinsame Middleware für Authentifizierung
router.use(authenticateJwt);
router.use(roleCheck([UserRole.VERMIETER, UserRole.MIETER]));

// Get all units by property ID
router.get('/property/:propertyId', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const units = await unitService.getUnitsByProperty(propertyId);
    res.json(units);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get available units (for tenant assignment)
router.get('/available', roleCheck([UserRole.VERMIETER]), async (req: Request, res: Response) => {
  try {
    const includeOccupied = req.query.includeOccupied === 'true';
    const units = await unitService.getAvailableUnits(includeOccupied);
    res.json(units);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get unit details
router.get('/:unitId', async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const unit = await unitService.getUnitDetails(unitId);
    res.json(unit);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

// Prüfen, ob eine Wohneinheit belegt ist
router.get('/:unitId/check-occupied', roleCheck([UserRole.VERMIETER]), async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const isOccupied = await unitService.isUnitOccupied(unitId);
    res.json({ isOccupied });
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
});

export default router;
