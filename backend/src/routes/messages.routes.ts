// src/routes/messages.router.ts

import express from 'express';
import mongoose from 'mongoose';
import { roleCheck } from '../middleware/auth.middleware';
import { Message } from '../models/message.model';
import { User, UserRole } from '../models/user.model';
import { Meldung } from '../models/meldung.model';
import PDFDocument from 'pdfkit';
import path from 'path';

const router = express.Router();

interface PopulatedMeldung extends mongoose.Document {
  title: string;
  reporter: {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    _id: mongoose.Types.ObjectId;
    firstName: string;
    lastName: string;
  };
  unit: {
    _id: mongoose.Types.ObjectId;
    unitNumber: string;
    property: {
      _id: mongoose.Types.ObjectId;
      address: {
        street: string;
        city: string;
        postalCode: string;
        country: string;
      };
      owner: {
        _id: mongoose.Types.ObjectId;
        firstName: string;
        lastName: string;
      };
    };
  };
}

// Gemeinsame Middleware für Authentifizierung
router.use(roleCheck([UserRole.MIETER, UserRole.VERMIETER, UserRole.HANDWERKER]));

// Helper-Funktion, um zu überprüfen, ob ein Benutzer Zugriff auf eine Meldung hat
async function hasAccessToMeldung(userId: string, userRole: UserRole, meldungId: string): Promise<boolean> {
  console.log(`Prüfe Zugriff für User ${userId} mit Rolle ${userRole} auf Meldung ${meldungId}`);
  
  const meldung = await Meldung.findById(meldungId)
    .populate('reporter')
    .populate('assignedTo')
    .populate({
      path: 'unit',
      populate: {
        path: 'property',
        populate: 'owner'
      }
    }) as PopulatedMeldung | null;

  if (!meldung) {
    console.log('Meldung nicht gefunden');
    return false;
  }

  if (!meldung.unit?.property?.owner) {
    console.log('Meldung hat keine vollständigen Referenzen (unit/property/owner)');
    return false;
  }

  const hasAccess = (
    meldung.reporter._id.toString() === userId || // Mieter
    meldung.assignedTo?._id.toString() === userId || // Handwerker
    meldung.unit.property.owner._id.toString() === userId || // Vermieter
    userRole === UserRole.VERMIETER // Vermieter sieht alles
  );
  
  console.log(`Zugriff: ${hasAccess}`);
  return hasAccess;
}

