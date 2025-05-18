'use client';
import React from 'react';
import StatCard from '../StatCard/StatCard';
import { BriefcaseIcon, CheckCircleIcon, DocumentTextIcon, ProjectIcon, TrendingUpIcon } from '../Icons/Icons';
import SkillAreaAnalysis from '@/app/interfaces/SkillAreaAnalysis.interface';
import BarChartComponent from '../BarChart/BarChart';

interface StatsInfoProps {
  stats: SkillAreaAnalysis[];
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

const SkillsInfo: React.FC<StatsInfoProps> = ({ stats, startDate, endDate }) => {
    
    //formatting data for the bar chart
    const barChartData = stats.map(item => ({
        name: item.skillArea,
        value: item.totalProjects,
    }));

  return (
    <section className="stats-dashboard p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Skills Overview
        <section className="block text-sm font-normal text-gray-400 mt-1">
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </section>
      </h2>
      
      {/* Stats Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Project Overview Card */}
                {stats.map((analysis) => {
                    const mostInDemandSkill = analysis.mostInDemandSkills.length > 0
                        ? analysis.mostInDemandSkills[0].skill
                        : 'N/A';
                    return (
                        <section key={analysis.skillArea} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:shadow-lg transition-shadow">
                            <h3 className="text-lg font-semibold mb-3 text-white flex items-center gap-2">
                                <ProjectIcon className="w-5 h-5" />
                                {analysis.skillArea}
                            </h3>
                            <section className="grid grid-cols-2 gap-4">
                                <StatCard 
                                title="Total Projects" 
                                value={analysis.totalProjects} 
                                icon={<DocumentTextIcon />}
                                color="bg-gray-700" 
                                textColor="text-indigo-300"
                                />
                                <StatCard 
                                title="Completed Projects" 
                                value={analysis.completedProjects} 
                                icon={<CheckCircleIcon />}
                                color="bg-gray-700" 
                                textColor="text-emerald-300"
                                />
                                <StatCard 
                                title="Hired Projects" 
                                value={analysis.hiredProjects} 
                                icon={<BriefcaseIcon />}
                                color="bg-gray-700" 
                                textColor="text-violet-300"
                                />
                                <StatCard 
                                title="Most in demand skill" 
                                value={mostInDemandSkill} 
                                icon={<TrendingUpIcon />}
                                color="bg-gray-700" 
                                textColor="text-amber-300"
                                />

                            </section>
                        </section>

                    )
                })}
            </section>
            {/* Bar Chart */}
            <section className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <BarChartComponent
                    data={barChartData}
                    colors={COLORS}
                    title="Project Distribution by Skill Area"
                    angle={-45}
                    position='end'
                    height={500}
                    bottom={125}
                />
            </section>

    </section>
  );
};

export default SkillsInfo;