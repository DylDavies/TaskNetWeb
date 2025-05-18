import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

type ChartType = 'pie' | 'bar';

//this componet will return a bar or pie chart that can be saved to a pdf
interface UnifiedChartProps {
  chartType: ChartType;
  dataValues: number[][];
  dataLabels: string[];
  axisLabels: string[];
  backgroundColors?: string[];
  borderColors?: string[];
  chartTitle?: string;
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'left' | 'bottom' | 'right';
  animationDuration?: number;
}

export const PDFUnifiedChart: React.FC<UnifiedChartProps> = ({
  chartType,
  dataValues,
  dataLabels,
  axisLabels,
  backgroundColors = [],
  borderColors = [],
  chartTitle = '',
  width = 400,
  height = 300,
  maintainAspectRatio = false,
  showLegend = true,
  legendPosition = 'bottom',
  animationDuration = 0,
}) => {
  // Default color palettes
  const defaultColors = [
    '#4CAF50', '#2196F3', '#FFC107', '#FF5722', 
    '#9C27B0', '#607D8B', '#E91E63', '#00BCD4'
  ];

  // Prepare datasets
   const datasets = dataValues.map((values, datasetIndex) => {
    if (chartType === 'pie') {
      return {
        label: dataLabels[datasetIndex],
        data: values,
        backgroundColor: values.map((_, valueIndex) => 
          backgroundColors[valueIndex] || 
          defaultColors[valueIndex % defaultColors.length]
        ),
        borderColor: borderColors[datasetIndex] || '#ffffff',
        borderWidth: 1,
      };
    }
    return {
      label: dataLabels[datasetIndex],
      data: values,
      backgroundColor: backgroundColors[datasetIndex] || 
        defaultColors[datasetIndex % defaultColors.length],
      borderColor: borderColors[datasetIndex] || '#ffffff',
      borderWidth: 1,
    };
  });

  //prepare data for the charts
  const data = {
    labels: axisLabels,
    datasets,
  };

  const options = {
    responsive: false,
    maintainAspectRatio,
    devicePixelRatio: 2,
    animation: { duration: animationDuration },
    plugins: {
      legend: {
        display: showLegend,
        position: legendPosition,
      },
      title: {
        display: !!chartTitle,
        text: chartTitle,
      },
    },
    ...(chartType === 'bar' && {
      scales: { y: { beginAtZero: true } }
    }),
  };

  const ChartComponent = chartType === 'pie' ? Pie : Bar;

  return (
    <div style={{ width, height }}>
      <ChartComponent
        data={data}
        options={options}
        width={width}
        height={height}
      />
    </div>
  );
};