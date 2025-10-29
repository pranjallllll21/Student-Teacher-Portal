import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input, Select, Button } from '../../components/UI';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    employeeId: '',
    parentId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'parent', label: 'Parent' },
  ];

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Role-specific validations
    if (formData.role === 'student' && !formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    }

    if (formData.role === 'teacher' && !formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
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
      // Prepare registration data
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      // Add role-specific fields
      if (formData.role === 'student' && formData.studentId) {
        registrationData.studentId = formData.studentId.trim();
      }
      if (formData.role === 'teacher' && formData.employeeId) {
        registrationData.employeeId = formData.employeeId.trim();
      }
      if (formData.role === 'parent' && formData.parentId) {
        registrationData.parentId = formData.parentId.trim();
      }

      const result = await register(registrationData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Join our educational community today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            placeholder="Enter first name"
            required
          />
          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            placeholder="Enter last name"
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Enter your email"
          required
        />

        <Select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={roleOptions}
          error={errors.role}
          required
        />

        {/* Role-specific fields */}
        {formData.role === 'student' && (
          <Input
            label="Student ID"
            type="text"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            error={errors.studentId}
            placeholder="Enter student ID"
            required
          />
        )}

        {formData.role === 'teacher' && (
          <Input
            label="Employee ID"
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            error={errors.employeeId}
            placeholder="Enter employee ID"
            required
          />
        )}

        {formData.role === 'parent' && (
          <Input
            label="Child's Student ID (Optional)"
            type="text"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            error={errors.parentId}
            placeholder="Enter child's student ID"
            help="You can link your account to your child's account later"
          />
        )}

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Create a password"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            required
          />
          <span className="ml-2 text-sm text-gray-700">
            I agree to the{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </Link>
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          fullWidth
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
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

export default Register;
