import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className,
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <LoadingSpinner size="sm" className="mr-2" />
          Loading...
        </div>
      ) : (
        <div className="flex items-center">
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </div>
      )}
    </button>
  );
};

export const IconButton = ({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    warning: 'btn-warning',
    danger: 'btn-danger',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };
  
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      className={classes}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        icon
      )}
    </button>
  );
};

export const ButtonGroup = ({ children, className = '', ...props }) => {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

export { Button };
export default Button;
