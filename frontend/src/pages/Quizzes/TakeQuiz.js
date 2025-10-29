import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI';
import api from '../../services/api';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${id}`);
        // backend may return { quiz } or quiz directly
        const data = response.data;
        const quizData = data.quiz || data;
        setQuiz(quizData);
        // Start an attempt for students so the server has an active attempt to record answers against.
        // If the user is a teacher or start fails, ignore the error (server will enforce role/access).
        try {
          await api.post(`/quizzes/${id}/start`);
        } catch (startErr) {
          // Not critical here; log for debugging.
          console.warn('Could not start quiz attempt:', startErr.response ? startErr.response.data : startErr.message);
        }
        const qCount = Array.isArray(quizData.questions) ? quizData.questions.length : 0;
        // initialize answers: null for choice-based, empty string for short-answer
        const initialAnswers = new Array(qCount).fill(null);
        if (Array.isArray(quizData.questions)) {
          quizData.questions.forEach((q, idx) => {
            if (q && q.type === 'short-answer') initialAnswers[idx] = '';
          });
        }
        setAnswers(initialAnswers);
        const minutes = quizData.timeLimit || quizData.timeLimitMinutes || 30;
        setTimeLeft((minutes || 0) * 60); // Convert minutes to seconds
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleTextAnswer = (questionIndex, text) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = text;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Prepare all answers in a single payload
      const answersPayload = [];
      (quiz.questions || []).forEach((question, qIndex) => {
        const ans = answers[qIndex];
        if (ans === null || ans === undefined || (question.type === 'short-answer' && ans.toString().trim() === '')) {
          // skip unanswered
          return;
        }

        let answerValue;
        if (question.type === 'short-answer' || question.type === 'essay') {
          answerValue = ans;
        } else {
          // For choice-based questions, convert index to option text
          const selectedOption = question.options && question.options[ans];
          answerValue = selectedOption ? (selectedOption.text || String(selectedOption)) : '';
        }

        answersPayload.push({
          questionId: question._id,
          answer: answerValue
        });
      });

      // Submit all answers in a single request
      const response = await api.post(`/quizzes/${id}/submit`, { answers: answersPayload });
      navigate(`/quizzes/${id}/results`, { state: response.data });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600">{quiz.description}</p>
        </div>
        <div className="text-xl font-semibold">
          Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </div>
      </div>

      <div className="space-y-6">
        {(quiz.questions || []).map((question, qIndex) => (
          <Card key={qIndex}>
            <CardHeader>
              <CardTitle>Question {qIndex + 1}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <p className="text-lg font-medium">{question.question}</p>
                <div className="space-y-2">
                  {question.type === 'short-answer' ? (
                    <div>
                      <textarea
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                        value={answers[qIndex] || ''}
                        onChange={(e) => handleTextAnswer(qIndex, e.target.value)}
                        placeholder="Type your answer here"
                      />
                    </div>
                  ) : (
                    (question.options || []).map((option, oIndex) => {
                      const displayText = (option && option.text) || option || `Option ${oIndex + 1} (missing)`;
                      const isMissing = option === undefined || option === null;
                      if (isMissing) console.warn(`Question ${qIndex + 1} option ${oIndex + 1} is missing`, { question });

                      return (
                        <div
                          key={oIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${isMissing ? 'bg-yellow-50' : 'hover:bg-gray-50'} cursor-pointer`}
                          onClick={() => !isMissing && handleAnswerSelect(qIndex, oIndex)}
                        >
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={answers[qIndex] === oIndex}
                            onChange={() => !isMissing && handleAnswerSelect(qIndex, oIndex)}
                            className="h-4 w-4 text-indigo-600"
                            disabled={isMissing}
                          />
                          <label className="text-gray-700">{displayText}</label>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={submitting || (() => {
            // check completeness based on question types
            if (!quiz || !Array.isArray(quiz.questions)) return true;
            return quiz.questions.some((q, i) => {
              if (q.type === 'short-answer') return !answers[i] || answers[i].toString().trim() === '';
              return answers[i] === null || answers[i] === undefined;
            });
          })()}
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </Button>
      </div>
    </div>
  );
};

export default TakeQuiz;
