import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const percentage = Math.round(score * 100);

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-700';
    if (percentage >= 50) return 'text-amber-700';
    return 'text-red-700';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-300 bg-white w-32 h-32">
      <span className={`text-5xl font-bold font-lato ${getScoreColor()}`}>
        {percentage}
      </span>
      <span className="text-sm text-gray-600 font-lato mt-1">/ 100</span>
    </div>
  );
};
