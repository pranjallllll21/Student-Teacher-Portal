import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { StatCard, CourseCard, FeatureCard } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedAssignments: 0,
    takenQuizzes: 0,
    totalXP: user?.xp || 0,
    level: user?.level || 1,
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setStats({
          enrolledCourses: 3,
          completedAssignments: 8,
          takenQuizzes: 5,
          totalXP: user?.xp || 450,
          level: user?.level || 3,
        });

        setRecentCourses([
          {
            id: 1,
            title: 'Web Development Fundamentals',
            description: 'Learn HTML, CSS, and JavaScript basics',
            instructor: { firstName: 'Dr. Sarah', lastName: 'Johnson' },
            level: 'beginner',
            credits: 3,
            enrollmentCount: 25,
            maxStudents: 30,
          },
          {
            id: 2,
            title: 'Advanced Mathematics',
            description: 'Calculus and linear algebra concepts',
            instructor: { firstName: 'Prof. Michael', lastName: 'Chen' },
            level: 'intermediate',
            credits: 4,
            enrollmentCount: 18,
            maxStudents: 25,
          },
        ]);

        setUpcomingAssignments([
          {
            id: 1,
            title: 'HTML Portfolio Project',
            course: 'Web Development Fundamentals',
            dueDate: '2024-01-20',
            points: 100,
          },
          {
            id: 2,
            title: 'Calculus Problem Set 3',
            course: 'Advanced Mathematics',
            dueDate: '2024-01-22',
            points: 80,
          },
        ]);

        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, [user]);

  const xpToNextLevel = Math.pow(stats.level + 1, 2) * 100 - stats.totalXP;
  const xpProgress = (stats.totalXP / (Math.pow(stats.level + 1, 2) * 100)) * 100;

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
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-lg p-6 text-white shadow-xl border border-primary-400/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-primary-100">
              Ready to continue your learning journey? Let's make today productive!
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-2xl font-bold">Level {stats.level}</div>
              <div className="text-primary-100">⭐ {stats.totalXP} XP</div>
            </div>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress to Level {stats.level + 1}</span>
            <span>{xpToNextLevel} XP to go</span>
          </div>
          <div className="w-full bg-primary-800 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Enrolled Courses"
          value={stats.enrolledCourses}
          icon={<AcademicCapIcon className="h-8 w-8" />}
          iconColor="primary"
          change="+2 this month"
          changeType="positive"
        />
        <StatCard
          title="Assignments Completed"
          value={stats.completedAssignments}
          icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
          iconColor="accent"
          change="+3 this week"
          changeType="positive"
        />
        <StatCard
          title="Quizzes Taken"
          value={stats.takenQuizzes}
          icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
          iconColor="info"
          change="+1 today"
          changeType="positive"
        />
        <StatCard
          title="Total XP"
          value={stats.totalXP}
          icon={<TrophyIcon className="h-8 w-8" />}
          iconColor="warning"
          change="+50 today"
          changeType="positive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                <Link to="/my-courses">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onView={(course) => console.log('View course:', course)}
                    onEnroll={(course) => console.log('Enroll in course:', course)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-600">{assignment.course}</p>
                      <p className="text-xs text-gray-500">Due: {assignment.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{assignment.points} pts</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/assignments">
                  <Button variant="outline" size="sm" fullWidth>
                    View All Assignments
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              title="Take Quiz"
              description="Test your knowledge with interactive quizzes"
              icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="View Leaderboard"
              description="See how you rank among your peers"
              icon={<TrophyIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="Check Analytics"
              description="Track your learning progress and performance"
              icon={<ChartBarIcon className="h-8 w-8" />}
            />
            <FeatureCard
              title="AI Assistant"
              description="Get help from our smart learning assistant"
              icon={<SparklesIcon className="h-8 w-8" />}
            />
          </div>
        </div>
      </div>


    </div>
  );
};

export default StudentDashboard;
