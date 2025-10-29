const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   POST /api/submissions
// @desc    Submit an assignment
// @access  Private (Student)
router.post('/', [
  authenticateToken,
  body('assignmentId').notEmpty().withMessage('Assignment ID is required'),
  body('content').notEmpty().withMessage('Submission content is required'),
  body('type').isIn(['text', 'file']).withMessage('Submission type must be text or file')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignmentId, content, type, fileUrl } = req.body;
    const studentId = req.user.id;

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student is enrolled in the course
    const user = await User.findById(studentId);
    if (!user.courses.includes(assignment.course)) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Check if assignment is still open
    if (new Date() > assignment.dueDate) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

    // Check if student has already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }

    // Create submission
    const submission = new Submission({
      assignment: assignmentId,
      student: studentId,
      content,
      type,
      fileUrl: type === 'file' ? fileUrl : undefined,
      submittedAt: new Date()
    });

    await submission.save();

    // Add submission to assignment
    assignment.submissions.push(submission._id);
    await assignment.save();

    // Award XP for submission
    const io = req.app.get('io');
    if (io) {
      io.emit('xp-earned', {
        userId: studentId,
        xp: 50,
        reason: 'Assignment submitted'
      });
    }

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Get all submissions for an assignment
// @access  Private (Teacher/Admin)
router.get('/assignment/:assignmentId', authenticateToken, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const user = await User.findById(req.user.id);

    // Check if user is teacher or admin
    if (!['teacher', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is the teacher of this course or admin
    if (user.role === 'teacher' && assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'username email profile')
      .sort({ submittedAt: -1 });

    res.json(submissions);

  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/student/:studentId
// @desc    Get all submissions by a student
// @access  Private (Student/Teacher/Admin)
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = await User.findById(req.user.id);

    // Check if user is accessing their own submissions or is teacher/admin
    if (studentId !== req.user.id && !['teacher', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submissions = await Submission.find({ student: studentId })
      .populate('assignment', 'title course dueDate maxPoints')
      .populate('student', 'username email')
      .sort({ submittedAt: -1 });

    res.json(submissions);

  } catch (error) {
    console.error('Get student submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/submissions/:submissionId/grade
// @desc    Grade a submission
// @access  Private (Teacher/Admin)
router.put('/:submissionId/grade', [
  authenticateToken,
  body('points').isNumeric().withMessage('Points must be a number'),
  body('feedback').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { submissionId } = req.params;
    const { points, feedback } = req.body;
    const user = await User.findById(req.user.id);

    // Check if user is teacher or admin
    if (!['teacher', 'admin'].includes(user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submission = await Submission.findById(submissionId)
      .populate('assignment');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user is the teacher of this course or admin
    if (user.role === 'teacher' && submission.assignment.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Validate points
    if (points < 0 || points > submission.assignment.maxPoints) {
      return res.status(400).json({ 
        message: `Points must be between 0 and ${submission.assignment.maxPoints}` 
      });
    }

    // Update submission
    submission.points = points;
    submission.feedback = feedback;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user.id;

    await submission.save();

    // Award XP based on grade
    const xpEarned = Math.round((points / submission.assignment.maxPoints) * 100);
    const io = req.app.get('io');
    if (io) {
      io.emit('xp-earned', {
        userId: submission.student,
        xp: xpEarned,
        reason: 'Assignment graded'
      });
    }

    res.json({
      message: 'Submission graded successfully',
      submission
    });

  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/submissions/:submissionId
// @desc    Get a specific submission
// @access  Private
router.get('/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const user = await User.findById(req.user.id);

    const submission = await Submission.findById(submissionId)
      .populate('assignment', 'title course dueDate maxPoints')
      .populate('student', 'username email profile');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user can access this submission
    const canAccess = 
      submission.student._id.toString() === req.user.id || // Student owns submission
      ['teacher', 'admin'].includes(user.role); // Teacher or admin

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(submission);

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/submissions/:submissionId
// @desc    Delete a submission
// @access  Private (Student/Teacher/Admin)
router.delete('/:submissionId', authenticateToken, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const user = await User.findById(req.user.id);

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user can delete this submission
    const canDelete = 
      submission.student.toString() === req.user.id || // Student owns submission
      ['teacher', 'admin'].includes(user.role); // Teacher or admin

    if (!canDelete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Remove submission from assignment
    await Assignment.findByIdAndUpdate(
      submission.assignment,
      { $pull: { submissions: submissionId } }
    );

    await Submission.findByIdAndDelete(submissionId);

    res.json({ message: 'Submission deleted successfully' });

  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
