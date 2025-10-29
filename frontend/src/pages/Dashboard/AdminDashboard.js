import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, FeatureCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        setStats({
          totalUsers: 156,
          totalCourses: 12,
          totalAssignments: 45,
          totalQuizzes: 28,
        });

        setRecentUsers([
          {
            id: 1,
            name: 'Alex Smith',
            email: 'alex.smith@demo.com',
            role: 'student',
            joinedAt: '2024-01-15',
            status: 'active',
          },
          {
            id: 2,
            name: 'Emma Wilson',
            email: 'emma.wilson@demo.com',
            role: 'student',
            joinedAt: '2024-01-14',
            status: 'active',
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
      <div className="bg-gradient-to-r from-success-500 via-success-600 to-success-700 rounded-lg p-6 text-white shadow-xl border border-success-400/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👨‍💼
            </h1>
            <p className="text-gray-300">
              Manage your educational platform and ensure smooth operations for all users.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalUsers} Users</div>
              <div className="text-gray-300">{stats.totalCourses} Courses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<UserGroupIcon className="h-8 w-8" />}
          change="+12 this month"
          changeType="positive"
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<AcademicCapIcon className="h-8 w-8" />}
          change="+2 this month"
          changeType="positive"
        />
        <StatCard
          title="Total Assignments"
          value={stats.totalAssignments}
          icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
          change="+8 this month"
          changeType="positive"
        />
        <StatCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
          change="+5 this month"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                <Link to="/users">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Joined: {user.joinedAt}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                        {user.status}
                      </span>
                      <p className="text-xs text-gray-500 capitalize mt-1">{user.role}</p>
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
                <Link to="/admin/students">
                  <Button variant="primary" fullWidth className="justify-start">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Student Management
                  </Button>
                </Link>
                <Link to="/admin/teachers">
                  <Button variant="outline" fullWidth className="justify-start">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    Teacher Management
                  </Button>
                </Link>
                <Link to="/admin/course-progress">
                  <Button variant="outline" fullWidth className="justify-start">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Track Course Progress
                  </Button>
                </Link>
                <Link to="/admin/attendance-grades">
                  <Button variant="outline" fullWidth className="justify-start">
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                    Attendance & Grades
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tools Grid */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Administrative Tools</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              title="User Management"
              description="Manage users, roles, and permissions"
              icon={<UserGroupIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="System Analytics"
              description="Monitor platform performance and usage"
              icon={<ChartBarIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="Security Settings"
              description="Configure security and access controls"
              icon={<ShieldCheckIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="System Configuration"
              description="Manage system settings and preferences"
              icon={<Cog6ToothIcon className="h-8 w-8" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
