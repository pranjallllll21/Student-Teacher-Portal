const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Check if user is admin
const requireAdmin = requireRole('admin');

// Check if user is teacher or admin
const requireTeacher = requireRole('teacher', 'admin');

// Check if user is student, teacher, or admin
const requireUser = requireRole('student', 'teacher', 'admin', 'parent');

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user owns resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user._id.toString() !== resourceUserId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};

// Check if user is enrolled in course or is instructor
const requireCourseAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const courseId = req.params.courseId || req.params.id || req.body.courseId;
    
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID required' });
    }

    const Course = require('../models/Course');
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Admin can access all courses
    if (req.user.role === 'admin') {
      req.course = course;
      return next();
    }

    // Instructor can access their own courses
    if (req.user.role === 'teacher' && course.instructor.toString() === req.user._id.toString()) {
      req.course = course;
      return next();
    }

    // Students can access enrolled courses
    if (req.user.role === 'student' && course.isStudentEnrolled(req.user._id)) {
      req.course = course;
      return next();
    }

    // Parents can access their child's courses
    if (req.user.role === 'parent') {
      const User = require('../models/User');
      const children = await User.find({ parentId: req.user._id });
      const childIds = children.map(child => child._id.toString());
      
      const isChildEnrolled = course.enrolledStudents.some(
        enrollment => childIds.includes(enrollment.student.toString())
      );
      
      if (isChildEnrolled) {
        req.course = course;
        return next();
      }
    }

    return res.status(403).json({ message: 'Access denied to this course' });
  } catch (error) {
    return res.status(500).json({ message: 'Error checking course access' });
  }
};

// Rate limiting middleware
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, validTimestamps);
      }
    }

    // Check current IP
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        message: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireTeacher,
  requireUser,
  optionalAuth,
  requireOwnershipOrAdmin,
  requireCourseAccess,
  rateLimit
};
