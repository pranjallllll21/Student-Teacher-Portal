const express = require('express');
const { Badge, Achievement, Leaderboard, Quest, RewardItem, UserGamification } = require('../models/Gamification');
const User = require('../models/User');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/gamification/badges
// @desc    Get all badges
// @access  Private
router.get('/badges', authenticateToken, async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true })
      .sort({ category: 1, rarity: 1 });

    res.json({ badges });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/user/:userId/stats
// @desc    Get user gamification stats
// @access  Private
router.get('/user/:userId/stats', authenticateToken, validateObjectId('userId'), async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user can view these stats
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let userStats = await UserGamification.findOne({ user: userId });
    
    if (!userStats) {
      // Create default stats if they don't exist
      userStats = new UserGamification({
        user: userId,
        totalXP: 0,
        currentLevel: 1,
        xpToNextLevel: 100
      });
      await userStats.save();
    }

    const user = await User.findById(userId)
      .populate('badges.badgeId', 'name icon description rarity');

    res.json({
      stats: userStats,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/leaderboard', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { type = 'all-time', courseId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    let matchQuery = { role: 'student' };
    
    if (courseId) {
      // Get students enrolled in the course
      const Course = require('../models/Course');
      const course = await Course.findById(courseId);
      if (course) {
        const enrolledStudentIds = course.enrolledStudents
          .filter(e => e.status === 'active')
          .map(e => e.student);
        matchQuery._id = { $in: enrolledStudentIds };
      }
    }

    let sortQuery = { xp: -1 };
    let dateFilter = {};

    if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { lastLogin: { $gte: weekAgo } };
    } else if (type === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { lastLogin: { $gte: monthAgo } };
    }

    const users = await User.find({ ...matchQuery, ...dateFilter })
      .select('firstName lastName avatar xp level badges')
      .populate('badges.badgeId', 'name icon')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ ...matchQuery, ...dateFilter });

    // Add rank to each user
    const rankedUsers = users.map((user, index) => ({
      ...user.toObject(),
      rank: skip + index + 1
    }));

    res.json({
      leaderboard: rankedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      type,
      courseId
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/quests
// @desc    Get available quests
// @access  Private
router.get('/quests', authenticateToken, async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { isActive: true };
    if (type) {
      query.type = type;
    }

    const quests = await Quest.find(query)
      .populate('rewards.badge', 'name icon description')
      .sort({ type: 1, createdAt: -1 });

    // Get user's quest progress
    const userQuests = quests.map(quest => {
      const participation = quest.participants.find(
        p => p.user.toString() === req.user._id.toString()
      );
      
      return {
        ...quest.toObject(),
        userProgress: participation || null,
        isCompleted: participation ? participation.completedAt : false,
        isClaimed: participation ? participation.claimed : false
      };
    });

    res.json({ quests: userQuests });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gamification/quests/:questId/join
// @desc    Join a quest
// @access  Private
router.post('/quests/:questId/join', authenticateToken, validateObjectId('questId'), async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.questId);
    if (!quest) {
      return res.status(404).json({ message: 'Quest not found' });
    }

    if (!quest.isActive) {
      return res.status(400).json({ message: 'Quest is not active' });
    }

    // Check if user is already participating
    const existingParticipation = quest.participants.find(
      p => p.user.toString() === req.user._id.toString()
    );

    if (existingParticipation) {
      return res.status(400).json({ message: 'Already participating in this quest' });
    }

    // Add user to quest
    quest.participants.push({
      user: req.user._id,
      progress: quest.requirements.map(req => ({
        requirement: req._id,
        current: 0,
        completed: false
      }))
    });

    await quest.save();

    res.json({ message: 'Successfully joined quest' });
  } catch (error) {
    console.error('Join quest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/rewards
// @desc    Get reward marketplace items
// @access  Private
router.get('/rewards', authenticateToken, async (req, res) => {
  try {
    const rewards = await RewardItem.find({ isAvailable: true })
      .sort({ cost: 1 });

    res.json({ rewards });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gamification/rewards/:rewardId/redeem
// @desc    Redeem a reward
// @access  Private
router.post('/rewards/:rewardId/redeem', authenticateToken, validateObjectId('rewardId'), async (req, res) => {
  try {
    const reward = await RewardItem.findById(req.params.rewardId);
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    if (!reward.isAvailable) {
      return res.status(400).json({ message: 'Reward is not available' });
    }

    // Check stock
    if (reward.stock !== -1 && reward.stock <= 0) {
      return res.status(400).json({ message: 'Reward is out of stock' });
    }

    // Check user level requirement
    if (req.user.level < reward.levelRequired) {
      return res.status(400).json({ 
        message: `Level ${reward.levelRequired} required to redeem this reward` 
      });
    }

    // Check if user has enough XP
    if (req.user.xp < reward.cost) {
      return res.status(400).json({ 
        message: 'Insufficient XP to redeem this reward' 
      });
    }

    // Deduct XP
    req.user.xp -= reward.cost;
    await req.user.save();

    // Add redemption
    reward.redemptions.push({
      user: req.user._id,
      status: 'pending'
    });

    // Update stock
    if (reward.stock !== -1) {
      reward.stock -= 1;
    }

    await reward.save();

    res.json({ 
      message: 'Reward redeemed successfully',
      remainingXP: req.user.xp
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gamification/xp/add
// @desc    Add XP to user (admin only)
// @access  Private (Admin)
router.post('/xp/add', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId, amount, reason } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: 'User ID and amount are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const xpResult = user.addXP(amount, reason || 'Admin reward');
    await user.save();

    res.json({
      message: 'XP added successfully',
      xpGained: xpResult.xpGained,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/achievements
// @desc    Get user achievements
// @access  Private
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user._id })
      .populate('badge', 'name icon description rarity')
      .sort({ earnedAt: -1 });

    res.json({ achievements });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/activity
// @desc    Get user recent activity
// @access  Private
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    let userStats = await UserGamification.findOne({ user: req.user._id });
    
    if (!userStats) {
      userStats = new UserGamification({ user: req.user._id });
      await userStats.save();
    }

    res.json({ 
      recentActivity: userStats.recentActivity.slice(0, 20) // Last 20 activities
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/gamification/stats/overview
// @desc    Get gamification overview stats
// @access  Private (Admin)
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalBadges = await Badge.countDocuments({ isActive: true });
    const totalQuests = await Quest.countDocuments({ isActive: true });
    const totalRewards = await RewardItem.countDocuments({ isAvailable: true });
    
    const userStats = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: null,
          totalXP: { $sum: '$xp' },
          averageXP: { $avg: '$xp' },
          averageLevel: { $avg: '$level' },
          totalBadges: { $sum: { $size: '$badges' } }
        }
      }
    ]);

    res.json({
      totalBadges,
      totalQuests,
      totalRewards,
      userStats: userStats[0] || {
        totalXP: 0,
        averageXP: 0,
        averageLevel: 0,
        totalBadges: 0
      }
    });
  } catch (error) {
    console.error('Get gamification stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
