import mongoose from 'mongoose';
import { Meldung, MeldungStatus } from '../models/meldung.model';

const updateMeldungStatus = async () => {
  try {
    // Verbindung zur Datenbank herstellen
    await mongoose.connect('mongodb://localhost:27017/house');
    console.log('Connected to MongoDB');

    // Alle Meldungen abrufen
    const meldungen = await Meldung.find({});
    console.log(`Found ${meldungen.length} meldungen`);

    // Status aktualisieren
    for (const meldung of meldungen) {
      const oldStatus = meldung.status;
      let newStatus = oldStatus;

      // Konvertiere alte Status-Werte
      switch(oldStatus.toLowerCase()) {
        case 'neu':
          newStatus = MeldungStatus.OFFEN;
          break;
        case 'in_bearbeitung':
          newStatus = MeldungStatus.IN_BEARBEITUNG;
          break;
        case 'abgeschlossen':
          newStatus = MeldungStatus.ABGESCHLOSSEN;
          break;
      }

      // Nur aktualisieren, wenn sich der Status geändert hat
      if (oldStatus !== newStatus) {
        console.log(`Updating meldung ${meldung._id} status from ${oldStatus} to ${newStatus}`);
        meldung.status = newStatus;
        await meldung.save();
      }
    }

    console.log('Status update completed');
    process.exit(0);
  } catch (error) {
    console.error('Error updating status:', error);
    process.exit(1);
  }
};

updateMeldungStatus();
