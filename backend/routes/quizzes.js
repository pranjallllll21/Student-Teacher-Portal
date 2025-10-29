const express = require('express');
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const User = require('../models/User');
const QuizSubmission = require('../models/QuizSubmission');
const { authenticateToken, requireTeacher, requireCourseAccess } = require('../middleware/auth');
const { validateQuiz, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Get quizzes
// @access  Private
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { courseId, type, status } = req.query;

    let query = {};

    if (courseId) {
      query.course = courseId;
    }
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }

    // Role-based filtering
    if (req.user.role === 'student') {
      const enrolledCourses = await Course.find({
        'enrolledStudents.student': req.user._id,
        'enrolledStudents.status': 'active'
      }).select('_id');
      
      query.course = { $in: enrolledCourses.map(c => c._id) };
    } else if (req.user.role === 'teacher') {
      const myCourses = await Course.find({ instructor: req.user._id }).select('_id');
      query.course = { $in: myCourses.map(c => c._id) };
    }

    const quizzes = await Quiz.find(query)
      .populate('course', 'title code instructor')
      .populate('instructor', 'firstName lastName email avatar')
      .sort({ availableUntil: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get quiz by ID
// @access  Private
router.get('/:id', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title code instructor')
      .populate('instructor', 'firstName lastName email avatar');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check course access
    const course = await Course.findById(quiz.course._id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role === 'student' && !course.isStudentEnrolled(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'teacher' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Normalize quiz response to a consistent shape for frontend
    const quizObj = quiz.toObject ? quiz.toObject() : quiz;

    // Normalize questions and options
    quizObj.questions = (quizObj.questions || []).map(q => {
      const normalizedOptions = (q.options || []).map(opt => {
        if (!opt && opt !== '') return null;
        if (typeof opt === 'string') return { text: opt };
        if (typeof opt === 'object') return { text: opt.text || opt.value || '', isCorrect: !!opt.isCorrect, _id: opt._id };
        return { text: String(opt) };
      });

      return {
        ...q,
        options: normalizedOptions
      };
    });

    // For students, strip correct data so answers aren't exposed
    if (req.user.role === 'student') {
      // Include question _id so frontend can reference questions when submitting answers,
      // but do not expose correct flags or other sensitive data.
      const safeQuiz = {
        ...quizObj,
        questions: (quizObj.questions || []).map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          points: q.points,
          options: (q.options || []).map(o => ({ text: o.text })),
          explanation: q.explanation || undefined,
          order: q.order
        }))
      };
      return res.json(safeQuiz);
    }

    res.json(quizObj);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private (Teacher/Admin)
router.post('/', authenticateToken, requireTeacher, validateQuiz, async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const quizData = {
      ...req.body,
      course: courseId,
      instructor: req.user._id
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: populatedQuiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/start
// @desc    Start quiz attempt
// @access  Private (Student)
router.post('/:id/start', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can take quizzes' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if quiz is available
    const now = new Date();
    if (now < quiz.availableFrom || now > quiz.availableUntil) {
      return res.status(400).json({ message: 'Quiz is not currently available' });
    }

    // Verify student is enrolled in course
    const course = await Course.findById(quiz.course);
    if (!course || !course.isStudentEnrolled(req.user._id)) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    await quiz.startAttempt(req.user._id);

    const updatedQuiz = await Quiz.findById(req.params.id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar');

    res.json({
      message: 'Quiz attempt started',
      quiz: updatedQuiz
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    if (error.message === 'Maximum attempts reached') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/answer
// @desc    Submit quiz answer
// @access  Private (Student)
router.post('/:id/answer', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can answer quizzes' });
    }

    const { questionId, answer } = req.body;

    if (!questionId || answer === undefined) {
      return res.status(400).json({ message: 'Question ID and answer are required' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    await quiz.submitAnswer(req.user._id, questionId, answer);

    res.json({ message: 'Answer submitted successfully' });
  } catch (error) {
    console.error('Submit answer error:', error);
    if (error.message === 'No active attempt found' || error.message === 'Question not found') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz attempt
// @access  Private (Student)
router.post('/:id/submit', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit quizzes' });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // If answers are provided in the request body, submit them all first
    if (req.body.answers && Array.isArray(req.body.answers)) {
      for (const answerData of req.body.answers) {
        if (answerData.questionId && answerData.answer !== undefined && answerData.answer !== null) {
          try {
            await quiz.submitAnswer(req.user._id, answerData.questionId, answerData.answer);
            // Refetch quiz after each save to avoid version conflicts
            await quiz.save();
            // Reload the quiz to get fresh version
            const freshQuiz = await Quiz.findById(req.params.id);
            quiz.attempts = freshQuiz.attempts;
          } catch (err) {
            console.error('Error submitting answer:', err);
            // Continue with other answers even if one fails
          }
        }
      }
    }

    await quiz.submitAttempt(req.user._id);

    // Award XP based on score
    const attempt = quiz.getStudentAttempt(req.user._id);
    const user = await User.findById(req.user._id);
    
    let xpToAward = quiz.xpReward;
    if (attempt.percentage >= 90) {
      xpToAward += quiz.bonusXP;
    }
    
    const xpResult = user.addXP(xpToAward);
    await user.save();

    // Create QuizSubmission record for leaderboard
    const quizSubmission = new QuizSubmission({
      quiz: quiz._id,
      student: req.user._id,
      answers: attempt.answers.map(a => ({
        questionId: a.questionId,
        answer: a.answer,
        isCorrect: a.isCorrect
      })),
      score: attempt.score,
      maxScore: quiz.totalPoints || quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0),
      percentageScore: attempt.percentage,
      timeSpent: attempt.timeSpent,
      submittedAt: attempt.submittedAt
    });
    await quizSubmission.save();

    res.json({
      message: 'Quiz submitted successfully',
      score: attempt.score,
      percentage: attempt.percentage,
      xpGained: xpResult.xpGained,
      leveledUp: xpResult.levelUp
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    if (error.message === 'No active attempt found') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id/results
// @desc    Get quiz results
// @access  Private
router.get('/:id/results', authenticateToken, validateObjectId('id'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title code')
      .populate('instructor', 'firstName lastName email avatar');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check permissions
    const course = await Course.findById(quiz.course._id);
    if (req.user.role === 'student') {
      if (!course.isStudentEnrolled(req.user._id)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Students can only see their own results
      const attempt = quiz.getStudentAttempt(req.user._id);
      if (!attempt) {
        return res.status(404).json({ message: 'No attempt found' });
      }
      return res.json({ quiz, attempt });
    } else if (req.user.role === 'teacher') {
      if (course.instructor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      // Teachers can see all attempts
      return res.json({ quiz, attempts: quiz.attempts });
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Get quiz results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/my/attempts
// @desc    Get user's quiz attempts
// @access  Private
router.get('/my/attempts', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      'attempts.student': req.user._id
    })
    .populate('course', 'title code')
    .populate('instructor', 'firstName lastName email avatar')
    .sort({ availableUntil: -1 });

    const attempts = quizzes.map(quiz => {
      const attempt = quiz.attempts.find(
        a => a.student.toString() === req.user._id.toString()
      );
      return {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          course: quiz.course,
          instructor: quiz.instructor,
          type: quiz.type,
          maxPoints: quiz.maxPoints
        },
        attempt: attempt
      };
    });

    res.json({ attempts });
  } catch (error) {
    console.error('Get my attempts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
