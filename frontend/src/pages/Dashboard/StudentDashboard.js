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
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-2xl border border-primary-400/20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center space-x-2">
                <span>Welcome back, {user?.firstName}!</span>
                <span className="animate-bounce">👋</span>
              </h1>
              <p className="text-primary-100 text-lg">
                Ready to continue your learning journey? Let's make today productive!
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-right border border-white/20">
                <div className="text-3xl font-bold">Level {stats.level}</div>
                <div className="text-primary-100 flex items-center justify-end space-x-1">
                  <TrophyIcon className="h-5 w-5" />
                  <span>{stats.totalXP} XP</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="font-medium">Progress to Level {stats.level + 1}</span>
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold">{xpToNextLevel} XP to go</span>
            </div>
            <div className="w-full bg-primary-900/50 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Enrolled Courses"
            value={stats.enrolledCourses}
            icon={<AcademicCapIcon className="h-8 w-8" />}
            iconColor="primary"
            change="+2 this month"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Assignments Completed"
            value={stats.completedAssignments}
            icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
            iconColor="accent"
            change="+3 this week"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Quizzes Taken"
            value={stats.takenQuizzes}
            icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
            iconColor="info"
            change="+1 today"
            changeType="positive"
          />
        </div>
        <div className="transform transition-all hover:scale-105 hover:shadow-xl">
          <StatCard
            title="Total XP"
            value={stats.totalXP}
            icon={<TrophyIcon className="h-8 w-8" />}
            iconColor="warning"
            change="+50 today"
            changeType="positive"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <div className="card shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-header bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                  <span>My Courses</span>
                </h2>
                <Link to="/my-courses">
                  <Button variant="outline" size="sm" className="hover:bg-primary-50">View All</Button>
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="transform transition-all hover:scale-105">
                    <CourseCard
                      course={course}
                      onView={(course) => console.log('View course:', course)}
                      onEnroll={(course) => console.log('Enroll in course:', course)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Assignments */}
        <div>
          <div className="card shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-header bg-gradient-to-r from-orange-50 to-red-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <ClipboardDocumentListIcon className="h-6 w-6 text-orange-600" />
                <span>Upcoming Assignments</span>
              </h2>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {upcomingAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-all hover:border-orange-200">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{assignment.course}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                          Due: {assignment.dueDate}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {assignment.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link to="/assignments">
                  <Button variant="outline" size="sm" fullWidth className="hover:bg-orange-50">
                    View All Assignments
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card shadow-lg hover:shadow-xl transition-shadow">
        <div className="card-header bg-gradient-to-r from-purple-50 to-pink-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
            <span>Quick Actions</span>
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/quizzes" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="Take Quiz"
                description="Test your knowledge with interactive quizzes"
                icon={<QuestionMarkCircleIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/leaderboard" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="View Leaderboard"
                description="See how you rank among your peers"
                icon={<TrophyIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/analytics" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="Check Analytics"
                description="Track your learning progress and performance"
                icon={<ChartBarIcon className="h-8 w-8" />}
              />
            </Link>
            <Link to="/ai-assistant" className="transform transition-all hover:scale-105">
              <FeatureCard
                title="AI Assistant"
                description="Get help from our smart learning assistant"
                icon={<SparklesIcon className="h-8 w-8" />}
              />
            </Link>
          </div>
        </div>
      </div>


    </div>
  );
};

export default StudentDashboard;
