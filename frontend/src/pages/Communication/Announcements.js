import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Input, Textarea, Select, Checkbox } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { announcementsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const Announcements = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Admin form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sendNotification, setSendNotification] = useState(true);
  const isAdmin = user?.role === 'admin';

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementsAPI.getAnnouncements({ limit: 20 });
      const items = res.data.announcements || [];
      setAnnouncements(items);
      // Mark each as viewed to clear unread dot for users who open the page
      try {
        await Promise.all(items.slice(0, 10).map(a => announcementsAPI.getAnnouncement(a._id)));
        // notify sidebar to refresh counts
        window.dispatchEvent(new Event('announcements:refreshUnread'));
      } catch (e) {}
    } catch (err) {
      // error toasts handled globally
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Real-time: refresh when a new announcement arrives
  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchAnnouncements();
    socket.on('new-announcement', handler);
    return () => socket.off('new-announcement', handler);
  }, [socket]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const t = title.trim();
    const c = content.trim();
    if (t.length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    if (c.length < 10) {
      toast.error('Content must be at least 10 characters');
      return;
    }
    try {
      const payload = {
        title: t,
        content: c,
        scope: 'global',
        priority,
        status: 'published',
        sendNotification,
      };
      const res = await announcementsAPI.createAnnouncement(payload);
      toast.success('Announcement published');
      setTitle('');
      setContent('');
      setPriority('normal');
      setSendNotification(true);
      // Optimistically prepend
      setAnnouncements((prev) => [res.data.announcement, ...prev]);
    } catch (err) {
      // errors toasted by interceptor
    }
  };

  const PriorityBadge = ({ level }) => {
    const map = {
      low: 'bg-gray-100 text-gray-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-yellow-100 text-yellow-700',
      urgent: 'bg-red-100 text-red-700',
    };
    const label = level?.charAt(0).toUpperCase() + level?.slice(1);
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${map[level] || map.normal}`}>{label}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
        <p className="text-gray-600">Stay updated with important announcements</p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Tomorrow is a holiday"
                required
              />
              <Textarea
                label="Content"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide more details if needed..."
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { label: 'Low', value: 'low' },
                    { label: 'Normal', value: 'normal' },
                    { label: 'High', value: 'high' },
                    { label: 'Urgent', value: 'urgent' },
                  ]}
                />
                <Checkbox
                  label="Send notification to everyone"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Publish</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Latest Announcements</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No announcements yet</h3>
              <p className="text-gray-600">Announcements posted by the admin will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a._id} className="p-4 border rounded-lg hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                      <p className="mt-1 text-gray-700 whitespace-pre-line">{a.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <PriorityBadge level={a.priority} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <span>By {a.author?.firstName} {a.author?.lastName}</span>
                    </div>
                    <div>
                      <span>{new Date(a.publishDate || a.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Announcements;
