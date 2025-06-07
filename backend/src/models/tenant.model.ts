import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  moveInDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invitationToken: String,
  invitationExpires: Date
}, {
  timestamps: true
});

export interface ITenant extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  moveInDate: Date;
  isActive: boolean;
  userId?: mongoose.Types.ObjectId;
  invitationToken?: string;
  invitationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const Tenant = mongoose.model<ITenant>('Tenant', tenantSchema);
