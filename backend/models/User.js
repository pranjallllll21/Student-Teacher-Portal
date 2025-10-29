const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
      enum: ['student', 'teacher', 'admin', 'parent'],
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  // Student specific fields
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  grade: {
    type: String
  },
  // Teacher specific fields
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  department: {
    type: String
  },
  specialization: [String],
  // Gamification
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    language: {
      type: String,
      default: 'en'
    }
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ employeeId: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate level based on XP
userSchema.methods.calculateLevel = function() {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(this.xp / 100)) + 1;
};

// Add XP and update level
userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  const newLevel = this.calculateLevel();
  if (newLevel > this.level) {
    this.level = newLevel;
    return { levelUp: true, newLevel, xpGained: amount };
  }
  return { levelUp: false, xpGained: amount };
};

// To JSON transformation
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
