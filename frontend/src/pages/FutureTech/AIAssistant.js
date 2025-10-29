import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { SparklesIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI learning assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I understand your question. This is a placeholder response from the AI assistant. In a real implementation, this would connect to an AI service like OpenAI or a custom model.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <SparklesIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Learning Assistant</h1>
          <p className="text-gray-600">Get personalized help with your studies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Chat with AI Assistant</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={loading}>
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Study Help</h3>
                  <p className="text-sm text-blue-700">Get explanations for difficult concepts</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900">Practice Problems</h3>
                  <p className="text-sm text-green-700">Generate practice questions and exercises</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900">Learning Path</h3>
                  <p className="text-sm text-purple-700">Get personalized study recommendations</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-900">Writing Assistant</h3>
                  <p className="text-sm text-yellow-700">Help with essays and assignments</p>
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
                  Explain this concept
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  Generate practice quiz
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  Create study plan
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  Help with homework
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
