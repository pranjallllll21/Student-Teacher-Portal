# SMARTCONNECT

A next-generation educational platform built with the MERN stack, featuring gamification, role-based access, and future-ready architecture for AI and blockchain integration.

## Features

### Core Modules
- **Authentication & Authorization**: JWT-based with role management (Student, Teacher, Admin, Parent)
- **Role-Aware Dashboards**: Customized interfaces for each user type
- **Course Management**: Full CRUD operations for courses and enrollment
- **Assignments & Submissions**: Upload, grade, and provide feedback
- **Quizzes & Auto-Evaluation**: Timed MCQs with immediate scoring
- **Announcements & Notifications**: Real-time alerts and updates
- **Attendance Tracking**: Manual and facial recognition placeholder
- **Calendar Integration**: Unified view of exams, events, and deadlines
- **Messaging & Forums**: 1:1 chat and course-based discussions
- **Reports & Analytics**: Performance and attendance visualizations

### Gamification System
- **XP System**: Earn experience points for various activities
- **Level Progression**: Dynamic leveling based on XP
- **Leaderboards**: Weekly and global rankings
- **Reward Marketplace**: Redeem XP for perks and benefits

### Future-Ready Features
- **AI Learning Suggestions**: Adaptive learning recommendations
- **Smart Tutor Chatbot**: AI-powered study assistance
- **Blockchain Certificates**: Verified digital credentials
- **Virtual Study Pods**: Collaborative learning spaces
- **Mental Health Monitoring**: Wellness tracking widget

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **State Management**: Context API

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install-all
   ```

2. **Set up Environment Variables**
   ```bash
   # Backend (.env)
   MONGODB_URI=mongodb://localhost:27017/smartconnect
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

3. **Seed Demo Data**
   ```bash
   npm run seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Demo Accounts

After seeding, you can login with:

- **Student**: `student@demo.com` / `password123`
- **Teacher**: `teacher@demo.com` / `password123`
- **Admin**: `admin@demo.com` / `password123`
- **Parent**: `parent@demo.com` / `password123`

## Project Structure

```
smartconnect/
├── backend/                 # Express.js API server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication & validation
│   ├── controllers/        # Business logic
│   └── scripts/            # Database seeding
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # State management
│   │   ├── services/       # API calls
│   │   └── utils/          # Helper functions
└── package.json           # Root package configuration
```

## Contributing

This project is designed to be easily extensible. The modular architecture allows for:
- Adding new user roles
- Implementing additional gamification features
- Integrating AI and blockchain technologies
- Customizing the UI theme and components

## License

MIT License - see LICENSE file for details.
