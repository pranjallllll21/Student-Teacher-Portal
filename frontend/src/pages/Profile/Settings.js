import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Coming Soon</h3>
            <p className="text-gray-600">
              Account settings, preferences, and configuration options will be available here.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Settings;
