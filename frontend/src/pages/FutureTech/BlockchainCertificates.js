import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { ShieldCheckIcon, DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';

const BlockchainCertificates = () => {
  const [certificates] = useState([
    {
      id: 1,
      title: 'Web Development Fundamentals',
      issuer: 'student teacher portal',
      date: '2024-01-15',
      hash: '0x1234567890abcdef...',
      verified: true,
      type: 'course_completion',
    },
    {
      id: 2,
      title: 'JavaScript Mastery',
      issuer: 'student teacher portal',
      date: '2024-01-10',
      hash: '0xabcdef1234567890...',
      verified: true,
      type: 'skill_badge',
    },
    {
      id: 3,
      title: 'Perfect Attendance',
      issuer: 'student teacher portal',
      date: '2024-01-05',
      hash: '0x567890abcdef1234...',
      verified: true,
      type: 'achievement',
    },
  ]);

  const handleViewCertificate = (certificate) => {
    // In a real implementation, this would open a detailed view or download the certificate
    console.log('View certificate:', certificate);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
          <ShieldCheckIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blockchain Certificates</h1>
          <p className="text-gray-600">Secure, tamper-proof digital certificates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Certificates</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{certificate.title}</h3>
                        <p className="text-sm text-gray-600">Issued by: {certificate.issuer}</p>
                        <p className="text-xs text-gray-500">Date: {certificate.date}</p>
                        <p className="text-xs text-gray-500 font-mono">Hash: {certificate.hash}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="badge badge-success">Verified</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCertificate(certificate)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Verification</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Blockchain Verified</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    All certificates are stored on the blockchain and cannot be tampered with.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Digital Signature</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Each certificate is cryptographically signed by the issuing institution.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900">Public Verification</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    Anyone can verify the authenticity of your certificates using the blockchain hash.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verify Certificate</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Certificate Hash</label>
                  <input
                    type="text"
                    placeholder="Enter certificate hash..."
                    className="form-input"
                  />
                </div>
                <Button variant="primary" fullWidth>
                  Verify Certificate
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlockchainCertificates;
