const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  // Attendance status
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'excused'],
    required: true
  },
  // Time tracking
  checkInTime: Date,
  checkOutTime: Date,
  duration: Number, // in minutes
  // Method of attendance
  method: {
    type: String,
    enum: ['manual', 'qr_code', 'facial_recognition', 'gps', 'auto'],
    default: 'manual'
  },
  // Location (for GPS-based attendance)
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    accuracy: Number
  },
  // Notes
  notes: String,
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Attendance Session Schema (for class sessions)
const attendanceSessionSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  // Session details
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'exam', 'other'],
    default: 'lecture'
  },
  location: {
    room: String,
    building: String,
    online: Boolean,
    meetingLink: String
  },
  // Attendance tracking
  attendanceMethod: {
    type: String,
    enum: ['manual', 'qr_code', 'facial_recognition', 'gps', 'auto'],
    default: 'manual'
  },
  qrCode: {
    code: String,
    expiresAt: Date
  },
  // Attendance records
  attendance: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'absent'
    },
    checkInTime: Date,
    checkOutTime: Date,
    method: String,
    notes: String
  }],
  // Statistics
  statistics: {
    totalStudents: { type: Number, default: 0 },
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 },
    late: { type: Number, default: 0 },
    excused: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 0 }
  },
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Attendance Summary Schema (for reporting)
const attendanceSummarySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  period: {
    start: Date,
    end: Date,
    type: {
      type: String,
      enum: ['weekly', 'monthly', 'semester'],
      required: true
    }
  },
  // Summary statistics
  totalSessions: { type: Number, default: 0 },
  present: { type: Number, default: 0 },
  absent: { type: Number, default: 0 },
  late: { type: Number, default: 0 },
  excused: { type: Number, default: 0 },
  attendanceRate: { type: Number, default: 0 },
  // Streaks
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  // Warnings
  warnings: [{
    type: {
      type: String,
      enum: ['low_attendance', 'excessive_absences', 'pattern_concern']
    },
    message: String,
    issuedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
attendanceSchema.index({ course: 1, student: 1, date: 1 });
attendanceSchema.index({ student: 1, date: -1 });
attendanceSchema.index({ course: 1, date: -1 });
attendanceSchema.index({ status: 1 });

attendanceSessionSchema.index({ course: 1, date: 1 });
attendanceSessionSchema.index({ instructor: 1 });
attendanceSessionSchema.index({ status: 1 });
attendanceSessionSchema.index({ 'attendance.student': 1 });

attendanceSummarySchema.index({ student: 1, course: 1 });
attendanceSummarySchema.index({ 'period.type': 1, 'period.start': -1 });

// Methods for Attendance Session
attendanceSessionSchema.methods.markAttendance = function(studentId, status, method = 'manual', notes = '') {
  const existingRecord = this.attendance.find(
    record => record.student.toString() === studentId.toString()
  );
  
  if (existingRecord) {
    existingRecord.status = status;
    existingRecord.checkInTime = status === 'present' || status === 'late' ? new Date() : null;
    existingRecord.method = method;
    existingRecord.notes = notes;
  } else {
    this.attendance.push({
      student: studentId,
      status: status,
      checkInTime: status === 'present' || status === 'late' ? new Date() : null,
      method: method,
      notes: notes
    });
  }
  
  this.updateStatistics();
  return this.save();
};

attendanceSessionSchema.methods.updateStatistics = function() {
  this.statistics.totalStudents = this.attendance.length;
  this.statistics.present = this.attendance.filter(a => a.status === 'present').length;
  this.statistics.absent = this.attendance.filter(a => a.status === 'absent').length;
  this.statistics.late = this.attendance.filter(a => a.status === 'late').length;
  this.statistics.excused = this.attendance.filter(a => a.status === 'excused').length;
  
  const totalExpected = this.statistics.totalStudents;
  if (totalExpected > 0) {
    this.statistics.attendanceRate = Math.round(
      ((this.statistics.present + this.statistics.late) / totalExpected) * 100
    );
  }
};

attendanceSessionSchema.methods.generateQRCode = function() {
  const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.qrCode = {
    code: code,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  };
  return code;
};

attendanceSessionSchema.methods.verifyQRCode = function(code) {
  if (!this.qrCode || this.qrCode.code !== code) {
    return false;
  }
  if (new Date() > this.qrCode.expiresAt) {
    return false;
  }
  return true;
};

module.exports = {
  Attendance: mongoose.model('Attendance', attendanceSchema),
  AttendanceSession: mongoose.model('AttendanceSession', attendanceSessionSchema),
  AttendanceSummary: mongoose.model('AttendanceSummary', attendanceSummarySchema)
};
