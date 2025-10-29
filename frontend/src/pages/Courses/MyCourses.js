import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await coursesAPI.getMyCourses();
        if (!mounted) return;
        setCourses(res.data.courses || []);
      } catch (err) {
        console.warn('Could not load enrolled courses');
        setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    // Listen for global enroll events so this list updates immediately
    const onEnrolled = (e) => {
      const enrolledCourse = e.detail;
      setCourses(prev => {
        // Avoid duplicates
        if (prev.find(c => c._id === enrolledCourse._id)) return prev;
        return [enrolledCourse, ...prev];
      });
    };
    window.addEventListener('enrolledCourse', onEnrolled);

    return () => { 
      mounted = false; 
      window.removeEventListener('enrolledCourse', onEnrolled);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">View and manage your enrolled courses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-12">Loading…</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">You have no enrolled courses.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map(course => (
                <div key={course._id} className="p-4 border rounded-lg bg-white">
                  <h3 className="text-lg font-semibold">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="text-xs text-gray-500 mt-2">{course.category} • {course.level}</div>
                  {user?.role === 'teacher' && (
                    <div className="mt-3 text-sm">
                      Students enrolled: <span className="font-semibold">{course.enrolledStudents?.length ?? 0}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default MyCourses;
