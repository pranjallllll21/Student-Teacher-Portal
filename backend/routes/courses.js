const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticateToken, requireTeacher, requireUser, requireCourseAccess } = require('../middleware/auth');
const { validateCourse, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, level, status, search } = req.query;

    // Build query
    let query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    if (level) {
      query.level = level;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter based on user role
    if (req.user.role === 'student') {
      // Students can see courses they're enrolled in or available courses
      query.$or = [
        { 'enrolledStudents.student': req.user._id },
        { status: 'published' }
      ];
    } else if (req.user.role === 'teacher') {
      // Teachers can see their own courses and published courses
      query.$or = [
        { instructor: req.user._id },
        { status: 'published' }
      ];
    } else if (req.user.role === 'parent') {
      // Parents can see courses their children are enrolled in
      const children = await User.find({ parentId: req.user._id });
      const childIds = children.map(child => child._id);
      query['enrolledStudents.student'] = { $in: childIds };
    }

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email avatar')
      .populate('enrolledStudents.student', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), requireCourseAccess, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email avatar department')
      .populate('enrolledStudents.student', 'firstName lastName email avatar studentId')
      .populate('modules.lessons');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Teacher/Admin)
router.post('/', authenticateToken, requireTeacher, validateCourse, async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.user._id
    };

    const course = new Course(courseData);
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'firstName lastName email avatar');

    res.status(201).json({
      message: 'Course created successfully',
      course: populatedCourse
    });
  } catch (error) {
    console.error('Create course error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Teacher/Admin)
router.put('/:id', authenticateToken, validateObjectId('id'), requireCourseAccess, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user can edit this course
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedFields = [
      'title', 'description', 'credits', 'duration', 'level', 'category',
      'tags', 'thumbnail', 'syllabus', 'schedule', 'maxStudents',
      'modules', 'gradingPolicy', 'status', 'startDate', 'endDate',
      'xpRewards'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName email avatar');

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Teacher/Admin)
router.delete('/:id', authenticateToken, validateObjectId('id'), requireCourseAccess, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user can delete this course
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if course has enrolled students
    if (course.enrolledStudents.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete course with enrolled students. Archive it instead.' 
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in course
// @access  Private (Student)
router.post('/:id/enroll', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    if (course.isStudentEnrolled(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    if (course.isFull) {
      return res.status(400).json({ message: 'Course is full' });
    }

    await course.enrollStudent(req.user._id);

    // Award XP for enrollment
    const user = await User.findById(req.user._id);
    const xpResult = user.addXP(course.xpRewards.enrollment, 'Course enrollment');
    await user.save();

    const updatedCourse = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email avatar')
      .populate('enrolledStudents.student', 'firstName lastName email avatar');

    res.json({
      message: 'Successfully enrolled in course',
      course: updatedCourse,
      xpGained: xpResult.xpGained,
      leveledUp: xpResult.leveledUp
    });
  } catch (error) {
    console.error('Enroll in course error:', error);
    if (error.message === 'Student is already enrolled' || error.message === 'Course is full') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/drop
// @desc    Drop course
// @access  Private (Student)
router.post('/:id/drop', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can drop courses' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.isStudentEnrolled(req.user._id)) {
      return res.status(400).json({ message: 'Not enrolled in this course' });
    }

    await course.dropStudent(req.user._id);

    const updatedCourse = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName email avatar')
      .populate('enrolledStudents.student', 'firstName lastName email avatar');

    res.json({
      message: 'Successfully dropped course',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Drop course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/my/enrolled
// @desc    Get user's enrolled courses
// @access  Private
router.get('/my/enrolled', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'student') {
      query['enrolledStudents.student'] = req.user._id;
    } else if (req.user.role === 'teacher') {
      query.instructor = req.user._id;
    } else if (req.user.role === 'parent') {
      const children = await User.find({ parentId: req.user._id });
      const childIds = children.map(child => child._id);
      query['enrolledStudents.student'] = { $in: childIds };
    }

    const courses = await Course.find(query)
      .populate('instructor', 'firstName lastName email avatar')
      .populate('enrolledStudents.student', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/categories
// @desc    Get all course categories
// @access  Private
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Course.distinct('category');
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id/students
// @desc    Get course students
// @access  Private (Teacher/Admin)
router.get('/:id/students', authenticateToken, validateObjectId('id'), requireCourseAccess, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents.student', 'firstName lastName email avatar studentId xp level')
      .populate('enrolledStudents.student.badges.badgeId', 'name icon');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user can view students
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = course.enrolledStudents
      .filter(enrollment => enrollment.status === 'active')
      .map(enrollment => ({
        ...enrollment.student.toObject(),
        enrolledAt: enrollment.enrolledAt
      }));

    res.json({ students });
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/stats/overview
// @desc    Get course statistics overview
// @access  Private (Teacher/Admin)
router.get('/stats/overview', authenticateToken, requireTeacher, async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role === 'teacher') {
      matchQuery.instructor = req.user._id;
    }

    const stats = await Course.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          publishedCourses: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          totalEnrollments: { $sum: { $size: '$enrolledStudents' } },
          averageEnrollment: { $avg: { $size: '$enrolledStudents' } }
        }
      }
    ]);

    const categoryStats = await Course.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          enrollments: { $sum: { $size: '$enrolledStudents' } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        totalCourses: 0,
        publishedCourses: 0,
        totalEnrollments: 0,
        averageEnrollment: 0
      },
      byCategory: categoryStats
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
