import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`spinner ${sizeClasses[size]} ${className}`}></div>
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" className="mx-auto mb-4" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

export const ButtonLoader = ({ loading, children, ...props }) => (
  <button {...props} disabled={loading || props.disabled}>
    {loading ? (
      <div className="flex items-center">
        <LoadingSpinner size="sm" className="mr-2" />
        Loading...
      </div>
    ) : (
      children
    )}
  </button>
);

export const CardLoader = () => (
  <div className="card p-6">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

export const TableLoader = ({ rows = 5, cols = 4 }) => (
  <div className="card">
    <div className="overflow-hidden">
      <table className="table">
        <thead className="table-header">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="table-header-cell">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="table-row">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="table-cell">
                  <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default LoadingSpinner;
