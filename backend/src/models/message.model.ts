import mongoose, { Document } from 'mongoose';

interface ReadByEntry {
  user: mongoose.Types.ObjectId;
  readAt: Date;
}

interface MessageDocument extends Document {
  meldung: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderRole: string;
  receiver: {
    role: string;
    userId: mongoose.Types.ObjectId;
  };
  content: string;
  attachments: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  createdAt: Date;
  readBy: ReadByEntry[];
  markAsRead(userId: string): Promise<void>;
  isUnreadFor(userId: string): boolean;
}

const messageSchema = new mongoose.Schema({
  meldung: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meldung',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['mieter', 'vermieter', 'handwerker'],
    required: true
  },
  receiver: {
    role: {
      type: String,
      enum: ['mieter', 'vermieter', 'handwerker'],
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    url: String,
    type: String,
    name: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Method to mark message as read by a user
messageSchema.methods.markAsRead = async function(userId: string): Promise<void> {
  if (!this.readBy.some((read: ReadByEntry) => read.user.toString() === userId)) {
    this.readBy.push({
      user: new mongoose.Types.ObjectId(userId),
      readAt: new Date()
    });
    await this.save();
  }
};

// Method to check if a message is unread for a specific user
messageSchema.methods.isUnreadFor = function(userId: string): boolean {
  return !this.readBy.some((read: ReadByEntry) => read.user.toString() === userId);
};

export const Message = mongoose.model<MessageDocument>('Message', messageSchema);
