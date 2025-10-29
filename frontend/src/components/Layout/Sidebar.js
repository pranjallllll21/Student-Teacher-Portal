import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { messagesAPI, announcementsAPI } from '../../services/api';
import { 
  HomeIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasAnyRole } = useAuth();
  const { on: socketOn, off: socketOff } = useSocket();
  const location = useLocation();
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadAnnCount, setUnreadAnnCount] = useState(0);

  // Fetch unread count
  const fetchUnread = async () => {
    try {
      const [msgRes, annRes] = await Promise.all([
        messagesAPI.getUnreadCount(),
        announcementsAPI.getUnreadCount(),
      ]);
      setUnreadMsgCount(msgRes.data.unreadCount || 0);
      setUnreadAnnCount(annRes.data.unreadCount || 0);
    } catch (e) {
      // Silent fail; errors are already toasted by interceptor
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUnread();
    // Refetch when route changes (e.g., after opening a conversation)
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // When navigating to messages or away, refresh unread count
    fetchUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Listen for custom refresh events from the Messages page
  useEffect(() => {
    const refreshHandler = () => fetchUnread();
    window.addEventListener('messages:refreshUnread', refreshHandler);
    window.addEventListener('announcements:refreshUnread', refreshHandler);
    return () => {
      window.removeEventListener('messages:refreshUnread', refreshHandler);
      window.removeEventListener('announcements:refreshUnread', refreshHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for real-time events and refresh counts
  useEffect(() => {
    const handler = (message) => {
      const recipientId = message?.recipient?._id || message?.recipient?.id;
      if (recipientId && user && (recipientId === user.id)) {
        fetchUnread();
      }
    };
    socketOn('new-message', handler);
    const annHandler = () => fetchUnread();
    socketOn('new-announcement', annHandler);
    return () => {
      socketOff('new-message', handler);
      socketOff('new-announcement', annHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Role-based color theming
  const getRoleColor = (role) => {
    switch (role) {
      case 'student':
        return 'primary'; // Blue
      case 'teacher':
        return 'secondary'; // Purple
      case 'admin':
        return 'success'; // Green
      default:
        return 'primary';
    }
  };

  const roleColor = getRoleColor(user?.role);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      roles: ['student', 'teacher', 'admin'],
    },
    {
      name: 'Courses',
      href: '/courses',
      icon: AcademicCapIcon,
      roles: ['student', 'teacher', 'admin'],
    },
    {
      name: 'My Courses',
      href: '/my-courses',
      icon: AcademicCapIcon,
      roles: ['student', 'teacher', 'admin'],
    },
    {
      name: 'Assignments',
      href: '/assignments',
      icon: ClipboardDocumentListIcon,
      roles: ['student', 'teacher', 'admin'],
    },
    {
      name: 'Quizzes',
      href: '/quizzes',
      icon: QuestionMarkCircleIcon,
      roles: ['student', 'teacher', 'admin'],
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: TrophyIcon,
      roles: ['student', 'teacher', 'admin'],
    },

    {
      name: 'Rewards',
      href: '/rewards',
      icon: TrophyIcon,
      roles: ['student', 'teacher', 'admin'],
    },
    {
      name: 'Announcements',
      href: '/announcements',
      icon: MegaphoneIcon,
      roles: ['student', 'teacher', 'admin'],
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: ClipboardDocumentListIcon,
      roles: ['teacher', 'student'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: UserGroupIcon,
      roles: ['admin'],
    },
  ];
  // Admin-specific navigation items (requested)
  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/admin-dashboard',
      icon: HomeIcon,
      roles: ['admin'],
    },
    {
      name: 'Student Management',
      href: '/admin/students',
      icon: UserIcon,
      roles: ['admin'],
    },
    {
      name: 'Teacher Management',
      href: '/admin/teachers',
      icon: UserGroupIcon,
      roles: ['admin'],
    },
    {
      name: 'Course Progress',
      href: '/admin/course-progress',
      icon: ChartBarIcon,
      roles: ['admin'],
    },
    {
      name: 'Attendance & Grades',
      href: '/admin/attendance-grades',
      icon: ClipboardDocumentListIcon,
      roles: ['admin'],
    },
  ];

  const profileNavigation = [
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      roles: ['student', 'teacher'],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
      roles: ['student', 'teacher'],
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    hasAnyRole(item.roles)
  );

  // If admin, prefer the adminNavigation defined above (requested simplified admin menu)
  const finalNavigation = user?.role === 'admin'
    ? adminNavigation.filter(item => hasAnyRole(item.roles))
    : filteredNavigation;

  // No future tech section shown anymore per request
  // Future tech removed

  const filteredProfile = profileNavigation.filter(item => 
    hasAnyRole(item.roles)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 bg-gradient-to-r from-${roleColor}-500 to-${roleColor}-600 rounded-lg flex items-center justify-center shadow-sm`}>
                <span className="text-xs font-bold text-white">
                  {user?.role === 'student' ? '📚' : user?.role === 'teacher' ? '👨‍🏫' : '⚙️'}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">Portal</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r from-${roleColor}-500 to-${roleColor}-600 rounded-full flex items-center justify-center`}>
                <span className="text-sm font-bold text-white">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            
            {/* XP and Level */}
            {(user?.role === 'student' || user?.role === 'teacher') && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Level {user?.level || 1}</span>
                  <div className={`inline-flex items-center px-2 py-1 rounded-lg bg-${roleColor}-100 text-${roleColor}-800 text-sm font-medium`}>
                    ⭐ {user?.xp || 0} XP
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {finalNavigation.map((item) => {
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => `
                      flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                      ${isActive 
                        ? `bg-${roleColor}-100 text-${roleColor}-700 border-r-2 border-${roleColor}-500 font-semibold` 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                    onClick={onClose}
                  >
                    <div className="relative flex items-center">
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      <span>{item.name}</span>
                      {item.name === 'Messages' && unreadMsgCount > 0 && (
                        <span
                          title={`${unreadMsgCount} unread`}
                          className="ml-2 inline-flex min-w-[18px] h-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold"
                        >
                          {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                        </span>
                      )}
                      {item.name === 'Announcements' && unreadAnnCount > 0 && (
                        <span
                          title={`${unreadAnnCount} new`}
                          className="ml-2 inline-flex min-w-[18px] h-5 px-1.5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold"
                        >
                          {unreadAnnCount > 99 ? '99+' : unreadAnnCount}
                        </span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Future Tech removed per request */}

            {/* Profile Section - Only for students and teachers, NOT admin */}
            {user?.role !== 'admin' && (
              <div className="pt-6">
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </h3>
                </div>
                <div className="space-y-1">
                  {filteredProfile.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive: active }) => `
                        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                        ${active 
                          ? `bg-${roleColor}-100 text-${roleColor}-700 border-r-2 border-${roleColor}-500 font-semibold` 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                      onClick={onClose}
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
