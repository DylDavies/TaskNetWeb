import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import CompletionStats from '@/app/interfaces/CompletionStatsInterface';

Chart.register(...registerables);

interface MilestoneBarChartProps {
  stats: CompletionStats;
  width?: number;
  height?: number;
}

export const MilestoneBarChart: React.FC<MilestoneBarChartProps> = ({ stats, width = 400, height = 300 }) => {
  const data = {
    labels: ['Milestones'],
    datasets: [
      {
        label: 'Completed',
        data: [stats.CompletedMilestones],
        backgroundColor: '#4CAF50'
      },
      {
        label: 'Remaining',
        data: [stats.totalMilestones - stats.CompletedMilestones],
        backgroundColor: '#2196F3'
      }
    ]
  };

  return (
    <section style={{ width, height }}>
     <Bar
      data={data}
      options={{
      responsive: false,
      devicePixelRatio: 2,
      animation: { duration: 0 }, // Disable animations for capture
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Milestone Stats' }
      }
    }}
    width={600}
    height={300}
/>
    </section>
  );
};