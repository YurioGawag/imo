import { User, UserRole } from '../models/user.model';
import { Unit } from '../models/unit.model';
import { Property } from '../models/property.model';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail, loadEmailTemplate } from '../utils/email';

export const userService = {
  /**
   * Generate a secure random password
   */
  generateTemporaryPassword(): string {
    // Generate a random password with 10 characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },

  /**
   * Create a new user by admin
   */
  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    unitId?: string; // Only required for MIETER role
  }) {
    // Vermieter dürfen keine weiteren Vermieter anlegen
    if (userData.role === UserRole.VERMIETER) {
      throw new Error('Vermieter können keine weiteren Vermieter anlegen');
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Ein Benutzer mit dieser E-Mail existiert bereits');
    }

    // Generate temporary password
    const temporaryPassword = this.generateTemporaryPassword();

    // Create new user
    const user = new User({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      phone: userData.phone,
      password: temporaryPassword, // Will be hashed by the pre-save hook
      createdAt: new Date()
    });

    let unitDetails = null;
    let propertyDetails = null;

    // If user is a tenant, assign them to the unit
    if (userData.role === UserRole.MIETER && userData.unitId) {
      const unit = await Unit.findById(userData.unitId).populate('property');
      if (!unit) {
        throw new Error('Wohneinheit nicht gefunden');
      }
      
      // Prüfen, ob die Wohnung bereits belegt ist
      if (unit.status === 'occupied' || unit.currentTenant) {
        throw new Error('Diese Wohneinheit ist bereits belegt');
      }

      // Update unit with the new tenant
      unit.currentTenant = user._id;
      unit.status = 'occupied';
      await unit.save();

      // Assign unit to user
      user.assignedUnit = unit._id;

      // Speichere Unit- und Property-Details für die E-Mail
      unitDetails = unit;
      propertyDetails = unit.property as any;
    }

    await user.save();

    // Sende entsprechende E-Mail je nach Benutzerrolle
    if (userData.role === UserRole.MIETER && unitDetails && propertyDetails) {
      // Sende Mieter-Einladung mit Wohnungsdetails
      const emailHtml = loadEmailTemplate('tenant-invitation', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        temporaryPassword,
        propertyAddress: `${propertyDetails.address.street}, ${propertyDetails.address.postalCode} ${propertyDetails.address.city}`,
        unitNumber: unitDetails.unitNumber || 'Nicht angegeben'
      });

      await sendEmail({
        to: user.email,
        subject: 'Willkommen bei ImmoFox - Ihre Zugangsdaten',
        html: emailHtml
      });
    } else {
      // Standard-E-Mail für andere Benutzerrollen
      await sendEmail({
        to: user.email,
        subject: 'Ihr ImmoFox-Konto wurde erstellt',
        html: loadEmailTemplate('user-invitation', {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          temporaryPassword,
          role: user.role
        })
      });
    }

    return {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt
      },
      temporaryPassword
    };
  },

  /**
   * Update a user's assigned unit (for tenants)
   */
  async updateUserUnit(userId: string, unitId: string | null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }

    if (user.role !== UserRole.MIETER) {
      throw new Error('Nur Mieter können einer Wohneinheit zugewiesen werden');
    }

    // If user was previously assigned to a unit, update that unit
    if (user.assignedUnit) {
      const previousUnit = await Unit.findById(user.assignedUnit);
      if (previousUnit && previousUnit.currentTenant?.toString() === userId) {
        previousUnit.currentTenant = undefined;
        previousUnit.status = 'vacant';
        await previousUnit.save();
      }
    }

    // If unitId is null, just remove the tenant from the unit
    if (!unitId) {
      user.assignedUnit = undefined;
      await user.save();
      return { user };
    }

    // Assign user to new unit
    const newUnit = await Unit.findById(unitId);
    if (!newUnit) {
      throw new Error('Wohneinheit nicht gefunden');
    }

    // If unit already has a tenant, remove them
    if (newUnit.currentTenant) {
      const currentTenant = await User.findById(newUnit.currentTenant);
      if (currentTenant) {
        currentTenant.assignedUnit = undefined;
        await currentTenant.save();
      }
    }

    // Update unit with new tenant
    newUnit.currentTenant = user._id;
    newUnit.status = 'occupied';
    await newUnit.save();

    // Update user with new unit
    user.assignedUnit = newUnit._id;
    await user.save();

    return { user };
  },

  /**
   * Get all users with optional filtering
   */
  async getUsers(filter?: { role?: UserRole }) {
    const query = filter?.role ? { role: filter.role } : {};
    const users = await User.find(query).select('-password');
    return users;
  },

  /**
   * Change password for a user (for first login)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Benutzer nicht gefunden');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Aktuelles Passwort ist falsch');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Passwort erfolgreich geändert' };
  }
};
