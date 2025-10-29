import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, FeatureCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myCourses: 0,
    totalStudents: 0,
    assignmentsCreated: 0,
    quizzesCreated: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        setStats({
          myCourses: 3,
          totalStudents: 45,
          assignmentsCreated: 12,
          quizzesCreated: 8,
        });

        setRecentActivity([
          {
            id: 1,
            type: 'assignment',
            title: 'HTML Portfolio Project',
            course: 'Web Development Fundamentals',
            date: '2024-01-15',
            submissions: 18,
            graded: 15,
          },
          {
            id: 2,
            type: 'quiz',
            title: 'JavaScript Basics Quiz',
            course: 'Web Development Fundamentals',
            date: '2024-01-14',
            attempts: 25,
            average: 85,
          },
        ]);

        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-secondary-500 via-secondary-600 to-secondary-700 rounded-2xl p-8 text-white shadow-2xl border border-secondary-400/20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
                <span>Welcome back, {user?.firstName}!</span>
                <span className="animate-bounce">👨‍🏫</span>
              </h1>
              <p className="text-secondary-100 text-lg">
                Ready to inspire and educate? Let's make today's learning experience amazing!
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-right border border-white/20">
                <div className="text-3xl font-bold">{stats.myCourses} Courses</div>
                <div className="text-secondary-100 flex items-center justify-end space-x-1">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>{stats.totalStudents} Students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="My Courses"
            value={stats.myCourses}
            icon={<AcademicCapIcon className="h-8 w-8" />}
            change="+1 this month"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<UserGroupIcon className="h-8 w-8" />}
            change="+5 this week"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Assignments Created"
            value={stats.assignmentsCreated}
            icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
            change="+2 this week"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Quizzes Created"
            value={stats.quizzesCreated}
            icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
            change="+1 this week"
            changeType="positive"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-header bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
                <span>Recent Activity</span>
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition-all hover:border-purple-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${activity.type === 'assignment' ? 'bg-blue-100' : 'bg-green-100'} rounded-xl flex items-center justify-center`}>
                        {activity.type === 'assignment' ? (
                          <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                        ) : (
                          <QuestionMarkCircleIcon className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.course}</p>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full mt-1 inline-block">
                          {activity.date}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.type === 'assignment' ? (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {activity.graded}/{activity.submissions} graded
                          </div>
                          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-1 inline-block">
                            {Math.round((activity.graded / activity.submissions) * 100)}% complete
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {activity.attempts} attempts
                          </div>
                          <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-1 inline-block">
                            Avg: {activity.average}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="card shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-header bg-gradient-to-r from-green-50 to-emerald-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <PlusIcon className="h-6 w-6 text-green-600" />
                <span>Quick Actions</span>
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <Link to="/assignments/create">
                  <Button variant="primary" fullWidth className="justify-start hover:shadow-md transition-all">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </Link>
                <Link to="/quizzes/create">
                  <Button variant="outline" fullWidth className="justify-start hover:bg-purple-50 hover:border-purple-300 transition-all">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" fullWidth className="justify-start hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    Manage Courses
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" fullWidth className="justify-start hover:bg-green-50 hover:border-green-300 transition-all">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="card shadow-lg hover:shadow-xl transition-shadow">
        <div className="card-header bg-gradient-to-r from-orange-50 to-yellow-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <AcademicCapIcon className="h-6 w-6 text-orange-600" />
            <span>Teaching Tools</span>
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/assignments/create" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="Create Assignment"
                description="Design engaging assignments for your students"
                icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/quizzes/create" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="Build Quiz"
                description="Create interactive quizzes with auto-grading"
                icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/analytics" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="Student Analytics"
                description="Track student progress and performance"
                icon={<ChartBarIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/courses" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="Course Management"
                description="Organize and manage your courses"
                icon={<AcademicCapIcon className="h-8 w-8" />}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
