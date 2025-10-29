import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const fallbackCourses = [
  { _id: 'iot-1', code: 'IOT101', title: 'Internet of Things (IoT)', description: 'Sensors, connectivity, and edge computing', category: 'IoT', level: 'intermediate', instructor: { firstName: 'Alex', lastName: 'Rivera' }, enrolledCount: 12, credits: 3, duration: 12, maxStudents: 30, status: 'published' },
  { _id: 'cyber-1', code: 'CYB101', title: 'Cybersecurity Fundamentals', description: 'Threats, defenses, and secure coding', category: 'Security', level: 'beginner', instructor: { firstName: 'Priya', lastName: 'Shah' }, enrolledCount: 24, credits: 3, duration: 12, maxStudents: 30, status: 'published' },
  { _id: 'ds-1', code: 'DS101', title: 'Data Science', description: 'Data analysis, visualization, and statistics', category: 'Data', level: 'intermediate', instructor: { firstName: 'Marco', lastName: 'Diaz' }, enrolledCount: 18, credits: 3, duration: 12, maxStudents: 30, status: 'published' },
  { _id: 'ml-1', code: 'ML101', title: 'Machine Learning', description: 'Supervised/unsupervised learning and pipelines', category: 'AI', level: 'advanced', instructor: { firstName: 'Evelyn', lastName: 'Ng' }, enrolledCount: 9, credits: 4, duration: 16, maxStudents: 25, status: 'published' },
  { _id: 'web-1', code: 'WEB101', title: 'Full-Stack Web Development', description: 'React, Node.js and modern web apps', category: 'Web', level: 'beginner', instructor: { firstName: 'Chen', lastName: 'Wang' }, enrolledCount: 30, credits: 4, duration: 16, maxStudents: 35, status: 'published' },
  { _id: 'ai-1', code: 'AI101', title: 'Artificial Intelligence', description: 'AI fundamentals, neural networks, and deep learning', category: 'AI', level: 'advanced', instructor: { firstName: 'Sarah', lastName: 'Johnson' }, enrolledCount: 15, credits: 4, duration: 16, maxStudents: 25, status: 'published' },
  { _id: 'cloud-1', code: 'CLD101', title: 'Cloud Computing', description: 'AWS, Azure, and cloud architecture', category: 'Cloud', level: 'intermediate', instructor: { firstName: 'Michael', lastName: 'Brown' }, enrolledCount: 20, credits: 3, duration: 12, maxStudents: 30, status: 'published' },
  { _id: 'mobile-1', code: 'MOB101', title: 'Mobile App Development', description: 'iOS and Android development with React Native', category: 'Mobile', level: 'intermediate', instructor: { firstName: 'Lisa', lastName: 'Anderson' }, enrolledCount: 25, credits: 4, duration: 16, maxStudents: 30, status: 'published' }
];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        try {
          if (!user) {
            setCourses([]);
            setLoading(false);
            return;
          }
        
          try {
            const res = await coursesAPI.getCourses();
            if (!mounted) return;
            if (res.data.courses && res.data.courses.length > 0) {
              setCourses(res.data.courses);
            } else {
              // If no courses from API, use fallback
              console.log('No courses from API, using fallback data');
              setCourses(fallbackCourses);
            }
          } catch (apiError) {
            console.warn('API error, using fallback data:', apiError);
            setCourses(fallbackCourses);
          }
        } catch (err) {
          console.error('Error in course loading:', err);
          setCourses(fallbackCourses);
        } finally {
          if (mounted) setLoading(false);
        }
      };
    
      // Load courses regardless of user state
      setLoading(true);
      load();
    
      return () => { mounted = false; };
    }, []);

  // Accept courseId (button sends course._id)
  const handleEnroll = async (courseId) => {
    try {
      const res = await coursesAPI.enrollInCourse(courseId);
      toast.success(res.data?.message || 'Enrolled successfully');

      // If backend returned updated course, use it to update UI; otherwise increment count optimistically
      const updatedCourse = res.data?.course;
      if (updatedCourse) {
        setCourses(prev => prev.map(c => c._id === courseId ? updatedCourse : c));
        // Dispatch event with updated course for other components
        try { window.dispatchEvent(new CustomEvent('enrolledCourse', { detail: updatedCourse })); } catch (e) {}
      } else {
        setCourses(prev => prev.map(c => c._id === courseId ? { ...c, enrolledCount: (c.enrolledCount || c.enrolledStudents?.length || 0) + 1 } : c));
        try { window.dispatchEvent(new CustomEvent('enrolledCourse', { detail: { _id: courseId } })); } catch (e) {}
      }
    } catch (error) {
      // Log full response for debugging and show message if available
      console.warn('Enroll error:', error?.response?.data || error?.message || error);
      const msg = error?.response?.data?.message || error?.message || 'Could not enroll in course';
      // Let the global interceptor show toasts for standard HTTP statuses, but also show a specific message when available
      if (!error?.response) {
        toast.error('Network error. Please check your connection.');
      } else if (error.response?.data?.errors) {
        // show validation details
        error.response.data.errors.forEach(err => toast.error(err.msg || err.message));
      } else {
        toast.error(msg);
      }
    }
  };

  const viewStudents = async (courseId) => {
    try {
      const res = await coursesAPI.getCourseStudents(courseId);
      const students = res.data.students || [];
      toast((t) => (
        <div>
          <div className="font-semibold">{`Students (${students.length})`}</div>
          <div className="text-sm max-h-40 overflow-y-auto mt-2">
            {students.map(s => (
              <div key={s._id} className="py-1">{s.firstName} {s.lastName} — {s.email}</div>
            ))}
          </div>
        </div>
      ), { duration: 8000 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load students');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-600">Browse and enroll in available courses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="text-center py-12">Loading courses…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.length === 0 && (
                <div className="text-center py-12 col-span-full">No courses found.</div>
              )}

              {courses.map(course => {
                const enrolledCount = course.enrolledCount ?? (course.enrolledStudents?.length ?? 0);
                return (
                  <div key={course._id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{course.title}</h3>
                        <p className="text-sm text-gray-600">{course.description}</p>
                        <div className="text-xs text-gray-500 mt-2">{course.category} • {course.level}</div>
                        <div className="text-xs text-gray-500">Instructor: {course.instructor?.firstName} {course.instructor?.lastName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Enrolled</div>
                        <div className="text-2xl font-bold">{enrolledCount}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-3">
                      {user?.role === 'student' && (
                        <button onClick={() => handleEnroll(course._id)} className="px-3 py-1 bg-primary-600 text-white rounded">Enroll</button>
                      )}

                      {user?.role === 'teacher' && (
                        <button onClick={() => viewStudents(course._id)} className="px-3 py-1 border rounded">View students</button>
                      )}

                      <Link to={`/courses/${course._id}`} className="text-sm text-primary-600 hover:text-primary-700 font-medium">View Details</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Courses;
