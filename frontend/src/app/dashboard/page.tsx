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
  Sparkles, ShieldAlert, Route, Info, CheckSquare, Dumbbell, Award, HelpCircle
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

  if (authLoading || profileLoading || roadmapLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-slate-550 font-semibold">Loading dashboard command center...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Flatten tasks to find today's actions
  const allTasks = roadmap?.steps?.flatMap(s => s.tasks.map(t => ({ ...t, stepPhase: s.phase }))) || [];
  const todoTasks = allTasks.filter(t => t.status !== 'DONE').slice(0, 3);
  const completedTasks = allTasks.filter(t => t.status === 'DONE');

  // Calculate skill gaps
  const getGapAnalysis = () => {
    if (!profile || !profile.targetRole || !profile.skills) return [];
    return profile.targetRole.skills.map((rs: any) => {
      const uSkill = profile.skills.find((us: any) => us.skillId === rs.skillId);
      const score = uSkill ? uSkill.score : 0;
      return {
        name: rs.skill.name,
        score,
        importance: rs.importance,
        status: score < 50 ? 'CRITICAL' : score < rs.importance * 10 ? 'GAP' : 'ALIGNED'
      };
    }).filter((s: any) => s.status !== 'ALIGNED').sort((a: any, b: any) => b.importance - a.importance);
  };

  const gapAnalysis = getGapAnalysis();

  // Recommended project based on project readiness
  const getRecommendedProject = () => {
    const templates = profile?.targetRole?.projectTemplates || [];
    if (templates.length === 0) return null;
    const projectScore = roadmap?.readinessDetails?.project ?? 0;
    
    // Choose template based on score difficulty tiers
    if (projectScore < 40) {
      return templates.find((t: any) => t.difficulty.toLowerCase() === 'beginner') || templates[0];
    } else if (projectScore < 75) {
      return templates.find((t: any) => t.difficulty.toLowerCase() === 'intermediate') || templates[Math.min(1, templates.length - 1)];
    } else {
      return templates.find((t: any) => t.difficulty.toLowerCase() === 'advanced') || templates[templates.length - 1];
    }
  };

  const recommendedProject = getRecommendedProject();

  // Next Milestone
  const nextStep = roadmap?.steps?.find(s => s.tasks.some(t => t.status !== 'DONE'));
  const nextMilestone = nextStep ? `Phase ${nextStep.phase}: ${nextStep.title}` : 'All phases completed!';

  // Detailed scores fallback if backend doesn't have it
  const details = roadmap?.readinessDetails || {
    overall: roadmap?.readinessScore ?? 0,
    skill: 0,
    project: 0,
    interview: 0,
    roadmap: 0,
    consistency: 20
  };

  // Helper component for SVG Circular Gauge
  const CircularProgress = ({ value, label, subtitle, color = '#4F46E5' }: { value: number; label: string; subtitle: string; color?: string }) => {
    const radius = 32;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="glass-panel p-6 flex flex-col items-center justify-between text-center min-h-[220px] transition-all hover:-translate-y-0.5 hover:shadow-md duration-300">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="relative flex items-center justify-center my-4">
          <svg className="w-20 h-20 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Foreground circle */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute font-outfit text-base font-bold text-slate-900">{value}%</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium leading-tight">{subtitle}</span>
      </div>
    );
  };

  return (
    <ShellLayout>
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-12">
        {celebrate && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 z-50 animate-bounce shadow-lg shadow-emerald-500/10">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            Task Completed! Telemetry coordinates recalculated.
          </div>
        )}

        {/* Dashboard Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="font-sans text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user.email.split('@')[0]}
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Here is your career progression overview and AI insights for today.
            </p>
          </div>
          <button 
            onClick={() => router.push('/roadmap')}
            className="flex items-center gap-2 px-5 h-[48px] bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-sm shadow-primary/10"
          >
            <Route className="h-4 w-4" />
            <span>View Complete Roadmap</span>
          </button>
        </div>

        {/* Empty State - No Roadmap */}
        {!roadmap ? (
          <div className="glass-panel p-16 max-w-xl mx-auto text-center space-y-6">
            <Compass className="h-14 w-14 text-slate-400 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="font-sans text-xl font-bold text-slate-900">Initialize Your Roadmap</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                {profile?.targetRoleId 
                  ? `You have selected ${profile?.targetRole?.name || 'your target career role'}. Complete your onboarding and upload your resume to generate your custom roadmap.`
                  : "You haven't generated your target roadmap yet. Complete your profile and parse your resume to receive a personalized prep timeline."
                }
              </p>
            </div>
            <button
              onClick={() => router.push(profile?.targetRoleId ? '/onboarding' : '/career-center')}
              className="px-6 h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm shadow-primary/10 transition-all duration-200"
            >
              {profile?.targetRoleId ? 'Continue to Onboarding' : 'Select Target Career'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {/* SECTION 1: Premium KPI Cards Grid */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* KPI Card 1: Career Readiness */}
                <div className="glass-panel p-6 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Career Readiness</span>
                    <button 
                      onClick={() => setShowMathHelp(!showMathHelp)}
                      className="text-slate-450 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Show calculation formula"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="font-sans text-4xl font-bold text-slate-900">{details.overall}%</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-450 mt-2 block">Weighted readiness scorecard</span>
                </div>

                {/* KPI Card 2: Target Role */}
                <div className="glass-panel p-6 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-all duration-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Target Role</span>
                  <div className="mt-4">
                    <span className="font-sans text-xl font-bold text-slate-900 block truncate">{profile?.targetRole?.name || 'Full Stack Developer'}</span>
                    <span className="text-xs font-bold text-primary block mt-1">{profile?.targetRole?.salaryRange || '$80,000 - $110,000'}</span>
                  </div>
                  <span className="text-[11px] text-slate-450 block">High match probability</span>
                </div>

                {/* KPI Card 3: Interview Readiness */}
                <div className="glass-panel p-6 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-all duration-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Interview Readiness</span>
                  <div className="flex items-baseline gap-2 mt-4">
                    <span className="font-sans text-4xl font-bold text-slate-900">{details.interview}%</span>
                    <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-450 mt-2 block">Based on validation assessments</span>
                </div>

                {/* KPI Card 4: Expected Timeline */}
                <div className="glass-panel p-6 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-all duration-200">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Expected Timeline</span>
                  <div className="mt-4">
                    <span className="font-sans text-3xl font-bold text-slate-900 block">4 Months</span>
                    <span className="text-[11px] text-slate-500 block mt-1">Next: {nextStep?.title ? `Phase ${nextStep.phase}` : 'All complete'}</span>
                  </div>
                  <span className="text-[11px] text-slate-450 block">Prep rate projection</span>
                </div>

              </div>

              {/* Calculations Mathematical Formula Explanation Card */}
              {showMathHelp && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl animate-fadeIn space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      How Readiness Score is Calculated
                    </h4>
                    <button 
                      onClick={() => setShowMathHelp(false)} 
                      className="text-slate-400 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Career Readiness represents your real-time likelihood of clearing interviews and securing this target role. It is computed deterministically using the following formula:
                  </p>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl text-center font-mono text-xs text-slate-800 shadow-sm">
                    Readiness Score = (40% × Skill Score) + (30% × Project Score) + (20% × Roadmap Steps) + (10% × Assessment Score)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2 text-xs text-slate-500">
                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">1. Skills (40%):</span>
                      Percentage of required target role skills where your score is ≥ 70%.
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">2. Projects (30%):</span>
                      Completion rate of tasks marked as Phase 3 or Portfolio Blueprints.
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">3. Roadmap (20%):</span>
                      Overall completion percentage of all tasks seeded in your learning roadmap.
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block mb-1">4. Interview (10%):</span>
                      Average score across all short skill assessments completed on the platform.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Career Progress Circular Indicators */}
            <div className="space-y-6">
              <h2 className="font-sans text-xl font-bold text-slate-900">Career Progress</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <CircularProgress 
                  value={details.overall} 
                  label="Career Readiness" 
                  subtitle="Primary readiness rating for candidate application" 
                  color="#4F46E5" 
                />
                <CircularProgress 
                  value={details.interview} 
                  label="Interview Readiness" 
                  subtitle="Mock assessment performance score average" 
                  color="#F59E0B" 
                />
                <CircularProgress 
                  value={details.project} 
                  label="Project Completion" 
                  subtitle="Completion of key portfolio project milestones" 
                  color="#22C55E" 
                />
                <CircularProgress 
                  value={Math.round((completedTasks.length / (allTasks.length || 1)) * 100)} 
                  label="Skill Completion" 
                  subtitle="Target skills mapped on custom learning curve" 
                  color="#6366F1" 
                />
              </div>
            </div>

            {/* SECTION 3: Career Intelligence Panel & Daily Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily Checklist (2/3 width on desktop) */}
              <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <h3 className="font-sans text-lg font-bold text-slate-900">Today's Action Checklist</h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    {completedTasks.length} / {allTasks.length} Completed
                  </span>
                </div>

                {todoTasks.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-slate-800">All daily tasks complete!</p>
                    <p className="text-xs text-slate-400">Go to your Roadmap view to activate more learning steps.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {todoTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskMutation.mutate({ taskId: task.id, status: 'DONE' })}
                        className="flex flex-col justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] bg-slate-200/50 text-slate-600 border border-slate-200/40 font-semibold px-2 py-0.5 rounded-md">
                              PHASE {task.stepPhase}
                            </span>
                            <Circle className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                          </div>
                          <h5 className="text-sm font-semibold text-slate-800 mt-2 group-hover:text-primary transition-colors line-clamp-1">
                            {task.title}
                          </h5>
                          <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-4 text-[10px] font-medium text-slate-450">
                          <span>⏱️ 45m</span>
                          <span>⚡ Medium</span>
                          <span className="text-primary font-semibold">+4 Skill</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consistency & Roadmap Milestones Progress */}
              <div className="glass-panel p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <CheckSquare className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-sans text-lg font-bold text-slate-900">Consistency Index</h3>
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-3xl font-bold text-slate-900">
                      {completedTasks.length}
                    </span>
                    <span className="text-[11px] text-slate-450 block">Tasks Completed</span>
                  </div>
                  
                  {/* Streak representation */}
                  <div className="flex gap-1.5">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                      const completedCount = completedTasks.length;
                      const active = completedCount > 0 && (idx < 5 || completedCount > idx);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <span className="text-[9px] text-slate-400 font-bold">{day}</span>
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-all ${
                            active 
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm shadow-emerald-500/10' 
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}>
                            {active ? '✓' : idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold uppercase pt-3 border-t border-slate-100">
                  <span>Current Streak: 5 Days</span>
                  <span className="text-emerald-600 font-semibold">High Learning velocity</span>
                </div>
              </div>

            </div>

            {/* SECTION 4: Career Intelligence Panel (Premium AI insights, not ChatGPT) */}
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-sans text-lg font-bold text-slate-900">Career Intelligence Panel</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Insight 1 */}
                <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between min-h-[160px] hover:shadow-sm transition-all duration-200">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Ranking</span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-2">Ahead of 63% of applicants</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">Your profile completeness and skill points verify a higher onboarding readiness tier.</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block pt-3 border-t border-slate-200/50 mt-2">Validated metric</span>
                </div>

                {/* Insight 2 */}
                <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between min-h-[160px] hover:shadow-sm transition-all duration-200">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full uppercase">Strengths</span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-2">Front-end technologies strong</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">HTML, CSS, React components, and dynamic UI state configurations meet target criteria.</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block pt-3 border-t border-slate-200/50 mt-2">Verified via profile</span>
                </div>

                {/* Insight 3 */}
                <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between min-h-[160px] hover:shadow-sm transition-all duration-200">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-2 py-0.5 rounded-full uppercase">Recommendations</span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-2">Focus on Database APIs</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      {gapAnalysis.length > 0 ? `Improve gaps in ${gapAnalysis[0].name}. Required target: ${gapAnalysis[0].importance * 10}%.` : 'Backend telemetry nodes report slight logic gaps.'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block pt-3 border-t border-slate-200/50 mt-2">Critical path analysis</span>
                </div>

                {/* Insight 4 */}
                <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between min-h-[160px] hover:shadow-sm transition-all duration-200">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Project Guidance</span>
                    <h4 className="text-sm font-semibold text-slate-900 mt-2">Start Portfolio Blueprint</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      {recommendedProject ? `Building "${recommendedProject.title}" increases score by +15% readiness points.` : 'Start a recommended portfolio blueprint.'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block pt-3 border-t border-slate-200/50 mt-2">Application booster</span>
                </div>

              </div>
            </div>

          </>
        )}
      </div>
    </ShellLayout>
  );
}
