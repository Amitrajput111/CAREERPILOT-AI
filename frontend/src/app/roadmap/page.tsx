'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, Route, Circle, CheckCircle2, ChevronDown, ChevronUp, BookOpen, Video, FileText, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

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
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

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

  // Fetch Learning Resources associated with the skills of the target role
  const { data: resources } = useQuery<LearningResource[]>({
    queryKey: ['learning-resources'],
    queryFn: async () => {
      const profileRes = await axios.get('/api/profile', {
        headers: getAuthHeaders(),
      });
      const profile = profileRes.data;
      
      const rolesRes = await axios.get('/api/careers/roles', {
        headers: getAuthHeaders(),
      });
      const roles = rolesRes.data;
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
    },
    enabled: !!user && !!roadmap,
  });

  // Toggle expanded accordion steps
  const toggleExpand = (stepId: string) => {
    setExpandedStep(prev => (prev === stepId ? null : stepId));
  };

  // Set default expanded step
  useEffect(() => {
    if (roadmap?.steps && roadmap.steps.length > 0 && !expandedStep) {
      setExpandedStep(roadmap.steps[0].id);
    }
  }, [roadmap, expandedStep]);

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
    },
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4 text-rose-400" />;
      case 'DOCUMENTATION':
        return <FileText className="h-4 w-4 text-emerald-400" />;
      case 'COURSE':
        return <GraduationCap className="h-4 w-4 text-indigo-400" />;
      default:
        return <BookOpen className="h-4 w-4 text-amber-400" />;
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

  return (
    <ShellLayout>
      <div className="max-w-7xl w-full mx-auto px-4 py-8">
        {/* HUD Header */}
        <div className="mb-8">
          <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">
            Navigation <span className="gradient-text">Roadmap</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Turn-by-turn guidance plan. Complete milestones to adjust your estimated readiness coordinates.
          </p>
        </div>

        {/* Empty state */}
        {!roadmap ? (
          <div className="glass-panel p-12 rounded-2xl max-w-xl mx-auto text-center space-y-6">
            <Route className="h-12 w-12 text-slate-500 mx-auto animate-pulse" />
            <div>
              <h2 className="font-outfit text-xl font-bold text-white">No Roadmap Coordinates</h2>
              <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
                Choose a target career path in the Career Center to begin generating your personalized roadmap.
              </p>
            </div>
            <button
              onClick={() => router.push('/career-center')}
              className="glow-btn px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              Configure Target Career
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Main Timeline Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Timeline Steps Accordion List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Roadmap Steps</h2>
              
              <div className="space-y-4">
                {roadmap.steps?.map((step) => {
                  const isExpanded = expandedStep === step.id;
                  const stepDoneTasks = step.tasks?.filter(t => t.status === 'DONE').length || 0;
                  const stepProgress = step.tasks?.length > 0 ? Math.round((stepDoneTasks / step.tasks.length) * 100) : 0;

                  return (
                    <div
                      key={step.id}
                      className={`glass-panel rounded-2xl overflow-hidden border transition-all ${
                        isExpanded ? 'border-primary/40 shadow-lg shadow-primary/5' : 'hover:border-white/5'
                      }`}
                    >
                      {/* Step Header Accordion Toggle */}
                      <button
                        onClick={() => toggleExpand(step.id)}
                        className="w-full flex items-center justify-between p-6 cursor-pointer text-left focus:outline-none"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] bg-slate-800 text-slate-300 border border-border-color font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Phase {step.phase}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">{stepDoneTasks}/{step.tasks?.length || 0} Done</span>
                          </div>
                          <h3 className="font-outfit text-base font-bold text-white leading-snug">
                            {step.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-white">{stepProgress}%</span>
                            <div className="w-16 bg-slate-805 h-1 rounded-full overflow-hidden mt-1 border border-white/5">
                              <div className="bg-primary h-full" style={{ width: `${stepProgress}%` }} />
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                        </div>
                      </button>

                      {/* Accordion Content */}
                      {isExpanded && (
                        <div className="px-6 pb-6 border-t border-border-color pt-6 space-y-6 bg-slate-900/10">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {step.description}
                          </p>

                          {/* Tasks list */}
                          <div className="space-y-3">
                            <h4 className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Checklist Actions</h4>
                            <div className="space-y-2">
                              {step.tasks?.map((task) => (
                                <div
                                  key={task.id}
                                  onClick={() => toggleTaskMutation.mutate({
                                    taskId: task.id,
                                    status: task.status === 'DONE' ? 'TODO' : 'DONE'
                                  })}
                                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/30 border border-border-color hover:border-primary/20 transition-all cursor-pointer group"
                                >
                                  {task.status === 'DONE' ? (
                                    <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-slate-500 group-hover:text-primary shrink-0 mt-0.5" />
                                  )}
                                  <div>
                                    <h5 className={`text-xs font-semibold ${task.status === 'DONE' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                      {task.title}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                                      {task.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side column: Learning resources */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Curated Resources</h2>
              
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
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
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/30 border border-border-color hover:border-primary/30 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:border-primary/30 transition-colors">
                          {getResourceIcon(res.type)}
                        </div>
                        <div className="overflow-hidden">
                          <span className="text-[9px] bg-slate-800 text-slate-300 border border-border-color font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {res.skill.name}
                          </span>
                          <h4 className="text-xs font-bold text-white mt-1 truncate group-hover:text-primary transition-colors">
                            {res.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block capitalize">{res.type.toLowerCase()} • {res.difficulty}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <BookOpen className="h-8 w-8 text-slate-600 mx-auto animate-pulse" />
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
