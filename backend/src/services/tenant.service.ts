import { Tenant, ITenant } from '../models/tenant.model';
import { Property } from '../models/property.model';
import { Unit } from '../models/unit.model';
import { User } from '../models/user.model';
import crypto from 'crypto';
import { sendEmail, loadEmailTemplate } from '../utils/email';
import { HttpError } from '../utils/httpError';

export const tenantService = {
  async createTenant(propertyId: string, unitId: string, tenantData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    moveInDate: Date;
  }) {
    try {
      console.log('Creating tenant with data:', { propertyId, unitId, tenantData });
      
      // Prüfen ob die E-Mail bereits existiert
      const existingTenant = await Tenant.findOne({
        email: tenantData.email,
        isActive: true
      });

      if (existingTenant) {
        throw new HttpError(409, 'Ein aktiver Mieter mit dieser E-Mail existiert bereits');
      }

      // Prüfen, ob bereits ein Benutzer mit dieser E-Mail existiert
      const existingUser = await User.findOne({ email: tenantData.email });
      if (existingUser) {
        throw new HttpError(409, 'Ein Benutzer mit dieser E-Mail existiert bereits');
      }

      // Alte ausstehende Einladungen für diese E-Mail löschen
      await Tenant.deleteMany({ 
        email: tenantData.email,
        isActive: false 
      });

      // Einladungstoken generieren
      const invitationToken = crypto.randomBytes(32).toString('hex');
      const invitationExpires = new Date();
      invitationExpires.setHours(invitationExpires.getHours() + 24); // Token ist 24 Stunden gültig

      // Neuen Mieter erstellen
      const tenant = new Tenant({
        ...tenantData,
        invitationToken,
        invitationExpires,
        isActive: false,
      });
      await tenant.save();

      // Wohneinheit finden
      const unit = await Unit.findById(unitId);
      if (!unit) {
        throw new HttpError(404, 'Wohneinheit nicht gefunden');
      }

      // Wenn es einen pendingTenant gibt, diesen löschen
      if (unit.pendingTenant) {
        await Tenant.findByIdAndDelete(unit.pendingTenant);
        unit.status = 'vacant';
      }

      // Mieter der Wohneinheit zuweisen
      unit.pendingTenant = tenant._id;
      unit.leaseStart = tenantData.moveInDate;
      await unit.save();

      // Immobilie finden, um Adresse zu erhalten
      const property = await Property.findById(propertyId);
      if (!property) {
        throw new HttpError(404, 'Immobilie nicht gefunden');
      }

      // Einladungs-E-Mail mit Template senden
      const invitationUrl = `${process.env.FRONTEND_URL || 'https://immofox.io'}/mieter/einladung/${invitationToken}`;
      
      // Template laden. Bei Deployment kann das Template auch im src-Ordner liegen,
      // daher nur den Namen übergeben, damit loadEmailTemplate die passenden
      // Pfade durchprobiert.
      let emailHtml = await loadEmailTemplate('tenant-invitation');
      
      // Adresse formatieren mit Null-Check
      const propertyAddress = property.address ? 
        `${property.address.street}, ${property.address.postalCode} ${property.address.city}` : 
        property.name || 'Ihre Immobilie';
      
      // Platzhalter ersetzen
      emailHtml = emailHtml
        .replace(/{{firstName}}/g, tenant.firstName)
        .replace(/{{lastName}}/g, tenant.lastName)
        .replace(/{{email}}/g, tenant.email)
        .replace(/{{propertyAddress}}/g, propertyAddress)
        .replace(/{{unitNumber}}/g, unit.unitNumber || '')
        .replace(/{{invitationUrl}}/g, invitationUrl);
      
      try {
        await sendEmail({
          to: tenant.email,
          subject: 'Einladung zur Mieter-Registrierung bei ImmoFox',
          html: emailHtml
        });
      } catch (emailError) {
        console.error('Failed to send tenant invitation:', emailError);
        // Do not fail tenant creation if email sending fails
      }

      return tenant;
    } catch (error) {
      console.error('Error creating tenant:', error);
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
      throw error;
    }
  },

  async activateTenant(token: string, password: string) {
    try {
      console.log('Activating tenant with token:', token);
      
      const tenant = await Tenant.findOne({
        invitationToken: token,
        invitationExpires: { $gt: new Date() },
        isActive: false
      });

      if (!tenant) {
        throw new Error('Ungültiger oder abgelaufener Einladungslink');
      }

      // Neuen User erstellen
      const user = new User({
        email: tenant.email,
        password,
        role: 'mieter',
        firstName: tenant.firstName,
        lastName: tenant.lastName,
      });
      await user.save();

      // Wohneinheit finden und aktualisieren
      const unit = await Unit.findOne({ pendingTenant: tenant._id });
      if (unit) {
        unit.currentTenant = user._id;
        unit.pendingTenant = undefined;
        unit.status = 'occupied';
        await unit.save();
      }

      // Tenant aktivieren und mit User verknüpfen
      tenant.isActive = true;
      tenant.userId = user._id;
      tenant.invitationToken = undefined;
      tenant.invitationExpires = undefined;
      await tenant.save();

      return { tenant, user };
    } catch (error) {
      console.error('Error activating tenant:', error);
      throw error;
    }
  },

  async getTenantsByProperty(propertyId: string) {
    try {
      console.log('Getting tenants for property:', propertyId);
      
      const units = await Unit.find({ property: propertyId })
        .populate('currentTenant')
        .populate('pendingTenant')
        .exec();
      
      return units.map(unit => ({
        unit: {
          _id: unit._id,
          unitNumber: unit.unitNumber,
        },
        currentTenant: unit.currentTenant,
        pendingTenant: unit.pendingTenant
      }));
    } catch (error) {
      console.error('Error getting tenants by property:', error);
      throw error;
    }
  }
};
