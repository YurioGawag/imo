import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  VERMIETER = 'vermieter',
  MIETER = 'mieter',
  HANDWERKER = 'handwerker'
}

// Base interface for user data
export interface IUserBase {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Interface for the user document in the database
export interface IUser extends IUserBase {
  password: string;
  assignedUnit?: mongoose.Types.ObjectId;
  specialization?: string;  // Für Handwerker
  rating?: number;          // Für Handwerker
  assignedProperties?: mongoose.Types.ObjectId[];  // Für Handwerker
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  subscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  apartmentCount?: number;
}

// Interface for user methods
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Combined Document type
export type UserDocument = Document & IUser & IUserMethods;

const userSchema = new mongoose.Schema<UserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
  assignedUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit'
  },
  specialization: {
    type: String,
    validate: {
      validator: function (this: UserDocument) {
        return this.role !== UserRole.HANDWERKER || !!this.specialization;
      },
      message: 'Specialization is required for handwerker'
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
    validate: {
      validator: function (this: UserDocument) {
        return this.role !== UserRole.HANDWERKER || typeof this.rating === 'number';
      },
      message: 'Rating is required for handwerker'
    }
  },
  assignedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  subscriptionId: String,
  subscriptionStatus: String,
  subscriptionPlan: String,
  apartmentCount: {
    type: Number,
    default: 0
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Comparing password for user:', {
      email: this.email,
      hashPreview: this.password.substring(0, 10) + '...',
    });
  }

  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Password comparison result:', {
      email: this.email,
      isMatch,
    });
  }

  return isMatch;
};

export const User = mongoose.model<UserDocument>('User', userSchema);
