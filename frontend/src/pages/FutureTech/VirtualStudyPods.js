import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { UserGroupIcon, VideoCameraIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const VirtualStudyPods = () => {
  const [studyPods] = useState([
    {
      id: 1,
      name: 'Web Development Study Group',
      subject: 'Computer Science',
      members: 8,
      maxMembers: 12,
      isActive: true,
      nextSession: '2024-01-20 14:00',
    },
    {
      id: 2,
      name: 'Mathematics Problem Solving',
      subject: 'Mathematics',
      members: 6,
      maxMembers: 10,
      isActive: true,
      nextSession: '2024-01-21 16:00',
    },
    {
      id: 3,
      name: 'Language Learning Exchange',
      subject: 'Languages',
      members: 4,
      maxMembers: 8,
      isActive: false,
      nextSession: '2024-01-22 18:00',
    },
  ]);

  const [availablePods] = useState([
    {
      id: 4,
      name: 'Physics Study Group',
      subject: 'Physics',
      members: 3,
      maxMembers: 8,
      description: 'Working through advanced physics problems together',
    },
    {
      id: 5,
      name: 'History Discussion',
      subject: 'History',
      members: 5,
      maxMembers: 10,
      description: 'Exploring historical events and their impact',
    },
  ]);

  const handleJoinPod = (pod) => {
    console.log('Join study pod:', pod);
  };

  const handleCreatePod = () => {
    console.log('Create new study pod');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
          <UserGroupIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Virtual Study Pods</h1>
          <p className="text-gray-600">Collaborate and learn together in virtual spaces</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* My Study Pods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Study Pods</CardTitle>
                <Button variant="primary" size="sm" onClick={handleCreatePod}>
                  Create New Pod
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {studyPods.map((pod) => (
                  <div
                    key={pod.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{pod.name}</h3>
                        <p className="text-sm text-gray-600">{pod.subject}</p>
                        <p className="text-xs text-gray-500">
                          {pod.members}/{pod.maxMembers} members
                        </p>
                        <p className="text-xs text-gray-500">
                          Next session: {pod.nextSession}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${pod.isActive ? 'badge-success' : 'badge-gray'}`}>
                        {pod.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button variant="outline" size="sm">
                        <VideoCameraIcon className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Available Study Pods */}
          <Card>
            <CardHeader>
              <CardTitle>Available Study Pods</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {availablePods.map((pod) => (
                  <div
                    key={pod.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{pod.name}</h3>
                        <p className="text-sm text-gray-600">{pod.subject}</p>
                        <p className="text-sm text-gray-500">{pod.description}</p>
                        <p className="text-xs text-gray-500">
                          {pod.members}/{pod.maxMembers} members
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleJoinPod(pod)}
                    >
                      Join Pod
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Pod Features</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <VideoCameraIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Video Calls</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    High-quality video conferencing for study sessions
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Real-time Chat</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Instant messaging and file sharing during sessions
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Collaborative Tools</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    Shared whiteboards and document collaboration
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <Button variant="outline" fullWidth size="sm">
                  Find Study Partners
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  Schedule Study Session
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  Browse All Pods
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  Study Pod Analytics
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VirtualStudyPods;
