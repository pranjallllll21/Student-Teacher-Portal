import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track performance and learning progress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600">
              Performance tracking, learning analytics, and detailed reports will be available here.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Analytics;
