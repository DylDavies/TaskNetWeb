import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import CompletionStats from '@/app/interfaces/CompletionStatsInterface';

Chart.register(...registerables);

interface ProjectPieChartProps {
  stats: CompletionStats;
  width?: number;
  height?: number;
}

export const ProjectPieChart: React.FC<ProjectPieChartProps> = ({ stats, width = 400, height = 300 }) => {

  
  const data = {
    labels: ['Completed', 'Hired', 'In Progress'],
    datasets: [{
      data: [
        stats.completedProjects,
        stats.hiredProjects,
        stats.totalProjects - stats.completedProjects - stats.hiredProjects
      ],
      backgroundColor: ['#4CAF50', '#2196F3', '#FFC107'],
      borderWidth: 1
    }]
  };

  return (
    <section style={{ width, height }}>
      <Pie 
        data={data}
        options={{
        responsive: false,
        devicePixelRatio: 2,
        animation: { duration: 0 }, // Disable animations for capture
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Completion Stats' }
        }
      }}
      width={600}
      height={300}
      />
    </section>
  );
};