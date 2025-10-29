import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    studentId: ''
  });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await usersAPI.getUsersByRole('student');
        if (!mounted) return;
        setStudents(res.data.users || []);
      } catch (err) {
        console.warn('Could not load students, showing none');
        setStudents([]);
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
      setStudents(prev => prev.filter(s => s._id !== id));
      toast.success('Student removed');
    } catch (err) {
      toast.error('Could not remove student');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setAdding(true);
      const res = await usersAPI.createUser({
        ...form,
        role: 'student'
      });
      setStudents(prev => [...prev, res.data.user]);
      toast.success('Student added successfully');
      setShowAddModal(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', studentId: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add student');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-gray-600">Add, edit and remove students</p>
        </div>
        <div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Student</Button>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
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
                label="Student ID (Optional)"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              />
              <div className="flex space-x-3 pt-4">
                <Button type="submit" variant="primary" disabled={adding}>
                  {adding ? 'Adding...' : 'Add Student'}
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
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="py-12 text-center">Loading…</div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center">No students found.</div>
          ) : (
            <div className="space-y-2">
              {students.map(s => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{s.firstName} {s.lastName}</div>
                    <div className="text-xs text-gray-500">{s.email}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(s._id)}>Remove</Button>
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

export default Students;
