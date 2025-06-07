import { Unit, IUnit } from '../models/unit.model';
import { Property } from '../models/property.model';
import mongoose from 'mongoose';

export const unitService = {
  /**
   * Prüft, ob eine Wohneinheit bereits belegt ist
   */
  async isUnitOccupied(unitId: string): Promise<boolean> {
    const unit = await Unit.findById(unitId).lean();
    
    if (!unit) {
      throw new Error('Wohneinheit nicht gefunden');
    }
    
    return unit.status === 'occupied' || !!unit.currentTenant;
  },
  /**
   * Get all available units (vacant or with option to include occupied)
   */
  async getAvailableUnits(includeOccupied: boolean = false): Promise<IUnit[]> {
    // Create query to find units
    const query: any = {};
    
    // If not including occupied units, only get vacant ones
    if (!includeOccupied) {
      query.status = 'vacant';
      query.currentTenant = { $exists: false }; // Stellt sicher, dass kein Mieter zugewiesen ist
    }
    
    // Find units and populate property information
    const units = await Unit.find(query)
      .populate('property', 'name address')
      .sort({ 'property.name': 1, unitNumber: 1 })
      .lean();
    
    return units;
  },

  /**
   * Get units by property ID
   */
  async getUnitsByProperty(propertyId: string): Promise<IUnit[]> {
    const units = await Unit.find({ property: propertyId })
      .populate('currentTenant', 'firstName lastName email')
      .sort({ unitNumber: 1 })
      .lean();
    
    return units;
  },

  /**
   * Get unit details with tenant information
   */
  async getUnitDetails(unitId: string): Promise<any> {
    const unit = await Unit.findById(unitId)
      .populate('property', 'name address')
      .populate('currentTenant', 'firstName lastName email phone')
      .lean();
    
    if (!unit) {
      throw new Error('Wohneinheit nicht gefunden');
    }
    
    return unit;
  }
};
