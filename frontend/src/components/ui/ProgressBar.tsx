import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className = '', color = 'bg-primary', showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span className="font-semibold text-slate-700">{clamped}%</span>
        </div>
      )}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
