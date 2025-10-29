import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Button } from '../../components/UI';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, SparklesIcon, AcademicCapIcon, UserGroupIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await login(formData);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    const demoCredentials = {
      student: { email: 'student@demo.com', password: 'password123' },
      teacher: { email: 'teacher@demo.com', password: 'password123' },
      admin: { email: 'admin@demo.com', password: 'password123' },
    };

    setLoading(true);
    setErrors({});

    try {
      const result = await login(demoCredentials[role]);
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Demo login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section with Animation */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-2xl shadow-xl mb-4 animate-pulse">
          <SparklesIcon className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back!
        </h1>
        <p className="text-gray-600 text-lg">Sign in to continue your learning journey</p>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input with Icon */}
        <div className="relative group">
          <div className="absolute left-3 top-9 text-gray-400 group-focus-within:text-primary-600 transition-colors">
            <EnvelopeIcon className="h-5 w-5" />
          </div>
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            className="pl-10"
            required
          />
        </div>

        {/* Password Input with Icon and Toggle */}
        <div className="relative group">
          <div className="absolute left-3 top-9 text-gray-400 group-focus-within:text-primary-600 transition-colors">
            <LockClosedIcon className="h-5 w-5" />
          </div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            className="pl-10 pr-12"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-primary-600 transition-colors focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center group cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 border-gray-300 rounded transition-all"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Remember me</span>
          </label>
          
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-all"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In Button with Gradient */}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          loading={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500 font-medium">Quick Demo Access</span>
        </div>
      </div>

      {/* Demo Account Buttons with Icons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleDemoLogin('student')}
          disabled={loading}
          className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-blue-700">Student</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleDemoLogin('teacher')}
          disabled={loading}
          className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-green-700">Teacher</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleDemoLogin('admin')}
          disabled={loading}
          className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Cog6ToothIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-purple-700">Admin</span>
          </div>
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center pt-4">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-all"
          >
            Create one now
          </Link>
        </p>
      </div>

      {/* Features Footer */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl mb-1">🎯</div>
          <p className="text-xs text-gray-600">Smart Learning</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">⚡</div>
          <p className="text-xs text-gray-600">Real-time Sync</p>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🏆</div>
          <p className="text-xs text-gray-600">Achievements</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