// GET /messages/:meldungId/export
router.get('/:meldungId/export', async (req: any, res) => {
  try {
    const { meldungId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(meldungId)) {
      return res.status(400).json({ message: 'Ungültige Meldungs-ID' });
    }

  const access = await hasAccessToMeldung(userId, userRole, meldungId);
  if (!access) {
    return res.status(403).json({ message: 'Zugriff verweigert' });
  }

  const meldung = await Meldung.findById(meldungId)
    .populate('reporter', 'firstName lastName')
    .populate('assignedTo', 'firstName lastName')
    .populate({
      path: 'unit',
      populate: {
        path: 'property',
        populate: {
          path: 'owner',
          select: 'firstName lastName'
        }
      }
    }) as PopulatedMeldung | null;

  if (!meldung) {
    return res.status(404).json({ message: 'Meldung nicht gefunden' });
  }

  const messages = await Message.find({ meldung: meldungId })
    .populate('sender', 'firstName lastName')
    .sort({ createdAt: 1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="messages-${meldungId}.pdf"`);
    doc.pipe(res);

    doc.fontSize(16).text(`Meldung: ${meldung.title}`, { underline: true });
    doc.moveDown();
    const reporterName = `${meldung.reporter.firstName} ${meldung.reporter.lastName}`;
    doc.fontSize(12).text(`Gemeldet von: ${reporterName}`);
    if (meldung.unit && (meldung.unit as any).property) {
      const unit: any = meldung.unit;
      const property: any = unit.property;
      doc.fontSize(12).text(`Wohnung: ${unit.unitNumber}`);
      doc.fontSize(12).text(`Straße: ${property.address.street}`);
      doc.fontSize(12).text(`Ort: ${property.address.postalCode} ${property.address.city}`);
    }
    doc.moveDown();

    messages.forEach(msg => {
      const sender = (msg.sender as any)?.firstName + ' ' + (msg.sender as any)?.lastName;
      doc.fontSize(12).text(`Von: ${sender}`);
      doc.fontSize(10).text(`Zeit: ${msg.createdAt.toISOString()}`);
      doc.fontSize(12).text(msg.content);
      if (msg.attachments && msg.attachments.length) {
        msg.attachments.forEach(att => {
          if (att.type && att.type.startsWith('image/')) {
            try {
              const p = path.isAbsolute(att.url) ? att.url : path.join(process.cwd(), att.url);
              doc.image(p, { width: 200 });
            } catch (e) {
              console.error('Bild konnte nicht geladen werden:', e);
            }
          }
        });
      }
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error('Fehler beim Exportieren der Nachrichten:', error);
    res.status(500).json({ message: 'Fehler beim Exportieren der Nachrichten' });
  }
});

// GET /messages/:meldungId
router.get('/:meldungId', async (req: any, res) => {
  console.log('GET /messages/:meldungId aufgerufen');
  try {
    const { meldungId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.userId;

    console.log(`Parameter: meldungId=${meldungId}, userRole=${userRole}, userId=${userId}`);

    if (!mongoose.Types.ObjectId.isValid(meldungId)) {
      console.log('Ungültige Meldungs-ID');
      return res.status(400).json({ message: 'Ungültige Meldungs-ID' });
    }

    const hasAccess = await hasAccessToMeldung(userId, userRole, meldungId);
    if (!hasAccess) {
      console.log('Zugriff verweigert');
      return res.status(403).json({ message: 'Zugriff verweigert' });
    }

    // Hole alle Nachrichten für diese Meldung
    const messages = await Message.find({ meldung: meldungId })
      .populate('sender', 'firstName lastName')
      .populate('receiver.userId', 'firstName lastName')
      .sort({ createdAt: 1 });

    // Füge die Rollen zu den Nachrichten hinzu
    const messagesWithRoles = messages.map(msg => ({
      ...msg.toObject(),
      senderRole: msg.senderRole,
      receiver: {
        ...msg.receiver,
        role: msg.receiver.role
      }
    }));

    console.log(`${messages.length} Nachrichten gefunden`);
    res.json({ messages: messagesWithRoles });
  } catch (error) {
    console.error('Fehler beim Abrufen der Nachrichten:', error);
    res.status(500).json({ 
      message: 'Fehler beim Abrufen der Nachrichten',
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    });
  }
});

// POST /messages
router.post('/', async (req: any, res) => {
  console.log('POST /messages aufgerufen');
  try {
    const { content, meldungId, receiverRole } = req.body;
    const senderRole = req.user.role;
    const senderId = req.user.userId;

    console.log(`Parameter: content=${content}, meldungId=${meldungId}, receiverRole=${receiverRole}, senderRole=${senderRole}, senderId=${senderId}`);

    const hasAccess = await hasAccessToMeldung(senderId, senderRole, meldungId);
    if (!hasAccess) {
      console.log('Zugriff verweigert');
      return res.status(403).json({ message: 'Zugriff verweigert' });
    }

    // Finde die Meldung mit allen relevanten Benutzern
    const meldung = await Meldung.findById(meldungId)
      .populate('reporter')
      .populate('assignedTo')
      .populate({
        path: 'unit',
        populate: {
          path: 'property',
          populate: 'owner'
        }
      }) as PopulatedMeldung | null;

    if (!meldung) {
      console.log('Meldung nicht gefunden');
      return res.status(404).json({ message: 'Meldung nicht gefunden' });
    }

    if (!meldung.unit?.property?.owner) {
      console.log('Meldung hat keine vollständigen Referenzen (unit/property/owner)');
      return res.status(404).json({ message: 'Meldung oder Eigentümer nicht gefunden' });
    }

    // Bestimme den Empfänger basierend auf der receiverRole
    let receiverId;
    switch (receiverRole) {
      case 'mieter':
        receiverId = meldung.reporter._id;
        break;
      case 'vermieter':
        receiverId = meldung.unit.property.owner._id;
        break;
      case 'handwerker':
        if (!meldung.assignedTo) {
          console.log('Kein Handwerker zugewiesen');
          return res.status(400).json({ message: 'Kein Handwerker zugewiesen' });
        }
        receiverId = meldung.assignedTo._id;
        break;
      default:
        console.log('Ungültige Empfängerrolle:', receiverRole);
        return res.status(400).json({ message: 'Ungültige Empfängerrolle' });
    }

    const message = new Message({
      content,
      meldung: meldungId,
      sender: senderId,
      senderRole: senderRole.toLowerCase(),
      receiver: {
        userId: receiverId,
        role: receiverRole
      }
    });

    await message.save();
    await message.populate('sender', 'firstName lastName');
    await message.populate('receiver.userId', 'firstName lastName');

    console.log('Nachricht erfolgreich erstellt');
    res.status(201).json(message);
  } catch (error) {
    console.error('Fehler beim Erstellen der Nachricht:', error);
    res.status(500).json({ message: 'Fehler beim Erstellen der Nachricht' });
  }
});

export { hasAccessToMeldung };
export default router;
