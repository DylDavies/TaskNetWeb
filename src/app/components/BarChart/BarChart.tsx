import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BarChartComponentProps {
  data: { name: string; value: number }[];
  colors: string[];
  title: string;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data, colors, title }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 group">
      <h3 className="text-lg font-semibold mb-4 text-center text-white">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              tick={{ fill: '#ffffff' }}
            />
            <YAxis stroke="#9ca3af" tick={{ fill: '#ffffff' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
                borderRadius: '0.5rem',
                color: '#ffffff',
              }}
              itemStyle={{ color: '#ffffff' }}
              formatter={(value, name) => [
                <span key="value" style={{ color: 'white' }}>{value}</span>,
                <span key="name" style={{ color: 'white' }}>{name}</span>,
              ]}
              labelStyle={{ color: '#ffffff' }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`bar-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;
