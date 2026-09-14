import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  sub?: string;
}

export function StatCard({ label, value, icon: Icon, color = 'text-primary', sub }: StatCardProps) {
  return (
    <div className="glass-panel p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div>
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        {sub && <span className="text-xs text-slate-500 ml-2">{sub}</span>}
      </div>
    </div>
  );
}
