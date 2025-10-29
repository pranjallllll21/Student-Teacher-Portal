import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Button } from '../../components/UI';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);
      if (result.success) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h1>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>. 
          Please check your email and follow the instructions to reset your password.
        </p>
        
        <div className="space-y-4">
          <Button
            variant="primary"
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
            fullWidth
          >
            Send Another Email
          </Button>
          
          <Link
            to="/login"
            className="block text-center text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
        <p className="text-gray-600">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          placeholder="Enter your email address"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          fullWidth
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link
            to="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
