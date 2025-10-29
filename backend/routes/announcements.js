const express = require('express');
const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Course = require('../models/Course');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateAnnouncement, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/announcements
// @desc    Get announcements
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { scope, priority, courseId, role } = req.query;

    let query = { status: 'published' };

    // Filter by scope
    if (scope) {
      query.scope = scope;
    }

    // Filter by priority
    if (priority) {
      query.priority = priority;
    }

    // Filter by course
    if (courseId) {
      query['targetAudience.courses'] = courseId;
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      // Students see global, course-specific, and role-specific announcements
      query.$or = [
        { scope: 'global' },
        { scope: 'role', 'targetAudience.roles': req.user.role },
        { scope: 'course', 'targetAudience.courses': { $in: await getStudentCourses(req.user._id) } }
      ];
    } else if (req.user.role === 'teacher') {
      query.$or = [
        { scope: 'global' },
        { scope: 'role', 'targetAudience.roles': req.user.role },
        { scope: 'course', 'targetAudience.courses': { $in: await getTeacherCourses(req.user._id) } }
      ];
    } else if (req.user.role === 'parent') {
      // Parents see announcements for their children's courses
      const children = await User.find({ parentId: req.user._id });
      const childIds = children.map(child => child._id);
      const childCourses = await getStudentCourses(childIds);
      
      query.$or = [
        { scope: 'global' },
        { scope: 'role', 'targetAudience.roles': req.user.role },
        { scope: 'course', 'targetAudience.courses': { $in: childCourses } }
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'firstName lastName email avatar')
      .populate('targetAudience.courses', 'title code')
      .populate('views.user', 'firstName lastName')
      .populate('likes.user', 'firstName lastName')
      .populate('comments.author', 'firstName lastName email avatar')
      .sort({ isPinned: -1, priority: -1, publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Announcement.countDocuments(query);

    res.json({
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/announcements/unread/count
// @desc    Get count of unread announcements for current user
// @access  Private
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    // Build same visibility query as list endpoint
    let query = { status: 'published' };

    if (req.user.role === 'student') {
      query.$or = [
        { scope: 'global' },
        { scope: 'role', 'targetAudience.roles': req.user.role },
        { scope: 'course', 'targetAudience.courses': { $in: await getStudentCourses(req.user._id) } }
      ];
    } else if (req.user.role === 'teacher') {
      query.$or = [
        { scope: 'global' },
        { scope: 'role', 'targetAudience.roles': req.user.role },
        { scope: 'course', 'targetAudience.courses': { $in: await getTeacherCourses(req.user._id) } }
      ];
    } else if (req.user.role === 'parent') {
      const children = await User.find({ parentId: req.user._id });
      const childIds = children.map(child => child._id);
      const childCourses = await getStudentCourses(childIds);
      query.$or = [
        { scope: 'global' },
        { scope: 'role', 'targetAudience.roles': req.user.role },
        { scope: 'course', 'targetAudience.courses': { $in: childCourses } }
      ];
    }

    // Unread = announcements where views does NOT include this user
    query['views.user'] = { $ne: req.user._id };

    const count = await Announcement.countDocuments(query);
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread announcements count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
async function getStudentCourses(studentId) {
  const Course = require('../models/Course');
  const courses = await Course.find({
    'enrolledStudents.student': studentId,
    'enrolledStudents.status': 'active'
  }).select('_id');
  return courses.map(c => c._id);
}

async function getTeacherCourses(teacherId) {
  const Course = require('../models/Course');
  const courses = await Course.find({ instructor: teacherId }).select('_id');
  return courses.map(c => c._id);
}

// @route   GET /api/announcements/:id
// @desc    Get announcement by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'firstName lastName email avatar')
      .populate('targetAudience.courses', 'title code')
      .populate('views.user', 'firstName lastName')
      .populate('likes.user', 'firstName lastName')
      .populate('comments.author', 'firstName lastName email avatar');

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Mark as viewed
    await announcement.markAsViewed(req.user._id);

    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/announcements
// @desc    Create announcement
// @access  Private (Teacher/Admin)
router.post('/', authenticateToken, validateAnnouncement, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { scope, targetAudience, sendNotification } = req.body;

    // Validate target audience based on scope
    if (scope === 'course' && (!targetAudience.courses || targetAudience.courses.length === 0)) {
      return res.status(400).json({ message: 'Course announcements must specify target courses' });
    }

    if (scope === 'role' && (!targetAudience.roles || targetAudience.roles.length === 0)) {
      return res.status(400).json({ message: 'Role announcements must specify target roles' });
    }

    // Check course access for teachers
    if (req.user.role === 'teacher' && scope === 'course') {
      const Course = require('../models/Course');
      const myCourses = await Course.find({ instructor: req.user._id }).select('_id');
      const myCourseIds = myCourses.map(c => c._id.toString());
      
      const hasAccess = targetAudience.courses.every(courseId => 
        myCourseIds.includes(courseId.toString())
      );
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to one or more courses' });
      }
    }

    const announcementData = {
      ...req.body,
      author: req.user._id,
      sendNotification: sendNotification !== false
    };

    const announcement = new Announcement(announcementData);
    await announcement.save();

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('author', 'firstName lastName email avatar')
      .populate('targetAudience.courses', 'title code');

    // Emit real-time notification
    const io = req.app.get('io');
    if (io && sendNotification !== false) {
      io.emit('new-announcement', populatedAnnouncement);
    }

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: populatedAnnouncement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private
router.put('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedFields = [
      'title', 'content', 'priority', 'isPinned', 'expiryDate', 'attachments'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName email avatar')
     .populate('targetAudience.courses', 'title code');

    res.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private
router.delete('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/announcements/:id/like
// @desc    Toggle announcement like
// @access  Private
router.post('/:id/like', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    const result = announcement.toggleLike(req.user._id);
    await announcement.save();

    res.json({
      message: result.liked ? 'Announcement liked' : 'Announcement unliked',
      liked: result.liked,
      likeCount: result.likeCount
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/announcements/:id/comments
// @desc    Add comment to announcement
// @access  Private
router.post('/:id/comments', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.addComment(req.user._id, content.trim());

    const updatedAnnouncement = await Announcement.findById(req.params.id)
      .populate('comments.author', 'firstName lastName email avatar');

    res.json({
      message: 'Comment added successfully',
      announcement: updatedAnnouncement
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/announcements/:id/comments/:commentId
// @desc    Delete comment
// @access  Private
router.delete('/:id/comments/:commentId', authenticateToken, validateObjectId('id'), validateObjectId('commentId'), async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await announcement.deleteComment(req.params.commentId, req.user._id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    if (error.message === 'Comment not found or unauthorized') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/announcements/my/created
// @desc    Get user's created announcements
// @access  Private
router.get('/my/created', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const announcements = await Announcement.find({ author: req.user._id })
      .populate('targetAudience.courses', 'title code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Announcement.countDocuments({ author: req.user._id });

    res.json({
      announcements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
