const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireUser, requireOwnershipOrAdmin } = require('../middleware/auth');
const { validateUserUpdate, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/teachers
// @desc    Get all teachers (accessible to all authenticated users)
// @access  Private
router.get('/teachers', authenticateToken, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('firstName lastName email avatar department specialization')
      .sort({ firstName: 1 });

    res.json({ users: teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    // Build query
    let query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('badges.badgeId', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('badges.badgeId', 'name icon description')
      .populate('parentId', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can view this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      // Parents can view their children's profiles
      if (req.user.role === 'parent' && user.parentId && user.parentId._id.toString() === req.user._id.toString()) {
        // Allow access
      } else {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private
router.put('/:id', authenticateToken, validateObjectId('id'), validateUserUpdate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update allowed fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'address', 'preferences'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Admin can update additional fields
    if (req.user.role === 'admin') {
      const adminFields = ['role', 'isActive', 'isEmailVerified', 'grade', 'department', 'specialization'];
      for (const field of adminFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/:id/avatar', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Handle base64 image data
    if (!req.body.avatar) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // Store the base64 image
    user.avatar = req.body.avatar;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/role/:role
// @desc    Get users by role
// @access  Private
router.get('/role/:role', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!['student', 'teacher', 'admin', 'parent'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const users = await User.find({ role })
      .select('-password')
      .populate('badges.badgeId', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/parent/:parentId/children
// @desc    Get children of a parent
// @access  Private
router.get('/parent/:parentId/children', authenticateToken, validateObjectId('parentId'), async (req, res) => {
  try {
    const { parentId } = req.params;

    // Check if user can access this data
    if (req.user.role !== 'admin' && req.user._id.toString() !== parentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const children = await User.find({ parentId })
      .select('-password')
      .populate('badges.badgeId', 'name icon')
      .sort({ firstName: 1 });

    res.json({ children });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/:id/toggle-status
// @desc    Toggle user active status (admin only)
// @access  Private (Admin)
router.post('/:id/toggle-status', authenticateToken, requireAdmin, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview (admin only)
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          averageXP: { $avg: '$xp' },
          averageLevel: { $avg: '$level' }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    res.json({
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      byRole: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
