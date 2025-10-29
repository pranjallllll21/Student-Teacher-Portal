const mongoose = require('mongoose');

// Badge Schema
const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['achievement', 'milestone', 'special', 'seasonal'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  // Requirements
  requirements: {
    type: {
      type: String,
      enum: ['xp', 'assignments', 'quizzes', 'attendance', 'streak', 'custom'],
      required: true
    },
    value: Number,
    description: String
  },
  // Rewards
  xpReward: {
    type: Number,
    default: 0
  },
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Achievement Schema
const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Leaderboard Schema
const leaderboardSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['weekly', 'monthly', 'all-time', 'course'],
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  period: {
    start: Date,
    end: Date
  },
  rankings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    xp: Number,
    level: Number,
    rank: Number,
    badges: Number,
    assignments: Number,
    quizzes: Number
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Quest Schema
const questSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special'],
    required: true
  },
  category: {
    type: String,
    enum: ['learning', 'social', 'creative', 'challenge'],
    required: true
  },
  // Requirements
  requirements: [{
    action: {
      type: String,
      enum: ['complete_assignment', 'take_quiz', 'attend_class', 'post_message', 'earn_xp', 'level_up'],
      required: true
    },
    target: Number,
    description: String
  }],
  // Rewards
  rewards: {
    xp: { type: Number, default: 0 },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }
  },
  // Timing
  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  // Progress tracking
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: [{
      requirement: mongoose.Schema.Types.ObjectId,
      current: Number,
      completed: Boolean
    }],
    completedAt: Date,
    claimed: Boolean
  }]
}, {
  timestamps: true
});

// Reward Item Schema (for marketplace)
const rewardItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['badge', 'title', 'avatar', 'privilege', 'physical'],
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  icon: String,
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: -1 // -1 for unlimited
  },
  // Restrictions
  levelRequired: {
    type: Number,
    default: 1
  },
  // Redemptions
  redemptions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    redeemedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'fulfilled', 'cancelled'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

// User Gamification Stats
const userGamificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // XP and Level
  totalXP: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  xpToNextLevel: {
    type: Number,
    default: 100
  },
  // Activity Stats
  stats: {
    assignmentsCompleted: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    daysActive: { type: Number, default: 0 },
    messagesPosted: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 0 }
  },
  // Streaks
  streaks: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    assignment: { type: Number, default: 0 },
    quiz: { type: Number, default: 0 }
  },
  // Achievements
  badges: [{
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Recent Activity
  recentActivity: [{
    action: String,
    xp: Number,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Preferences
  preferences: {
    showXP: { type: Boolean, default: true },
    showBadges: { type: Boolean, default: true },
    showLeaderboard: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Indexes
badgeSchema.index({ category: 1 });
badgeSchema.index({ rarity: 1 });
achievementSchema.index({ user: 1, badge: 1 });
leaderboardSchema.index({ type: 1, course: 1 });
questSchema.index({ type: 1, isActive: 1 });
rewardItemSchema.index({ isAvailable: 1, cost: 1 });
userGamificationSchema.index({ user: 1 });
userGamificationSchema.index({ totalXP: -1 });

// Methods
userGamificationSchema.methods.addXP = function(amount, reason) {
  this.totalXP += amount;
  
  // Calculate new level
  const newLevel = Math.floor(Math.sqrt(this.totalXP / 100)) + 1;
  const leveledUp = newLevel > this.currentLevel;
  
  if (leveledUp) {
    this.currentLevel = newLevel;
    this.xpToNextLevel = Math.pow(newLevel, 2) * 100 - this.totalXP;
  } else {
    this.xpToNextLevel = Math.pow(this.currentLevel, 2) * 100 - this.totalXP;
  }
  
  // Add to recent activity
  this.recentActivity.unshift({
    action: 'xp_earned',
    xp: amount,
    description: reason || 'XP earned',
    timestamp: new Date()
  });
  
  // Keep only last 50 activities
  if (this.recentActivity.length > 50) {
    this.recentActivity = this.recentActivity.slice(0, 50);
  }
  
  return { leveledUp, newLevel, xpGained: amount };
};

userGamificationSchema.methods.updateStreak = function(type) {
  if (!this.streaks[type]) {
    this.streaks[type] = 0;
  }
  this.streaks[type] += 1;
};

userGamificationSchema.methods.resetStreak = function(type) {
  this.streaks[type] = 0;
};

module.exports = {
  Badge: mongoose.model('Badge', badgeSchema),
  Achievement: mongoose.model('Achievement', achievementSchema),
  Leaderboard: mongoose.model('Leaderboard', leaderboardSchema),
  Quest: mongoose.model('Quest', questSchema),
  RewardItem: mongoose.model('RewardItem', rewardItemSchema),
  UserGamification: mongoose.model('UserGamification', userGamificationSchema)
};
