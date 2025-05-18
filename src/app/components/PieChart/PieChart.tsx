import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface PieChartComponentProps {
  data: { name: string; value: number }[];
  colors: string[];
  title: string;
}


//This component will display a react pie chart for the given data
const PieChartComponent: React.FC<PieChartComponentProps> = ({ data, colors, title }) => {
  return (
    <section className="bg-gray-800 p-4 rounded-lg border border-gray-700 group">
      <h3 className="text-lg font-semibold mb-4 text-center text-white">
        {title}
      </h3>
      <section className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="#1f2937"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                color: '#ffffff',
              }}
              itemStyle={{ color: '#ffffff' }}
              formatter={(value, name) => [
                <section key="value" style={{ color: 'white' }}>{value}</section>,
                <section key="name" style={{ color: 'white' }}>{name}</section>,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </section>
  );
};

export default PieChartComponent;