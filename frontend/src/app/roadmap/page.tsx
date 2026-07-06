'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Compass, Route, Circle, CheckCircle2, BookOpen, Video, FileText, 
  GraduationCap, ArrowRight, Loader2, PlayCircle, Trophy, Sparkles, CheckSquare, UserCheck
} from 'lucide-react';

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
  readinessScore: number;
  steps: RoadmapStep[];
}

interface LearningResource {
  id: string;
  title: string;
  url: string;
  type: 'ARTICLE' | 'VIDEO' | 'DOCUMENTATION' | 'COURSE' | 'PRACTICE' | 'PROJECT';
  difficulty: string;
  skill: { name: string };
}

export default function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Dynamic Auth Header Helper
  const getAuthHeaders = () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cp_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          return { Authorization: `Bearer ${parsed.accessToken}` };
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  };

  // Fetch active roadmap
  const { data: roadmap, isLoading: roadmapLoading } = useQuery<ActiveRoadmap | null>({
    queryKey: ['active-roadmap'],
    queryFn: async () => {
      const res = await axios.get('/api/roadmaps/active', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user,
  });

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axios.get('/api/profile', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user && !!roadmap,
  });

  // Fetch career-roles
  const { data: roles } = useQuery({
    queryKey: ['career-roles'],
    queryFn: async () => {
      const res = await axios.get('/api/careers/roles', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user && !!roadmap,
  });

  // Compute resources memoized
  const resources = React.useMemo(() => {
    if (!profile || !roles) return [];
    const currentRole = roles.find((r: any) => r.id === profile.targetRoleId);
    const items: LearningResource[] = [];
    if (currentRole) {
      for (const s of currentRole.skills) {
        if (s.skill.learningResources && s.skill.learningResources.length > 0) {
          s.skill.learningResources.forEach((lr: any) => {
            items.push({
              ...lr,
              skill: { name: s.skill.name }
            });
          });
        }
      }
    }
    return items;
  }, [profile, roles]);

  // Task check mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: 'TODO' | 'DONE' }) => {
      const res = await axios.patch(
        `/api/tasks/${taskId}`,
        { status },
        { headers: getAuthHeaders() }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4 text-rose-500" />;
      case 'DOCUMENTATION':
        return <FileText className="h-4 w-4 text-emerald-500" />;
      case 'COURSE':
        return <GraduationCap className="h-4 w-4 text-indigo-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-amber-500" />;
    }
  };

  if (authLoading || roadmapLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Find overall progress state to render node highlights
  const steps = roadmap?.steps || [];
  const activeStepIdx = steps.findIndex(s => s.tasks.some(t => t.status !== 'DONE'));

  return (
    <ShellLayout>
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-12">
        {/* HUD Header */}
        <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-sans text-3xl font-bold text-slate-900 tracking-tight">
              Career Journey Timeline
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Your step-by-step navigation map. Walk through each phase to unlock your full hireability score.
            </p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-5 h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer border border-slate-200"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Empty state */}
        {!roadmap ? (
          <div className="glass-panel p-16 max-w-xl mx-auto text-center space-y-6">
            <Route className="h-14 w-14 text-slate-400 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="font-sans text-xl font-bold text-slate-900">No Active Career Path</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                Select a target role on the Opportunities board to compile your step-by-step career timeline.
              </p>
            </div>
            <button
              onClick={() => router.push('/career-center')}
              className="px-6 h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm shadow-primary/10 transition-all duration-200"
            >
              Configure Target Career
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Main Timeline Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Visual Vertical Journey Timeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Timeline Track */}
              <div className="border-l-2 border-slate-200 ml-6 pl-10 space-y-12 relative">
                
                {/* Node 1: Current Position (Starting Point) */}
                <div className="relative">
                  {/* Timeline Dot Indicator */}
                  <div className="absolute -left-[49px] top-1.5 w-6 h-6 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center shadow-sm">
                    <UserCheck className="h-3 w-3 text-white" />
                  </div>
                  
                  {/* Card Content */}
                  <div className="glass-panel p-6 hover:shadow-md transition-all hover:scale-[1.01] duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Baseline Verified
                        </span>
                        <h3 className="font-sans text-lg font-bold text-slate-900 mt-2">
                          Current Position
                        </h3>
                        <p className="text-slate-550 text-xs mt-1.5 leading-relaxed">
                          Your profile telemetry has been parsed. Initial skills and target role expectations are successfully mapped.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">Step 1 of {steps.length + 2}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Roadmap Steps */}
                {steps.map((step, idx) => {
                  const stepDoneTasks = step.tasks?.filter(t => t.status === 'DONE').length || 0;
                  const stepProgress = step.tasks?.length > 0 ? Math.round((stepDoneTasks / step.tasks.length) * 100) : 0;
                  
                  const isCompleted = stepProgress === 100;
                  const isActive = idx === activeStepIdx;
                  const isLocked = idx > activeStepIdx && activeStepIdx !== -1;

                  return (
                    <div key={step.id} className="relative">
                      
                      {/* Timeline Dot Indicator */}
                      <div className={`absolute -left-[49px] top-1.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-emerald-500' 
                          : isActive 
                          ? 'bg-primary animate-pulse' 
                          : 'bg-slate-350'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Card Content */}
                      <div className={`glass-panel p-6 hover:shadow-md transition-all hover:scale-[1.01] duration-200 ${
                        isActive ? 'border-primary/30 ring-1 ring-primary/10 shadow-sm' : ''
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isCompleted 
                                  ? 'bg-emerald-50 text-emerald-600' 
                                  : isActive 
                                  ? 'bg-indigo-50 text-primary' 
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                Phase {step.phase}
                              </span>
                              <span className="text-xs text-slate-450 font-semibold">{stepDoneTasks}/{step.tasks?.length || 0} Complete</span>
                            </div>
                            <h3 className="font-sans text-lg font-bold text-slate-900 mt-2 leading-snug">
                              {step.title}
                            </h3>
                          </div>

                          <div className="flex flex-col sm:items-end">
                            <span className="text-sm font-bold text-slate-800">{stepProgress}% Complete</span>
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-200/40">
                              <div 
                                className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`} 
                                style={{ width: `${stepProgress}%` }} 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 space-y-4">
                          <p className="text-xs text-slate-550 leading-relaxed">
                            {step.description}
                          </p>

                          {/* Step Tasks */}
                          <div className="space-y-2.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Required Checklist actions</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.tasks?.map((task) => {
                                const isTaskDone = task.status === 'DONE';
                                return (
                                  <div
                                    key={task.id}
                                    onClick={() => toggleTaskMutation.mutate({
                                      taskId: task.id,
                                      status: isTaskDone ? 'TODO' : 'DONE'
                                    })}
                                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 border border-slate-150/40 hover:border-slate-350 hover:bg-slate-50 transition-all cursor-pointer group"
                                  >
                                    {isTaskDone ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-slate-400 group-hover:text-primary shrink-0 mt-0.5" />
                                    )}
                                    <div className="min-w-0">
                                      <h5 className={`text-xs font-semibold truncate ${
                                        isTaskDone ? 'line-through text-slate-400' : 'text-slate-800'
                                      }`}>
                                        {task.title}
                                      </h5>
                                      <p className="text-[11px] text-slate-500 mt-0.5 leading-normal line-clamp-1">
                                        {task.description}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {/* Node 3: Job Ready (Placement) */}
                <div className="relative">
                  {/* Timeline Dot Indicator */}
                  <div className="absolute -left-[49px] top-1.5 w-6 h-6 rounded-full border-4 border-white bg-slate-300 flex items-center justify-center shadow-sm">
                    <Trophy className="h-3 w-3 text-white" />
                  </div>
                  
                  {/* Card Content */}
                  <div className="glass-panel p-6 hover:shadow-md transition-all hover:scale-[1.01] duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Future Milestone
                        </span>
                        <h3 className="font-sans text-lg font-bold text-slate-900 mt-2">
                          Job Ready & Career Placement
                        </h3>
                        <p className="text-slate-550 text-xs mt-1.5 leading-relaxed">
                          Complete all previous phase checklists to trigger resume telemetry verification, active role placement matching, and recruiter outreach pipelines.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">Final Step</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Curated Learning Resources */}
            <div className="lg:col-span-1 space-y-6 sticky top-24">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-1">Curated Resources</h2>
              
              <div className="glass-panel p-6 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  These verified courses, guides, and documentation articles correspond directly to the skills demanded by your roadmap.
                </p>

                {resources && resources.length > 0 ? (
                  <div className="space-y-3">
                    {resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-200/50 hover:border-primary/20 hover:bg-slate-50 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-white border border-slate-200 group-hover:border-primary/30 transition-colors shrink-0">
                          {getResourceIcon(res.type)}
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-[9px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {res.skill.name}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 mt-1 truncate group-hover:text-primary transition-colors">
                            {res.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 block capitalize mt-0.5">{res.type.toLowerCase()} • {res.difficulty}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <BookOpen className="h-8 w-8 text-slate-400 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-500">No resources linked yet.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </ShellLayout>
  );
}
