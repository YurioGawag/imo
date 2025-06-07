import mongoose from 'mongoose';

export enum MeldungStatus {
  OFFEN = 'OFFEN',
  IN_BEARBEITUNG = 'IN_BEARBEITUNG',
  HANDWERKER_ERLEDIGT = 'HANDWERKER_ERLEDIGT',
  ABGESCHLOSSEN = 'ABGESCHLOSSEN',
  STORNIERT = 'STORNIERT'
}

export enum MeldungPriority {
  NIEDRIG = 'niedrig',
  MITTEL = 'mittel',
  HOCH = 'hoch',
  DRINGEND = 'dringend'
}

export enum Room {
  WOHNZIMMER = 'wohnzimmer',
  SCHLAFZIMMER = 'schlafzimmer',
  KUECHE = 'kueche',
  BADEZIMMER = 'badezimmer',
  FLUR = 'flur',
  BALKON = 'balkon',
  KELLER = 'keller',
  SONSTIGE = 'sonstige'
}

export enum CommonIssue {
  WASSERSCHADEN = 'wasserschaden',
  HEIZUNG_DEFEKT = 'heizung_defekt',
  STROMAUSFALL = 'stromausfall',
  SCHIMMEL = 'schimmel',
  FENSTER_DEFEKT = 'fenster_defekt',
  TUERE_DEFEKT = 'tuere_defekt',
  SANITAER_PROBLEM = 'sanitaer_problem',
  BODENBELAG_BESCHAEDIGT = 'bodenbelag_beschaedigt',
  ELEKTRO_PROBLEM = 'elektro_problem',
  SCHLOSS_DEFEKT = 'schloss_defekt'
}

const meldungSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  room: {
    type: String,
    enum: Object.values(Room)
  },
  commonIssue: {
    type: String,
    enum: Object.values(CommonIssue)
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: Object.values(MeldungStatus),
    default: MeldungStatus.OFFEN,
    set: function(status: string) {
      // Konvertiere alte Status-Werte in neue
      switch(status.toLowerCase()) {
        case 'neu':
          return MeldungStatus.OFFEN;
        case 'in_bearbeitung':
          return MeldungStatus.IN_BEARBEITUNG;
        case 'abgeschlossen':
          return MeldungStatus.ABGESCHLOSSEN;
        default:
          return status;
      }
    }
  },
  priority: {
    type: String,
    enum: Object.values(MeldungPriority),
    default: MeldungPriority.MITTEL
  },
  images: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  estimatedCost: Number,
  actualCost: Number,
  notes: [{
    text: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

meldungSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  if (this.status === MeldungStatus.ABGESCHLOSSEN && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

export const Meldung = mongoose.model('Meldung', meldungSchema);
