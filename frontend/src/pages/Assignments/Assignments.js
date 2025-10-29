import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { assignmentsAPI, uploadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState({}); // map assignmentId -> File
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await assignmentsAPI.getAssignments();
        if (!mounted) return;
        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error('Load assignments error:', err);
        toast.error('Could not load assignments');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleFileChange = (assignmentId, file) => {
    setSelectedFiles(prev => ({ ...prev, [assignmentId]: file }));
  };

  const handleSubmit = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) return toast.error('Please select a file (PDF) to submit');
    if (file.type !== 'application/pdf') return toast.error('Only PDF files are accepted');

    try {
      setSubmitting(prev => ({ ...prev, [assignmentId]: true }));

      // Upload file to server
      const uploadRes = await uploadAPI.uploadFile(file, 'assignments');

      const fileUrl = uploadRes.data.fileUrl;

      // Submit assignment via assignments API
      const payload = { content: '', files: [fileUrl] };
      const res = await assignmentsAPI.submitAssignment(assignmentId, payload);

      toast.success(res.data?.message || 'Submitted successfully');

      // Update local list: refresh assignments or mark as submitted
      setAssignments(prev => prev.map(a => a._id === assignmentId ? res.data.assignment || a : a));
      setSelectedFiles(prev => { const copy = { ...prev }; delete copy[assignmentId]; return copy; });
    } catch (err) {
      console.error('Submit assignment error:', err);
      toast.error(err.response?.data?.message || 'Could not submit assignment');
    } finally {
      setSubmitting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">View and submit assignments</p>
        </div>
        {user?.role === 'teacher' && (
          <a href="/assignments/create" className="px-3 py-2 bg-primary-600 text-white rounded">Create Assignment</a>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Assignments</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-12">Loading assignments…</div>
          ) : (
            <div className="space-y-4">
              {assignments.length === 0 && (
                <div className="text-center py-12">No assignments found.</div>
              )}

              {assignments.map(a => (
                <div key={a._id} className="p-4 border rounded-lg bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{a.title}</h3>
                      <div className="text-sm text-gray-600">{a.description}</div>
                      <div className="text-xs text-gray-500 mt-2">Course: {a.course?.title ?? a.course}</div>
                      <div className="text-xs text-gray-500">Due: {new Date(a.dueDate).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Submissions</div>
                      <div className="text-2xl font-bold">{a.submissionCount ?? (a.submissions?.length ?? 0)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-3">
                    {user?.role === 'student' && (
                      <>
                        <input accept="application/pdf" onChange={(e) => handleFileChange(a._id, e.target.files[0])} type="file" />
                        <button disabled={submitting[a._id]} onClick={() => handleSubmit(a._id)} className="px-3 py-1 bg-primary-600 text-white rounded">
                          {submitting[a._id] ? 'Submitting…' : 'Submit PDF'}
                        </button>
                      </>
                    )}

                    {user?.role === 'teacher' && (
                      <a href={`/assignments/${a._id}`} className="px-3 py-1 border rounded">View Submissions</a>
                    )}

                    <a href={`/assignments/${a._id}`} className="text-sm text-primary-600">Details</a>
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

export default Assignments;
