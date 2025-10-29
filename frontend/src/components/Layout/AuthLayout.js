import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Welcome to the Future of Education</h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Experience learning like never before with our next-generation student-teacher portal. 
              Gamified education, real-time collaboration, and AI-powered insights await you.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <h3 className="font-semibold">Gamified Learning</h3>
                <p className="text-primary-100 text-sm">Earn XP and climb leaderboards</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">AI-Powered</h3>
                <p className="text-primary-100 text-sm">Smart tutoring and personalized learning paths</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
              <div>
                <h3 className="font-semibold">Blockchain Verified</h3>
                <p className="text-primary-100 text-sm">Secure, tamper-proof certificates and achievements</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-3">
              {/* Inline SVG logo (simple STP mark) */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-primary-500 to-primary-600">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <rect width="36" height="36" rx="8" fill="url(#g)" />
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#06b6d4" />
                      <stop offset="1" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                  <text x="50%" y="56%" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12" fill="#fff">STP</text>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900 lowercase">student teacher portal</span>
            </Link>
            <p className="text-gray-600 mt-2">Next-generation educational platform</p>
          </div>

          {/* Auth Form */}
          <div className="card">
            <div className="card-body">
              {children}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-600">
            <p>
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
