const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const { isValidObjectId } = require('mongoose');

// Get leaderboard data
router.get('/', authenticateToken, async (req, res) => {
  try {
    const query = {};
    if (req.query.course && isValidObjectId(req.query.course)) {
      // First get all quizzes for the course
      const quizzes = await Quiz.find({ course: req.query.course }).select('_id');
      query.quiz = { $in: quizzes.map(q => q._id) };
    }

    const leaderboard = await QuizSubmission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$student',
          totalScore: { $sum: '$score' },
          maxPossibleScore: { $sum: '$maxScore' },
          quizzesCompleted: { $sum: 1 },
          averageScore: { $avg: '$percentageScore' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          _id: '$student._id',
          name: { 
            $concat: ['$student.firstName', ' ', '$student.lastName']
          },
          email: '$student.email',
          avatar: '$student.avatar',
          totalScore: 1,
          maxPossibleScore: 1,
          quizzesCompleted: 1,
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      { $sort: { totalScore: -1, averageScore: -1 } }
    ]);

    // Add rank to each entry
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard data' });
  }
});

module.exports = router;