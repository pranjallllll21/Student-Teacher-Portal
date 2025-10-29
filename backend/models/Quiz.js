const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }],
  correctOption: {
    type: Number,
    required: true,
    min: 0
  },
  points: {
    type: Number,
    default: 1,
    min: 0
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Quiz settings
  type: {
    type: String,
    enum: ['practice', 'graded', 'survey'],
    required: true
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 1
  },
  // Questions
  questions: [quizQuestionSchema],
  // Timing
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: {
    type: Date,
    required: true
  },
  // Attempts
  maxAttempts: {
    type: Number,
    default: 1
  },
  // Questions
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
      required: true
    },
    points: {
      type: Number,
      required: true,
      min: 1
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String, // for short-answer and essay
    explanation: String,
    order: Number
  }],
  // Settings
  settings: {
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    showExplanations: { type: Boolean, default: true },
    allowReview: { type: Boolean, default: true },
    oneQuestionAtATime: { type: Boolean, default: false }
  },
  // Attempts tracking
  attempts: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      answer: mongoose.Schema.Types.Mixed,
      isCorrect: Boolean,
      points: Number
    }],
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: Date,
    timeSpent: Number, // in minutes
    score: Number,
    percentage: Number,
    attempt: Number
  }],
  // Statistics
  statistics: {
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  // Gamification
  xpReward: {
    type: Number,
    default: 30
  },
  bonusXP: {
    type: Number,
    default: 20
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  }
}, {
  timestamps: true,
  versionKey: false  // Disable versioning to prevent VersionError on concurrent saves
});

// Indexes
quizSchema.index({ course: 1 });
quizSchema.index({ instructor: 1 });
quizSchema.index({ availableUntil: 1 });
quizSchema.index({ status: 1 });
quizSchema.index({ 'attempts.student': 1 });

// Virtual for total questions
quizSchema.virtual('totalQuestions').get(function() {
  return this.questions.length;
});

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

// Method to get student attempt
quizSchema.methods.getStudentAttempt = function(studentId) {
  return this.attempts.find(
    a => a.student.toString() === studentId.toString()
  );
};

// Method to start attempt
quizSchema.methods.startAttempt = function(studentId) {
  const existingAttempt = this.getStudentAttempt(studentId);

  // If there is an active (not yet submitted) attempt, do nothing.
  if (existingAttempt && !existingAttempt.submittedAt) {
    return this.save();
  }

  if (existingAttempt && existingAttempt.submittedAt) {
    // Check if student can make another attempt
    const studentAttempts = this.attempts.filter(
      a => a.student.toString() === studentId.toString()
    );
    if (studentAttempts.length >= this.maxAttempts) {
      throw new Error('Maximum attempts reached');
    }
  }

  const attempt = {
    student: studentId,
    answers: [],
    startedAt: new Date(),
    attempt: this.attempts.filter(a => a.student.toString() === studentId.toString()).length + 1
  };

  this.attempts.push(attempt);
  return this.save();
};

// Method to submit answer
quizSchema.methods.submitAnswer = function(studentId, questionId, answer) {
  const attempt = this.attempts.find(
    a => a.student.toString() === studentId.toString() && !a.submittedAt
  );
  
  if (!attempt) {
    throw new Error('No active attempt found');
  }
  
  const question = this.questions.id(questionId);
  if (!question) {
    throw new Error('Question not found');
  }
  
  let isCorrect = false;
  let points = 0;
  
  // Check answer based on question type
  switch (question.type) {
    case 'multiple-choice': {
      // Options may be strings or objects with { text, isCorrect }
      const selectedOption = question.options.find(opt => {
        if (typeof opt === 'string') return opt === answer;
        if (opt && typeof opt === 'object') return opt.text === answer;
        return false;
      });
      isCorrect = selectedOption ? (typeof selectedOption === 'string' ? false : !!selectedOption.isCorrect) : false;
      break;
    }
    case 'true-false': {
      // Prefer correctAnswer if present; otherwise infer from options' isCorrect flag
      if (typeof question.correctAnswer === 'string') {
        isCorrect = answer === question.correctAnswer;
      } else {
        const opt = question.options.find(o => {
          if (typeof o === 'string') return o === answer;
          if (o && typeof o === 'object') return o.text === answer;
          return false;
        });
        isCorrect = opt ? (typeof opt === 'string' ? false : !!opt.isCorrect) : false;
      }
      break;
    }
    case 'short-answer':
      isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      break;
    case 'essay':
      // For essay questions, always give full points (manual grading required)
      isCorrect = true;
      break;
  }
  
  points = isCorrect ? question.points : 0;
  
  // Update or add answer
  const existingAnswer = attempt.answers.find(a => a.questionId.toString() === questionId.toString());
  if (existingAnswer) {
    existingAnswer.answer = answer;
    existingAnswer.isCorrect = isCorrect;
    existingAnswer.points = points;
  } else {
    attempt.answers.push({
      questionId,
      answer,
      isCorrect,
      points
    });
  }
  
  return this.save();
};

// Method to submit attempt
quizSchema.methods.submitAttempt = function(studentId) {
  const attempt = this.attempts.find(
    a => a.student.toString() === studentId.toString() && !a.submittedAt
  );
  
  if (!attempt) {
    throw new Error('No active attempt found');
  }
  
  attempt.submittedAt = new Date();
  attempt.timeSpent = Math.round((attempt.submittedAt - attempt.startedAt) / (1000 * 60));
  attempt.score = attempt.answers.reduce((sum, a) => sum + a.points, 0);
  const totalPoints = this.totalPoints || this.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  attempt.percentage = totalPoints > 0 ? Math.round((attempt.score / totalPoints) * 100) : 0;
  
  // Update statistics
  this.statistics.totalAttempts += 1;
  const completedAttempts = this.attempts.filter(a => a.submittedAt);
  this.statistics.averageScore = completedAttempts.reduce(
    (sum, a) => sum + a.score, 0
  ) / completedAttempts.length;
  this.statistics.averageTime = completedAttempts.reduce(
    (sum, a) => sum + a.timeSpent, 0
  ) / completedAttempts.length;
  
  return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema);
