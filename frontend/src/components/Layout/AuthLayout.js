import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Left Side - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-purple-600 to-purple-800 relative overflow-hidden">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Floating Circles Animation */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white bg-opacity-10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white bg-opacity-10 rounded-full animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white bg-opacity-10 rounded-full animate-float animation-delay-4000"></div>
        <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-white bg-opacity-5 rounded-full animate-float animation-delay-1000"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          {/* Main Heading */}
          <div className="mb-10">
            <div className="inline-block mb-4">
              <span className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                ✨ Smart Education Platform
              </span>
            </div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Transform Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                Learning Experience
              </span>
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              Join SMARTCONNECT and unlock the future of education with gamification, AI insights, and real-time collaboration.
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="space-y-5">
            <div className="flex items-start space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-5 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-3xl">🎮</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Gamified Learning</h3>
                <p className="text-primary-100 text-sm">Earn XP, unlock achievements, and compete on leaderboards</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-5 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">AI-Powered Insights</h3>
                <p className="text-primary-100 text-sm">Personalized recommendations and smart tutoring</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-5 hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-3xl">🔗</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Blockchain Certified</h3>
                <p className="text-primary-100 text-sm">Secure, verifiable achievements and certificates</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">10K+</div>
              <div className="text-primary-200 text-sm">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">500+</div>
              <div className="text-primary-200 text-sm">Expert Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">98%</div>
              <div className="text-primary-200 text-sm">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Enhanced Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center justify-center space-x-3 group">
              <div className="relative">
                <img src="/logo.svg" alt="SMARTCONNECT" className="w-14 h-14 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                SMARTCONNECT
              </span>
            </Link>
            <p className="text-gray-500 mt-3 text-sm">Your Gateway to Smart Education</p>
          </div>

          {/* Auth Form Container */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700 hover:underline font-medium">
                Terms
              </Link>{' '}
              &{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700 hover:underline font-medium">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center space-x-6 mt-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Secure SSL</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Verified Platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
