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
      <div className="bg-gradient-to-r from-secondary-500 via-secondary-600 to-secondary-700 rounded-lg p-6 text-white shadow-xl border border-secondary-400/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👨‍🏫
            </h1>
            <p className="text-secondary-100">
              Ready to inspire and educate? Let's make today's learning experience amazing!
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.myCourses} Courses</div>
              <div className="text-secondary-100">{stats.totalStudents} Students</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Courses"
          value={stats.myCourses}
          icon={<AcademicCapIcon className="h-8 w-8" />}
          change="+1 this month"
          changeType="positive"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<UserGroupIcon className="h-8 w-8" />}
          change="+5 this week"
          changeType="positive"
        />
        <StatCard
          title="Assignments Created"
          value={stats.assignmentsCreated}
          icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
          change="+2 this week"
          changeType="positive"
        />
        <StatCard
          title="Quizzes Created"
          value={stats.quizzesCreated}
          icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
          change="+1 this week"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        {activity.type === 'assignment' ? (
                          <ClipboardDocumentListIcon className="h-5 w-5 text-primary-600" />
                        ) : (
                          <QuestionMarkCircleIcon className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.course}</p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.type === 'assignment' ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.graded}/{activity.submissions} graded
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round((activity.graded / activity.submissions) * 100)}% complete
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {activity.attempts} attempts
                          </div>
                          <div className="text-xs text-gray-500">
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
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <Link to="/assignments/create">
                  <Button variant="primary" fullWidth className="justify-start">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </Link>
                <Link to="/quizzes/create">
                  <Button variant="outline" fullWidth className="justify-start">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Quiz
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button variant="outline" fullWidth className="justify-start">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    Manage Courses
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" fullWidth className="justify-start">
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
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Teaching Tools</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              title="Create Assignment"
              description="Design engaging assignments for your students"
              icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="Build Quiz"
              description="Create interactive quizzes with auto-grading"
              icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="Student Analytics"
              description="Track student progress and performance"
              icon={<ChartBarIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="Course Management"
              description="Organize and manage your courses"
              icon={<AcademicCapIcon className="h-8 w-8" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
