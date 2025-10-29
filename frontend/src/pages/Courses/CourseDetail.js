import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Fallback courses data (same as in Courses.js)
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

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        // First check if this looks like a fallback course ID
        if (id && id.includes('-')) {
          // It's a fallback course, use local data directly
          console.log('Loading fallback course:', id);
          const fallbackCourse = fallbackCourses.find(c => c._id === id);
          if (fallbackCourse) {
            setCourse(fallbackCourse);
            setLoading(false);
            return;
          } else {
            console.error('Fallback course not found:', id);
            toast.error('Course not found');
            setTimeout(() => navigate('/courses'), 1500);
            setLoading(false);
            return;
          }
        }
        
        // Try to get from API (for real MongoDB courses)
        console.log('Fetching course from API:', id);
        const res = await coursesAPI.getCourse(id);
        setCourse(res.data.course);
      } catch (err) {
        // If API fails, try fallback data
        console.log('API failed for course:', id, err.message);
        const fallbackCourse = fallbackCourses.find(c => c._id === id);
        if (fallbackCourse) {
          console.log('Using fallback course after API failure');
          setCourse(fallbackCourse);
        } else {
          console.error('Course not found in fallback data:', id);
          toast.error('Course not found');
          setTimeout(() => navigate('/courses'), 1500);
        }
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id, navigate]);

  const handleEnroll = async () => {
    // For fallback courses, simulate enrollment
    if (course._id && course._id.includes('-')) {
      setEnrolling(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update course enrollment count
      setCourse(prev => ({
        ...prev,
        enrolledCount: (prev.enrolledCount || 0) + 1,
        students: [...(prev.students || []), user?.id]
      }));
      
      toast.success('Successfully enrolled in the course!');
      setEnrolling(false);
      return;
    }

    try {
      setEnrolling(true);
      await coursesAPI.enrollCourse(id);
      toast.success('Successfully enrolled in the course!');
      // Reload course to update enrollment status
      const res = await coursesAPI.getCourse(id);
      setCourse(res.data.course);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    // For fallback courses, simulate unenrollment
    if (course._id && course._id.includes('-')) {
      setEnrolling(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update course enrollment count
      setCourse(prev => ({
        ...prev,
        enrolledCount: Math.max((prev.enrolledCount || 0) - 1, 0),
        students: (prev.students || []).filter(s => s !== user?.id)
      }));
      
      toast.success('Successfully unenrolled from the course');
      setEnrolling(false);
      return;
    }

    try {
      setEnrolling(true);
      await coursesAPI.unenrollCourse(id);
      toast.success('Successfully unenrolled from the course');
      const res = await coursesAPI.getCourse(id);
      setCourse(res.data.course);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unenroll');
    } finally {
      setEnrolling(false);
    }
  };

  // Get course image based on code or category
  const getCourseImage = (course) => {
    const code = course?.code?.toUpperCase() || '';
    const title = course?.title?.toLowerCase() || '';
    const category = course?.category?.toLowerCase() || '';
    
    // Map course codes/titles to relevant images
    // IoT courses
    if (code.includes('IOT') || title.includes('iot') || title.includes('internet of things')) {
      return 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800&q=80';
    }
    // Cybersecurity courses
    if (code.includes('CYB') || code.includes('SEC') || title.includes('cybersecurity') || title.includes('security')) {
      return 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80';
    }
    // Data Science courses
    if (code.includes('DS') || title.includes('data science') || category.includes('data')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80';
    }
    // Machine Learning / AI courses
    if (code.includes('ML') || code.includes('AI') || title.includes('machine learning') || title.includes('artificial intelligence')) {
      return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80';
    }
    // Web Development courses
    if (code.includes('WEB') || title.includes('web development') || title.includes('full-stack') || title.includes('full stack')) {
      return 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80';
    }
    // Cloud Computing courses
    if (code.includes('CLD') || code.includes('CLOUD') || title.includes('cloud')) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80';
    }
    // Mobile Development courses
    if (code.includes('MOB') || title.includes('mobile') || title.includes('android') || title.includes('ios')) {
      return 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80';
    }
    // Computer Science / Programming courses
    if (code.includes('CS') || title.includes('computer') || title.includes('programming')) {
      return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';
    }
    // Database courses
    if (code.includes('DB') || title.includes('database')) {
      return 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80';
    }
    // Math courses
    if (code.includes('MATH') || title.includes('mathematics')) {
      return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80';
    }
    // MERN courses
    if (code.includes('MERN') || title.includes('mern')) {
      return 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&q=80';
    }
    // Default image for education/classroom
    return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Course not found</p>
        <Button onClick={() => navigate('/courses')} className="mt-4">Back to Courses</Button>
      </div>
    );
  }

  const isEnrolled = course.students?.some(s => s._id === user?.id || s === user?.id);
  const isInstructor = course.instructor?._id === user?.id || course.instructor === user?.id;
  const canEnroll = user?.role === 'student' && !isEnrolled;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Courses
      </button>

      {/* Course Header with Image */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
          <img 
            src={getCourseImage(course)} 
            alt={course.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {course.code}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium capitalize">
                {course.category || 'General'}
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-blue-100 text-lg">{course.description}</p>
          </div>
        </div>

        {/* Course Info Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{course.students?.length || 0} Students</span>
              </div>
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{course.credits || 3} Credits</span>
              </div>
            </div>

            {/* Enrollment Status */}
            {isEnrolled && (
              <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Enrolled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* About Course */}
          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {course.description || 'This course provides comprehensive knowledge and practical skills in the subject area.'}
                </p>
                
                <h3 className="text-lg font-semibold mt-6 mb-3">What You'll Learn</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Core concepts and fundamental principles</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Hands-on practical experience and real-world applications</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Industry best practices and modern techniques</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Problem-solving and critical thinking skills</span>
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>

          {/* Course Content */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Introduction & Fundamentals</h4>
                        <p className="text-sm text-gray-500">5 lectures • 2 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Core Concepts</h4>
                        <p className="text-sm text-gray-500">8 lectures • 4 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Advanced Topics</h4>
                        <p className="text-sm text-gray-500">6 lectures • 3 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card>
            <CardBody>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-blue-600">
                  {course.credits || 3} Credits
                </div>
                
                {canEnroll && (
                  <Button 
                    onClick={handleEnroll} 
                    disabled={enrolling}
                    className="w-full"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </Button>
                )}
                
                {isEnrolled && !isInstructor && (
                  <Button 
                    onClick={handleUnenroll} 
                    disabled={enrolling}
                    variant="outline"
                    className="w-full"
                  >
                    {enrolling ? 'Processing...' : 'Unenroll'}
                  </Button>
                )}

                {isInstructor && (
                  <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg">
                    <p className="font-medium">You're teaching this course</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Course Code</p>
                  <p className="font-semibold text-gray-900">{course.code}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-semibold text-gray-900 capitalize">{course.category || 'General'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">Full Semester</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Level</p>
                  <p className="font-semibold text-gray-900">
                    {course.code?.includes('101') || course.code?.includes('100') ? 'Beginner' : 
                     course.code?.includes('201') || course.code?.includes('200') ? 'Intermediate' : 
                     'Advanced'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Basic understanding of core concepts
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Willingness to learn and practice
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
