'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Compass, CheckCircle2, Circle, Trophy, ClipboardList, 
  Briefcase, Calendar, Star, ArrowRight, Loader2, 
  Sparkles, ShieldAlert, Route, Info, CheckSquare, 
  Award, HelpCircle, MessageSquare, Plus, Clock, Target, ArrowUpRight
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
  durationDays?: number;
  readinessDetails?: {
    overall: number;
    skill: number;
    project: number;
    interview: number;
    roadmap: number;
    consistency: number;
  };
  steps: RoadmapStep[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [celebrate, setCelebrate] = useState(false);
  const [showMathHelp, setShowMathHelp] = useState(false);

  // Task interaction states
  const [skippedTaskIds, setSkippedTaskIds] = useState<string[]>([]);
  const [selectedDetailTask, setSelectedDetailTask] = useState<any | null>(null);

  // AI Copilot state
  const [copilotQuery, setCopilotQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your Career OS Copilot. Ask me anything about your readiness score, career path, or recommendations!' }
  ]);
  const [askingCopilot, setAskingCopilot] = useState(false);

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

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axios.get('/api/profile', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user,
  });

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['active-roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (data.task.status === 'DONE') {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 2000);
      }
    },
  });

  // Ask AI Copilot handler
  const handleAskCopilot = async (messageText: string) => {
    if (!messageText.trim() || askingCopilot) return;
    
    const userMsg = messageText;
    setCopilotQuery('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAskingCopilot(true);

    try {
      const res = await axios.post(
        '/api/ai/copilot',
        { message: userMsg },
        { headers: getAuthHeaders() }
      );
      setChatHistory(prev => [...prev, { sender: 'ai', text: res.data.answer || res.data.response || res.data }]);
    } catch (err: any) {
      console.error(err);
      setChatHistory(prev => [...prev, { sender: 'ai', text: 'Failed to query copilot. Please verify database connection.' }]);
    } finally {
      setAskingCopilot(false);
    }
  };

  if (authLoading || profileLoading || roadmapLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4 max-w-xs w-full px-6">
          {/* Skeleton Loaders for Dashboard */}
          <div className="h-8 w-3/4 bg-slate-105 animate-pulse rounded-lg" />
          <div className="h-4 w-1/2 bg-slate-105 animate-pulse rounded-lg" />
          <div className="w-full grid grid-cols-2 gap-4 pt-8">
            <div className="h-28 bg-slate-105 animate-pulse rounded-xl" />
            <div className="h-28 bg-slate-105 animate-pulse rounded-xl" />
          </div>
          <div className="h-40 w-full bg-slate-105 animate-pulse rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Flatten roadmap tasks and filter out skipped ones
  const allTasks = roadmap?.steps?.flatMap(s => s.tasks.map(t => ({ ...t, stepPhase: s.phase }))) || [];
  const todoTasks = allTasks
    .filter(t => t.status !== 'DONE' && !skippedTaskIds.includes(t.id))
    .slice(0, 3);
  const completedTasks = allTasks.filter(t => t.status === 'DONE');

  // readiness details mapping
  const details = roadmap?.readinessDetails || {
    overall: roadmap?.readinessScore ?? 0,
    skill: 0,
    project: 0,
    interview: 0,
    roadmap: 0,
    consistency: 20
  };

  // Capitalize name
  const userName = profile?.name || user.email.split('@')[0];
  const capitalizedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Dynamic Blockers calculator (Section 4)
  const getBlockers = () => {
    const list = [];
    if (!profile?.resumeUrl) {
      list.push({
        name: 'Resume Quality',
        importance: 'High',
        reason: 'Your profile has no parsed resume. Critical technical gaps cannot be calculated.',
        fix: 'Upload your PDF resume to scan your experience.',
        impact: '+15% Readiness'
      });
    }
    if (!profile?.githubUsername) {
      list.push({
        name: 'Portfolio Proof',
        importance: 'High',
        reason: 'Missing public code repository verification links.',
        fix: 'Connect your GitHub username in settings.',
        impact: '+10% Readiness'
      });
    }
    if (details.skill < 50) {
      list.push({
        name: 'Target Skill Gaps',
        importance: 'High',
        reason: `Ecosystem gaps identified in core target role skills.`,
        fix: 'Execute your active Roadmap learning timeline.',
        impact: '+12% Readiness'
      });
    }
    if (details.project < 40) {
      list.push({
        name: 'System Design / Projects',
        importance: 'Medium',
        reason: 'Lacking a validated deployment-ready full stack portfolio template.',
        fix: 'Build the recommended portfolio project blueprint.',
        impact: '+10% Readiness'
      });
    }
    // Fallback blocker
    if (list.length === 0) {
      list.push({
        name: 'Mock Interview Prep',
        importance: 'Medium',
        reason: 'Database profile is completely synchronized. Next: practice interviews.',
        fix: 'Take baseline validation assessments for active skills.',
        impact: '+5% Readiness'
      });
    }
    return list;
  };
  const blockers = getBlockers();

  // Recommended Project (Section 5)
  const getRecommendedProject = () => {
    const templates = profile?.targetRole?.projectTemplates || [];
    if (templates.length === 0) return null;
    const projectScore = details.project;
    if (projectScore < 40) {
      return templates.find((t: any) => t.difficulty.toLowerCase() === 'beginner') || templates[0];
    } else if (projectScore < 75) {
      return templates.find((t: any) => t.difficulty.toLowerCase() === 'intermediate') || templates[Math.min(1, templates.length - 1)];
    } else {
      return templates.find((t: any) => t.difficulty.toLowerCase() === 'advanced') || templates[templates.length - 1];
    }
  };
  const recommendedProject = getRecommendedProject();

  // Recommended Opportunity (Section 6)
  const getRecommendedOpportunity = () => {
    const roleName = profile?.targetRole?.name || 'Full Stack Developer';
    return {
      role: `Associate ${roleName}`,
      company: 'TechCorp Solutions',
      match: details.overall >= 50 ? Math.min(98, details.overall + 15) : 72,
      why: `Matches your target role. Requires ${profile?.targetRole?.skills?.slice(0, 2).map((s: any) => s.skill.name).join(', ') || 'core programming'} capabilities.`,
      skills: profile?.targetRole?.skills?.slice(0, 3).map((s: any) => s.skill.name) || ['React', 'Node.js', 'SQL']
    };
  };
  const recommendedOpportunity = getRecommendedOpportunity();

  // Active Milestone Details (CTO Addition #2)
  const nextStep = roadmap?.steps?.find(s => s.tasks.some(t => t.status !== 'DONE'));
  const nextMilestone = nextStep 
    ? {
        title: nextStep.title,
        phase: nextStep.phase,
        completed: nextStep.tasks.filter(t => t.status === 'DONE').length,
        total: nextStep.tasks.length,
      }
    : null;

  return (
    <ShellLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-8 text-slate-800">
        
        {celebrate && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 z-50 animate-bounce shadow-md">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Task Completed! Telemetry coordinates recalculated.
          </div>
        )}

        {/* SECTION 1: Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-6">
          <div className="space-y-1">
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Good Morning, {capitalizedName} 👋
            </h1>
            <p className="text-slate-550 text-xs sm:text-sm font-semibold">
              You are <span className="text-primary font-bold">{details.overall}% ready</span> for your target career.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Position</div>
            <div className="text-sm font-extrabold text-slate-900">{profile?.targetRole?.name || 'MERN Stack Developer'}</div>
          </div>
        </div>

        {/* EMPTY STATE - NO ROADMAP INITIALIZED */}
        {!roadmap ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center max-w-lg mx-auto space-y-6 shadow-xs">
            <Compass className="h-12 w-12 text-slate-400 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="font-outfit text-xl font-extrabold text-slate-900">Initialize Your Telemetry</h2>
              <p className="text-slate-550 text-xs leading-relaxed max-w-sm mx-auto">
                Select your target career, upload your CV, and trigger our analyzer to generate your daily roadmap timeline.
              </p>
            </div>
            <button
              onClick={() => router.push(profile?.targetRoleId ? '/onboarding' : '/profile')}
              className="px-5 h-[44px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm shadow-primary/10 transition-all duration-200"
            >
              {profile?.targetRoleId ? 'Continue to Onboarding' : 'Select Target Career'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          
          /* MAIN TWO-COLUMN DASHBOARD GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT MAIN REGION (8 columns) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* SECTION 2: Career Readiness Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-405 uppercase tracking-wider">Career Readiness</h3>
                  <button 
                    onClick={() => setShowMathHelp(!showMathHelp)}
                    className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 text-[10px] font-bold"
                    title="Formula description"
                  >
                    <Info className="h-4 w-4 text-primary" />
                    How is this calculated?
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div>
                    <div className="text-5xl font-extrabold text-slate-900 tracking-tight">{details.overall}%</div>
                    <span className="text-[11px] text-slate-405 font-bold uppercase tracking-wider block mt-2">
                      Target Role: {profile?.targetRole?.name || 'Developer'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-150 pt-4 sm:pt-0 sm:pl-6">
                    <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Timeline Remaining</div>
                    <div className="text-lg font-bold text-slate-900">{roadmap?.durationDays ? Math.round(roadmap.durationDays / 30) : 3} Months</div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Last updated: Just now</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-150">
                  This score updates dynamically as you complete projects, assessments and roadmap milestones.
                </p>

                {showMathHelp && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fadeIn">
                    <h4 className="text-[10.5px] font-bold text-slate-905 uppercase">Readiness Score Weights</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10.5px] text-slate-550 leading-relaxed font-semibold">
                      <div><span className="text-primary font-bold block text-xs">40%</span> Skills Coverage</div>
                      <div><span className="text-primary font-bold block text-xs">30%</span> Projects Finished</div>
                      <div><span className="text-primary font-bold block text-xs">20%</span> Task checklist</div>
                      <div><span className="text-primary font-bold block text-xs">10%</span> Assessments</div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: Today's Focus */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ClipboardList className="h-4.5 w-4.5 text-primary" />
                  <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">Today's Focus</h3>
                </div>

                {todoTasks.length === 0 ? (
                  <div className="py-8 text-center space-y-2 bg-slate-50/55 rounded-xl border border-slate-150 border-dashed">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-900">All Daily Tasks Complete!</h4>
                    <p className="text-[10px] text-slate-405 font-medium">Review your Roadmap view to activate more lessons and tasks.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {todoTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className="p-4 rounded-xl bg-slate-50/40 border border-slate-150 hover:border-slate-300 transition-all flex flex-col justify-between min-h-[190px]"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-primary font-bold px-2 py-0.5 rounded-full uppercase">
                              Phase {task.stepPhase}
                            </span>
                            <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-405">
                              <Clock className="h-3 w-3" /> 45m
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{task.title}</h4>
                          <p className="text-[10.5px] text-slate-500 leading-normal line-clamp-2 font-semibold">{task.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-3 space-y-2.5">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-405">
                            <span>Impact: <strong className="text-primary font-extrabold">+4 Readiness</strong></span>
                            <span>Difficulty: Easy</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleTaskMutation.mutate({ taskId: task.id, status: 'DONE' })}
                              className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-605 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 border border-emerald-100"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => setSkippedTaskIds(prev => [...prev, task.id])}
                              className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-650 text-[10px] font-bold rounded-lg transition-colors cursor-pointer border border-slate-150"
                            >
                              Skip
                            </button>
                            <button
                              onClick={() => setSelectedDetailTask(task)}
                              className="py-1.5 px-2 bg-white hover:bg-slate-50 text-primary text-[10px] font-bold rounded-lg transition-colors cursor-pointer border border-slate-200"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: Current Blockers */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldAlert className="h-4.5 w-4.5 text-danger" />
                  <h3 className="font-outfit text-sm font-bold text-slate-905 uppercase tracking-wider">Current Blockers</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blockers.map((blocker, index) => (
                    <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-900">{blocker.name}</h4>
                        <span className={`text-[8.5px] font-bold border rounded-full px-2 py-0.5 uppercase tracking-wide ${
                          blocker.importance === 'High' 
                            ? 'bg-danger/5 border-danger/10 text-danger' 
                            : 'bg-amber-50 border-amber-100 text-warning'
                        }`}>
                          {blocker.importance} Priority
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 leading-normal font-semibold">{blocker.reason}</p>
                      <div className="pt-2 border-t border-slate-150 flex justify-between items-center text-[10px]">
                        <span className="text-slate-450 font-semibold">Fix: <strong className="text-slate-805 font-extrabold">{blocker.fix}</strong></span>
                        <span className="text-primary font-bold shrink-0">{blocker.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: Recommended Project */}
              {recommendedProject && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Award className="h-4.5 w-4.5 text-primary" />
                    <h3 className="font-outfit text-sm font-bold text-slate-905 uppercase tracking-wider font-extrabold">Recommended Project</h3>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-1.5 flex-1">
                      <h4 className="text-sm font-bold text-slate-900">{recommendedProject.title}</h4>
                      <p className="text-xs text-slate-505 leading-relaxed font-semibold max-w-md">
                        {recommendedProject.description}
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-405 mt-3">
                        <div>
                          <span className="block text-[8.5px] text-slate-400 uppercase tracking-wide">Skills Covered</span>
                          <span className="text-slate-800 font-extrabold">{profile?.targetRole?.skills?.slice(0, 2).map((s: any) => s.skill.name).join(', ') || 'React, Tailwind'}</span>
                        </div>
                        <div>
                          <span className="block text-[8.5px] text-slate-400 uppercase tracking-wide">Portfolio Value</span>
                          <span className="text-slate-850">High</span>
                        </div>
                        <div>
                          <span className="block text-[8.5px] text-slate-400 uppercase tracking-wide">Estimated Duration</span>
                          <span className="text-slate-850">14 Days</span>
                        </div>
                        <div>
                          <span className="block text-[8.5px] text-slate-400 uppercase tracking-wide">Interview Relevance</span>
                          <span className="text-slate-850 font-extrabold text-indigo-600">System Design</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => router.push('/projects')}
                      className="px-4 h-[38px] border border-slate-200 hover:border-slate-350 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
                    >
                      View Details
                    </button>
                  </div>

                  {/* Decision Transparency (CTO Addition #1) */}
                  <div className="p-3 bg-indigo-50/50 border border-primary/10 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-primary uppercase">Why am I seeing this?</span>
                    <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                      Your target career is {profile?.targetRole?.name || 'Developer'}. You currently have no deployed portfolio blueprints. Completing this project satisfies deployment criteria and updates your score by +15% readiness points.
                    </p>
                  </div>
                </div>
              )}

              {/* SECTION 6: Recommended Opportunity */}
              {recommendedOpportunity && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Briefcase className="h-4.5 w-4.5 text-emerald-600" />
                    <h3 className="font-outfit text-sm font-bold text-slate-905 uppercase tracking-wider">Top Opportunity</h3>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{recommendedOpportunity.role}</h4>
                        <span className="text-[9px] bg-emerald-50 text-emerald-605 font-bold border border-emerald-100 px-2 py-0.2 rounded-full">
                          {recommendedOpportunity.match}% MATCH
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-550 font-semibold">{recommendedOpportunity.company} • {recommendedOpportunity.why}</p>
                      
                      <div className="flex gap-1.5 pt-1">
                        {recommendedOpportunity.skills.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => router.push('/career-center')}
                      className="px-4 h-[38px] bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-sm shadow-emerald-550/10"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 7 & 8: Weekly Progress & Activity Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Section 7: Weekly Reflection & Progress (CTO Addition #4) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold text-slate-405 uppercase tracking-wider border-b border-slate-100 pb-2">Weekly Progress & Reflection</h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Tasks Completed</span>
                      <strong className="text-slate-800">{completedTasks.length} Completed</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Projects Finished</span>
                      <strong className="text-slate-800">{details.project >= 40 ? 1 : 0} Finished</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Applications Sent</span>
                      <strong className="text-slate-800">1 Sent</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Assessment Score</span>
                      <strong className="text-primary">{details.interview > 0 ? `${details.interview}%` : '80% Avg'}</strong>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-slate-500 font-semibold">Consistency</span>
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">High</span>
                    </div>

                    {/* Small trend chart */}
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider block">Consistency Trend</span>
                      <div className="flex items-end gap-1 h-8 pt-2">
                        {[40, 60, 45, 80, 75, 90, 95].map((val, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                            <div 
                              className={`w-full rounded-t transition-all ${idx === 6 ? 'bg-primary' : 'bg-slate-200'}`} 
                              style={{ height: `${(val / 100) * 24}px` }} 
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase pt-1">
                        <span>Mon</span>
                        <span>Sun</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 8: Recent Activity */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-405 uppercase tracking-wider border-b border-slate-100 pb-2">Recent Activity</h3>
                  
                  <div className="relative border-l-2 border-slate-150 pl-4 ml-1 space-y-3.5">
                    <div className="relative text-[11px] font-semibold text-slate-505">
                      <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-500 border border-white" />
                      Roadmap generated successfully
                    </div>
                    <div className="relative text-[11px] font-semibold text-slate-505">
                      <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-500 border border-white" />
                      Onboarding answers persisted
                    </div>
                    {profile?.resumeUrl && (
                      <div className="relative text-[11px] font-semibold text-slate-505">
                        <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-emerald-500 border border-white" />
                        Resume document parsed
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT SIDEBAR REGION (4 columns) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* CTO Addition #2: Next Milestone */}
              {nextMilestone && (
                <div className="rounded-2xl border border-slate-200 bg-indigo-50/25 p-5 space-y-3.5">
                  <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Next Milestone</div>
                  <h4 className="text-xs font-extrabold text-slate-900 leading-tight">Phase {nextMilestone.phase}: {nextMilestone.title}</h4>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200/60 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${(nextMilestone.completed / (nextMilestone.total || 1)) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-450 font-bold uppercase">
                      <span>{nextMilestone.completed} / {nextMilestone.total} Completed</span>
                      <span>{Math.round(((nextMilestone.total - nextMilestone.completed) * 45) / 60)}h remaining</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Completion Checklist (CTO Addition #3) */}
              {profile && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-xs">
                  <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Complete Your Profile</div>
                  
                  <div className="space-y-2 text-xs font-semibold text-slate-650">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>Career Goal Selected</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span>Education Stage Configured</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {profile.resumeUrl ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className={profile.resumeUrl ? '' : 'text-slate-400'}>Upload Resume PDF</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {profile.githubUsername ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className={profile.githubUsername ? '' : 'text-slate-400'}>Connect GitHub Username</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {profile.linkedinUrl ? (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
                      )}
                      <span className={profile.linkedinUrl ? '' : 'text-slate-400'}>Connect LinkedIn profile</span>
                    </div>
                  </div>
                </div>
              )}

              {/* QUICK ACTIONS PANEL */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">Quick Actions</div>
                
                <div className="flex flex-col gap-2 text-xs font-bold text-slate-700">
                  <button 
                    onClick={() => router.push('/profile')} 
                    className="w-full py-2.5 px-3 rounded-lg border border-slate-150 hover:bg-slate-50 text-left flex justify-between items-center cursor-pointer"
                  >
                    <span>Update Resume PDF</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  <button 
                    onClick={() => router.push('/roadmap')} 
                    className="w-full py-2.5 px-3 rounded-lg border border-slate-150 hover:bg-slate-50 text-left flex justify-between items-center cursor-pointer"
                  >
                    <span>Continue Roadmap</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                  <button 
                    onClick={() => router.push('/career-center')} 
                    className="w-full py-2.5 px-3 rounded-lg border border-slate-150 hover:bg-slate-50 text-left flex justify-between items-center cursor-pointer"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Notifications / Alerts Panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                <div className="text-[10px] text-slate-405 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">Alerts & Notifications</div>
                <div className="space-y-2.5 text-[11px] font-semibold text-slate-650 leading-normal">
                  <div className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <p>
                      Target role <strong className="text-slate-800">{profile?.targetRole?.name || 'MERN Stack Developer'}</strong> selected. Complete Phase 1 tasks to activate mock assessments.
                    </p>
                  </div>
                </div>
              </div>

              {/* AI COPILOT COMPACT WIDGET */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <MessageSquare className="h-4.5 w-4.5 text-primary" />
                  <h4 className="text-xs font-bold text-slate-905 uppercase">Ask CareerPilot</h4>
                </div>

                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-2.5 rounded-xl text-[10.5px] leading-relaxed max-w-[90%] font-semibold ${
                        msg.sender === 'user' 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pre-populated Context-aware prompt suggestions */}
                <div className="flex flex-col gap-1.5 pt-1 text-[9.5px] font-bold text-primary">
                  <button 
                    onClick={() => handleAskCopilot(`Why is my readiness score only ${details.overall}%?`)}
                    className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2 py-1 rounded-md text-left cursor-pointer transition-colors"
                  >
                    "Why is my readiness only {details.overall}%?"
                  </button>
                  {recommendedProject && (
                    <button 
                      onClick={() => handleAskCopilot(`Why was the "${recommendedProject.title}" project recommended to me?`)}
                      className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2 py-1 rounded-md text-left cursor-pointer transition-colors"
                    >
                      "Why was this project recommended?"
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  <input
                    type="text"
                    value={copilotQuery}
                    onChange={(e) => setCopilotQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskCopilot(copilotQuery)}
                    placeholder="Ask copilot a question..."
                    disabled={askingCopilot}
                    className="bg-transparent border-none text-xs focus:ring-0 outline-none w-full text-slate-800 placeholder-slate-400 font-semibold"
                  />
                  <button 
                    onClick={() => handleAskCopilot(copilotQuery)}
                    disabled={askingCopilot}
                    className="h-6 w-6 rounded-lg bg-primary hover:bg-primary-hover flex items-center justify-center text-white shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {askingCopilot ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />}
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Task Detail Modal Pop-Up Dialog */}
        {selectedDetailTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="p-6 rounded-2xl max-w-sm w-full bg-white shadow-lg border border-slate-200 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-primary font-bold px-2 py-0.5 rounded-full uppercase">
                  Phase {selectedDetailTask.stepPhase} Task Details
                </span>
                <button 
                  onClick={() => setSelectedDetailTask(null)}
                  className="text-slate-400 hover:text-slate-650 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <h3 className="font-outfit text-sm font-extrabold text-slate-900">{selectedDetailTask.title}</h3>
              <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                {selectedDetailTask.description || 'No detailed instructions provided.'}
              </p>
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4 text-[10px] font-bold text-slate-405">
                <div>
                  <span className="block text-[8px] text-slate-400 uppercase tracking-wide">Estimated Time</span>
                  <span className="text-slate-700">45 Minutes</span>
                </div>
                <div>
                  <span className="block text-[8px] text-slate-400 uppercase tracking-wide">Readiness Impact</span>
                  <span className="text-primary font-extrabold">+4 Score Points</span>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleTaskMutation.mutate({ taskId: selectedDetailTask.id, status: 'DONE' });
                  setSelectedDetailTask(null);
                }}
                className="w-full h-[38px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center"
              >
                Complete Task Now
              </button>
            </div>
          </div>
        )}

      </div>
    </ShellLayout>
  );
}
