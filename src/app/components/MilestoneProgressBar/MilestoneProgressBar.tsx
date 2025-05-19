import React from "react";

/*This component is a progression bar for the milestones page, it fills up as the job gets completed*/

interface ProgressBarProps {
  progress: number; // Percentage (0-100)
  label?: string;   // Optional accessible label
}

const MilestoneProgressBar: React.FC<ProgressBarProps> = ({ progress, label = "Progress" }) => {
  return (
    <section className="w-full max-w-6xl mx-auto flex justify-center">
      <section id="progress-label" className="sr-only ">
        {label}: {progress}%
      </section>
      
      {/* Semantic HTML5 progress element */}
      <progress
        aria-labelledby="progress-label"
        value={progress}
        max="100"
        className="w-full max-w-6xl h-4 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-gray-700 [&::-webkit-progress-value]:bg-green-600 [&::-moz-progress-bar]:bg-green-500"
      />
      
      {/* Fallback for browsers that don't support styling progress elements */}
      <noscript>
        <section className="w-full bg-gray-700 rounded-full h-4">
          <section 
            className="bg-green-600 h-4 rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </section>
      </noscript>
    </section>
  );
};

export default MilestoneProgressBar;