const express = require('express');
const Message = require('../models/Message');
const { MessageThread } = require('../models/Message');
const User = require('../models/User');
const Course = require('../models/Course');
const { authenticateToken, requireUser } = require('../middleware/auth');
const { validateMessage, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/messages
// @desc    Get messages
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { threadId, courseId, type } = req.query;

    let query = {
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ],
      isDeleted: false
    };

    if (threadId) {
      query.thread = threadId;
    }
    if (courseId) {
      query.course = courseId;
    }
    if (type) {
      query.type = type;
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName email avatar')
      .populate('recipient', 'firstName lastName email avatar')
      .populate('thread', 'title')
      .populate('course', 'title code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments(query);

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get conversations (grouped by user)
// @access  Private
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    // Get all unique users the current user has messaged with
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ],
      isDeleted: false,
      type: { $ne: 'announcement' } // Exclude announcements
    })
      .populate('sender', 'firstName lastName email avatar role')
      .populate('recipient', 'firstName lastName email avatar role')
      .sort({ createdAt: -1 });

    // Group messages by conversation partner
    const conversationsMap = new Map();

    messages.forEach(message => {
      const partnerId = message.sender._id.toString() === req.user._id.toString()
        ? message.recipient?._id.toString()
        : message.sender._id.toString();

      if (!partnerId) return;

      if (!conversationsMap.has(partnerId)) {
        const partner = message.sender._id.toString() === req.user._id.toString()
          ? message.recipient
          : message.sender;

        conversationsMap.set(partnerId, {
          user: partner,
          lastMessage: message,
          unreadCount: 0
        });
      }

      // Count unread messages from this partner
      if (message.recipient?._id.toString() === req.user._id.toString() && !message.isRead) {
        conversationsMap.get(partnerId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get messages with a specific user
// @access  Private
router.get('/conversation/:userId', authenticateToken, validateObjectId('userId'), async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id }
      ],
      isDeleted: false
    })
      .populate('sender', 'firstName lastName email avatar role')
      .populate('recipient', 'firstName lastName email avatar role')
      .sort({ createdAt: 1 });

    // Mark messages from this user as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/unread/count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/:id
// @desc    Get message by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName email avatar')
      .populate('recipient', 'firstName lastName email avatar')
      .populate('thread', 'title')
      .populate('course', 'title code')
      .populate('replyTo');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user can view this message
    if (message.sender._id.toString() !== req.user._id.toString() && 
        message.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as read if recipient
    if (message.recipient && message.recipient._id.toString() === req.user._id.toString() && !message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await message.save();
    }

    res.json({ message });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', authenticateToken, validateMessage, async (req, res) => {
  try {
    const { recipient, content, type, priority, courseId, threadId, replyTo } = req.body;

    // Validate recipient for direct messages
    if (recipient && type !== 'announcement') {
      const recipientUser = await User.findById(recipient);
      if (!recipientUser) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
    }

    // Validate course for course messages
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user has access to this course
      if (req.user.role === 'student' && !course.isStudentEnrolled(req.user._id)) {
        return res.status(403).json({ message: 'Access denied to this course' });
      }
      if (req.user.role === 'teacher' && course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied to this course' });
      }
    }

    // Validate thread
    if (threadId) {
      const thread = await MessageThread.findById(threadId);
      if (!thread) {
        return res.status(404).json({ message: 'Thread not found' });
      }
    }

    const messageData = {
      sender: req.user._id,
      content,
      type: type || 'text',
      priority: priority || 'normal'
    };

    if (recipient) messageData.recipient = recipient;
    if (courseId) messageData.course = courseId;
    if (threadId) messageData.thread = threadId;
    if (replyTo) messageData.replyTo = replyTo;

    const message = new Message(messageData);
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email avatar')
      .populate('recipient', 'firstName lastName email avatar')
      .populate('thread', 'title')
      .populate('course', 'title code');

    // Emit real-time message
    const io = req.app.get('io');
    if (io) {
      if (recipient) {
        io.to(recipient).emit('new-message', populatedMessage);
      }
      if (courseId) {
        io.to(`course-${courseId}`).emit('new-message', populatedMessage);
      }
      if (threadId) {
        io.to(`thread-${threadId}`).emit('new-message', populatedMessage);
      }
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id
// @desc    Update message
// @access  Private
router.put('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user can edit this message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { content } = req.body;
    if (content) {
      message.content = content;
    }

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName email avatar')
      .populate('recipient', 'firstName lastName email avatar')
      .populate('thread', 'title')
      .populate('course', 'title code');

    res.json({
      message: 'Message updated successfully',
      data: updatedMessage
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user can delete this message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/:id/like
// @desc    Toggle message like
// @access  Private
router.post('/:id/like', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const result = message.toggleLike(req.user._id);
    await message.save();

    res.json({
      message: result.liked ? 'Message liked' : 'Message unliked',
      liked: result.liked,
      likeCount: result.likeCount
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/messages/threads
// @desc    Get message threads
// @access  Private
router.get('/threads', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { courseId } = req.query;

    let query = {};
    if (courseId) {
      query.course = courseId;
    }

    const threads = await MessageThread.find(query)
      .populate('course', 'title code')
      .populate('createdBy', 'firstName lastName email avatar')
      .populate('lastMessage')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MessageThread.countDocuments(query);

    res.json({
      threads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/messages/threads
// @desc    Create message thread
// @access  Private
router.post('/threads', authenticateToken, async (req, res) => {
  try {
    const { title, courseId } = req.body;

    if (!title || !courseId) {
      return res.status(400).json({ message: 'Title and course ID are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user has access to this course
    if (req.user.role === 'student' && !course.isStudentEnrolled(req.user._id)) {
      return res.status(403).json({ message: 'Access denied to this course' });
    }

    const thread = new MessageThread({
      title,
      course: courseId,
      createdBy: req.user._id
    });

    await thread.save();

    const populatedThread = await MessageThread.findById(thread._id)
      .populate('course', 'title code')
      .populate('createdBy', 'firstName lastName email avatar');

    res.status(201).json({
      message: 'Thread created successfully',
      thread: populatedThread
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
