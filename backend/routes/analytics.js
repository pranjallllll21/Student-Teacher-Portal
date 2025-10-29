const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/analytics/overview
// @desc    Get analytics overview
// @access  Private
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    let overview = {};

    if (req.user.role === 'admin') {
      // Admin overview
      overview = await getAdminOverview();
    } else if (req.user.role === 'teacher') {
      // Teacher overview
      overview = await getTeacherOverview(req.user._id);
    } else if (req.user.role === 'student') {
      // Student overview
      overview = await getStudentOverview(req.user._id);
    } else if (req.user.role === 'parent') {
      // Parent overview
      overview = await getParentOverview(req.user._id);
    }

    res.json({ overview });
  } catch (error) {
    console.error('Get analytics overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/performance
// @desc    Get performance analytics
// @access  Private
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const { courseId, period = 'monthly' } = req.query;

    let performance = {};

    if (req.user.role === 'student') {
      performance = await getStudentPerformance(req.user._id, courseId, period);
    } else if (req.user.role === 'teacher') {
      performance = await getTeacherPerformance(req.user._id, courseId, period);
    } else if (req.user.role === 'admin') {
      performance = await getAdminPerformance(courseId, period);
    }

    res.json({ performance });
  } catch (error) {
    console.error('Get performance analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/engagement
// @desc    Get engagement analytics
// @access  Private
router.get('/engagement', authenticateToken, async (req, res) => {
  try {
    const { courseId, period = 'monthly' } = req.query;

    let engagement = {};

    if (req.user.role === 'teacher') {
      engagement = await getTeacherEngagement(req.user._id, courseId, period);
    } else if (req.user.role === 'admin') {
      engagement = await getAdminEngagement(courseId, period);
    }

    res.json({ engagement });
  } catch (error) {
    console.error('Get engagement analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/course/:courseId
// @desc    Get course-specific analytics
// @access  Private
router.get('/course/:courseId', authenticateToken, validateObjectId('courseId'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { period = 'monthly' } = req.query;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check access
    if (req.user.role === 'student' && !course.isStudentEnrolled(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const analytics = await getCourseAnalytics(courseId, period);

    res.json({ analytics });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
async function getAdminOverview() {
  const [
    totalUsers,
    totalCourses,
    totalAssignments,
    totalQuizzes,
    userStats,
    courseStats
  ] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Assignment.countDocuments(),
    Quiz.countDocuments(),
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
          averageXP: { $avg: '$xp' }
        }
      }
    ]),
    Course.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageEnrollment: { $avg: { $size: '$enrolledStudents' } }
        }
      }
    ])
  ]);

  return {
    totalUsers,
    totalCourses,
    totalAssignments,
    totalQuizzes,
    userStats,
    courseStats
  };
}

async function getTeacherOverview(teacherId) {
  const [
    myCourses,
    totalStudents,
    totalAssignments,
    totalQuizzes,
    recentActivity
  ] = await Promise.all([
    Course.find({ instructor: teacherId }).countDocuments(),
    Course.aggregate([
      { $match: { instructor: teacherId } },
      { $unwind: '$enrolledStudents' },
      { $match: { 'enrolledStudents.status': 'active' } },
      { $count: 'total' }
    ]),
    Assignment.find({ instructor: teacherId }).countDocuments(),
    Quiz.find({ instructor: teacherId }).countDocuments(),
    getRecentActivity(teacherId, 'teacher')
  ]);

  return {
    myCourses,
    totalStudents: totalStudents[0]?.total || 0,
    totalAssignments,
    totalQuizzes,
    recentActivity
  };
}

async function getStudentOverview(studentId) {
  const [
    enrolledCourses,
    completedAssignments,
    completedQuizzes,
    totalXP,
    level,
    recentActivity
  ] = await Promise.all([
    Course.find({
      'enrolledStudents.student': studentId,
      'enrolledStudents.status': 'active'
    }).countDocuments(),
    Assignment.find({
      'submissions.student': studentId,
      'submissions.grade': { $exists: true }
    }).countDocuments(),
    Quiz.find({
      'attempts.student': studentId,
      'attempts.submittedAt': { $exists: true }
    }).countDocuments(),
    User.findById(studentId).select('xp level'),
    getRecentActivity(studentId, 'student')
  ]);

  return {
    enrolledCourses,
    completedAssignments,
    completedQuizzes,
    totalXP: totalXP?.xp || 0,
    level: totalXP?.level || 1,
    recentActivity
  };
}

async function getParentOverview(parentId) {
  const children = await User.find({ parentId }).select('_id');
  const childIds = children.map(child => child._id);

  const [
    childrenCount,
    enrolledCourses,
    averagePerformance
  ] = await Promise.all([
    children.length,
    Course.find({
      'enrolledStudents.student': { $in: childIds },
      'enrolledStudents.status': 'active'
    }).countDocuments(),
    getChildrenAveragePerformance(childIds)
  ]);

  return {
    childrenCount,
    enrolledCourses,
    averagePerformance
  };
}

async function getStudentPerformance(studentId, courseId, period) {
  const matchQuery = { 'submissions.student': studentId };
  if (courseId) {
    matchQuery.course = courseId;
  }

  const [assignments, quizzes] = await Promise.all([
    Assignment.aggregate([
      { $match: matchQuery },
      { $unwind: '$submissions' },
      { $match: { 'submissions.student': studentId, 'submissions.grade': { $exists: true } } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$submissions.grade.points' },
          totalSubmissions: { $sum: 1 },
          perfectScores: { $sum: { $cond: [{ $eq: ['$submissions.grade.points', '$maxPoints'] }, 1, 0] } }
        }
      }
    ]),
    Quiz.aggregate([
      { $match: { 'attempts.student': studentId, 'attempts.submittedAt': { $exists: true } } },
      { $unwind: '$attempts' },
      { $match: { 'attempts.student': studentId } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$attempts.score' },
          totalAttempts: { $sum: 1 },
          averagePercentage: { $avg: '$attempts.percentage' }
        }
      }
    ])
  ]);

  return {
    assignments: assignments[0] || { averageScore: 0, totalSubmissions: 0, perfectScores: 0 },
    quizzes: quizzes[0] || { averageScore: 0, totalAttempts: 0, averagePercentage: 0 }
  };
}

