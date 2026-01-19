import { useEffect, useState } from 'react';

interface MatchScoreProps {
  score: number;
}

export default function MatchScore({ score }: MatchScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timeout);
  }, [score]);

  // Calculate circle progress
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 70) return '#10B981'; // Green
    if (score >= 50) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg className="w-32 h-32 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-ring-circle transition-all duration-500 ease-out"
        />
      </svg>

      {/* Score text in center */}
      <div className="absolute mt-10">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            {animatedScore}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Match Score</div>
        </div>
      </div>
    </div>
  );
}
