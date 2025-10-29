import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button, Input } from '../../components/UI';
import api from '../../services/api';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    course: '',
    type: 'graded',
    maxPoints: 100,
    timeLimit: 30,
    availableUntil: '',
    questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }]
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        // Backend returns { courses, pagination } structure
        const coursesData = response.data.courses || response.data;
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    if (field === 'options') {
      newQuestions[index].options = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, { question: '', options: ['', '', '', ''], correctOption: 0 }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Transform quiz data to match backend expectations
      const quizData = {
        title: quiz.title,
        description: quiz.description,
        courseId: quiz.course,
        type: quiz.type,
        maxPoints: Number(quiz.maxPoints),
        timeLimit: Number(quiz.timeLimit),
        availableUntil: new Date(quiz.availableUntil).toISOString(), // Convert to ISO8601
        maxAttempts: 2,
        questions: quiz.questions.map((q, idx) => ({
          question: q.question,
          type: 'multiple-choice',
          points: 10,
          options: q.options.map((opt, optIdx) => ({
            text: opt,
            isCorrect: optIdx === q.correctOption
          })),
          order: idx + 1
        })),
        settings: {
          shuffleQuestions: false,
          shuffleOptions: true,
          showCorrectAnswers: true,
          showExplanations: true,
          allowReview: true
        },
        status: 'published',
        xpReward: 30,
        bonusXP: 20
      };
      
      await api.post('/quizzes', quizData);
      navigate('/quizzes');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert('Failed to create quiz. Please check all fields and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
        <p className="text-gray-600">Create interactive quizzes for your students</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Quiz Title"
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                required
              />
              <Input
                label="Description"
                type="textarea"
                value={quiz.description}
                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={quiz.course}
                  onChange={(e) => setQuiz({ ...quiz, course: e.target.value })}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
                <Input
                  type="datetime-local"
                  label="Available Until"
                  value={quiz.availableUntil}
                  onChange={(e) => setQuiz({ ...quiz, availableUntil: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Time Limit (minutes)"
                  value={quiz.timeLimit}
                  onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) })}
                  required
                  min="1"
                />
                <Input
                  type="number"
                  label="Max Points"
                  value={quiz.maxPoints}
                  onChange={(e) => setQuiz({ ...quiz, maxPoints: parseInt(e.target.value) })}
                  required
                  min="1"
                />
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={quiz.type}
                  onChange={(e) => setQuiz({ ...quiz, type: e.target.value })}
                  required
                >
                  <option value="practice">Practice</option>
                  <option value="graded">Graded</option>
                  <option value="survey">Survey</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {quiz.questions.map((q, index) => (
          <Card key={index} className="mb-6">
            <CardHeader>
              <CardTitle>Question {index + 1}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input
                  label="Question"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                  required
                />
                {q.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <Input
                      label={`Option ${optIndex + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...q.options];
                        newOptions[optIndex] = e.target.value;
                        handleQuestionChange(index, 'options', newOptions);
                      }}
                      required
                    />
                    <input
                      type="radio"
                      name={`correct-${index}`}
                      checked={q.correctOption === optIndex}
                      onChange={() => handleQuestionChange(index, 'correctOption', optIndex)}
                      required
                    />
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ))}

        <div className="flex justify-between">
          <Button type="button" onClick={addQuestion}>
            Add Question
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Quiz...' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
