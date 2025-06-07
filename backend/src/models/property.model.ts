import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Germany'
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalUnits: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    required: false
  },
  yearBuilt: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

propertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Property = mongoose.model('Property', propertySchema);

export { Property };

export type PropertyDocument = mongoose.Document & {
  name: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  owner: mongoose.Types.ObjectId;
  totalUnits: number;
  description?: string;
  yearBuilt?: number;
  createdAt: Date;
  updatedAt: Date;
};
