// components/EmptyState.tsx
'use client'

import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  title = "No data available",
  description = "There are no records to display for the selected criteria",
  action
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-24 h-24 mb-4 rounded-full bg-gray-50 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-200 mb-1">{title}</h3>
      <p className="text-gray-400 max-w-md mb-4">{description}</p>
      {action || (
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh data
        </button>
      )}
    </div>
  );
}