async function getTeacherPerformance(teacherId, courseId, period) {
  const matchQuery = { instructor: teacherId };
  if (courseId) {
    matchQuery.course = courseId;
  }

  const [assignments, quizzes, students] = await Promise.all([
    Assignment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          totalSubmissions: { $sum: '$statistics.totalSubmissions' },
          gradedSubmissions: { $sum: '$statistics.gradedSubmissions' },
          averageScore: { $avg: '$statistics.averageScore' }
        }
      }
    ]),
    Quiz.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalAttempts: { $sum: '$statistics.totalAttempts' },
          averageScore: { $avg: '$statistics.averageScore' },
          completionRate: { $avg: '$statistics.completionRate' }
        }
      }
    ]),
    Course.aggregate([
      { $match: { instructor: teacherId } },
      { $unwind: '$enrolledStudents' },
      { $match: { 'enrolledStudents.status': 'active' } },
      { $count: 'total' }
    ])
  ]);

  return {
    assignments: assignments[0] || { totalAssignments: 0, totalSubmissions: 0, gradedSubmissions: 0, averageScore: 0 },
    quizzes: quizzes[0] || { totalQuizzes: 0, totalAttempts: 0, averageScore: 0, completionRate: 0 },
    totalStudents: students[0]?.total || 0
  };
}

async function getAdminPerformance(courseId, period) {
  const matchQuery = {};
  if (courseId) {
    matchQuery.course = courseId;
  }

  const [assignments, quizzes, users] = await Promise.all([
    Assignment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          totalSubmissions: { $sum: '$statistics.totalSubmissions' },
          averageScore: { $avg: '$statistics.averageScore' }
        }
      }
    ]),
    Quiz.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalAttempts: { $sum: '$statistics.totalAttempts' },
          averageScore: { $avg: '$statistics.averageScore' }
        }
      }
    ]),
    User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          averageXP: { $avg: '$xp' },
          averageLevel: { $avg: '$level' }
        }
      }
    ])
  ]);

  return {
    assignments: assignments[0] || { totalAssignments: 0, totalSubmissions: 0, averageScore: 0 },
    quizzes: quizzes[0] || { totalQuizzes: 0, totalAttempts: 0, averageScore: 0 },
    users: users[0] || { totalStudents: 0, averageXP: 0, averageLevel: 0 }
  };
}

async function getTeacherEngagement(teacherId, courseId, period) {
  // Implementation for teacher engagement analytics
  return {
    courseEngagement: [],
    studentParticipation: [],
    assignmentCompletion: []
  };
}

async function getAdminEngagement(courseId, period) {
  // Implementation for admin engagement analytics
  return {
    platformEngagement: [],
    courseEngagement: [],
    userActivity: []
  };
}

async function getCourseAnalytics(courseId, period) {
  const [
    enrollmentStats,
    assignmentStats,
    quizStats,
    attendanceStats
  ] = await Promise.all([
    Course.findById(courseId).select('enrolledStudents'),
    Assignment.aggregate([
      { $match: { course: courseId } },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          totalSubmissions: { $sum: '$statistics.totalSubmissions' },
          averageScore: { $avg: '$statistics.averageScore' }
        }
      }
    ]),
    Quiz.aggregate([
      { $match: { course: courseId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          totalAttempts: { $sum: '$statistics.totalAttempts' },
          averageScore: { $avg: '$statistics.averageScore' }
        }
      }
    ]),
    { totalSessions: 0, averageAttendance: 0 } // Placeholder for attendance stats
  ]);

  return {
    enrollment: {
      totalStudents: enrollmentStats?.enrolledStudents?.length || 0,
      activeStudents: enrollmentStats?.enrolledStudents?.filter(s => s.status === 'active').length || 0
    },
    assignments: assignmentStats[0] || { totalAssignments: 0, totalSubmissions: 0, averageScore: 0 },
    quizzes: quizStats[0] || { totalQuizzes: 0, totalAttempts: 0, averageScore: 0 },
    attendance: attendanceStats
  };
}

async function getRecentActivity(userId, userType) {
  // Implementation for recent activity tracking
  return [];
}

async function getChildrenAveragePerformance(childIds) {
  // Implementation for children's average performance
  return { averageScore: 0, totalAssignments: 0, totalQuizzes: 0 };
}

module.exports = router;
