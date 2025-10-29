const express = require('express');
const { Attendance, AttendanceSession, AttendanceSummary } = require('../models/Attendance');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken, requireTeacher, requireCourseAccess } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/attendance/sessions
// @desc    Get attendance sessions
// @access  Private
router.get('/sessions', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { courseId, status, type } = req.query;

    let query = {};

    if (courseId) {
      query.course = courseId;
    }
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      const enrolledCourses = await Course.find({
        'enrolledStudents.student': req.user._id,
        'enrolledStudents.status': 'active'
      }).select('_id');
      
      query.course = { $in: enrolledCourses.map(c => c._id) };
    } else if (req.user.role === 'teacher') {
      const myCourses = await Course.find({ instructor: req.user._id }).select('_id');
      query.course = { $in: myCourses.map(c => c._id) };
    }

    const sessions = await AttendanceSession.find(query)
      .populate('course', 'title code instructor')
      .populate('instructor', 'firstName lastName email avatar')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AttendanceSession.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get attendance sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/sessions/:id
// @desc    Get attendance session by ID
// @access  Private
router.get('/sessions/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id)
      .populate('course', 'title code instructor')
      .populate('instructor', 'firstName lastName email avatar')
      .populate('attendance.student', 'firstName lastName email avatar studentId');

    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found' });
    }

    // Check course access
    const course = await Course.findById(session.course._id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'student' && !course.isStudentEnrolled(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get attendance session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/sessions
// @desc    Create attendance session
// @access  Private (Teacher/Admin)
router.post('/sessions', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { courseId, title, date, startTime, endTime, type, location } = req.body;

    if (!courseId || !title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is instructor of this course
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sessionData = {
      course: courseId,
      instructor: req.user._id,
      title,
      date: new Date(date),
      startTime: new Date(`${date}T${startTime}`),
      endTime: new Date(`${date}T${endTime}`),
      type: type || 'lecture',
      location: location || {},
      status: 'active' // Set to active so attendance can be marked immediately
    };

    const session = new AttendanceSession(sessionData);
    await session.save();

    const populatedSession = await AttendanceSession.findById(session._id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar');

    // Emit socket event to notify enrolled students
    const io = req.app.get('io');
    if (io) {
      // Notify all students enrolled in this course
      course.students.forEach(studentId => {
        io.to(`user-${studentId}`).emit('new-attendance-session', {
          session: populatedSession,
          message: `New attendance session created for ${course.title}`
        });
      });
      
      // Also broadcast to course room
      io.to(`course-${courseId}`).emit('new-attendance-session', {
        session: populatedSession,
        message: `New attendance session created`
      });
    }

    res.status(201).json({
      message: 'Attendance session created successfully',
      session: populatedSession
    });
  } catch (error) {
    console.error('Create attendance session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/sessions/:id/mark
// @desc    Mark attendance
// @access  Private
router.post('/sessions/:id/mark', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const { studentId, status, method, notes } = req.body;

    if (!studentId || !status) {
      console.log('Missing required fields:', { studentId, status });
      return res.status(400).json({ message: 'Student ID and status are required' });
    }

    const session = await AttendanceSession.findById(req.params.id);
    if (!session) {
      console.log('Session not found:', req.params.id);
      return res.status(404).json({ message: 'Attendance session not found' });
    }

    // Check permissions
    const course = await Course.findById(session.course);
    if (req.user.role === 'student') {
      // Students can only mark their own attendance
      if (req.user._id.toString() !== studentId) {
        console.log('Student trying to mark other student attendance');
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'teacher') {
      // Teachers can mark attendance for their courses
      if (course.instructor.toString() !== req.user._id.toString()) {
        console.log('Teacher not instructor of course');
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role !== 'admin') {
      console.log('Invalid role:', req.user.role);
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if session is active (allow both active and scheduled)
    if (session.status !== 'active' && session.status !== 'scheduled') {
      console.log('Session status not active/scheduled:', session.status);
      return res.status(400).json({ message: 'Session is not active. Status: ' + session.status });
    }

    await session.markAttendance(studentId, status, method || 'manual', notes || '');

    const updatedSession = await AttendanceSession.findById(req.params.id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar')
      .populate('attendance.student', 'firstName lastName email avatar studentId');

    res.json({
      message: 'Attendance marked successfully',
      session: updatedSession
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/attendance/sessions/:id/qr-code
// @desc    Generate QR code for attendance
// @access  Private (Teacher/Admin)
router.post('/sessions/:id/qr-code', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const session = await AttendanceSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found' });
    }

    // Check permissions
    const course = await Course.findById(session.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const qrCode = session.generateQRCode();
    await session.save();

    res.json({
      message: 'QR code generated successfully',
      qrCode,
      expiresAt: session.qrCode.expiresAt
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance/sessions/:id/verify-qr
// @desc    Verify QR code and mark attendance
// @access  Private (Student)
router.post('/sessions/:id/verify-qr', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can use QR code attendance' });
    }

    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ message: 'QR code is required' });
    }

    const session = await AttendanceSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: 'Attendance session not found' });
    }

    // Verify QR code
    if (!session.verifyQRCode(qrCode)) {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    // Check if student is enrolled in course
    const course = await Course.findById(session.course);
    if (!course || !course.isStudentEnrolled(req.user._id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Mark attendance
    await session.markAttendance(req.user._id, 'present', 'qr_code');

    res.json({ message: 'Attendance marked successfully via QR code' });
  } catch (error) {
    console.error('Verify QR code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/my/records
// @desc    Get user's attendance records
// @access  Private
router.get('/my/records', authenticateToken, async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    let query = {};

    if (req.user.role === 'student') {
      query['attendance.student'] = req.user._id;
    } else if (req.user.role === 'teacher') {
      query.instructor = req.user._id;
    } else if (req.user.role === 'parent') {
      // Get children's attendance
      const children = await User.find({ parentId: req.user._id });
      const childIds = children.map(child => child._id);
      query['attendance.student'] = { $in: childIds };
    }

    if (courseId) {
      query.course = courseId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await AttendanceSession.find(query)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar')
      .populate('attendance.student', 'firstName lastName email avatar studentId')
      .sort({ date: -1 });

    // Filter attendance records for the user
    const attendanceRecords = sessions.map(session => {
      let userAttendance = null;
      
      if (req.user.role === 'student') {
        userAttendance = session.attendance.find(
          a => a.student._id.toString() === req.user._id.toString()
        );
      } else if (req.user.role === 'parent') {
        const children = session.attendance.filter(a => 
          req.user.children?.some(child => child._id.toString() === a.student._id.toString())
        );
        userAttendance = children;
      }

      return {
        session: {
          id: session._id,
          title: session.title,
          course: session.course,
          instructor: session.instructor,
          date: session.date,
          startTime: session.startTime,
          endTime: session.endTime,
          type: session.type,
          location: session.location
        },
        attendance: userAttendance
      };
    });

    res.json({ attendanceRecords });
  } catch (error) {
    console.error('Get attendance records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get attendance summary
// @access  Private
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { courseId, period = 'monthly' } = req.query;

    let matchQuery = {};

    if (req.user.role === 'student') {
      matchQuery.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      // Get summary for teacher's courses
      const myCourses = await Course.find({ instructor: req.user._id }).select('_id');
      matchQuery.course = { $in: myCourses.map(c => c._id) };
    }

    if (courseId) {
      matchQuery.course = courseId;
    }

    // Set period
    const now = new Date();
    let periodStart, periodEnd;

    switch (period) {
      case 'weekly':
        periodStart = new Date(now.setDate(now.getDate() - 7));
        periodEnd = new Date();
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'semester':
        periodStart = new Date(now.getFullYear(), 0, 1);
        periodEnd = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    matchQuery['period.start'] = { $gte: periodStart };
    matchQuery['period.end'] = { $lte: periodEnd };

    const summaries = await AttendanceSummary.find(matchQuery)
      .populate('student', 'firstName lastName email avatar studentId')
      .populate('course', 'title code')
      .sort({ attendanceRate: -1 });

    res.json({ summaries, period, periodStart, periodEnd });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
