import React, { useEffect, useState } from 'react';
import { coursesAPI } from '../../services/api';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';

const CourseProgress = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await coursesAPI.getCourses();
        if (!mounted) return;
        setCourses(res.data.courses || []);
      } catch (err) {
        console.warn('Could not load courses for progress');
        setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Track Course Progress & Completion</h1>
        <p className="text-gray-600">Overview of course completion and student progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="py-12 text-center">Loading…</div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center">No courses found.</div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => (
                <div key={c._id} className="p-3 bg-gray-50 rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.title}</div>
                    <div className="text-xs text-gray-500">{c.category} • {c.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Enrolled: {c.enrolledStudents?.length ?? 0}</div>
                    <div className="text-xs text-gray-500">Status: {c.status}</div>
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

export default CourseProgress;
