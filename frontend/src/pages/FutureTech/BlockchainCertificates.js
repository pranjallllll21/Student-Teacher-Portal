import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  EyeIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowUpIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const BlockchainCertificates = () => {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  
  const [certificates, setCertificates] = useState([
    {
      id: 1,
      title: 'Web Development Fundamentals',
      issuer: 'SMARTCONNECT',
      recipient: 'John Doe',
      date: '2024-01-15',
      hash: '0x1234567890abcdef1234567890abcdef12345678',
      verified: true,
      type: 'course_completion',
      grade: 'A+',
    },
    {
      id: 2,
      title: 'JavaScript Mastery',
      issuer: 'SMARTCONNECT',
      recipient: 'John Doe',
      date: '2024-01-10',
      hash: '0xabcdef1234567890abcdef1234567890abcdef12',
      verified: true,
      type: 'skill_badge',
      grade: 'A',
    },
    {
      id: 3,
      title: 'Perfect Attendance Award',
      issuer: 'SMARTCONNECT',
      recipient: 'John Doe',
      date: '2024-01-05',
      hash: '0x567890abcdef1234567890abcdef1234567890ab',
      verified: true,
      type: 'achievement',
      grade: null,
    },
  ]);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    recipient: '',
    type: 'course_completion',
    grade: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [verifyHash, setVerifyHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleViewCertificate = (certificate) => {
    toast.success(`Viewing certificate: ${certificate.title}`, {
      icon: '📜',
    });
    // In a real implementation, this would open a detailed view or download the certificate
    console.log('View certificate:', certificate);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setUploadForm({ ...uploadForm, file });
      toast.success(`File selected: ${file.name}`);
    }
  };

  const generateBlockchainHash = () => {
    // Simulate blockchain hash generation
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 40; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const handleUploadCertificate = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.recipient || !uploadForm.file) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);

    // Simulate blockchain upload
    setTimeout(() => {
      const newCertificate = {
        id: certificates.length + 1,
        title: uploadForm.title,
        issuer: 'SMARTCONNECT',
        recipient: uploadForm.recipient,
        date: new Date().toISOString().split('T')[0],
        hash: generateBlockchainHash(),
        verified: true,
        type: uploadForm.type,
        grade: uploadForm.grade || null,
      };

      setCertificates([newCertificate, ...certificates]);
      
      toast.success('Certificate uploaded to blockchain successfully!', {
        icon: '🔗',
        duration: 4000,
      });

      // Reset form
      setUploadForm({
        title: '',
        recipient: '',
        type: 'course_completion',
        grade: '',
        description: '',
        file: null
      });
      
      // Reset file input
      const fileInput = document.getElementById('certificate-file');
      if (fileInput) fileInput.value = '';
      
      setUploading(false);
    }, 2000);
  };

  const handleVerifyCertificate = () => {
    if (!verifyHash.trim()) {
      toast.error('Please enter a certificate hash');
      return;
    }

    const found = certificates.find(cert => cert.hash.toLowerCase() === verifyHash.toLowerCase());
    
    if (found) {
      setVerificationResult({
        verified: true,
        certificate: found
      });
      toast.success('Certificate verified on blockchain!', {
        icon: '✅',
      });
    } else {
      setVerificationResult({
        verified: false,
        certificate: null
      });
      toast.error('Certificate not found on blockchain', {
        icon: '❌',
      });
    }
  };


  const getCertificateTypeColor = (type) => {
    const colors = {
      course_completion: 'blue',
      skill_badge: 'green',
      achievement: 'purple',
    };
    return colors[type] || 'gray';
  };

  const getCertificateTypeLabel = (type) => {
    const labels = {
      course_completion: 'Course Completion',
      skill_badge: 'Skill Badge',
      achievement: 'Achievement',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <ShieldCheckIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blockchain Certificates</h1>
            <p className="text-gray-600">Secure, tamper-proof digital credentials on the blockchain</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{certificates.length} Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Certificate Form (Teachers/Admin Only) */}
          {isTeacher && (
            <Card className="shadow-lg border-2 border-indigo-200">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <CardTitle className="flex items-center space-x-2">
                  <CloudArrowUpIcon className="h-5 w-5 text-indigo-600" />
                  <span>Issue New Certificate</span>
                </CardTitle>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleUploadCertificate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Certificate Title *</label>
                      <input
                        type="text"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                        placeholder="e.g., Advanced Mathematics"
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Recipient Name *</label>
                      <input
                        type="text"
                        value={uploadForm.recipient}
                        onChange={(e) => setUploadForm({ ...uploadForm, recipient: e.target.value })}
                        placeholder="Student name"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Certificate Type *</label>
                      <select
                        value={uploadForm.type}
                        onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                        className="form-input"
                      >
                        <option value="course_completion">Course Completion</option>
                        <option value="skill_badge">Skill Badge</option>
                        <option value="achievement">Achievement</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Grade (Optional)</label>
                      <input
                        type="text"
                        value={uploadForm.grade}
                        onChange={(e) => setUploadForm({ ...uploadForm, grade: e.target.value })}
                        placeholder="e.g., A+, 95%"
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                      placeholder="Add any additional details about this certificate..."
                      className="form-input"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="form-label flex items-center space-x-2">
                      <DocumentArrowUpIcon className="h-5 w-5 text-gray-600" />
                      <span>Upload Certificate File (PDF, PNG, JPG) *</span>
                    </label>
                    <input
                      id="certificate-file"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="form-input"
                      required
                    />
                    {uploadForm.file && (
                      <p className="text-sm text-green-600 mt-2 flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        {uploadForm.file.name} selected
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setUploadForm({
                          title: '',
                          recipient: '',
                          type: 'course_completion',
                          grade: '',
                          description: '',
                          file: null
                        });
                        document.getElementById('certificate-file').value = '';
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      disabled={uploading}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading to Blockchain...
                        </>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                          Issue Certificate
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          {/* Certificates List */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center justify-between">
                <span>My Certificates</span>
                <span className="text-sm font-normal text-gray-600">{certificates.length} total</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {certificates.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-14 h-14 bg-${getCertificateTypeColor(certificate.type)}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <DocumentTextIcon className={`h-7 w-7 text-${getCertificateTypeColor(certificate.type)}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{certificate.title}</h3>
                          {certificate.verified && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Recipient: {certificate.recipient}</p>
                        <p className="text-sm text-gray-600">Issued by: {certificate.issuer} • {certificate.date}</p>
                        {certificate.grade && (
                          <p className="text-sm font-medium text-blue-600">Grade: {certificate.grade}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`badge badge-${getCertificateTypeColor(certificate.type)}`}>
                            {getCertificateTypeLabel(certificate.type)}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(certificate.hash);
                              toast.success('Hash copied to clipboard!');
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700 font-mono flex items-center"
                          >
                            <LinkIcon className="h-3 w-3 mr-1" />
                            {certificate.hash.substring(0, 20)}...
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCertificate(certificate)}
                        className="whitespace-nowrap"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                
                {certificates.length === 0 && (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No certificates yet</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Blockchain Info */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                <span>Blockchain Security</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 text-sm">Tamper-Proof</h3>
                      <p className="text-xs text-green-700 mt-1">Certificates stored on blockchain cannot be altered or forged</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start space-x-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm">Digital Signature</h3>
                      <p className="text-xs text-blue-700 mt-1">Cryptographically signed by the issuing institution</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-start space-x-2">
                    <EyeIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-900 text-sm">Public Verification</h3>
                      <p className="text-xs text-purple-700 mt-1">Anyone can verify authenticity using the hash</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start space-x-2">
                    <LinkIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 text-sm">Permanent Record</h3>
                      <p className="text-xs text-yellow-700 mt-1">Certificates remain accessible forever on the blockchain</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Verify Certificate */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle>Verify Certificate</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Certificate Hash</label>
                  <input
                    type="text"
                    value={verifyHash}
                    onChange={(e) => setVerifyHash(e.target.value)}
                    placeholder="Enter hash (0x...)"
                    className="form-input font-mono text-sm"
                  />
                </div>
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={handleVerifyCertificate}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Verify on Blockchain
                </Button>

                {verificationResult && (
                  <div className={`p-4 rounded-lg ${verificationResult.verified ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                    <div className="flex items-start space-x-2">
                      {verificationResult.verified ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <h3 className={`font-semibold ${verificationResult.verified ? 'text-green-900' : 'text-red-900'}`}>
                          {verificationResult.verified ? 'Certificate Verified!' : 'Not Found'}
                        </h3>
                        {verificationResult.verified && verificationResult.certificate && (
                          <div className="text-sm text-green-700 mt-2 space-y-1">
                            <p><strong>Title:</strong> {verificationResult.certificate.title}</p>
                            <p><strong>Recipient:</strong> {verificationResult.certificate.recipient}</p>
                            <p><strong>Date:</strong> {verificationResult.certificate.date}</p>
                          </div>
                        )}
                        {!verificationResult.verified && (
                          <p className="text-sm text-red-700 mt-1">
                            This certificate hash was not found on the blockchain
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Stats Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
            <CardBody>
              <div className="text-center space-y-3">
                <ShieldCheckIcon className="h-10 w-10 mx-auto" />
                <h3 className="font-bold text-lg">Blockchain Powered</h3>
                <p className="text-sm text-blue-100">
                  Your certificates are secured by blockchain technology
                </p>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">{certificates.length}</div>
                    <div className="text-xs text-blue-100">Certificates</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold">100%</div>
                    <div className="text-xs text-blue-100">Verified</div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlockchainCertificates;
