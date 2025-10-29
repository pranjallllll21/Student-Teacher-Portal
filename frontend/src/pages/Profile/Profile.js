import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    employeeId: '',
    class: '',
    division: '',
    department: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        studentId: user.studentId || '',
        employeeId: user.employeeId || '',
        class: user.class || '',
        division: user.division || '',
        department: user.department || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      };

      // Add role-specific fields
      if (user.role === 'student') {
        updateData.studentId = form.studentId;
        updateData.class = form.class;
        updateData.division = form.division;
      } else if (user.role === 'teacher') {
        updateData.employeeId = form.employeeId;
        updateData.department = form.department;
      }

      const res = await usersAPI.updateUser(user.id, updateData);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setUploading(true);
      
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result;
          
          // Send to backend
          const res = await usersAPI.uploadAvatar(user.id, { avatar: base64String });
          updateUser(res.data.user);
          setForm({ ...form, avatar: res.data.user.avatar });
          toast.success('Photo uploaded successfully');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to upload photo');
        } finally {
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read file');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Failed to process image');
      setUploading(false);
    }
  };

  const instituteName = "Excellence Academy";
  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My ID Card</h1>
        <p className="text-gray-600 mt-2">Your digital identification card</p>
      </div>

      {/* ID Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm p-6 text-center border-b border-white border-opacity-30">
          <h2 className="text-2xl font-bold text-white">{instituteName}</h2>
          <p className="text-blue-100 text-sm mt-1">
            {isStudent ? 'Student Identification Card' : isTeacher ? 'Faculty Identification Card' : 'Identification Card'}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Photo Section */}
            <div className="md:col-span-1 flex flex-col items-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-lg overflow-hidden border-4 border-white shadow-xl bg-white">
                  {form.avatar ? (
                    <img 
                      src={form.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-6xl text-gray-400">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Upload Button Overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg">
                  <div className="text-center text-white">
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs">{uploading ? 'Uploading...' : 'Upload Photo'}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              
              <div className="mt-4 text-center">
                <div className="inline-block px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full">
                  <p className="text-white text-sm font-semibold">
                    {isStudent ? form.studentId || 'STU-XXXXX' : form.employeeId || 'EMP-XXXXX'}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="md:col-span-2 space-y-4">
              {editing ? (
                // Edit Mode
                <div className="space-y-4 bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      className="bg-white"
                    />
                    <Input
                      label="Last Name"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="bg-white"
                    />
                  </div>
                  
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-white"
                  />

                  {isStudent && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label="Student ID"
                          value={form.studentId}
                          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                          className="bg-white"
                        />
                        <Input
                          label="Class"
                          value={form.class}
                          onChange={(e) => setForm({ ...form, class: e.target.value })}
                          placeholder="e.g., 10th"
                          className="bg-white"
                        />
                        <Input
                          label="Division"
                          value={form.division}
                          onChange={(e) => setForm({ ...form, division: e.target.value })}
                          placeholder="e.g., A"
                          className="bg-white"
                        />
                      </div>
                    </>
                  )}

                  {isTeacher && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Employee ID"
                          value={form.employeeId}
                          onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                          className="bg-white"
                        />
                        <Input
                          label="Department"
                          value={form.department}
                          onChange={(e) => setForm({ ...form, department: e.target.value })}
                          placeholder="e.g., Computer Science"
                          className="bg-white"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)} className="bg-white">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-blue-200 text-sm uppercase tracking-wide mb-1">Full Name</p>
                        <p className="text-white text-2xl font-bold">{form.firstName} {form.lastName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-blue-200 text-sm uppercase tracking-wide mb-1">Position</p>
                          <p className="text-white text-lg font-semibold capitalize">{user?.role}</p>
                        </div>
                        {isStudent && form.class && (
                          <>
                            <div>
                              <p className="text-blue-200 text-sm uppercase tracking-wide mb-1">Class</p>
                              <p className="text-white text-lg font-semibold">{form.class}</p>
                            </div>
                            {form.division && (
                              <div>
                                <p className="text-blue-200 text-sm uppercase tracking-wide mb-1">Division</p>
                                <p className="text-white text-lg font-semibold">{form.division}</p>
                              </div>
                            )}
                          </>
                        )}
                        {isTeacher && form.department && (
                          <div>
                            <p className="text-blue-200 text-sm uppercase tracking-wide mb-1">Department</p>
                            <p className="text-white text-lg font-semibold">{form.department}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-blue-200 text-sm uppercase tracking-wide mb-1">Email</p>
                        <p className="text-white text-lg">{form.email}</p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setEditing(true)} className="w-full bg-white text-blue-600 hover:bg-blue-50">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 text-center border-t border-white border-opacity-30">
          <p className="text-white text-xs">
            This is an official identification card • Valid for Academic Year 2024-2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
