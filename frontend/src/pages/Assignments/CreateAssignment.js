import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { coursesAPI, assignmentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CreateAssignment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', courseId: '', dueDate: '', maxPoints: 100, submissionType: 'file', allowedFileTypes: ['pdf'] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await coursesAPI.getCourses();
        if (!mounted) return;
        setCourses(res.data.courses || []);
        if (!form.courseId && res.data.courses && res.data.courses[0]) {
          setForm(prev => ({ ...prev, courseId: res.data.courses[0]._id }));
        }
      } catch (err) {
        console.error('Load courses for create assignment error:', err);
        toast.error('Could not load courses');
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.courseId || !form.dueDate) return toast.error('Please fill title, course and due date');
    try {
      setSaving(true);
      const payload = {
        title: form.title,
        description: form.description,
        courseId: form.courseId,
        dueDate: new Date(form.dueDate),
        maxPoints: Number(form.maxPoints) || 100,
        submissionType: form.submissionType,
        allowedFileTypes: form.allowedFileTypes,
        status: 'published'
      };
      const res = await assignmentsAPI.createAssignment(payload);
      toast.success(res.data?.message || 'Assignment created');
      navigate('/assignments');
    } catch (err) {
      console.error('Create assignment error:', err);
      toast.error(err.response?.data?.message || 'Could not create assignment');
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'teacher') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
          <p className="text-gray-600">Only teachers can create assignments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
        <p className="text-gray-600">Create new assignments for your students</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Creation</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input name="title" value={form.title} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="mt-1 block w-full border rounded p-2" rows={4} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Course</label>
                <select name="courseId" value={form.courseId} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due date</label>
                <input name="dueDate" value={form.dueDate} onChange={handleChange} type="datetime-local" className="mt-1 block w-full border rounded p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max points</label>
                <input name="maxPoints" value={form.maxPoints} onChange={handleChange} type="number" className="mt-1 block w-full border rounded p-2" />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded">
                {saving ? 'Creating…' : 'Create Assignment'}
              </button>
              <a className="text-sm text-gray-500" href="/assignments">Cancel</a>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default CreateAssignment;
