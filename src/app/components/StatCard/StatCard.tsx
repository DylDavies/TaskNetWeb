import React from "react";

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color: string;
  textColor?: string;
}> = ({ title, value, icon, color, textColor = 'text-white' }) => {
  return (
    <div className={`p-4 rounded-lg ${color} transition-all hover:bg-gray-600/50`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-300">{title}</h4>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold mt-2 ${textColor}`}>
        {value}
      </p>
    </div>
  );
};

export default StatCard;