import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Quizzes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes');
        // API may return { quizzes, pagination } or an array depending on endpoint
        if (Array.isArray(res.data)) setQuizzes(res.data);
        else if (Array.isArray(res.data.quizzes)) setQuizzes(res.data.quizzes);
        else setQuizzes([]);
      } catch (err) {
        console.error('Failed to load quizzes', err);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-gray-600">Take quizzes and test your knowledge</p>
        </div>

        {user && (user.role === 'teacher' || user.role === 'admin') && (
          <div>
            <Button onClick={() => navigate('/quizzes/create')}>Create Quiz</Button>
          </div>
        )}
      </div>

      {loading ? (
        <Card>
          <CardBody>
            <div className="text-center py-8">Loading quizzes...</div>
          </CardBody>
        </Card>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <div className="text-2xl text-gray-600">No quizzes available yet.</div>
            </div>
          </CardBody>
        </Card>
      ) : (
        // Group quizzes by title to avoid showing repeated identical quizzes from seeding
        (() => {
          const groups = quizzes.reduce((acc, q) => {
            const key = q.title || q._id;
            if (!acc[key]) acc[key] = { title: q.title, description: q.description, items: [] };
            acc[key].items.push(q);
            return acc;
          }, {});

          const grouped = Object.values(groups);

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped.map((g, idx) => {
                const first = g.items[0];
                return (
                  <Card key={idx} className="hover:shadow-lg">
                    <CardHeader>
                      <CardTitle>{g.title}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      <p className="text-gray-600 mb-3">{g.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">Available until: {new Date(first.availableUntil).toLocaleString()}</div>
                        <div className="space-x-2">
                          <Link to={`/quizzes/${first._id}`} className="text-indigo-600 hover:underline">Details</Link>
                          {user?.role === 'student' && (
                            <Link to={`/quizzes/${first._id}/take`} className="ml-2 text-white bg-indigo-600 px-3 py-1 rounded">Take</Link>
                          )}
                        </div>
                      </div>
                      {g.items.length > 1 && (
                        <div className="mt-3 text-sm text-gray-500">Available for {g.items.length} course(s)</div>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          );
        })()
      )}
    </div>
  );
};

export default Quizzes;
