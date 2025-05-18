"use client";
import { useState, useEffect } from 'react';

import { RefreshCw } from 'lucide-react';
import CompletionStats from '@/app/interfaces/CompletionStatsInterface';
import { getCompletionStats } from '@/app/server/services/statsService';
import { EmptyState } from '../EmptyState/EmptyState';
import { ErrorBoundary } from 'react-error-boundary';
import CompletionInfo from '../CompletionRateInfo/CompletionRateInfo';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { isValidDateString } from '@/app/server/formatters/FormatDates';
import { exportCompletionStatsToPDF } from '@/app/components/PDFBuilder/PDFBuilder';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <section role="alert" className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <p>Something went wrong:</p>
      <pre className="mt-2 text-sm">{error.message}</pre>
    </section>
  );
}

//This component will display the completion stats
export default function AnalyticsPage() {
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [startInput, setStartInput] = useState(startDate.toISOString().split('T')[0]);
  const [endInput, setEndInput] = useState(endDate.toISOString().split('T')[0]);

  //Handle and validate a change in the date range
  const handleChangeFilters = () => {
    if (!isValidDateString(startInput)) {
      toast.error("Please enter a valid start date.");
      return;
    }

    if (!isValidDateString(endInput)) {
      toast.error("Please enter a valid end date.");
      return;
    }
  
    const newStartDate = new Date(startInput);
    const newEndDate = new Date(endInput);
    
      if (newStartDate > newEndDate) {
        toast.error("Start date cannot be after end date.");
        setStartInput(startDate.toISOString().split('T')[0]);
      } else {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
      }
  };


  //Will load stats for the given dates, will reload stats when these dates change
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
    setEndInput(endDate.toISOString().split('T')[0]);
    setStartInput(startDate.toISOString().split('T')[0]);
    loadStats();
  }, [startDate, endDate]);

  //Displays a loading screen
  if (loading) return (
    <section className="flex justify-center items-center h-64">
      <section className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></section>
    </section>
  );

  //Resents the dates when there is an error
  function HandleErrorClick(){
    setStartDate(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    setEndDate(new Date())
    
  }

  //Allows the user to download the completion rate report
  async function HandleDownloadClick(){
     if (stats) {
    const loadingToast = toast.loading("Generating PDF"); 
    try {
      await exportCompletionStatsToPDF(stats, startDate, endDate);
      toast.success("PDF ready for download");
      toast.dismiss(loadingToast); 
    } catch (error) {
      toast.error("Failed to Generate PDF");
      toast.dismiss(loadingToast); 
      console.error(error);
    }
  } else {
    toast.error("Failed to Generate PDF - No data available");
  }
  }

  //Displays an error message if there is no stats for a given date range and prompts the user to enter a new set of ranges
  if (!stats || stats.totalProjects == 0) return (
    <EmptyState 
      title="No analytics data"
      description="We couldn't find any project data for the selected date range. Try adjusting your filters."
      action={
        <button
          onClick={() => HandleErrorClick()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </button>
      }
    />
  );

  return (
    <section className="p-6">
    <section className="mb-6 flex flex-wrap sm:flex-nowrap gap-4 items-end">
      {/* Start Date */}
      <section className="flex flex-col w-full sm:w-64">
        <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
        <input
          type="date"
          max={format(new Date(), 'yyyy-MM-dd')}
          value={startInput}
          onChange={(e) => setStartInput(e.target.value)}
          className="p-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </section>
  
      {/* End Date */}
      <section className="flex flex-col w-full sm:w-64">
        <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
        <input
          type="date"
          max={format(new Date(), 'yyyy-MM-dd')}
          value={endInput}
          onChange={(e) => setEndInput(e.target.value)}
          className="p-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </section>
  
      {/* Buttons */}
      <section className="ml-auto flex gap-4">
        <button
          onClick={handleChangeFilters}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-900 hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          Apply Filters
        </button>

        <button
          onClick={() => HandleDownloadClick()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-violet-900 hover:bg-violet-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
        >
          Download Report
        </button>
      </section>
    </section>

    {/* Error boundary where information is loaded*/}
    <ErrorBoundary FallbackComponent={ErrorFallback}>
        <CompletionInfo stats={stats} startDate={startDate} endDate={endDate} />
    </ErrorBoundary>
  </section>
  );


  
}