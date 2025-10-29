import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import api from '../../services/api';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const courseParam = selectedCourse === 'all' ? '' : `?course=${selectedCourse}`;
        const response = await api.get(`/leaderboard${courseParam}`);
        setLeaderboardData(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await api.get('/courses');
        if (Array.isArray(response.data)) {
          setCourses(response.data);
        } else if (Array.isArray(response.data.courses)) {
          setCourses(response.data.courses);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchLeaderboard();
    fetchCourses();
  }, [selectedCourse]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600">See how you rank among your peers</p>
      </div>

      <div className="flex justify-end mb-4">
        <select
          className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          disabled={loadingCourses}
        >
          <option value="all">All Courses</option>
          {Array.isArray(courses) && courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name || course.title}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Rankings</CardTitle>
        </CardHeader>
        <CardBody>
          {loading || loadingCourses ? (
            <div className="text-center py-4">Loading...</div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-4">No quiz scores available yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quizzes Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData.map((entry, index) => (
                    <tr key={entry._id} className={index < 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg font-bold">{entry.rank || (index + 1)}</span>
                          {index < 3 && (
                            <span className="ml-2 text-2xl">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {entry.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-bold">{entry.totalScore}</span>
                          {entry.maxPossibleScore && (
                            <span className="text-gray-500"> / {entry.maxPossibleScore}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{entry.quizzesCompleted}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.averageScore}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Leaderboard;
