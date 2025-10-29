import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { MegaphoneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const AnnouncementsMessages = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements & Messages</h1>
          <p className="text-gray-600">Send announcements or messages to users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 mb-4">Create and send important announcements to all users or specific groups.</p>
            <Link to="/announcements">
              <Button variant="primary">
                <MegaphoneIcon className="h-4 w-4 mr-2" />
                Go to Announcements
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 mb-4">Send direct messages or group messages using the messaging system.</p>
            <Link to="/messages">
              <Button variant="outline">
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Go to Messages
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AnnouncementsMessages;
