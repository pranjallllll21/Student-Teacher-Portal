import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon,
  LightBulbIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI learning assistant powered by advanced AI. I can help you with:\n\n• Explaining complex concepts\n• Solving problems step-by-step\n• Creating study materials\n• Answering questions\n• Providing learning recommendations\n\nWhat would you like to learn today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Response Generator with context-aware responses
  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Math-related responses
    if (input.includes('math') || input.includes('calculate') || input.includes('solve')) {
      return `I'd be happy to help with math! Here's how I can assist:

1. **Problem Solving**: I can walk you through step-by-step solutions
2. **Concept Explanation**: Understanding the theory behind the math
3. **Practice Problems**: Generate similar problems for practice

What specific math topic or problem would you like help with?`;
    }
    
    // Science-related responses
    if (input.includes('science') || input.includes('physics') || input.includes('chemistry') || input.includes('biology')) {
      return `Science is fascinating! I can help you with:

• **Concept Explanations**: Breaking down complex scientific ideas
• **Experiments**: Understanding lab work and procedures
• **Study Guides**: Creating summaries and notes
• **Practice Questions**: Testing your knowledge

Which science topic interests you?`;
    }
    
    // Programming/coding responses
    if (input.includes('code') || input.includes('program') || input.includes('javascript') || input.includes('python')) {
      return `Let's dive into coding! I can assist with:

\`\`\`
• Debugging code issues
• Explaining programming concepts
• Code examples and best practices
• Algorithm explanations
• Project guidance
\`\`\`

What programming challenge are you working on?`;
    }
    
    // Writing/essay help
    if (input.includes('write') || input.includes('essay') || input.includes('paper')) {
      return `I can help you become a better writer! Here's what I offer:

📝 **Essay Structure**: Introduction, body paragraphs, conclusion
✍️ **Grammar & Style**: Improving clarity and flow
💡 **Brainstorming**: Generating ideas and outlines
🔍 **Research Tips**: Finding and citing sources

What are you writing about?`;
    }
    
    // Study help
    if (input.includes('study') || input.includes('exam') || input.includes('test')) {
      return `Let me help you study effectively! I can:

🎯 Create a personalized study schedule
📚 Generate practice questions
🧠 Use memory techniques and mnemonics
⏰ Suggest break schedules using Pomodoro technique
✅ Track your progress

What subject are you preparing for?`;
    }

    // Homework help
    if (input.includes('homework') || input.includes('assignment')) {
      return `I'm here to help with your homework! I can:

1. Break down complex problems into simpler steps
2. Explain concepts you're struggling with
3. Provide examples similar to your problems
4. Help you check your work

**Note**: I'll guide you to understand and solve it yourself - that's the best way to learn!

What's the homework about?`;
    }

    // Default intelligent response
    return `That's an interesting question! Let me help you explore this topic:

🔍 **Analysis**: I've processed your query and can provide detailed explanations
💡 **Learning Path**: I'll break this down into manageable steps
📊 **Resources**: I can suggest relevant materials and examples

Could you provide more details about what you'd like to know? The more specific you are, the better I can help!`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setLoading(true);

    // Simulate AI processing with intelligent response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(currentInput),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const handleQuickAction = (action) => {
    setInputMessage(action);
    setSelectedTopic(action);
  };

  const suggestedTopics = [
    { icon: BookOpenIcon, text: "Help me understand calculus", color: "blue" },
    { icon: AcademicCapIcon, text: "Explain photosynthesis process", color: "green" },
    { icon: LightBulbIcon, text: "How to write a good essay?", color: "yellow" },
    { icon: ClockIcon, text: "Create a study schedule for exams", color: "purple" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Learning Assistant</h1>
            <p className="text-gray-600">Powered by advanced AI • Get instant help with your studies</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-700">AI Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Suggested Topics (shown when chat is empty) */}
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestedTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(topic.text)}
                  className={`p-4 bg-${topic.color}-50 hover:bg-${topic.color}-100 border-2 border-${topic.color}-200 rounded-xl text-left transition-all hover:scale-105 hover:shadow-md`}
                >
                  <div className="flex items-start space-x-3">
                    <topic.icon className={`h-6 w-6 text-${topic.color}-600 flex-shrink-0`} />
                    <p className={`text-sm font-medium text-${topic.color}-900`}>{topic.text}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Chat Card */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600" />
                  <span>Chat with AI</span>
                </CardTitle>
                <span className="text-xs text-gray-500">{messages.length} messages</span>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {/* Messages Container */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-md ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <SparklesIcon className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-semibold text-purple-600">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 px-5 py-3 rounded-2xl shadow-md border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-purple-600 font-medium">AI is analyzing...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything... (e.g., 'Explain quantum physics' or 'Help with my math homework')"
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                      className="border-2 border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={loading || !inputMessage.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6"
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Capabilities */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center space-x-2">
                <SparklesIcon className="h-5 w-5 text-blue-600" />
                <span>AI Capabilities</span>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start space-x-2">
                    <BookOpenIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 text-sm">Study Help</h3>
                      <p className="text-xs text-blue-700 mt-1">Explanations, examples, and concept breakdowns</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start space-x-2">
                    <AcademicCapIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-900 text-sm">Practice Problems</h3>
                      <p className="text-xs text-green-700 mt-1">Generate custom quizzes and exercises</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-start space-x-2">
                    <LightBulbIcon className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-purple-900 text-sm">Smart Insights</h3>
                      <p className="text-xs text-purple-700 mt-1">Personalized learning recommendations</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start space-x-2">
                    <ClockIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 text-sm">Study Planning</h3>
                      <p className="text-xs text-yellow-700 mt-1">Schedules, time management, exam prep</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  fullWidth 
                  size="sm"
                  onClick={() => handleQuickAction("Explain a difficult concept I'm struggling with")}
                  className="justify-start hover:bg-purple-50 hover:border-purple-300"
                >
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  Explain Concept
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  size="sm"
                  onClick={() => handleQuickAction("Generate a practice quiz to test my knowledge")}
                  className="justify-start hover:bg-green-50 hover:border-green-300"
                >
                  <AcademicCapIcon className="h-4 w-4 mr-2" />
                  Practice Quiz
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  size="sm"
                  onClick={() => handleQuickAction("Create a study plan for my upcoming exams")}
                  className="justify-start hover:bg-blue-50 hover:border-blue-300"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Study Plan
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  size="sm"
                  onClick={() => handleQuickAction("Help me with my homework assignment")}
                  className="justify-start hover:bg-yellow-50 hover:border-yellow-300"
                >
                  <LightBulbIcon className="h-4 w-4 mr-2" />
                  Homework Help
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* AI Stats */}
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
            <CardBody>
              <div className="text-center space-y-2">
                <SparklesIcon className="h-8 w-8 mx-auto" />
                <h3 className="font-bold text-lg">AI-Powered Learning</h3>
                <p className="text-sm text-purple-100">
                  Get instant, intelligent responses tailored to your learning style
                </p>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-xs text-purple-100">Available</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                    <div className="text-2xl font-bold">∞</div>
                    <div className="text-xs text-purple-100">Topics</div>
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

export default AIAssistant;
