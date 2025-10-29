import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { announcementsAPI } from '../../services/api';
import api from '../../services/api';
import { 
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { IconButton } from '../UI/Button';

const Header = ({ onMenuClick }) => {
  const { user, logout, getFullName, getAvatar } = useAuth();
  const { connected, on: socketOn, off: socketOff } = useSocket();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const handleLogout = async () => {
    await logout();
  };

  // Listen for socket events and add notifications
  useEffect(() => {
    const onMsg = (message) => {
      // Don't notify for messages sent by self
      if (message?.sender?._id === user?.id) return;
      setNotifications(prev => [
        {
          id: `msg-${message._id}`,
          type: 'message',
          title: `New message from ${message.sender.firstName} ${message.sender.lastName}`,
          time: new Date().toISOString(),
          read: false,
          link: '/messages',
        },
        ...prev,
      ].slice(0, 20));
    };

    const onAnn = (a) => {
      setNotifications(prev => [
        {
          id: `ann-${a._id}`,
          type: 'announcement',
          title: `New announcement: ${a.title}`,
          time: new Date().toISOString(),
          read: false,
          link: '/announcements',
        },
        ...prev,
      ].slice(0, 20));
    };

    socketOn('new-message', onMsg);
    socketOn('new-announcement', onAnn);
    return () => {
      socketOff('new-message', onMsg);
      socketOff('new-announcement', onAnn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // Seed initial notifications from API (recent announcements + unread messages)
  useEffect(() => {
    const seed = async () => {
      try {
        // Get recent announcements
        const annRes = await announcementsAPI.getAnnouncements({ limit: 5 });
        const anns = (annRes.data.announcements || []).map(a => {
          const viewed = (a.views || []).some(v => {
            const uid = v.user?._id || v.user;
            return uid === user?.id;
          });
          return {
            id: `ann-${a._id}`,
            type: 'announcement',
            title: `Announcement: ${a.title}`,
            time: a.publishDate || a.createdAt,
            read: viewed,
            link: '/announcements',
          };
        });

        // Get recent messages and mark those addressed to me and unread
        const msgRes = await api.get('/messages', { params: { limit: 10 } });
        const msgs = (msgRes.data.messages || [])
          .filter(m => (m.recipient?._id === user?.id) )
          .map(m => ({
            id: `msg-${m._id}`,
            type: 'message',
            title: `New message from ${m.sender?.firstName} ${m.sender?.lastName}`,
            time: m.createdAt,
            read: !!m.isRead,
            link: '/messages',
          }));

        // Merge, sort by time desc, cap 20
        const merged = [...anns, ...msgs].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0,20);
        setNotifications(merged);
      } catch (e) {
        // ignore
      }
    };
    if (user) seed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <header className="header">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses, assignments..."
              className="form-input pl-10 w-64"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Socket status indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-danger-500'}`}></div>
            <span className="text-xs text-gray-500 hidden sm:block">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <IconButton
              icon={<BellIcon className="h-5 w-5" />}
              variant="ghost"
              onClick={() => setShowNotifications(!showNotifications)}
            />
            
            {/* Notification badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex min-w-[18px] h-5 px-1.5 items-center justify-center rounded-full bg-danger-500 text-white text-xs font-semibold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No new notifications</div>
                  ) : (
                    <ul className="divide-y">
                      {notifications.map((n) => (
                        <li key={n.id} className={`p-3 hover:bg-gray-50 ${n.read ? 'opacity-80' : ''}`}>
                          <a href={n.link} onClick={() => setNotifications(prev => prev.map(x => x.id===n.id?{...x, read:true}:x))} className="block">
                            <div className="text-sm font-medium text-gray-900">{n.title}</div>
                            <div className="text-xs text-gray-500">{new Date(n.time).toLocaleString()}</div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <button onClick={markAllRead} className="text-sm text-gray-600 hover:text-gray-800">Mark all as read</button>
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {getFullName()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email}
                    </p>
                  </div>
                  
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserCircleIcon className="inline w-4 h-4 mr-2" />
                    Profile
                  </a>
                  
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </a>
                  
                  <div className="border-t border-gray-200"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
