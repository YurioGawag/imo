import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  unitNumber: {
    type: String,
    required: true
  },
  floor: Number,
  squareMeters: {
    type: Number,
    required: true
  },
  rooms: {
    type: Number,
    required: true
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pendingTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant'
  },
  features: [{
    type: String
  }],
  leaseStart: Date,
  leaseEnd: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

unitSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export interface IUnit extends mongoose.Document {
  property: mongoose.Types.ObjectId;
  unitNumber: string;
  floor?: number;
  squareMeters: number;
  rooms: number;
  monthlyRent: number;
  currentTenant?: mongoose.Types.ObjectId;
  pendingTenant?: mongoose.Types.ObjectId;
  status: 'vacant' | 'occupied' | 'maintenance';
  features?: string[];
  leaseStart?: Date;
  leaseEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const Unit = mongoose.model<IUnit>('Unit', unitSchema);
