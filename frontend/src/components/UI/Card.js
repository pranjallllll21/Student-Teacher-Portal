import React from 'react';

const Card = ({ children, className = '', hover = false, ...props }) => {
  const classes = [
    'card',
    hover ? 'hover:shadow-md transition-shadow duration-200' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`} {...props}>
      {children}
    </p>
  );
};

// Stat Card Component
export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  iconColor = 'primary',
  className = '',
  ...props 
}) => {
  const changeClasses = {
    positive: 'stat-change positive',
    negative: 'stat-change negative',
    neutral: 'text-gray-600',
  };

  const iconColorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    accent: 'text-accent-600',
    success: 'text-success-600',
    warning: 'text-warning-600',
    info: 'text-info-600',
    sage: 'text-sage-600',
  };

  return (
    <Card className={`stat-card ${className}`} {...props}>
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          {change && (
            <p className={changeClasses[changeType]}>
              {changeType === 'positive' && '+'}
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className={`text-3xl ${iconColorClasses[iconColor] || iconColorClasses.primary}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

// Feature Card Component
export const FeatureCard = ({ 
  title, 
  description, 
  icon,
  className = '',
  ...props 
}) => {
  return (
    <Card className={`text-center ${className}`} hover {...props}>
      <CardBody>
        {icon && (
          <div className="text-4xl text-primary-600 mb-4">
            {icon}
          </div>
        )}
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardBody>
    </Card>
  );
};

// Course Card Component
export const CourseCard = ({ 
  course,
  onEnroll,
  onView,
  className = '',
  ...props 
}) => {
  const { title, description, instructor, level, credits, enrollmentCount, maxStudents } = course;

  return (
    <Card className={`${className}`} hover {...props}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-1">{title}</CardTitle>
            <CardDescription>
              by {instructor?.firstName} {instructor?.lastName}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <span className="badge badge-primary">{level}</span>
            <span className="text-sm text-gray-500">{credits} credits</span>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{enrollmentCount}/{maxStudents} students</span>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full" 
              style={{ width: `${(enrollmentCount / maxStudents) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardBody>
      
      <CardFooter>
        <div className="flex space-x-2">
          <button 
            onClick={() => onView(course)}
            className="btn btn-outline flex-1"
          >
            View Details
          </button>
          <button 
            onClick={() => onEnroll(course)}
            className="btn btn-primary flex-1"
          >
            Enroll
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Badge Card Component
export const BadgeCard = ({ 
  badge,
  earned = false,
  className = '',
  ...props 
}) => {
  const { name, description, icon, rarity } = badge;

  const rarityClasses = {
    common: 'border-gray-300',
    uncommon: 'border-green-300',
    rare: 'border-blue-300',
    epic: 'border-purple-300',
    legendary: 'border-yellow-300',
  };

  return (
    <Card className={`text-center ${earned ? 'ring-2 ring-primary-500' : ''} ${className}`} {...props}>
      <CardBody>
        <div className={`text-4xl mb-3 ${earned ? 'animate-bounce-slow' : 'opacity-50'}`}>
          {icon}
        </div>
        <CardTitle className="mb-2">{name}</CardTitle>
        <CardDescription className="mb-3">{description}</CardDescription>
        <div className={`badge ${rarityClasses[rarity]} ${earned ? 'badge-success' : 'badge-gray'}`}>
          {rarity}
        </div>
      </CardBody>
    </Card>
  );
};

export { Card, CardHeader, CardBody, CardFooter, CardTitle, CardDescription };
