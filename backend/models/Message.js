const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Message content
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'announcement'],
    default: 'text'
  },
  // Thread/Forum
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageThread'
  },
  // Course context
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String
  }],
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Reply to
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Indexes
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1 });
messageSchema.index({ thread: 1 });
messageSchema.index({ course: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Virtual for message age
messageSchema.virtual('age').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

module.exports = mongoose.model('Message', messageSchema);

// Message Thread Schema for forums
const messageThreadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Thread settings
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  // Statistics
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

messageThreadSchema.index({ course: 1 });
messageThreadSchema.index({ createdBy: 1 });
messageThreadSchema.index({ lastActivity: -1 });
messageThreadSchema.index({ isPinned: -1 });

module.exports.MessageThread = mongoose.model('MessageThread', messageThreadSchema);
