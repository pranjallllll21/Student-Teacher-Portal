const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedOption: Number
  }],
  score: {
    type: Number,
    required: true
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentageScore: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster leaderboard queries
quizSubmissionSchema.index({ student: 1, score: -1 });
quizSubmissionSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);