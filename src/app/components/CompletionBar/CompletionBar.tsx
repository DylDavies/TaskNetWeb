'use client';
import React from 'react';

interface CompletionBar {
  value: number; // a number between 0 and 100
  label?: string;
}

const CompletionBar: React.FC<CompletionBar> = ({ value, label = 'Completion Rate' }) => {
  return (
    <section className="bg-gray-800 p-6 rounded-lg border border-gray-700 transition-all hover:border-gray-600">
      <section className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          {label}
        </h3>
        <section className="text-xl font-bold text-indigo-400">
          {value}%
        </section>
      </section>
      <section className="w-full bg-gray-700 rounded-full h-2">
        <section 
          className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${value}%` }}
        />
      </section>
      <section className="flex justify-between mt-2 text-sm text-gray-400">
        <section>0%</section>
        <section>100%</section>
      </section>
    </section>
  );
};

export default CompletionBar;
