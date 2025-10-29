import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeId: ''
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await usersAPI.getUsersByRole('teacher');
        if (!mounted) return;
        setTeachers(res.data.users || []);
      } catch (err) {
        console.warn('Could not load teachers');
        setTeachers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleDelete = async (id) => {
    try {
      await usersAPI.deleteUser(id);
      setTeachers(prev => prev.filter(t => t._id !== id));
      toast.success('Teacher removed');
    } catch (err) {
      toast.error('Could not remove teacher');
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setAdding(true);
      const res = await usersAPI.createUser({
        ...form,
        role: 'teacher'
      });
      setTeachers(prev => [...prev, res.data.user]);
      toast.success('Teacher added successfully');
      setShowAddModal(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', employeeId: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add teacher');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Management</h1>
          <p className="text-gray-600">Add, edit and remove teachers</p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Teacher</Button>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Teacher</h2>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <Input
                label="First Name *"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name *"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
              <Input
                label="Email *"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Password *"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <Input
                label="Employee ID (Optional)"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              />
              <div className="flex space-x-3 pt-4">
                <Button type="submit" variant="primary" disabled={adding}>
                  {adding ? 'Adding...' : 'Add Teacher'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Teachers</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="py-12 text-center">Loading…</div>
          ) : teachers.length === 0 ? (
            <div className="py-12 text-center">No teachers found.</div>
          ) : (
            <div className="space-y-2">
              {teachers.map(t => (
                <div key={t._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{t.firstName} {t.lastName}</div>
                    <div className="text-xs text-gray-500">{t.email}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(t._id)}>Remove</Button>
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

export default Teachers;
