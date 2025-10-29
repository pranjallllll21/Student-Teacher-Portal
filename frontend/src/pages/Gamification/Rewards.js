import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import api, { gamificationAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  TrophyIcon, 
  StarIcon, 
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const Rewards = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [studentRewards, setStudentRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, assignment, quiz, xp
  const [sortBy, setSortBy] = useState('recent'); // recent, xp
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      if (isTeacher) {
        // Load all students
        const studentsRes = await usersAPI.getUsersByRole('student');
        const students = studentsRes.data?.users || [];
        
        // Load activity for each student and combine with student data
        const studentsWithRewards = await Promise.all(
          students.map(async (student) => {
            try {
              // Try to fetch activity for this student
              const activityRes = await gamificationAPI.getUserStats(student._id);
              const studentActivity = activityRes.data?.recentActivity || [];
              
              return {
                id: student._id,
                studentName: `${student.firstName} ${student.lastName}`,
                studentId: student.studentId || student.email,
                email: student.email,
                level: student.level || 1,
                totalXP: student.xp || 0,
                recentRewards: studentActivity.slice(0, 3), // Get last 3 activities
              };
            } catch (err) {
              // If no activity found, return student with empty activity
              return {
                id: student._id,
                studentName: `${student.firstName} ${student.lastName}`,
                studentId: student.studentId || student.email,
                email: student.email,
                level: student.level || 1,
                totalXP: student.xp || 0,
                recentRewards: [],
              };
            }
          })
        );
        
        setStudentRewards(studentsWithRewards);
      } else {
        // Load student's own activity
        const activityRes = await gamificationAPI.getActivity();
        setRecentActivity(activityRes.data?.recentActivity || []);
      }
    } catch (e) {
      console.error('Failed to load activity', e);
      toast.error('Failed to load rewards data');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    load();
  }, [isTeacher]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Rewards data refreshed!');
  };

  const getFilteredAndSortedStudents = () => {
    let filtered = [...studentRewards];
    
    // Sort
    if (sortBy === 'xp') {
      filtered.sort((a, b) => b.totalXP - a.totalXP);
    } else {
      // Sort by most recent activity
      filtered.sort((a, b) => {
        const aTime = new Date(a.recentRewards[0]?.timestamp || 0);
        const bTime = new Date(b.recentRewards[0]?.timestamp || 0);
        return bTime - aTime;
      });
    }
    
    return filtered;
  };

  // Teacher View
  if (isTeacher) {
    const sortedStudents = getFilteredAndSortedStudents();
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <TrophyIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Rewards</h1>
              <p className="text-gray-600">Track student achievements and XP earnings</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </Button>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 rounded-full border border-orange-200">
              <span className="text-sm font-semibold text-orange-700">
                {sortedStudents.length} Active Students
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="card shadow-lg">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSortBy('recent')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      sortBy === 'recent'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Recent Activity
                  </button>
                  <button
                    onClick={() => setSortBy('xp')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      sortBy === 'xp'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Total XP
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Showing {sortedStudents.length} students
              </div>
            </div>
          </div>
        </div>

        {/* Student Rewards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-600">Loading student rewards...</p>
            </div>
          ) : sortedStudents.length === 0 ? (
            <div className="col-span-2 py-12 text-center">
              <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No student activity yet</h3>
              <p className="text-gray-600">Student rewards will appear here as they complete assignments and quizzes.</p>
            </div>
          ) : (
            sortedStudents.map((student) => (
              <Card key={student.id} className="shadow-lg hover:shadow-xl transition-all">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {student.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{student.studentName}</h3>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-orange-600">
                        <StarIcon className="h-5 w-5" />
                        <span className="text-xl font-bold">Level {student.level}</span>
                      </div>
                      <div className="text-sm text-gray-600">{student.totalXP} XP</div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                    <TrophyIcon className="h-4 w-4" />
                    <span>Recent Rewards</span>
                  </h4>
                  {student.recentRewards.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="text-4xl mb-2">📚</div>
                      <p className="text-sm text-gray-500">No recent activity</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Rewards will appear when student completes assignments or quizzes
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {student.recentRewards.map((reward, idx) => {
                        let bgColor = 'bg-blue-50';
                        let icon = '📚';
                        let textColor = 'text-blue-700';
                        
                        if (reward.action === 'assignment_submission') {
                          bgColor = 'bg-green-50';
                          icon = '📝';
                          textColor = 'text-green-700';
                        } else if (reward.action === 'quiz_completion') {
                          bgColor = 'bg-purple-50';
                          icon = '🧠';
                          textColor = 'text-purple-700';
                        } else if (reward.action === 'xp_earned') {
                          bgColor = 'bg-yellow-50';
                          icon = '⭐';
                          textColor = 'text-orange-700';
                        }

                        return (
                          <div key={idx} className={`${bgColor} rounded-lg p-3 border border-gray-200`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{icon}</span>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {reward.description}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(reward.timestamp).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className={`${textColor} font-bold flex items-center space-x-1`}>
                                <span>+{reward.xp}</span>
                                <span className="text-xs">XP</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* View Student Details Link */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link to={`/admin/students`} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center space-x-1 transition-colors">
                      <span>View Student Details</span>
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {sortedStudents.reduce((sum, s) => sum + s.totalXP, 0)}
                  </div>
                  <div className="text-blue-100 mt-1">Total XP Earned</div>
                </div>
                <ChartBarIcon className="h-12 w-12 text-blue-200" />
              </div>
            </CardBody>
          </Card>
          
          <Card className="shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {(sortedStudents.reduce((sum, s) => sum + s.level, 0) / sortedStudents.length).toFixed(1)}
                  </div>
                  <div className="text-purple-100 mt-1">Average Level</div>
                </div>
                <StarIcon className="h-12 w-12 text-purple-200" />
              </div>
            </CardBody>
          </Card>
          
          <Card className="shadow-lg bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">
                    {sortedStudents.reduce((sum, s) => sum + s.recentRewards.length, 0)}
                  </div>
                  <div className="text-yellow-100 mt-1">Recent Activities</div>
                </div>
                <TrophyIcon className="h-12 w-12 text-yellow-200" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Student View (original)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center animate-pulse">
            <TrophyIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Rewards & Activity</h1>
            <p className="text-gray-600">Track your XP earnings and achievements</p>
          </div>
        </div>
        {user && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-3 rounded-xl border border-orange-200 shadow-sm">
            <div className="flex items-center space-x-2">
              <StarIcon className="h-6 w-6 text-orange-600" />
              <div>
                <div className="text-xs text-gray-600">Your Level</div>
                <div className="text-2xl font-bold text-orange-600">Level {user.level || 1}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardTitle className="flex items-center space-x-2">
            <TrophyIcon className="h-6 w-6 text-orange-600" />
            <span>🎉 Recent Rewards & Activity</span>
          </CardTitle>
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
                    className={`${bgColor} rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`${iconBg} w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                          {icon}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.description || item.action}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      {item.xp !== undefined && (
                        <div className={`${textColor} font-bold text-xl flex items-center space-x-1 bg-white px-4 py-2 rounded-full shadow-sm`}>
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
