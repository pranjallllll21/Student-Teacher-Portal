const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, rateLimit } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');

const router = express.Router();

// Apply rate limiting to auth routes
router.use(rateLimit(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes (increased for development)

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, studentId, employeeId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Check for unique IDs based on role
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student ID already exists' });
      }
    }

    if (role === 'teacher' && employeeId) {
      const existingTeacher = await User.findOne({ employeeId });
      if (existingTeacher) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role
    };

    // Add role-specific fields
    if (role === 'student') {
      userData.studentId = studentId;
    } else if (role === 'teacher') {
      userData.employeeId = employeeId;
    }

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('badges.badgeId', 'name icon description')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        avatar: user.avatar,
        badges: user.badges,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success as token removal is handled client-side
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token (in a real app, you'd send this via email)
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real application, you would:
    // 1. Store the reset token in the database
    // 2. Send an email with the reset link
    // 3. Handle the reset process

    res.json({ 
      message: 'If the email exists, a reset link has been sent',
      // In development, you might want to return the token
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify user email
// @access  Private
router.post('/verify-email', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // In a real application, you would:
    // 1. Generate a verification token
    // 2. Send an email with the verification link
    // 3. Handle the verification process

    // For demo purposes, we'll just mark as verified
    user.isEmailVerified = true;
    await user.save();

    res.json({ message: 'Email verification sent' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

module.exports = router;
