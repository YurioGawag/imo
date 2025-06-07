import { MeldungStatus, Room } from '../types/meldung.types';

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Alle' },
  { value: MeldungStatus.OFFEN, label: 'Offen' },
  { value: MeldungStatus.IN_BEARBEITUNG, label: 'In Bearbeitung' },
  { value: MeldungStatus.HANDWERKER_ERLEDIGT, label: 'Wartet auf Bestätigung' },
  { value: MeldungStatus.ABGESCHLOSSEN, label: 'Abgeschlossen' },
  { value: MeldungStatus.STORNIERT, label: 'Storniert' }
];

export const ROOM_TYPES = [
  { id: Room.WOHNZIMMER, label: 'Wohnzimmer' },
  { id: Room.SCHLAFZIMMER, label: 'Schlafzimmer' },
  { id: Room.KUECHE, label: 'Küche' },
  { id: Room.BADEZIMMER, label: 'Badezimmer' },
  { id: Room.FLUR, label: 'Flur' },
  { id: Room.BALKON, label: 'Balkon' },
  { id: Room.KELLER, label: 'Keller' },
  { id: Room.SONSTIGE, label: 'Sonstige' }
];

export const getStatusColor = (status: string) => {
  switch (status) {
    case MeldungStatus.OFFEN:
      return 'info.main';
    case MeldungStatus.IN_BEARBEITUNG:
      return 'warning.main';
    case MeldungStatus.HANDWERKER_ERLEDIGT:
      return 'secondary.main';
    case MeldungStatus.ABGESCHLOSSEN:
      return 'success.main';
    case MeldungStatus.STORNIERT:
      return 'error.main';
    default:
      return 'grey.main';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case MeldungStatus.OFFEN:
      return 'Offen';
    case MeldungStatus.IN_BEARBEITUNG:
      return 'In Bearbeitung';
    case MeldungStatus.HANDWERKER_ERLEDIGT:
      return 'Wartet auf Bestätigung';
    case MeldungStatus.ABGESCHLOSSEN:
      return 'Abgeschlossen';
    case MeldungStatus.STORNIERT:
      return 'Storniert';
    default:
      return status;
  }
};

export const COMMON_ISSUES = [
  {
    id: 1,
    title: 'Heizung funktioniert nicht',
    description: 'Probleme mit der Heizungsanlage oder einzelnen Heizkörpern',
    image: '/images/issues/heating.jpg'
  },
  {
    id: 2,
    title: 'Wasserhahn tropft',
    description: 'Undichter Wasserhahn oder tropfende Armatur',
    image: '/images/issues/leaking-tap.jpg'
  },
  {
    id: 3,
    title: 'Verstopfter Abfluss',
    description: 'Verstopfung in Waschbecken, Badewanne oder Spüle',
    image: '/images/issues/clogged-drain.jpg'
  },
  {
    id: 4,
    title: 'Schimmel an der Wand',
    description: 'Schimmelbildung an Wänden oder Decken',
    image: '/images/issues/mold.jpg'
  },
  {
    id: 5,
    title: 'Defekte Steckdose',
    description: 'Nicht funktionierende oder beschädigte Steckdose',
    image: '/images/issues/socket.jpg'
  },
  {
    id: 6,
    title: 'Fenster schließt nicht richtig',
    description: 'Probleme mit Fensterdichtung oder -mechanismus',
    image: '/images/issues/window.jpg'
  },
  {
    id: 7,
    title: 'Rolladen klemmt',
    description: 'Defekter oder klemmender Rolladen',
    image: '/images/issues/shutter.jpg'
  },
  {
    id: 8,
    title: 'Türklingel defekt',
    description: 'Nicht funktionierende Türklingel oder Gegensprechanlage',
    image: '/images/issues/doorbell.jpg'
  },
  {
    id: 9,
    title: 'Licht/Lampe defekt',
    description: 'Defekte Beleuchtung oder Schalter',
    image: '/images/issues/light.jpg'
  },
  {
    id: 10,
    title: 'Wasserflecken an der Decke',
    description: 'Wasserschaden oder Feuchtigkeit von oben',
    image: '/images/issues/water-damage.jpg'
  }
];
