import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import api, { gamificationAPI } from '../../services/api';

const Rewards = () => {
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const activityRes = await gamificationAPI.getActivity();
        setRecentActivity(activityRes.data?.recentActivity || []);
      } catch (e) {
        console.error('Failed to load activity', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rewards & Activity</h1>
        <p className="text-gray-600">Track your XP earnings and achievements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎉 Recent Rewards & Activity</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading your rewards...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-600">
                Complete assignments and quizzes to earn XP and rewards!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item, idx) => {
                // Determine activity type for styling
                const isAssignment = item.action === 'assignment_submission' || item.description?.toLowerCase().includes('assignment');
                const isQuiz = item.action === 'quiz_completion' || item.description?.toLowerCase().includes('quiz');
                const isXP = item.action === 'xp_earned';
                
                let bgColor = 'bg-gradient-to-r from-blue-50 to-indigo-50';
                let iconBg = 'bg-blue-100';
                let icon = '📚';
                let textColor = 'text-blue-700';
                
                if (isAssignment) {
                  bgColor = 'bg-gradient-to-r from-green-50 to-emerald-50';
                  iconBg = 'bg-green-100';
                  icon = '📝';
                  textColor = 'text-green-700';
                } else if (isQuiz) {
                  bgColor = 'bg-gradient-to-r from-purple-50 to-pink-50';
                  iconBg = 'bg-purple-100';
                  icon = '🧠';
                  textColor = 'text-purple-700';
                } else if (isXP) {
                  bgColor = 'bg-gradient-to-r from-yellow-50 to-orange-50';
                  iconBg = 'bg-yellow-100';
                  icon = '⭐';
                  textColor = 'text-orange-700';
                }

                return (
                  <div 
                    key={idx} 
                    className={`${bgColor} rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`${iconBg} w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0`}>
                          {icon}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.description || item.action}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      {item.xp !== undefined && (
                        <div className={`${textColor} font-bold text-lg flex items-center space-x-1`}>
                          <span className="text-2xl">+</span>
                          <span>{item.xp}</span>
                          <span className="text-sm">XP</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Rewards;
