const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'file'],
    required: true
  },
  fileUrl: {
    type: String,
    required: function() {
      return this.type === 'file';
    }
  },
  points: {
    type: Number,
    default: null,
    min: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedAt: {
    type: Date,
    default: null
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'late'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

// Index for efficient queries
submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ student: 1, submittedAt: -1 });
submissionSchema.index({ assignment: 1, submittedAt: -1 });

// Virtual for grade percentage
submissionSchema.virtual('gradePercentage').get(function() {
  if (!this.points || !this.assignment) return null;
  return Math.round((this.points / this.assignment.maxPoints) * 100);
});

// Pre-save middleware to set status
submissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Check if submission is late
    const assignment = await mongoose.model('Assignment').findById(this.assignment);
    if (assignment && new Date() > assignment.dueDate) {
      this.status = 'late';
    }
  }
  next();
});

// Method to check if submission is late
submissionSchema.methods.isLate = function() {
  return this.status === 'late';
};

// Method to check if submission is graded
submissionSchema.methods.isGraded = function() {
  return this.points !== null && this.points !== undefined;
};

module.exports = mongoose.model('Submission', submissionSchema);
