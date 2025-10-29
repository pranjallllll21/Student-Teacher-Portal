import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, FeatureCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({
    childrenCount: 0,
    enrolledCourses: 0,
    completedAssignments: 0,
    averageGrade: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      setTimeout(() => {
        setChildren([
          {
            id: 1,
            name: 'Alex Smith',
            studentId: 'S001',
            grade: 'Sophomore',
            xp: 450,
            level: 3,
            courses: 3,
            assignments: 8,
            averageGrade: 85,
          },
        ]);

        setStats({
          childrenCount: 1,
          enrolledCourses: 3,
          completedAssignments: 8,
          averageGrade: 85,
        });

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
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👨‍👩‍👧‍👦
            </h1>
            <p className="text-green-100">
              Stay connected with your child's educational journey and track their progress.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.childrenCount} Child</div>
              <div className="text-green-100">{stats.enrolledCourses} Courses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Children"
          value={stats.childrenCount}
          icon={<UserGroupIcon className="h-8 w-8" />}
        />
        <StatCard
          title="Enrolled Courses"
          value={stats.enrolledCourses}
          icon={<AcademicCapIcon className="h-8 w-8" />}
        />
        <StatCard
          title="Completed Assignments"
          value={stats.completedAssignments}
          icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
        />
        <StatCard
          title="Average Grade"
          value={`${stats.averageGrade}%`}
          icon={<ChartBarIcon className="h-8 w-8" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Children Overview */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Children Overview</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {children.map((child) => (
                  <div key={child.id} className="p-6 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-primary-600">
                            {child.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                          <p className="text-sm text-gray-600">Student ID: {child.studentId}</p>
                          <p className="text-sm text-gray-600">Grade: {child.grade}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="level-badge">Level {child.level}</div>
                        <div className="xp-badge mt-2">⭐ {child.xp} XP</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{child.courses}</div>
                        <div className="text-sm text-gray-600">Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{child.assignments}</div>
                        <div className="text-sm text-gray-600">Assignments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{child.averageGrade}%</div>
                        <div className="text-sm text-gray-600">Average</div>
                      </div>
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
                <Link to="/courses">
                  <Button variant="primary" fullWidth className="justify-start">
                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                    View Courses
                  </Button>
                </Link>
                <Link to="/assignments">
                  <Button variant="outline" fullWidth className="justify-start">
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                    View Assignments
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline" fullWidth className="justify-start">
                    <TrophyIcon className="h-4 w-4 mr-2" />
                    View Leaderboard
                  </Button>
                </Link>
                <Link to="/messages">
                  <Button variant="outline" fullWidth className="justify-start">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    Contact Teachers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Tools Grid */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Parent Tools</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              title="Progress Tracking"
              description="Monitor your child's academic progress"
              icon={<ChartBarIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="Course Overview"
              description="View enrolled courses and curriculum"
              icon={<AcademicCapIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="Assignment Status"
              description="Track assignment completion and grades"
              icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="Teacher Communication"
              description="Connect with teachers and staff"
              icon={<UserGroupIcon className="h-8 w-8" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
