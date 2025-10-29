import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { HeartIcon, ChartBarIcon, CalendarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const MentalHealth = () => {
  const [moodData] = useState([
    { date: '2024-01-15', mood: 4, stress: 3, sleep: 7 },
    { date: '2024-01-16', mood: 3, stress: 4, sleep: 6 },
    { date: '2024-01-17', mood: 5, stress: 2, sleep: 8 },
    { date: '2024-01-18', mood: 4, stress: 3, sleep: 7 },
    { date: '2024-01-19', mood: 5, stress: 2, sleep: 8 },
  ]);

  const [resources] = useState([
    {
      id: 1,
      title: 'Stress Management Techniques',
      type: 'article',
      duration: '5 min read',
      description: 'Learn effective ways to manage academic stress',
    },
    {
      id: 2,
      title: 'Mindfulness Meditation',
      type: 'audio',
      duration: '10 min',
      description: 'Guided meditation for relaxation and focus',
    },
    {
      id: 3,
      title: 'Study-Life Balance',
      type: 'video',
      duration: '15 min',
      description: 'Tips for maintaining a healthy study-life balance',
    },
  ]);

  const [currentMood, setCurrentMood] = useState(0);
  const [currentStress, setCurrentStress] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);

  const handleSubmitMood = () => {
    console.log('Submit mood data:', { currentMood, currentStress, sleepHours });
  };

  const getMoodEmoji = (mood) => {
    const emojis = ['😢', '😔', '😐', '😊', '😄', '🤩'];
    return emojis[mood] || '😐';
  };

  const getStressColor = (stress) => {
    if (stress <= 2) return 'text-green-600';
    if (stress <= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
          <HeartIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mental Health & Wellness</h1>
          <p className="text-gray-600">Track your wellbeing and access mental health resources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Mood Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Mood Check-in</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <label className="form-label">How are you feeling today?</label>
                  <div className="flex justify-between items-center mt-2">
                    {[1, 2, 3, 4, 5].map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setCurrentMood(mood)}
                        className={`text-4xl p-2 rounded-lg transition-colors ${
                          currentMood === mood ? 'bg-primary-100' : 'hover:bg-gray-100'
                        }`}
                      >
                        {getMoodEmoji(mood)}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Very Low</span>
                    <span>Very High</span>
                  </div>
                </div>

                <div>
                  <label className="form-label">Stress Level (1-5)</label>
                  <div className="flex justify-between items-center mt-2">
                    {[1, 2, 3, 4, 5].map((stress) => (
                      <button
                        key={stress}
                        onClick={() => setCurrentStress(stress)}
                        className={`w-12 h-12 rounded-full border-2 transition-colors ${
                          currentStress === stress
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        {stress}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="form-label">Hours of Sleep Last Night</label>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseInt(e.target.value) || 0)}
                    className="form-input w-24"
                  />
                </div>

                <Button onClick={handleSubmitMood} variant="primary" fullWidth>
                  Submit Check-in
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Mood History */}
          <Card>
            <CardHeader>
              <CardTitle>Mood History</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {moodData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getMoodEmoji(day.mood)}</div>
                      <div>
                        <p className="font-medium text-gray-900">{day.date}</p>
                        <p className="text-sm text-gray-600">
                          Sleep: {day.sleep}h | Stress: 
                          <span className={getStressColor(day.stress)}> {day.stress}/5</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Mood: {day.mood}/5
                      </div>
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
              <CardTitle>Wellness Resources</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{resource.duration}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Access
                      </Button>
                    </div>
                  </div>
                ))}
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
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Schedule Counseling
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Crisis Support
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" fullWidth size="sm">
                  <HeartIcon className="h-4 w-4 mr-2" />
                  Wellness Tips
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Resources</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <h3 className="font-medium text-red-900">Crisis Hotline</h3>
                  <p className="text-sm text-red-700">988 - Suicide & Crisis Lifeline</p>
                  <p className="text-xs text-red-600">Available 24/7</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Student Counseling</h3>
                  <p className="text-sm text-blue-700">(555) 123-4567</p>
                  <p className="text-xs text-blue-600">Mon-Fri 9AM-5PM</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;
