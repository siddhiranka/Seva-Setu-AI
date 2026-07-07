import React from 'react';

const Loader = ({ type = 'spinner', count = 3 }) => {
  if (type === 'skeleton') {
    return (
      <div className="space-y-4 w-full">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
          >
            <div className="shimmer h-6 w-1/3 rounded-lg mb-4"></div>
            <div className="shimmer h-4 w-full rounded-lg mb-2"></div>
            <div className="shimmer h-4 w-5/6 rounded-lg mb-4"></div>
            <div className="flex gap-2">
              <div className="shimmer h-8 w-24 rounded-xl"></div>
              <div className="shimmer h-8 w-20 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 w-full" role="status" aria-live="polite">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-primary dark:border-t-saffron animate-spin"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
