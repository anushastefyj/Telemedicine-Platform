import React from 'react';

const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} animate-spin rounded-full border-t-primary-500 border-slate-200`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 bg-opacity-75">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center py-8">{spinner}</div>;
};

export default LoadingSpinner;
