export enum MeldungStatus {
  OFFEN = 'OFFEN',
  IN_BEARBEITUNG = 'IN_BEARBEITUNG',
  HANDWERKER_ERLEDIGT = 'HANDWERKER_ERLEDIGT',
  ABGESCHLOSSEN = 'ABGESCHLOSSEN',
  STORNIERT = 'STORNIERT'
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

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Property {
  _id: string;
  name: string;
  owner: User;
  units?: Unit[];
}

export interface Unit {
  _id: string;
  unitNumber: string;
  number?: string; // Für Kompatibilität mit Backend
  property: Property;
  status?: string;
  monthlyRent?: number;
  currentTenant?: User;
}

export interface Note {
  text: string;
  createdBy: string;
  createdAt: Date;
}

export enum RepairType {
  SANITAER = 'sanitaer',
  ELEKTRIK = 'elektrik',
  HEIZUNG = 'heizung',
  SCHREINER = 'schreiner',
  MALERARBEITEN = 'malerarbeiten',
  SONSTIGES = 'sonstiges'
}

export interface Meldung {
  _id: string;
  title: string;
  description: string;
  room: Room;
  status: MeldungStatus;
  unit: Unit;
  property?: Property;
  reporter: User;
  assignedTo?: User;
  assignedHandwerker?: User;
  repairType?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes: Note[];
  images: string[];
  unreadMessages?: number;
  commonIssue?: CommonIssue;
}
