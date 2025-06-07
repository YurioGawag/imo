export enum NotificationType {
  MAINTENANCE = 'MAINTENANCE',    // z.B. Schornsteinfeger
  ANNOUNCEMENT = 'ANNOUNCEMENT',  // Allgemeine Ankündigungen
  EVENT = 'EVENT',               // z.B. Hausversammlung
  EMERGENCY = 'EMERGENCY'        // Notfälle
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  property: string;
  date?: Date;
  createdAt: Date;
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
}
