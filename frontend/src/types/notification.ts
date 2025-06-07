import { Meldung } from './meldung.types';
import { Unit } from './property';

export enum NotificationType {
  NEW_MELDUNG = 'new_meldung',
  MELDUNG_STATUS_CHANGE = 'meldung_status_change',
  NEW_MESSAGE = 'new_message',
  LEASE_ENDING = 'lease_ending',
  PAYMENT_DUE = 'payment_due'
}

export interface Notification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedMeldung?: Meldung;
  relatedUnit?: Unit;
  read: boolean;
  createdAt: string;
}