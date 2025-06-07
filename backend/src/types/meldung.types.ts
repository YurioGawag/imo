import { Document, Types } from 'mongoose';
import { MeldungStatus, Room } from '../models/meldung.model';

export interface INote {
  text: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

export interface IProperty {
  _id: Types.ObjectId;
  name: string;
  owner: {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface IUnit {
  _id: Types.ObjectId;
  unitNumber: string;
  property: IProperty;
}

export interface IMeldung extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  room: Room;
  status: MeldungStatus;
  unit: IUnit;
  reporter: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  notes: INote[];
  images: string[];
}

export interface IPopulatedMeldung extends Omit<IMeldung, 'unit'> {
  unit: IUnit;
}
