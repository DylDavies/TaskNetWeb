"use client";
import { useState, useEffect } from 'react';
import { getCompletionStats } from '../server/services/adminService';
import StatsDashboard from '../components/temporarygraphs/graphs';
import CompletionStats from '../interfaces/CompletionStatsInterface';
import { ErrorBoundary } from 'react-error-boundary';
import { EmptyState } from '../components/EmptyState/EmptyState';
import { RefreshCw } from 'lucide-react';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <p>Something went wrong:</p>
      <pre className="mt-2 text-sm">{error.message}</pre>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const data = await getCompletionStats(startDate, endDate);
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadStats();
  }, [startDate, endDate]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!stats || stats.totalProjects == 0) return (
    <EmptyState 
      title="No analytics data"
      description="We couldn't find any project data for the selected date range. Try adjusting your filters."
      action={
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </button>
      }
    />
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate.toISOString().split('T')[0]} 
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate.toISOString().split('T')[0]} 
            onChange={(e) => setEndDate(new Date(e.target.value))}
            className="p-2 border rounded"
          />
        </div>
      </div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
            <StatsDashboard stats={stats} startDate={startDate} endDate={endDate} />
        </ErrorBoundary>

    </div>
  );
}