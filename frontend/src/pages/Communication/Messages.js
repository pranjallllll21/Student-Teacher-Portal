import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';

const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
    if (user?.role === 'student') {
      fetchTeachers();
    }
  }, [user]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (message) => {
      // If message is from/to selected user, add it to messages
      if (selectedUser && 
          (message.sender._id === selectedUser._id || message.recipient._id === selectedUser._id)) {
        setMessages(prev => [...prev, message]);
      }
      // Refresh conversations
      fetchConversations();
    });

    return () => {
      socket.off('new-message');
    };
  }, [socket, selectedUser]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      setConversations(res.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/users/teachers');
      setTeachers(res.data.users || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const loadConversation = async (userId) => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/conversation/${userId}`);
      setMessages(res.data.messages);
      // Notify others (e.g., Sidebar) to refresh unread count since these were marked read
      try { window.dispatchEvent(new Event('messages:refreshUnread')); } catch (e) {}
      
      // Find user details
      const conv = conversations.find(c => c.user._id === userId);
      if (conv) {
        setSelectedUser(conv.user);
      } else if (user?.role === 'student') {
        const teacher = teachers.find(t => t._id === userId);
        if (teacher) setSelectedUser(teacher);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await api.post('/messages', {
        recipient: selectedUser._id,
        content: newMessage,
        type: 'text'
      });
      
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');
      fetchConversations(); // Update conversation list
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInHours = (now - d) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">
          {user?.role === 'student' ? 'Send messages to your teachers' : 'Reply to student messages'}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6" style={{ height: '70vh' }}>
        {/* Conversations List */}
        <div className="col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>
                {user?.role === 'student' ? 'Teachers' : 'Conversations'}
              </CardTitle>
            </CardHeader>
            <CardBody className="flex-1 overflow-y-auto p-0">
              {/* For students: show all teachers */}
              {user?.role === 'student' && teachers.map(teacher => (
                <div
                  key={teacher._id}
                  onClick={() => loadConversation(teacher._id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedUser?._id === teacher._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{teacher.email}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* For teachers: show conversations with students */}
              {user?.role === 'teacher' && conversations.map(conv => (
                <div
                  key={conv.user._id}
                  onClick={() => loadConversation(conv.user._id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedUser?._id === conv.user._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                      {conv.user.firstName?.[0]}{conv.user.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">
                          {conv.user.firstName} {conv.user.lastName}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTime(conv.lastMessage.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {conversations.length === 0 && user?.role === 'teacher' && (
                <div className="p-8 text-center text-gray-500">
                  <p>No messages yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="col-span-8">
          <Card className="h-full flex flex-col">
            {selectedUser ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                    </div>
                    <div>
                      <CardTitle className="mb-0">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {selectedUser.role === 'teacher' ? 'Teacher' : 'Student'}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardBody className="flex-1 overflow-y-auto space-y-4">
                  {loading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <div className="text-5xl mb-3">💬</div>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isOwn = msg.sender._id === user?._id;
                      return (
                        <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-lg p-3 ${
                              isOwn 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                            <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </CardBody>

                {/* Send Message Form */}
                <div className="border-t p-4">
                  <form onSubmit={sendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardBody className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-lg">Select a conversation to start messaging</p>
                </div>
              </CardBody>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
