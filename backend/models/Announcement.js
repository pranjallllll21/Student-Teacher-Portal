const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Scope
  scope: {
    type: String,
    enum: ['global', 'course', 'role'],
    required: true
  },
  // Target audience
  targetAudience: {
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    roles: [{
      type: String,
      enum: ['student', 'teacher', 'admin', 'parent']
    }],
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  // Priority and visibility
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  // Timing
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String
  }],
  // Engagement
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Comments
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }],
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  // Notifications
  sendNotification: {
    type: Boolean,
    default: true
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
announcementSchema.index({ author: 1 });
announcementSchema.index({ scope: 1 });
announcementSchema.index({ publishDate: -1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ isPinned: -1 });
announcementSchema.index({ priority: -1 });
announcementSchema.index({ 'targetAudience.courses': 1 });
announcementSchema.index({ 'targetAudience.roles': 1 });

// Virtual for view count
announcementSchema.virtual('viewCount').get(function() {
  return this.views.length;
});

// Virtual for like count
announcementSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
announcementSchema.virtual('commentCount').get(function() {
  return this.comments.filter(c => !c.isDeleted).length;
});

// Virtual for is expired
announcementSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

// Method to check if user has viewed
announcementSchema.methods.hasUserViewed = function(userId) {
  return this.views.some(view => view.user.toString() === userId.toString());
};

// Method to mark as viewed
announcementSchema.methods.markAsViewed = function(userId) {
  if (!this.hasUserViewed(userId)) {
    this.views.push({
      user: userId,
      viewedAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to toggle like
announcementSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
    return { liked: false, likeCount: this.likes.length };
  } else {
    this.likes.push({
      user: userId,
      likedAt: new Date()
    });
    return { liked: true, likeCount: this.likes.length };
  }
};

// Method to add comment
announcementSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    author: userId,
    content: content,
    createdAt: new Date()
  });
  return this.save();
};

// Method to delete comment
announcementSchema.methods.deleteComment = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  if (comment && (comment.author.toString() === userId.toString() || this.author.toString() === userId.toString())) {
    comment.isDeleted = true;
    return this.save();
  }
  throw new Error('Comment not found or unauthorized');
};

module.exports = mongoose.model('Announcement', announcementSchema);
