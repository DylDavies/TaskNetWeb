'use client';
import CompletionStats from '@/app/interfaces/CompletionStatsInterface';
import React from 'react';
import StatCard from '../StatCard/StatCard';
import BarChartComponent from '../BarChart/BarChart';
import PieChartComponent from '../PieChart/PieChart';
import CompletionBar from '../CompletionBar/CompletionBar';
import { ArrowTrendingUpIcon, BriefcaseIcon, CheckBadgeIcon, CheckCircleIcon, DocumentTextIcon, ListBulletIcon, MilestoneIcon, ProjectIcon, TrendingUpIcon } from '../Icons/Icons';

interface CompletionInfoProps {
  stats: CompletionStats;
  startDate: Date;
  endDate: Date;
}

const COLORS = [
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899'  // pink-500
];

const CompletionInfo: React.FC<CompletionInfoProps> = ({ stats, startDate, endDate }) => {
  const projectData = [
    { name: 'Completed', value: stats.completedProjects },
    { name: 'Hired', value: stats.hiredProjects },
    { name: 'Open To Applications', value: stats.totalProjects - stats.completedProjects - stats.hiredProjects },
  ];

  const milestoneData = [
    { name: 'Completed', value: stats.CompletedMilestones },
    { name: 'Pending', value: stats.totalMilestones - stats.CompletedMilestones },
  ];

  const completionRate = parseFloat(stats.completionRate.replace('%', ''));

  return (
    <section className="stats-dashboard p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Project Completion Statistics 
        <section className="block text-sm font-normal text-gray-400 mt-1">
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </section>
      </h2>
      
      {/* Stats Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Project Overview Card */}
        <section className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
            <ProjectIcon className="w-5 h-5" />
            Projects Overview
          </h3>
          <section className="grid grid-cols-2 gap-4">
            <StatCard 
              title="Total Projects" 
              value={stats.totalProjects} 
              icon={<DocumentTextIcon />}
              color="bg-gray-700" 
              textColor="text-indigo-300"
            />
            <StatCard 
              title="Completed" 
              value={stats.completedProjects} 
              icon={<CheckCircleIcon />}
              color="bg-gray-700" 
              textColor="text-emerald-300"
            />
            <StatCard 
              title="Hired" 
              value={stats.hiredProjects} 
              icon={<BriefcaseIcon />}
              color="bg-gray-700" 
              textColor="text-violet-300"
            />
            <StatCard 
              title="Completion Rate" 
              value={stats.completionRate} 
              icon={<TrendingUpIcon />}
              color="bg-gray-700" 
              textColor="text-amber-300"
            />
          </section>
        </section>

        {/* Milestones Overview Card */}
        <section className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
            <MilestoneIcon className="w-5 h-5" />
            Milestones Overview
          </h3>
          <section className="grid grid-cols-2 gap-4">
            <StatCard 
              title="Total Milestones" 
              value={stats.totalMilestones} 
              icon={<ListBulletIcon />}
              color="bg-gray-700" 
              textColor="text-blue-300"
            />
            <StatCard 
              title="Completed" 
              value={stats.CompletedMilestones} 
              icon={<CheckBadgeIcon />}
              color="bg-gray-700" 
              textColor="text-green-300"
            />
            <StatCard 
              title="Completion Rate" 
              value={stats.totalMilestones > 0 
                ? `${((stats.CompletedMilestones / stats.totalMilestones) * 100).toFixed(2)}%` 
                : '0%'}
              icon={<ArrowTrendingUpIcon />}
              color="bg-gray-700" 
              textColor="text-yellow-300"
            />
          </section>
        </section>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Pie Chart */}
        <section className="bg-gray-800 p-4 rounded-lg border border-gray-700 group" id="CompletionPieChart">
          <PieChartComponent 
            data={projectData} 
            colors={COLORS} 
            title="Projects Breakdown"
          />
        </section>

        {/* Milestones Bar Chart */}
        <section className="bg-gray-800 p-4 rounded-lg border border-gray-700 group">
          <BarChartComponent 
            data={milestoneData}
            colors={['#6366f1', '#f59e0b']}
            title="Milestones Progress"
          />
        </section>
      </section>

      {/* Completion Bar */}
      <section className="bg-gray-800 p-4 rounded-lg border border-gray-700 group mt-6">
        <CompletionBar value={completionRate} label="Overall Completion Rate" />
      </section>

    </section>
  );
};

export default CompletionInfo;