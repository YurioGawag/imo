import mongoose from 'mongoose';

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

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: Object.values(NotificationType),
    default: NotificationType.ANNOUNCEMENT 
  },
  priority: { 
    type: String, 
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM 
  },
  property: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Property',
    required: true 
  },
  date: { type: Date },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
