import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { assignmentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AssignmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await assignmentsAPI.getAssignment(id);
        if (!mounted) return;
        setAssignment(res.data.assignment || res.data);
      } catch (err) {
        console.error('Load assignment error:', err);
        toast.error('Could not load assignment');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="py-12 text-center">Loading assignment…</div>;
  if (!assignment) return <div className="py-12 text-center">Assignment not found.</div>;

  const submissions = assignment.submissions || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
        <p className="text-gray-600">{assignment.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Information</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Course</div>
              <div className="font-medium">{assignment.course?.title ?? assignment.course}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Due</div>
              <div className="font-medium">{new Date(assignment.dueDate).toLocaleString()}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-500">Instructions</div>
              <div className="mt-1 text-gray-700 whitespace-pre-wrap">{assignment.instructions}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {user?.role === 'teacher' && (
        <Card>
          <CardHeader>
            <CardTitle>Submissions ({submissions.length})</CardTitle>
          </CardHeader>
          <CardBody>
            {submissions.length === 0 ? (
              <div className="text-center py-8">No submissions yet.</div>
            ) : (
              <div className="space-y-4">
                {submissions.map(sub => (
                  <div key={sub._id} className="p-4 border rounded-lg bg-white flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{sub.student?.firstName ? `${sub.student.firstName} ${sub.student.lastName}` : (sub.student?.email ?? 'Unknown Student')}</div>
                      <div className="text-sm text-gray-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</div>
                      {sub.attempt > 1 && <div className="text-xs text-yellow-600">Attempt: {sub.attempt}</div>}
                    </div>

                    <div className="space-x-2 text-right">
                      {sub.files && sub.files.length > 0 && (
                        sub.files.map((f, idx) => (
                          <a key={idx} href={f.path || f.url || f} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded text-sm text-primary-600">View Document</a>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {user?.role === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardBody>
            {submissions.length === 0 ? (
              <div className="text-center py-8">No submissions yet.</div>
            ) : (
              (() => {
                // Match by several possible user id fields (id, _id) or email
                const my = submissions.find(s => {
                  if (!s.student) return false;
                  const studentId = s.student._id || s.student.id || s.student;
                  const userId = user?.id || user?._id;
                  if (studentId && userId && studentId.toString() === userId.toString()) return true;
                  if (s.student.email && user?.email && s.student.email === user.email) return true;
                  return false;
                });
                if (!my) return <div className="text-center py-8">You have not submitted yet.</div>;
                return (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">Submitted: {new Date(my.submittedAt).toLocaleString()}</div>
                    {my.files && my.files.map((f, i) => (
                      <a key={i} href={f.path || f.url || f} target="_blank" rel="noreferrer" className="block text-primary-600">View document {i+1}</a>
                    ))}
                    <div className="mt-2">Attempt: {my.attempt}</div>
                  </div>
                );
              })()
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default AssignmentDetail;
