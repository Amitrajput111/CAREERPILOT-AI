'use client';

import React, { useState } from 'react';
import { ShellLayout } from '../../components/ShellLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { Badge } from '../../components/ui/Badge';
import { ClipboardList, CheckCircle2, Circle, Clock, ArrowRight, Route, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  completedAt: string | null;
}

interface RoadmapStep {
  id: string;
  phase: number;
  title: string;
  description: string;
  order: number;
  tasks: Task[];
}

interface ActiveRoadmap {
  id: string;
  title: string;
  steps: RoadmapStep[];
}

type FilterType = 'all' | 'todo' | 'done';

export default function TasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const { data: roadmap, isLoading } = useQuery<ActiveRoadmap | null>({
    queryKey: ['active-roadmap'],
    queryFn: async () => {
      const res = await api.get('/api/roadmaps/active');
      return res.data;
    },
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const res = await api.patch(`/api/tasks/${taskId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId); else next.add(phaseId);
      return next;
    });
  };

  const allTasks = roadmap?.steps?.flatMap(s => s.tasks.map(t => ({ ...t, stepTitle: s.title, stepPhase: s.phase }))) || [];
  const todoCount = allTasks.filter(t => t.status !== 'DONE').length;
  const doneCount = allTasks.filter(t => t.status === 'DONE').length;

  return (
    <ShellLayout>
      <div className="max-w-4xl mx-auto px-5 py-6 space-y-6">
        <PageHeader
          title="Tasks"
          subtitle="Track and complete your career roadmap tasks"
        />

        {/* Stats */}
        {!isLoading && roadmap && (
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{allTasks.length}</p>
              <p className="text-xs text-slate-500 mt-1">Total Tasks</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{todoCount}</p>
              <p className="text-xs text-slate-500 mt-1">Remaining</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{doneCount}</p>
              <p className="text-xs text-slate-500 mt-1">Completed</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        {!isLoading && roadmap && (
          <div className="flex gap-2">
            {(['all', 'todo', 'done'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filter === f ? 'bg-primary text-white' : 'bg-white border border-border-color text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f === 'all' ? 'All Tasks' : f === 'todo' ? 'To Do' : 'Completed'}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <SkeletonCard key={i} className="h-24" />)}
          </div>
        )}

        {!isLoading && !roadmap && (
          <EmptyState
            icon={Route}
            title="No roadmap yet"
            description="Generate your personalized career roadmap first, then come back to track your tasks."
            action={{ label: 'View Roadmap', onClick: () => router.push('/roadmap') }}
          />
        )}

        {!isLoading && roadmap && (
          <div className="space-y-4">
            {roadmap.steps.map((step) => {
              const stepTasks = step.tasks.filter(t => {
                if (filter === 'todo') return t.status !== 'DONE';
                if (filter === 'done') return t.status === 'DONE';
                return true;
              });
              if (stepTasks.length === 0) return null;
              const isExpanded = expandedPhases.has(step.id);
              const stepDone = step.tasks.filter(t => t.status === 'DONE').length;
              return (
                <div key={step.id} className="glass-panel overflow-hidden">
                  <button
                    onClick={() => togglePhase(step.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                        {step.phase}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                        <p className="text-xs text-slate-500">{stepDone}/{step.tasks.length} tasks complete</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-border-color divide-y divide-border-color">
                      {stepTasks.map(task => (
                        <div key={task.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                          <button
                            onClick={() => toggleMutation.mutate({ taskId: task.id, status: task.status === 'DONE' ? 'TODO' : 'DONE' })}
                            className="mt-0.5 text-slate-400 hover:text-primary transition-colors shrink-0"
                          >
                            {task.status === 'DONE'
                              ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              : <Circle className="h-5 w-5" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                          </div>
                          <Badge variant={task.status === 'DONE' ? 'success' : 'default'}>
                            {task.status === 'DONE' ? 'Done' : 'To Do'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ShellLayout>
  );
}
