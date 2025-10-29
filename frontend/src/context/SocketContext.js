import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token && !socketRef.current) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      });

      socketRef.current = newSocket;

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        setSocket(newSocket);
        
        // Join user-specific room
        if (user && user.id) {
          newSocket.emit('join-room', `user-${user.id}`);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      // Message event handlers
      newSocket.on('new-message', (message) => {
        // Show notification for new messages (except from current user)
        if (message.sender._id !== user.id) {
          toast.success(`New message from ${message.sender.firstName} ${message.sender.lastName}`);
        }
      });

      newSocket.on('new-announcement', (announcement) => {
        // Show notification for new announcements
        toast.success(`New announcement: ${announcement.title}`, {
          duration: 6000,
        });
      });

      newSocket.on('assignment-graded', (data) => {
        // Show notification when assignment is graded
        toast.success(`Assignment "${data.assignment.title}" has been graded!`);
      });

      newSocket.on('quiz-available', (data) => {
        // Show notification when new quiz is available
        toast.success(`New quiz available: ${data.quiz.title}`);
      });

      newSocket.on('xp-gained', (data) => {
        // Show XP gain notification
        toast.success(`+${data.xp} XP gained!`, {
          icon: '⭐',
          duration: 3000,
        });
      });

      newSocket.on('level-up', (data) => {
        // Show level up notification
        toast.success(`Level Up! You're now level ${data.newLevel}!`, {
          icon: '🎉',
          duration: 5000,
        });
      });

      newSocket.on('badge-earned', (data) => {
        // Show badge earned notification
        toast.success(`Badge earned: ${data.badge.name}!`, {
          icon: '🏆',
          duration: 5000,
        });
      });

      newSocket.on('new-attendance-session', (data) => {
        // Show notification for new attendance session
        toast.success(data.message, {
          icon: '📋',
          duration: 6000,
        });
      });

      // Cleanup on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }
        setSocket(null);
        setConnected(false);
      };
    } else {
      // Disconnect socket if user logs out
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  // Join room function
  const joinRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('join-room', roomId);
    }
  };

  // Leave room function
  const leaveRoom = (roomId) => {
    if (socket && connected) {
      socket.emit('leave-room', roomId);
    }
  };

  // Send message function
  const sendMessage = (messageData) => {
    if (socket && connected) {
      socket.emit('send-message', messageData);
    }
  };

  // Emit custom event
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  // Listen to custom event
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  // Remove event listener
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
    sendMessage,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
