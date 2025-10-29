const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
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
  // Assignment details
  type: {
    type: String,
    enum: ['essay', 'project', 'lab', 'presentation', 'other'],
    required: true
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 1
  },
  // Timing
  dueDate: {
    type: Date,
    required: true
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  lateSubmissionAllowed: {
    type: Boolean,
    default: true
  },
  latePenalty: {
    type: Number,
    default: 10, // percentage
    min: 0,
    max: 100
  },
  // Submission requirements
  submissionType: {
    type: String,
    enum: ['file', 'text', 'both'],
    default: 'both'
  },
  allowedFileTypes: [String],
  maxFileSize: {
    type: Number, // in MB
    default: 10
  },
  maxSubmissions: {
    type: Number,
    default: 3
  },
  // Instructions and resources
  instructions: {
    type: String,
    required: true
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['document', 'video', 'link', 'other']
    }
  }],
  rubric: [{
    criterion: String,
    description: String,
    points: Number,
    levels: [{
      level: String,
      description: String,
      points: Number
    }]
  }],
  // Grading
  gradingMethod: {
    type: String,
    enum: ['manual', 'auto', 'peer'],
    default: 'manual'
  },
  // Submissions
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    files: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    submittedAt: {
      type: Date,
      default: Date.now
    },
    isLate: {
      type: Boolean,
      default: false
    },
    grade: {
      points: Number,
      feedback: String,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      gradedAt: Date
    },
    attempt: {
      type: Number,
      default: 1
    }
  }],
  // Statistics
  statistics: {
    totalSubmissions: { type: Number, default: 0 },
    gradedSubmissions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    onTimeSubmissions: { type: Number, default: 0 },
    lateSubmissions: { type: Number, default: 0 }
  },
  // Gamification
  xpReward: {
    type: Number,
    default: 50
  },
  bonusXP: {
    type: Number,
    default: 25
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

// Indexes
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

// Virtual for submission count
assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions.length;
});

// Virtual for grading progress
assignmentSchema.virtual('gradingProgress').get(function() {
  if (this.submissions.length === 0) return 0;
  return (this.statistics.gradedSubmissions / this.submissions.length) * 100;
});

// Method to get student submission
assignmentSchema.methods.getStudentSubmission = function(studentId) {
  return this.submissions.find(
    s => s.student.toString() === studentId.toString()
  );
};

// Method to add submission
assignmentSchema.methods.addSubmission = function(studentId, submissionData) {
  const existingSubmission = this.getStudentSubmission(studentId);
  
  if (existingSubmission) {
    // Update existing submission
    existingSubmission.content = submissionData.content;
    existingSubmission.files = submissionData.files || [];
    existingSubmission.submittedAt = new Date();
    existingSubmission.isLate = new Date() > this.dueDate;
    existingSubmission.attempt += 1;
  } else {
    // Create new submission
    this.submissions.push({
      student: studentId,
      content: submissionData.content,
      files: submissionData.files || [],
      submittedAt: new Date(),
      isLate: new Date() > this.dueDate,
      attempt: 1
    });
  }
  
  // Update statistics
  this.statistics.totalSubmissions = this.submissions.length;
  this.statistics.onTimeSubmissions = this.submissions.filter(s => !s.isLate).length;
  this.statistics.lateSubmissions = this.submissions.filter(s => s.isLate).length;
  
  return this.save();
};

// Method to grade submission
assignmentSchema.methods.gradeSubmission = function(studentId, gradeData) {
  const submission = this.getStudentSubmission(studentId);
  
  if (!submission) {
    throw new Error('Submission not found');
  }
  
  submission.grade = {
    points: gradeData.points,
    feedback: gradeData.feedback,
    gradedBy: gradeData.gradedBy,
    gradedAt: new Date()
  };
  
  // Update statistics
  this.statistics.gradedSubmissions += 1;
  const gradedSubmissions = this.submissions.filter(s => s.grade);
  this.statistics.averageScore = gradedSubmissions.reduce(
    (sum, s) => sum + s.grade.points, 0
  ) / gradedSubmissions.length;
  
  return this.save();
};

module.exports = mongoose.model('Assignment', assignmentSchema);
