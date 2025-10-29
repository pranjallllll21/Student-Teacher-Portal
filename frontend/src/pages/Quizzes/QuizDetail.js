import React from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';

const QuizDetail = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quiz Details</h1>
        <p className="text-gray-600">View quiz information and take the quiz</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Information</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quiz Details Coming Soon</h3>
            <p className="text-gray-600">
              Quiz information, question preview, and quiz taking interface will be available here.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default QuizDetail;
