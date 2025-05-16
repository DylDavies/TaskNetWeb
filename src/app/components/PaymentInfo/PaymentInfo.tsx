'use client';
import React from 'react';
import StatCard from '../StatCard/StatCard';
import {
  BanknotesIcon,
  HandCoinsIcon,
  LockClosedIcon,
  DocumentTextIcon
} from '../Icons/Icons';
import PieChartComponent from '../PieChart/PieChart';
import BarChartComponent from '../BarChart/BarChart';
import PaymentStats from '@/app/interfaces/PaymentStats.interface';

interface PaymentInfoProps {
  stats: PaymentStats
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

const PaymentInfo: React.FC<PaymentInfoProps> = ({
  stats,
  startDate,
  endDate,
}) => {
  
  const projectData = [
    { name: 'Escrow', value: stats.totalESCROW},
    { name: 'Paid', value: stats.totalPayed },
    { name: 'Unpaid', value: stats.totalUnpaid },
  ];

  stats.tabelInfo.sort((a, b) => {
  const clientA = a[4];
  const clientB = b[4];
  return clientA.localeCompare(clientB); // for strings
});

  return (
    <section className="stats-dashboard p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Payment Statistics
        <section className="block text-sm font-normal text-gray-400 mt-1">
          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
        </section>
      </h2>

      {/* Stats Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Paid"
          value={`$${stats.totalPayed.toFixed(2)}`}
          icon={<BanknotesIcon />}
          color="bg-gray-700"
          textColor="text-emerald-300"
        />
        <StatCard
          title="In ESCROW"
          value={`$${stats.totalESCROW.toFixed(2)}`}
          icon={<LockClosedIcon />}
          color="bg-gray-700"
          textColor="text-blue-300"
        />
        <StatCard
          title="Unpaid"
          value={`$${stats.totalUnpaid.toFixed(2)}`}
          icon={<HandCoinsIcon />}
          color="bg-gray-700"
          textColor="text-red-300"
        />
      </section>

      <section className="bg-gray-800 p-4 rounded-lg border border-gray-700 group" id="CompletionPieChart">
        <section className="flex flex-col md:flex-row gap-4 justify-center items-start">
          <section className="flex-1">
          <PieChartComponent 
            data={projectData} 
            colors={COLORS} 
            title="Percentage Breakdown"
          />
          </section>
          <section className="flex-1">
          <BarChartComponent 
            data={projectData}
            colors={COLORS}
            title="Breakdown in $"
          />
          </section>
        </section>
      </section>

      {/* Table Section */}
      <section className="bg-gray-800 p-4 rounded-lg border border-gray-700 overflow-auto">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          Job Payment Breakdown
        </h3>
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs uppercase bg-gray-700 text-gray-400">
            <tr>
              <th className="px-4 py-2">Job ID</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Client</th>
              <th className="px-4 py-2">Freelancer</th>
              <th className="px-4 py-2">Client UID</th>
              <th className="px-4 py-2">Total ($)</th>
              <th className="px-4 py-2">Paid ($)</th>
              <th className="px-4 py-2">Unpaid ($)</th>
              <th className="px-4 py-2">ESCROW ($)</th>
            </tr>
          </thead>
          <tbody>
            {stats.tabelInfo.map((row, index) => (
              <tr key={index} className="border-b border-gray-700">
                {row.map((cell, i) => (
                  <td key={i} className="px-4 py-2 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </section>
  );
};

export default PaymentInfo;
