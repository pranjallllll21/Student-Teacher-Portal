import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import api from '../../services/api';

const QuizResult = () => {
  const { id } = useParams();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result] = useState(location.state || null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${id}/results`);
        setQuiz(response.data);
      } catch (error) {
        console.error('Error fetching quiz results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading results...</div>
      </div>
    );
  }

  if (!quiz || !result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Results not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quiz Results</h1>
        <p className="text-gray-600">{quiz.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Score</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-6">
            <div className="text-6xl font-bold mb-4">
              {result.score}/{result.maxScore}
            </div>
            <div className="text-2xl text-gray-600">
              {result.percentageScore.toFixed(1)}%
            </div>
            {result.xpGained && (
              <div className="mt-4 text-green-600">
                +{result.xpGained} XP Earned!
                {result.leveledUp && (
                  <div className="text-indigo-600 font-semibold mt-2">
                    🎉 Level Up! 🎉
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <Card key={index} className={
            result.answers[index]?.selectedOption === question.correctOption
              ? 'border-green-500'
              : 'border-red-500'
          }>
            <CardHeader>
              <CardTitle>Question {index + 1}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <p className="text-lg font-medium">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-lg ${
                        optIndex === question.correctOption
                          ? 'bg-green-50 text-green-700'
                          : result.answers[index]?.selectedOption === optIndex
                          ? 'bg-red-50 text-red-700'
                          : ''
                      }`}
                    >
                      <div className="flex items-center">
                        {optIndex === question.correctOption && (
                          <span className="mr-2">✓</span>
                        )}
                        {result.answers[index]?.selectedOption === optIndex &&
                          optIndex !== question.correctOption && (
                            <span className="mr-2">✗</span>
                          )}
                        {(option && option.text) || option}
                      </div>
                    </div>
                  ))}
                </div>
                {result.answers[index]?.selectedOption !== question.correctOption && (
                  <div className="mt-4 text-green-600">
                    <strong>Correct Answer:</strong> {question.options[question.correctOption]}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizResult;