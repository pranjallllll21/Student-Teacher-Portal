const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const { Badge, Quest, RewardItem } = require('../models/Gamification');
const Announcement = require('../models/Announcement');

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📡 Connected to MongoDB');

    // Clear existing data
    await clearDatabase();

    // Create users
    const users = await createUsers();
    console.log('✅ Users created');

    // Create badges
    const badges = await createBadges();
    console.log('✅ Badges created');

    // Create courses
    const courses = await createCourses(users);
    console.log('✅ Courses created');

    // Create assignments
    await createAssignments(courses, users);
    console.log('✅ Assignments created');

    // Create quizzes
    await createQuizzes(courses, users);
    console.log('✅ Quizzes created');

    // Create announcements
    await createAnnouncements(users, courses);
    console.log('✅ Announcements created');

    // Create quests
    await createQuests(badges);
    console.log('✅ Quests created');

    // Create reward items
    await createRewardItems();
    console.log('✅ Reward items created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Student: student@demo.com / password123');
    console.log('Teacher: teacher@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');
    console.log('Parent: parent@demo.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

async function clearDatabase() {
  const collections = [
    'users', 'courses', 'assignments', 'quizzes', 'messages', 'messagethreads',
    'announcements', 'attendances', 'attendancesessions', 'attendancesummaries',
    'badges', 'achievements', 'leaderboards', 'quests', 'rewarditems', 'usergamifications'
  ];

  for (const collection of collections) {
    await mongoose.connection.db.collection(collection).deleteMany({});
  }
  console.log('🗑️  Database cleared');
}

async function createUsers() {
  const users = [];

  // Admin user
  const admin = new User({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@demo.com',
    password: 'password123',
    role: 'admin',
    isEmailVerified: true,
    xp: 1000,
    level: 5
  });
  await admin.save();
  users.push(admin);

  // Teacher users
  const teacher1 = new User({
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'teacher@demo.com',
    password: 'password123',
    role: 'teacher',
    employeeId: 'T001',
    department: 'Computer Science',
    specialization: ['Web Development', 'Database Systems'],
    isEmailVerified: true,
    xp: 800,
    level: 4
  });
  await teacher1.save();
  users.push(teacher1);

  const teacher2 = new User({
    firstName: 'Prof. Michael',
    lastName: 'Chen',
    email: 'michael.chen@demo.com',
    password: 'password123',
    role: 'teacher',
    employeeId: 'T002',
    department: 'Mathematics',
    specialization: ['Calculus', 'Linear Algebra'],
    isEmailVerified: true,
    xp: 750,
    level: 4
  });
  await teacher2.save();
  users.push(teacher2);

  // Student users
  const student1 = new User({
    firstName: 'Alex',
    lastName: 'Smith',
    email: 'student@demo.com',
    password: 'password123',
    role: 'student',
    studentId: 'S001',
    grade: 'Sophomore',
    isEmailVerified: true,
    xp: 450,
    level: 3
  });
  await student1.save();
  users.push(student1);

  const student2 = new User({
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@demo.com',
    password: 'password123',
    role: 'student',
    studentId: 'S002',
    grade: 'Junior',
    isEmailVerified: true,
    xp: 600,
    level: 3
  });
  await student2.save();
  users.push(student2);

  const student3 = new User({
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@demo.com',
    password: 'password123',
    role: 'student',
    studentId: 'S003',
    grade: 'Freshman',
    isEmailVerified: true,
    xp: 200,
    level: 2
  });
  await student3.save();
  users.push(student3);

  // Parent user
  const parent = new User({
    firstName: 'Lisa',
    lastName: 'Smith',
    email: 'parent@demo.com',
    password: 'password123',
    role: 'parent',
    isEmailVerified: true
  });
  parent.parentId = student1._id; // Link to Alex Smith
  await parent.save();
  users.push(parent);

  return users;
}

async function createBadges() {
  const badges = [];

  const badgeData = [
    {
      name: 'First Assignment',
      description: 'Complete your first assignment',
      icon: '📝',
      category: 'achievement',
      rarity: 'common',
      requirements: { type: 'assignments', value: 1 },
      xpReward: 25
    },
    {
      name: 'Quiz Master',
      description: 'Score 100% on 5 quizzes',
      icon: '🧠',
      category: 'achievement',
      rarity: 'uncommon',
      requirements: { type: 'quizzes', value: 5 },
      xpReward: 50
    },
    {
      name: 'Perfect Attendance',
      description: 'Maintain 100% attendance for a month',
      icon: '📅',
      category: 'achievement',
      rarity: 'rare',
      requirements: { type: 'attendance', value: 30 },
      xpReward: 100
    },
    {
      name: 'Level 5',
      description: 'Reach level 5',
      icon: '⭐',
      category: 'milestone',
      rarity: 'uncommon',
      requirements: { type: 'xp', value: 500 },
      xpReward: 75
    },
    {
      name: 'Course Completion',
      description: 'Complete your first course',
      icon: '🎓',
      category: 'achievement',
      rarity: 'rare',
      requirements: { type: 'custom', value: 1 },
      xpReward: 150
    }
  ];

  for (const data of badgeData) {
    const badge = new Badge(data);
    await badge.save();
    badges.push(badge);
  }

  return badges;
}

async function createCourses(users) {
  const courses = [];
  const teacher1 = users.find(u => u.role === 'teacher' && u.firstName === 'Dr. Sarah');
  const teacher2 = users.find(u => u.role === 'teacher' && u.firstName === 'Prof. Michael');

  const courseData = [
    {
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of web development including HTML, CSS, and JavaScript.',
      code: 'CS101',
      instructor: teacher1._id,
      credits: 3,
      duration: 16,
      level: 'beginner',
      category: 'Computer Science',
      tags: ['HTML', 'CSS', 'JavaScript', 'Web Development'],
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      status: 'published',
      maxStudents: 30,
      gradingPolicy: {
        assignments: 40,
        quizzes: 30,
        attendance: 10,
        finalExam: 20
      },
      xpRewards: {
        enrollment: 50,
        completion: 200,
        perfectScore: 100
      }
    },
    {
      title: 'Advanced Mathematics',
      description: 'Advanced topics in calculus and linear algebra.',
      code: 'MATH201',
      instructor: teacher2._id,
      credits: 4,
      duration: 16,
      level: 'intermediate',
      category: 'Mathematics',
      tags: ['Calculus', 'Linear Algebra', 'Mathematics'],
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      status: 'published',
      maxStudents: 25,
      gradingPolicy: {
        assignments: 35,
        quizzes: 25,
        attendance: 10,
        finalExam: 30
      },
      xpRewards: {
        enrollment: 50,
        completion: 200,
        perfectScore: 100
      }
    },
    {
      title: 'Database Systems',
      description: 'Introduction to database design and management.',
      code: 'CS201',
      instructor: teacher1._id,
      credits: 3,
      duration: 16,
      level: 'intermediate',
      category: 'Computer Science',
      tags: ['SQL', 'Database', 'MySQL', 'PostgreSQL'],
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      status: 'published',
      maxStudents: 20,
      gradingPolicy: {
        assignments: 45,
        quizzes: 25,
        attendance: 10,
        finalExam: 20
      },
      xpRewards: {
        enrollment: 50,
        completion: 200,
        perfectScore: 100
      }
    }
  ];

  // Additional demo courses
  courseData.push(
    {
      title: 'Internet of Things (IoT)',
      description: 'Sensors, connectivity, and edge computing.',
      code: 'IOT101',
      instructor: teacher1._id,
      credits: 3,
      duration: 8,
      level: 'intermediate',
      category: 'IoT',
      tags: ['IoT', 'Sensors', 'Edge'],
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-30'),
      status: 'published',
      maxStudents: 25,
      xpRewards: { enrollment: 30, completion: 100 }
    },
    {
      title: 'Cybersecurity Fundamentals',
      description: 'Threats, defenses, and secure coding practices.',
      code: 'SEC101',
      instructor: teacher2._id,
      credits: 3,
      duration: 10,
      level: 'beginner',
      category: 'Security',
      tags: ['Security', 'Secure Coding'],
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-05-15'),
      status: 'published',
      maxStudents: 30,
      xpRewards: { enrollment: 25, completion: 120 }
    },
    {
      title: 'Data Science Basics',
      description: 'Data analysis, visualization, and statistics.',
      code: 'DS101',
      instructor: teacher1._id,
      credits: 3,
      duration: 12,
      level: 'intermediate',
      category: 'Data',
      tags: ['Data', 'Visualization', 'Statistics'],
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-06-01'),
      status: 'published',
      maxStudents: 30,
      xpRewards: { enrollment: 40, completion: 150 }
    },
    {
      title: 'Machine Learning',
      description: 'Supervised and unsupervised learning techniques and pipelines.',
      code: 'ML201',
      instructor: teacher2._id,
      credits: 4,
      duration: 14,
      level: 'advanced',
      category: 'AI',
      tags: ['ML', 'AI', 'Neural Networks'],
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-07-01'),
      status: 'published',
      maxStudents: 20,
      xpRewards: { enrollment: 50, completion: 200 }
    },
    {
      title: 'Full-Stack Web Development',
      description: 'React, Node.js and modern web application development.',
      code: 'WEB202',
      instructor: teacher1._id,
      credits: 3,
      duration: 16,
      level: 'beginner',
      category: 'Web',
      tags: ['React', 'Node.js', 'Full-Stack'],
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-05-20'),
      status: 'published',
      maxStudents: 35,
      xpRewards: { enrollment: 45, completion: 180 }
    }
  );

  for (const data of courseData) {
    const course = new Course(data);
    await course.save();

    // NOTE: Do not auto-enroll demo students during seeding so 'My Courses' starts empty.
    // If you want to auto-enroll for testing, uncomment the block below.
    /*
    const students = users.filter(u => u.role === 'student');
    for (let i = 0; i < Math.min(3, students.length); i++) {
      try {
        await course.enrollStudent(students[i]._id);
      } catch (error) {
        // Student might already be enrolled
      }
    }
    */

    courses.push(course);
  }

  return courses;
}

async function createAssignments(courses, users) {
  const assignments = [];

  for (const course of courses) {
    // Create unique assignments based on course category
    const assignmentData = [];
    
    switch(course.category.toLowerCase()) {
      case 'web':
        assignmentData.push({
          title: 'Build a Responsive Website',
          description: 'Create a fully responsive website using modern web technologies.',
          type: 'project',
          maxPoints: 100,
          instructions: 'Implement a responsive design that works well on desktop, tablet, and mobile.'
        });
        break;
      
      case 'ai':
        assignmentData.push({
          title: 'Machine Learning Model Implementation',
          description: 'Implement and train a basic machine learning model.',
          type: 'project',
          maxPoints: 100,
          instructions: 'Build a classifier using scikit-learn and evaluate its performance.'
        });
        break;
      
      case 'security':
        assignmentData.push({
          title: 'Security Vulnerability Assessment',
          description: 'Perform a security assessment and document findings.',
          type: 'project',
          maxPoints: 100,
          instructions: 'Analyze a given system for security vulnerabilities and provide remediation steps.'
        });
        break;

      case 'iot':
        assignmentData.push({
          title: 'IoT Sensor Data Analysis',
          description: 'Collect and analyze data from IoT sensors.',
          type: 'project',
          maxPoints: 100,
          instructions: 'Build a system to collect sensor data and visualize the results.'
        });
        break;

      case 'data':
        assignmentData.push({
          title: 'Data Analysis Report',
          description: 'Analyze a dataset and present insights.',
          type: 'project',
          maxPoints: 100,
          instructions: 'Use pandas and matplotlib to analyze and visualize a real-world dataset.'
        });
        break;

      case 'cloud':
        assignmentData.push({
          title: 'Cloud Architecture Design',
          description: 'Design a scalable cloud architecture.',
          type: 'project',
          maxPoints: 100,
          instructions: 'Create a detailed cloud architecture diagram and implementation plan.'
        });
        break;

      case 'mobile':
        assignmentData.push({
          title: 'Mobile App Development',
          description: 'Build a mobile application using React Native.',
          type: 'project',
          maxPoints: 100,
          instructions: 'Develop a cross-platform mobile app with at least three screens.'
        });
        break;

      default:
        assignmentData.push({
          title: `${course.title} Project`,
          description: `Complete a project demonstrating your understanding of ${course.title}.`,
          type: 'project',
          maxPoints: 100,
          instructions: 'Follow the project guidelines and submit your work.'
        });
    }

    // Add common fields to each assignment
    assignmentData.forEach(data => {
      Object.assign(data, {
        course: course._id,
        instructor: course.instructor,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        availableFrom: new Date(),
        submissionType: 'file',
        allowedFileTypes: ['pdf'],
        maxFileSize: 10,
        status: 'published',
        xpReward: 50,
        bonusXP: 25
      });
    });

    for (const data of assignmentData) {
      const assignment = new Assignment(data);
      await assignment.save();
      assignments.push(assignment);
    }
  }

  return assignments;
}

async function createQuizzes(courses, users) {
  const quizzes = [];

  for (const course of courses) {
    const quizData = [
      {
        title: 'HTML Basics Quiz',
        description: 'Test your knowledge of HTML fundamentals.',
        course: course._id,
        instructor: course.instructor,
        type: 'graded',
        maxPoints: 50,
        timeLimit: 30,
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAttempts: 2,
        questions: [
          {
            question: 'What does HTML stand for?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: 'Hyper Text Markup Language', isCorrect: true },
              { text: 'High Tech Modern Language', isCorrect: false },
              { text: 'Home Tool Markup Language', isCorrect: false },
              { text: 'Hyperlink and Text Markup Language', isCorrect: false }
            ],
            explanation: 'HTML stands for Hyper Text Markup Language.',
            order: 1
          },
          {
            question: 'Which tag is used to create a hyperlink?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: '<link>', isCorrect: false },
              { text: '<a>', isCorrect: true },
              { text: '<href>', isCorrect: false },
              { text: '<url>', isCorrect: false }
            ],
            explanation: 'The <a> tag is used to create hyperlinks in HTML.',
            order: 2
          },
          {
            question: 'What is the correct way to create a heading in HTML?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: '<h1>Heading</h1>', isCorrect: true },
              { text: '<heading>Heading</heading>', isCorrect: false },
              { text: '<head>Heading</head>', isCorrect: false },
              { text: '<title>Heading</title>', isCorrect: false }
            ],
            explanation: 'HTML headings are created using h1, h2, h3, etc. tags.',
            order: 3
          },
          {
            question: 'HTML is a programming language.',
            type: 'true-false',
            points: 10,
            options: [
              { text: 'True', isCorrect: false },
              { text: 'False', isCorrect: true }
            ],
            explanation: 'HTML is a markup language, not a programming language.',
            order: 4
          },
          {
            question: 'What does CSS stand for?',
            type: 'short-answer',
            points: 10,
            correctAnswer: 'Cascading Style Sheets',
            explanation: 'CSS stands for Cascading Style Sheets.',
            order: 5
          }
        ],
        settings: {
          shuffleQuestions: false,
          shuffleOptions: true,
          showCorrectAnswers: true,
          showExplanations: true,
          allowReview: true,
          oneQuestionAtATime: false
        },
        status: 'published',
        xpReward: 30,
        bonusXP: 20
      },
      {
        title: 'CSS Fundamentals Quiz',
        description: 'Test your understanding of CSS styling and selectors.',
        course: course._id,
        instructor: course.instructor,
        type: 'graded',
        maxPoints: 50,
        timeLimit: 25,
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxAttempts: 2,
        questions: [
          {
            question: 'Which CSS property is used to change the text color?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: 'text-color', isCorrect: false },
              { text: 'color', isCorrect: true },
              { text: 'font-color', isCorrect: false },
              { text: 'text-style', isCorrect: false }
            ],
            explanation: 'The color property is used to set the text color in CSS.',
            order: 1
          },
          {
            question: 'How do you select an element with id "header" in CSS?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: '.header', isCorrect: false },
              { text: '#header', isCorrect: true },
              { text: '*header', isCorrect: false },
              { text: 'header', isCorrect: false }
            ],
            explanation: 'The # symbol is used to select elements by ID in CSS.',
            order: 2
          },
          {
            question: 'Which property is used to add space between the element border and content?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: 'margin', isCorrect: false },
              { text: 'padding', isCorrect: true },
              { text: 'spacing', isCorrect: false },
              { text: 'border-spacing', isCorrect: false }
            ],
            explanation: 'Padding adds space between the border and content, while margin adds space outside the border.',
            order: 3
          },
          {
            question: 'CSS can be included inline in HTML elements.',
            type: 'true-false',
            points: 10,
            options: [
              { text: 'True', isCorrect: true },
              { text: 'False', isCorrect: false }
            ],
            explanation: 'CSS can be included inline using the style attribute, in <style> tags, or in external files.',
            order: 4
          },
          {
            question: 'What does the display property value "flex" enable?',
            type: 'short-answer',
            points: 10,
            correctAnswer: 'flexbox',
            explanation: 'The flex value enables the Flexbox layout model for flexible responsive layouts.',
            order: 5
          }
        ],
        settings: {
          shuffleQuestions: false,
          shuffleOptions: true,
          showCorrectAnswers: true,
          showExplanations: true,
          allowReview: true,
          oneQuestionAtATime: false
        },
        status: 'published',
        xpReward: 30,
        bonusXP: 20
      },
      {
        title: 'JavaScript Basics Quiz',
        description: 'Assess your JavaScript programming fundamentals.',
        course: course._id,
        instructor: course.instructor,
        type: 'graded',
        maxPoints: 50,
        timeLimit: 30,
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        maxAttempts: 3,
        questions: [
          {
            question: 'Which keyword is used to declare a variable in JavaScript?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: 'var, let, const', isCorrect: true },
              { text: 'variable', isCorrect: false },
              { text: 'dim', isCorrect: false },
              { text: 'int', isCorrect: false }
            ],
            explanation: 'JavaScript uses var, let, and const to declare variables.',
            order: 1
          },
          {
            question: 'What is the correct way to write a JavaScript array?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: 'var colors = (1:"red", 2:"green")', isCorrect: false },
              { text: 'var colors = ["red", "green"]', isCorrect: true },
              { text: 'var colors = "red", "green"', isCorrect: false },
              { text: 'var colors = 1 = "red", 2 = "green"', isCorrect: false }
            ],
            explanation: 'Arrays in JavaScript are written with square brackets and comma-separated values.',
            order: 2
          },
          {
            question: 'How do you call a function named "myFunction"?',
            type: 'multiple-choice',
            points: 10,
            options: [
              { text: 'call myFunction()', isCorrect: false },
              { text: 'myFunction()', isCorrect: true },
              { text: 'call function myFunction', isCorrect: false },
              { text: 'execute myFunction()', isCorrect: false }
            ],
            explanation: 'Functions are called by using their name followed by parentheses.',
            order: 3
          },
          {
            question: 'JavaScript is the same as Java.',
            type: 'true-false',
            points: 10,
            options: [
              { text: 'True', isCorrect: false },
              { text: 'False', isCorrect: true }
            ],
            explanation: 'JavaScript and Java are completely different programming languages.',
            order: 4
          },
          {
            question: 'What method is used to parse a string to an integer in JavaScript?',
            type: 'short-answer',
            points: 10,
            correctAnswer: 'parseInt',
            explanation: 'The parseInt() function parses a string and returns an integer.',
            order: 5
          }
        ],
        settings: {
          shuffleQuestions: false,
          shuffleOptions: true,
          showCorrectAnswers: true,
          showExplanations: true,
          allowReview: true,
          oneQuestionAtATime: false
        },
        status: 'published',
        xpReward: 35,
        bonusXP: 25
      }
    ];

    for (const data of quizData) {
      const quiz = new Quiz(data);
      await quiz.save();
      quizzes.push(quiz);
    }
  }

  return quizzes;
}

async function createAnnouncements(users, courses) {
  const announcements = [];

  const admin = users.find(u => u.role === 'admin');
  const teacher1 = users.find(u => u.role === 'teacher' && u.firstName === 'Dr. Sarah');

  const announcementData = [
    {
      title: 'Welcome to the Student Portal!',
      content: 'Welcome to our new student-teacher portal! This platform is designed to enhance your learning experience with gamification, real-time communication, and comprehensive analytics.',
      author: admin._id,
      scope: 'global',
      priority: 'high',
      isPinned: true,
      status: 'published'
    },
    {
      title: 'Web Development Course Update',
      content: 'The Web Development Fundamentals course has been updated with new modules on React.js and Node.js. Please check the course content for the latest materials.',
      author: teacher1._id,
      scope: 'course',
      targetAudience: {
        courses: [courses[0]._id]
      },
      priority: 'normal',
      status: 'published'
    },
    {
      title: 'Assignment Submission Guidelines',
      content: 'Please ensure all assignments are submitted before the due date. Late submissions will incur a 10% penalty unless prior arrangements have been made.',
      author: admin._id,
      scope: 'role',
      targetAudience: {
        roles: ['student']
      },
      priority: 'normal',
      status: 'published'
    }
  ];

  for (const data of announcementData) {
    const announcement = new Announcement(data);
    await announcement.save();
    announcements.push(announcement);
  }

  return announcements;
}

