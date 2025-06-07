import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

// Create transporter lazily to allow unit tests without email configuration
let transporter: nodemailer.Transporter | null = null;
let usingEthereal = false;

async function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: parseInt(EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: EMAIL_USER, pass: EMAIL_PASSWORD },
      tls: process.env.EMAIL_SECURE === 'false' ? { rejectUnauthorized: false } : undefined,
    });
    usingEthereal = false;
  } else {
    console.warn('Email configuration missing. Using Ethereal test account.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    usingEthereal = true;
  }

  return transporter;
}

// Funktion zum Senden von E-Mails
export const sendEmail = async (options: EmailOptions) => {
  try {
    if (!transporter) {
      transporter = await getTransporter();
    }

    const info = await transporter.sendMail({
      from: `"ImmoFox" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [],
    });

    console.log('\n\n=== E-MAIL GESENDET ===');
    console.log(`An: ${options.to}`);
    console.log(`Betreff: ${options.subject}`);
    console.log(`Message ID: ${info.messageId}`);
    if (usingEthereal) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    console.log('======================\n\n');

    return info;
  } catch (error) {
    console.error('Fehler beim E-Mail-Versand:', {
      message: (error as Error).message,
    });
    throw error;
  }
};

// Funktion zum Laden von E-Mail-Templates
export const loadEmailTemplate = (
  pathOrName: string,
  replacements?: Record<string, string>
) => {
  try {
    let templatePath = pathOrName;

    // Wenn nur der Template-Name übergeben wurde, konstruiere mögliche Pfade
    if (!pathOrName.includes('/') && !pathOrName.includes('\\')) {
      const potentialPaths = [
        path.join(__dirname, '..', 'templates', 'emails', `${pathOrName}.html`),
        path.join(__dirname, '..', '..', 'src', 'templates', 'emails', `${pathOrName}.html`),
        path.join(process.cwd(), 'src', 'templates', 'emails', `${pathOrName}.html`)
      ];

      const found = potentialPaths.find(p => fs.existsSync(p));
      templatePath = found || potentialPaths[0];
    }

    // Prüfen, ob das Template existiert
    if (!fs.existsSync(templatePath)) {
      throw new Error(`E-Mail-Template ${templatePath} nicht gefunden`);
    }

    // Template laden
    let template = fs.readFileSync(templatePath, 'utf8');

    // Ersetze alle Platzhalter im Format {{key}}, falls replacements vorhanden
    if (replacements) {
      Object.entries(replacements).forEach(([key, value]) => {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
      });
    }

    return template;
  } catch (error) {
    console.error('Fehler beim Laden des E-Mail-Templates:', error);
    throw error;
  }
};
