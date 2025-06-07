import express, { Request, Response } from 'express';
import { User, UserRole } from '../models/user.model';
import { sendEmail } from '../utils/email';

const router = express.Router();

// Endpoint für Vermieter-Anfragen
router.post('/vermieter-request', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, company, propertiesCount, message } = req.body;

    // Grundlegende Validierung
    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ message: 'Bitte füllen Sie alle Pflichtfelder aus' });
    }

    // E-Mail-Format überprüfen
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Ungültiges E-Mail-Format' });
    }

    // Prüfen, ob E-Mail bereits existiert
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Wir senden trotzdem eine E-Mail, teilen dem Benutzer aber mit, dass der Account bereits existiert
      await sendEmail({
        to: email,
        subject: 'Ihre Anfrage bei Immofox',
        html: `
          <h2>Vielen Dank für Ihre Anfrage!</h2>
          <p>Sehr geehrte(r) ${firstName} ${lastName},</p>
          <p>wir haben festgestellt, dass bereits ein Konto mit Ihrer E-Mail-Adresse existiert. 
          Sie können sich mit Ihren bestehenden Zugangsdaten unter <a href="${process.env.FRONTEND_URL}/login">Immofox Login</a> anmelden.</p>
          <p>Falls Sie Ihr Passwort vergessen haben, nutzen Sie bitte die "Passwort vergessen" Funktion auf der Login-Seite.</p>
          <p>Bei weiteren Fragen stehen wir Ihnen gerne zur Verfügung.</p>
          <p>Mit freundlichen Grüßen,<br>Ihr Immofox-Team</p>
        `
      });

      // Wir informieren auch das Admin-Team
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@immofox.de',
        subject: 'Bestehender Nutzer hat Anfrage gestellt',
        html: `
          <h2>Bestehender Nutzer hat Kontaktformular ausgefüllt</h2>
          <p>Ein bestehender Nutzer hat das Kontaktformular ausgefüllt:</p>
          <ul>
            <li><strong>Name:</strong> ${firstName} ${lastName}</li>
            <li><strong>E-Mail:</strong> ${email}</li>
            <li><strong>Telefon:</strong> ${phone}</li>
            <li><strong>Unternehmen:</strong> ${company || 'Nicht angegeben'}</li>
            <li><strong>Anzahl Immobilien:</strong> ${propertiesCount || 'Nicht angegeben'}</li>
          </ul>
          <p><strong>Nachricht:</strong><br>${message}</p>
          <p>Der Nutzer wurde informiert, dass bereits ein Konto existiert.</p>
        `
      });

      return res.status(200).json({ 
        message: 'Anfrage erfolgreich gesendet. Sie werden bald kontaktiert.',
        accountExists: true
      });
    }

    // E-Mail an das Admin-Team senden
    await sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@immofox.de',
      subject: 'Neue Vermieter-Anfrage',
      html: `
        <h2>Neue Vermieter-Anfrage</h2>
        <p>Eine neue Anfrage für einen Vermieter-Account wurde gestellt:</p>
        <ul>
          <li><strong>Name:</strong> ${firstName} ${lastName}</li>
          <li><strong>E-Mail:</strong> ${email}</li>
          <li><strong>Telefon:</strong> ${phone}</li>
          <li><strong>Unternehmen:</strong> ${company || 'Nicht angegeben'}</li>
          <li><strong>Anzahl Immobilien:</strong> ${propertiesCount || 'Nicht angegeben'}</li>
        </ul>
        <p><strong>Nachricht:</strong><br>${message}</p>
        <p>Bitte prüfen Sie diese Anfrage und erstellen Sie bei positivem Bescheid manuell einen Vermieter-Account.</p>
      `
    });

    // Bestätigungs-E-Mail an den Anfragenden senden
    await sendEmail({
      to: email,
      subject: 'Vielen Dank für Ihre Anfrage bei Immofox',
      html: `
        <h2>Vielen Dank für Ihre Anfrage!</h2>
        <p>Sehr geehrte(r) ${firstName} ${lastName},</p>
        <p>wir haben Ihre Anfrage erhalten und werden sie sorgfältig prüfen. Unser Team wird sich innerhalb der nächsten 24 Stunden mit Ihnen in Verbindung setzen.</p>
        <p>In der Zwischenzeit können Sie sich gerne auf unserer <a href="${process.env.FRONTEND_URL}">Website</a> über weitere Funktionen informieren.</p>
        <p>Mit freundlichen Grüßen,<br>Ihr Immofox-Team</p>
      `
    });

    res.status(201).json({ message: 'Anfrage erfolgreich gesendet. Sie werden bald kontaktiert.' });

  } catch (error) {
    console.error('Fehler bei Vermieter-Anfrage:', error);
    res.status(500).json({ 
      message: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.' 
    });
  }
});

export default router;
