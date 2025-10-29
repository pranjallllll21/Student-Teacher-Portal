const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Course details
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  duration: {
    type: Number, // in weeks
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  // Media
  thumbnail: {
    type: String,
    default: ''
  },
  syllabus: {
    type: String
  },
  // Schedule
  schedule: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    time: {
      start: String, // HH:MM format
      end: String    // HH:MM format
    },
    room: String
  },
  // Enrollment
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'dropped', 'completed'],
      default: 'active'
    }
  }],
  maxStudents: {
    type: Number,
    default: 50
  },
  // Course content
  modules: [{
    title: String,
    description: String,
    order: Number,
    lessons: [{
      title: String,
      content: String,
      type: {
        type: String,
        enum: ['video', 'text', 'quiz', 'assignment'],
        default: 'text'
      },
      duration: Number, // in minutes
      order: Number
    }]
  }],
  // Grading
  gradingPolicy: {
    assignments: { type: Number, default: 40 },
    quizzes: { type: Number, default: 30 },
    attendance: { type: Number, default: 10 },
    finalExam: { type: Number, default: 20 }
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Gamification
  xpRewards: {
    enrollment: { type: Number, default: 50 },
    completion: { type: Number, default: 200 },
    perfectScore: { type: Number, default: 100 }
  }
}, {
  timestamps: true
});

// Indexes
courseSchema.index({ code: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ 'enrolledStudents.student': 1 });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.filter(s => s.status === 'active').length;
});

// Virtual for is full
courseSchema.virtual('isFull').get(function() {
  return this.enrollmentCount >= this.maxStudents;
});

// Method to check if student is enrolled
courseSchema.methods.isStudentEnrolled = function(studentId) {
  return this.enrolledStudents.some(
    enrollment => enrollment.student.toString() === studentId.toString() && 
    enrollment.status === 'active'
  );
};

// Method to enroll student
courseSchema.methods.enrollStudent = function(studentId) {
  if (this.isStudentEnrolled(studentId)) {
    throw new Error('Student is already enrolled');
  }
  if (this.isFull) {
    throw new Error('Course is full');
  }
  
  this.enrolledStudents.push({
    student: studentId,
    enrolledAt: new Date(),
    status: 'active'
  });
  
  return this.save();
};

// Method to drop student
courseSchema.methods.dropStudent = function(studentId) {
  const enrollment = this.enrolledStudents.find(
    e => e.student.toString() === studentId.toString()
  );
  
  if (enrollment) {
    enrollment.status = 'dropped';
    return this.save();
  }
  
  throw new Error('Student not found in course');
};

module.exports = mongoose.model('Course', courseSchema);
