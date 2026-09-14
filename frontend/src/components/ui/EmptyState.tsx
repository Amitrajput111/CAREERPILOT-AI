import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center py-16 px-8 text-center space-y-4">
      <div className="p-4 bg-slate-50 rounded-2xl">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
