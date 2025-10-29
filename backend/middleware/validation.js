const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .isIn(['student', 'teacher', 'admin', 'parent'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  handleValidationErrors
];

// Course validation rules
const validateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('code')
    .trim()
    .isLength({ min: 3, max: 10 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must be 3-10 uppercase letters/numbers'),
  body('credits')
    .isInt({ min: 1, max: 6 })
    .withMessage('Credits must be between 1 and 6'),
  body('duration')
    .isInt({ min: 1, max: 52 })
    .withMessage('Duration must be between 1 and 52 weeks'),
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid level'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  handleValidationErrors
];

// Assignment validation rules
const validateAssignment = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('type')
    .isIn(['essay', 'project', 'lab', 'presentation', 'other'])
    .withMessage('Invalid assignment type'),
  body('maxPoints')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max points must be between 1 and 1000'),
  body('dueDate')
    .isISO8601()
    .withMessage('Valid due date is required'),
  body('instructions')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Instructions must be between 10 and 5000 characters'),
  handleValidationErrors
];

// Quiz validation rules
const validateQuiz = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('type')
    .isIn(['practice', 'graded', 'survey'])
    .withMessage('Invalid quiz type'),
  body('maxPoints')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max points must be between 1 and 1000'),
  body('timeLimit')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Time limit must be between 1 and 300 minutes'),
  body('availableUntil')
    .isISO8601()
    .withMessage('Valid available until date is required'),
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  body('questions.*.question')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Question must be between 5 and 500 characters'),
  body('questions.*.type')
    .isIn(['multiple-choice', 'true-false', 'short-answer', 'essay'])
    .withMessage('Invalid question type'),
  body('questions.*.points')
    .isInt({ min: 1, max: 100 })
    .withMessage('Question points must be between 1 and 100'),
  handleValidationErrors
];

// Message validation rules
const validateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'announcement'])
    .withMessage('Invalid message type'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
];

// Announcement validation rules
const validateAnnouncement = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  body('scope')
    .isIn(['global', 'course', 'role'])
    .withMessage('Invalid scope'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (maxSize = 10 * 1024 * 1024, allowedTypes = []) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          message: `File ${file.originalname} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
        });
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: `File type ${file.mimetype} is not allowed`
        });
      }
    }

    next();
  };
};

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCourse,
  validateAssignment,
  validateQuiz,
  validateMessage,
  validateAnnouncement,
  validateObjectId,
  validatePagination,
  validateFileUpload
};