async function createQuests(badges) {
  const quests = [];

  const questData = [
    {
      title: 'Daily Learning Streak',
      description: 'Complete an assignment or quiz every day for a week',
      type: 'daily',
      category: 'learning',
      requirements: [
        {
          action: 'complete_assignment',
          target: 7,
          description: 'Complete 7 assignments'
        }
      ],
      rewards: {
        xp: 100,
        badge: badges[0]._id
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true
    },
    {
      title: 'Quiz Champion',
      description: 'Score 90% or higher on 5 quizzes',
      type: 'weekly',
      category: 'challenge',
      requirements: [
        {
          action: 'take_quiz',
          target: 5,
          description: 'Take 5 quizzes with 90%+ score'
        }
      ],
      rewards: {
        xp: 150,
        badge: badges[1]._id
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true
    },
    {
      title: 'Perfect Attendance',
      description: 'Maintain 100% attendance for a month',
      type: 'monthly',
      category: 'challenge',
      requirements: [
        {
          action: 'attend_class',
          target: 30,
          description: 'Attend 30 classes'
        }
      ],
      rewards: {
        xp: 200,
        badge: badges[2]._id
      },
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true
    }
  ];

  for (const data of questData) {
    const quest = new Quest(data);
    await quest.save();
    quests.push(quest);
  }

  return quests;
}

async function createRewardItems() {
  const rewardItems = [];

  const rewardData = [
    {
      name: 'Custom Avatar Frame',
      description: 'Unlock a special golden frame for your avatar',
      type: 'avatar',
      cost: 100,
      icon: '🖼️',
      levelRequired: 2,
      isAvailable: true,
      stock: -1
    },
    {
      name: 'Study Buddy Badge',
      description: 'A special badge for helping other students',
      type: 'badge',
      cost: 200,
      icon: '🤝',
      levelRequired: 3,
      isAvailable: true,
      stock: 50
    },
    {
      name: 'Early Assignment Access',
      description: 'Get access to assignments 24 hours early',
      type: 'privilege',
      cost: 300,
      icon: '⏰',
      levelRequired: 4,
      isAvailable: true,
      stock: -1
    },
    {
      name: 'Custom Title',
      description: 'Unlock a custom title for your profile',
      type: 'title',
      cost: 500,
      icon: '👑',
      levelRequired: 5,
      isAvailable: true,
      stock: -1
    }
  ];

  for (const data of rewardData) {
    const reward = new RewardItem(data);
    await reward.save();
    rewardItems.push(reward);
  }

  return rewardItems;
}

// Run the seeding
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
