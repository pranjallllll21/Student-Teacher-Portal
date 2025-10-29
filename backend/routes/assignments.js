const express = require('express');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const User = require('../models/User');
const { UserGamification } = require('../models/Gamification');
const path = require('path');
const { authenticateToken, requireTeacher, requireCourseAccess } = require('../middleware/auth');
const { validateAssignment, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/assignments
// @desc    Get assignments
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { courseId, status, type } = req.query;

    let query = {};

    // Filter by course
    if (courseId) {
      query.course = courseId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      // Students can only see assignments from courses they're enrolled in
      const enrolledCourses = await Course.find({
        'enrolledStudents.student': req.user._id,
        'enrolledStudents.status': 'active'
      }).select('_id');
      
      query.course = { $in: enrolledCourses.map(c => c._id) };
    } else if (req.user.role === 'teacher') {
      // Teachers can see assignments from their courses
      const myCourses = await Course.find({ instructor: req.user._id }).select('_id');
      query.course = { $in: myCourses.map(c => c._id) };
    } else if (req.user.role === 'parent') {
      // Parents can see assignments from their children's courses
      const children = await User.find({ parentId: req.user._id });
      const childIds = children.map(child => child._id);
      
      const enrolledCourses = await Course.find({
        'enrolledStudents.student': { $in: childIds },
        'enrolledStudents.status': 'active'
      }).select('_id');
      
      query.course = { $in: enrolledCourses.map(c => c._id) };
    }

    const assignments = await Assignment.find(query)
      .populate('course', 'title code instructor')
      .populate('instructor', 'firstName lastName email avatar')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Assignment.countDocuments(query);

    res.json({
      assignments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code instructor')
      .populate('instructor', 'firstName lastName email avatar')
      .populate('submissions.student', 'firstName lastName email avatar studentId')
      .populate('submissions.grade.gradedBy', 'firstName lastName email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check course access
    const course = await Course.findById(assignment.course._id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify user has access to this course
    if (req.user.role === 'student' && !course.isStudentEnrolled(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments
// @desc    Create a new assignment
// @access  Private (Teacher/Admin)
router.post('/', authenticateToken, requireTeacher, validateAssignment, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Verify course exists and user is instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignmentData = {
      ...req.body,
      course: courseId,
      instructor: req.user._id
    };

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    const populatedAssignment = await Assignment.findById(assignment._id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar');

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: populatedAssignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access  Private (Teacher/Admin)
router.put('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedFields = [
      'title', 'description', 'type', 'maxPoints', 'dueDate', 'availableFrom',
      'lateSubmissionAllowed', 'latePenalty', 'submissionType', 'allowedFileTypes',
      'maxFileSize', 'maxSubmissions', 'instructions', 'resources', 'rubric',
      'gradingMethod', 'status', 'xpReward', 'bonusXP'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('course', 'title code')
     .populate('instructor', 'firstName lastName email avatar');

    res.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Teacher/Admin)
router.delete('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if assignment has submissions
    if (assignment.submissions.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete assignment with submissions. Archive it instead.' 
      });
    }

    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private (Student)
router.post('/:id/submit', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit assignments' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if assignment is available
    if (new Date() < assignment.availableFrom) {
      return res.status(400).json({ message: 'Assignment is not yet available' });
    }

    // Check if due date has passed
    if (new Date() > assignment.dueDate && !assignment.lateSubmissionAllowed) {
      return res.status(400).json({ message: 'Assignment submission deadline has passed' });
    }

    // Verify student is enrolled in course
    const course = await Course.findById(assignment.course);
    if (!course || !course.isStudentEnrolled(req.user._id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const submissionData = {
      content: req.body.content,
      files: req.body.files || []
    };

    // Normalize files: allow frontend to send file URLs (strings) or full file objects.
    submissionData.files = (submissionData.files || []).map(f => {
      if (!f) return f;
      if (typeof f === 'string') {
        // Convert URL/string to file object expected by the schema
        return {
          filename: path.basename(f),
          originalName: path.basename(f),
          path: f
        };
      }
      return f;
    });

    await assignment.addSubmission(req.user._id, submissionData);

    // Award XP for submission (user profile)
    const user = await User.findById(req.user._id);
    const xpResult = user.addXP(assignment.xpReward);
    await user.save();

    // Update Gamification stats and recent activity (reward section)
    let userStats = await UserGamification.findOne({ user: req.user._id });
    if (!userStats) {
      userStats = new UserGamification({ user: req.user._id });
    }
    // Add XP via gamification tracker as well (keeps recentActivity log)
    userStats.addXP(assignment.xpReward, `Assignment submission: ${assignment.title}`);
    userStats.stats.assignmentsCompleted = (userStats.stats.assignmentsCompleted || 0) + 1;
    userStats.updateStreak('assignment');
    // Add explicit activity entry for clarity in UI
    userStats.recentActivity.unshift({
      action: 'assignment_submission',
      xp: assignment.xpReward,
      description: `Submitted assignment "${assignment.title}"`,
      timestamp: new Date()
    });
    // Trim recent activity
    if (userStats.recentActivity.length > 50) {
      userStats.recentActivity = userStats.recentActivity.slice(0, 50);
    }
    await userStats.save();

    const updatedAssignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar');

    res.json({
      message: 'Assignment submitted successfully',
      assignment: updatedAssignment,
      xpGained: xpResult.xpGained,
      leveledUp: xpResult.levelUp
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assignments/:id/grade
// @desc    Grade assignment submission
// @access  Private (Teacher/Admin)
router.post('/:id/grade', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const { studentId, points, feedback } = req.body;

    if (!studentId || points === undefined) {
      return res.status(400).json({ message: 'Student ID and points are required' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (points < 0 || points > assignment.maxPoints) {
      return res.status(400).json({ 
        message: `Points must be between 0 and ${assignment.maxPoints}` 
      });
    }

    const gradeData = {
      points,
      feedback: feedback || '',
      gradedBy: req.user._id
    };

    await assignment.gradeSubmission(studentId, gradeData);

    // Award bonus XP for perfect score
    if (points === assignment.maxPoints) {
      const user = await User.findById(studentId);
      if (user) {
        const xpResult = user.addXP(assignment.bonusXP, 'Perfect assignment score');
        await user.save();
      }
    }

    const updatedAssignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar')
      .populate('submissions.student', 'firstName lastName email avatar studentId');

    res.json({
      message: 'Assignment graded successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/:id/submissions
// @desc    Get assignment submissions
// @access  Private (Teacher/Admin)
router.get('/:id/submissions', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = assignment.submissions.map(submission => ({
      ...submission.toObject(),
      student: submission.student
    }));

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/my/submissions
// @desc    Get user's assignment submissions
// @access  Private
router.get('/my/submissions', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.find({
      'submissions.student': req.user._id
    })
    .populate('course', 'title code')
    .populate('instructor', 'firstName lastName email avatar')
    .sort({ dueDate: -1 });

    const submissions = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        s => s.student.toString() === req.user._id.toString()
      );
      return {
        assignment: {
          id: assignment._id,
          title: assignment.title,
          course: assignment.course,
          instructor: assignment.instructor,
          dueDate: assignment.dueDate,
          maxPoints: assignment.maxPoints
        },
        submission: submission
      };
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assignments/stats/overview
// @desc    Get assignment statistics overview
// @access  Private (Teacher/Admin)
router.get('/stats/overview', authenticateToken, requireTeacher, async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role === 'teacher') {
      matchQuery.instructor = req.user._id;
    }

    const stats = await Assignment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          publishedAssignments: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          totalSubmissions: { $sum: '$statistics.totalSubmissions' },
          gradedSubmissions: { $sum: '$statistics.gradedSubmissions' },
          averageScore: { $avg: '$statistics.averageScore' }
        }
      }
    ]);

    const typeStats = await Assignment.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          submissions: { $sum: '$statistics.totalSubmissions' }
        }
      }
    ]);

    res.json({
      overview: stats[0] || {
        totalAssignments: 0,
        publishedAssignments: 0,
        totalSubmissions: 0,
        gradedSubmissions: 0,
        averageScore: 0
      },
      byType: typeStats
    });
  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
