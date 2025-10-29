import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  help,
  required = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        className={`form-input ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
      {help && !error && <p className="form-help">{help}</p>}
    </div>
  );
});

const Textarea = forwardRef(({
  label,
  error,
  help,
  required = false,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`form-input ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
      {help && !error && <p className="form-help">{help}</p>}
    </div>
  );
});

const Select = forwardRef(({
  label,
  error,
  help,
  required = false,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`form-input ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
      {help && !error && <p className="form-help">{help}</p>}
    </div>
  );
});

const Checkbox = forwardRef(({
  label,
  error,
  help,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      <label className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded ${error ? 'border-danger-500' : ''} ${className}`}
          {...props}
        />
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </label>
      {error && <p className="form-error">{error}</p>}
      {help && !error && <p className="form-help">{help}</p>}
    </div>
  );
});

const Radio = forwardRef(({
  label,
  error,
  help,
  options = [],
  className = '',
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && <p className="form-label">{label}</p>}
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value} className="flex items-center">
            <input
              ref={ref}
              type="radio"
              value={option.value}
              className={`form-radio h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 ${error ? 'border-danger-500' : ''} ${className}`}
              {...props}
            />
            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}
      {help && !error && <p className="form-help">{help}</p>}
    </div>
  );
});

const FileInput = forwardRef(({
  label,
  error,
  help,
  required = false,
  accept,
  multiple = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className={`form-input ${error ? 'border-danger-500 focus:ring-danger-500 focus:border-danger-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
      {help && !error && <p className="form-help">{help}</p>}
    </div>
  );
});

const SearchInput = forwardRef(({
  placeholder = 'Search...',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        ref={ref}
        type="text"
        placeholder={placeholder}
        className={`form-input pl-10 ${className}`}
        {...props}
      />
    </div>
  );
});

export {
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  FileInput,
  SearchInput,
};
