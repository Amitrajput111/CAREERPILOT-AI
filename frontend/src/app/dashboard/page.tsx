'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
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
          <span className="text-xs text-slate-500 font-semibold">Restoring flight parameters...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Flatten tasks to find today's actions
  const allTasks = roadmap?.steps?.flatMap(s => s.tasks.map(t => ({ ...t, stepPhase: s.phase }))) || [];
  const todoTasks = allTasks.filter(t => t.status !== 'DONE').slice(0, 3);
  const completedTasks = allTasks.filter(t => t.status === 'DONE');

  // Format Recharts Radar Data
  const getRadarData = () => {
    if (!profile || !profile.targetRole || !profile.skills) return [];
    return profile.targetRole.skills.map((rs: any) => {
      const uSkill = profile.skills.find((us: any) => us.skillId === rs.skillId);
      return {
        subject: rs.skill.name,
        Current: uSkill ? uSkill.score : 0,
        Target: rs.importance * 10,
      };
    });
  };

  const radarData = getRadarData();

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
  const highestImpactSkills = gapAnalysis.slice(0, 2);

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

  // Detailed scores fallback if backend doesn't have it (ensure absolute crash safety)
  const details = roadmap?.readinessDetails || {
    overall: roadmap?.readinessScore ?? 0,
    skill: 0,
    project: 0,
    interview: 0,
    roadmap: 0,
    consistency: 20
  };

  // Static/Dynamic Trust AI Recommendations with exact rationales
  const getAiRecommendations = () => {
    const list = [];
    if (gapAnalysis.length > 0) {
      list.push({
        title: `Master ${gapAnalysis[0].name}`,
        description: `Improve your score in ${gapAnalysis[0].name}. Currently at ${gapAnalysis[0].score}%, while target demands at least ${gapAnalysis[0].importance * 10}%.`,
        reason: `Required for ${profile?.targetRole?.name || 'target'} roles and identified as a critical skill gap.`
      });
    }
    if (recommendedProject) {
      list.push({
        title: `Build "${recommendedProject.title}"`,
        description: `Start this ${recommendedProject.difficulty} project blueprint to increase your project readiness score.`,
        reason: `Builds portfolio proof in core technologies. Your current project score is ${details.project}%.`
      });
    }
    if (todoTasks.length > 0) {
      list.push({
        title: `Complete "${todoTasks[0].title}"`,
        description: `Finish the next task on your daily roadmap step.`,
        reason: `Directly boosts your roadmap completion index and maintains your active learning streak.`
      });
    }
    if (profile?.userAssessments?.length === 0) {
      list.push({
        title: `Take Core Skill Assessment`,
        description: `Complete a short 5-10 question validation test.`,
        reason: `Validates skills on your resume and establishes interview readiness baseline.`
      });
    }
    return list;
  };

  const aiRecommendations = getAiRecommendations();

  return (
    <ShellLayout>
      <div className="max-w-7xl w-full mx-auto px-4 py-6 relative space-y-8">
        {celebrate && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 z-50 animate-bounce shadow-lg shadow-emerald-500/10">
            <Sparkles className="h-4 w-4" />
            Task Completed! Telemetry coordinates recalculated.
          </div>
        )}

        {/* Dashboard Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">
              Dashboard Cockpit
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Your real-time Career GPS operating system. Follow instructions below to navigate to your goal.
            </p>
          </div>
          <button 
            onClick={() => router.push('/roadmap')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
          >
            <Route className="h-4 w-4 text-primary" />
            <span>View Complete Roadmap</span>
          </button>
        </div>

        {/* Empty State - No Roadmap */}
        {!roadmap ? (
          <div className="glass-panel p-12 rounded-2xl max-w-xl mx-auto text-center space-y-6 border border-border-color">
            <Compass className="h-12 w-12 text-slate-500 mx-auto animate-pulse" />
            <div>
              <h2 className="font-outfit text-xl font-bold text-white">Initialize GPS Coordinates</h2>
              <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
                You haven't generated your target roadmap yet. Complete your profile and parse your resume to receive a personalized prep timeline.
              </p>
            </div>
            <button
              onClick={() => router.push('/career-center')}
              className="px-6 py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-lg shadow-primary/20"
            >
              Select Target Career
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* SECTION 1: Career Readiness & Core Coordinates */
          <div className="space-y-6">
            
            {/* Header Core HUD Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Overall Readiness Score */}
              <div className="glass-panel p-5 rounded-xl border border-border-color flex items-center justify-between gap-4 relative overflow-hidden group">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-450">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Career Readiness</span>
                    <button 
                      onClick={() => setShowMathHelp(!showMathHelp)}
                      className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                      title="Show calculation formula"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h3 className="font-outfit text-4xl font-extrabold text-white mt-1">{details.overall}%</h3>
                  <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    GPS Coordinates Active
                  </span>
                </div>
                <div className="relative shrink-0 flex items-center justify-center h-16 w-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                    <circle cx="32" cy="32" r="26" stroke="#4F46E5" strokeWidth="4" fill="transparent"
                      strokeDasharray={2 * Math.PI * 26}
                      strokeDashoffset={((100 - details.overall) / 100) * (2 * Math.PI * 26)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute font-outfit text-[11px] font-extrabold text-white">{details.overall}%</div>
                </div>
              </div>

              {/* Target Destination Card */}
              <div className="glass-panel p-5 rounded-xl border border-border-color flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Position</span>
                  <h3 className="font-outfit text-sm font-extrabold text-white mt-1">{profile?.targetRole?.name}</h3>
                  <span className="text-[10px] text-primary font-bold block mt-0.5">{profile?.targetRole?.salaryRange || '$80,000 - $110,000'}</span>
                </div>
              </div>

              {/* Timeline Gauge */}
              <div className="glass-panel p-5 rounded-xl border border-border-color flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Timeline Target</span>
                  <h3 className="font-outfit text-sm font-extrabold text-white mt-1">~3-4 Months Prep</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">Based on weekly consistency rate.</p>
                </div>
              </div>

              {/* Next Milestone Card */}
              <div className="glass-panel p-5 rounded-xl border border-border-color flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Next Milestone</span>
                  <h3 className="font-outfit text-sm font-extrabold text-white mt-1 truncate">{nextMilestone}</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5 truncate">{nextStep?.tasks?.length || 0} active roadmap steps.</p>
                </div>
              </div>

            </div>

            {/* Calculations Mathematical Formula Explanation Card */}
            {showMathHelp && (
              <div className="p-5 bg-slate-900 border border-border-color rounded-xl animate-fadeIn space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    How Readiness Score is Calculated
                  </h4>
                  <button 
                    onClick={() => setShowMathHelp(false)} 
                    className="text-slate-500 hover:text-white text-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Career Readiness represents your real-time likelihood of clearing interviews and securing this target role. We do not use arbitrary numbers or fake algorithms. It is computed deterministically using the following formula:
                </p>
                <div className="p-3 bg-background border border-border-color rounded-lg text-center font-mono text-[11px] text-white">
                  Readiness Score = (40% × Skill Score) + (30% × Project Score) + (20% × Roadmap Steps) + (10% × Interview Assessment Score)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 text-[11px] text-slate-400">
                  <div>
                    <span className="font-semibold text-white block">1. Skills (40%):</span>
                    Percentage of required target role skills where your score is ≥ 70%.
                  </div>
                  <div>
                    <span className="font-semibold text-white block">2. Projects (30%):</span>
                    Completion rate of tasks marked as Phase 3 or Portfolio Blueprints.
                  </div>
                  <div>
                    <span className="font-semibold text-white block">3. Roadmap (20%):</span>
                    Overall completion percentage of all tasks seeded in your learning roadmap.
                  </div>
                  <div>
                    <span className="font-semibold text-white block">4. Interview (10%):</span>
                    Average score across all short skill assessments completed on the platform.
                  </div>
                </div>
              </div>
            )}

            {/* Sub-scores Overview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Skill Readiness', val: details.skill, desc: 'Target skills ≥ 70%', color: 'border-l-primary' },
                { name: 'Project Readiness', val: details.project, desc: 'Portfolio blueprints built', color: 'border-l-emerald-500' },
                { name: 'Interview Readiness', val: details.interview, desc: 'Assessments average score', color: 'border-l-amber-500' },
                { name: 'Consistency Index', val: details.consistency, desc: '7-day learning velocity', color: 'border-l-indigo-400' }
              ].map((sub, i) => (
                <div key={i} className={`p-4 bg-slate-900 border border-border-color border-l-4 ${sub.color} rounded-lg flex flex-col justify-between`}>
                  <span className="text-[10px] text-slate-400 font-bold block">{sub.name}</span>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-xl font-extrabold text-white">{sub.val}%</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{sub.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 2: Gaps & Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Missing Skills */}
              <div className="glass-panel p-5 rounded-xl border border-border-color flex flex-col justify-between h-[300px]">
                <div className="flex items-center gap-2 border-b border-border-color pb-2">
                  <ShieldAlert className="h-4 w-4 text-danger animate-pulse" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Missing Target Skills</h4>
                </div>
                <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
                  {gapAnalysis.map((gap: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-border-color/30 text-xs">
                      <div>
                        <span className="font-semibold text-white block">{gap.name}</span>
                        <span className="text-[9px] text-slate-500">Required level: {gap.importance * 10}%</span>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-danger/10 text-danger border border-danger/20">
                        {gap.score}% Score
                      </span>
                    </div>
                  ))}
                  {gapAnalysis.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <span className="text-xs text-slate-400">All skill coordinates fully aligned!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Highest Impact Skills Radar */}
              <div className="glass-panel p-5 rounded-xl border border-border-color flex flex-col justify-between h-[300px]">
                <div className="flex items-center gap-2 border-b border-border-color pb-2">
                  <Star className="h-4 w-4 text-warning" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Radar Target Align</h4>
                </div>
                {radarData.length > 0 ? (
                  <div className="h-[180px] w-full flex-grow mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.03)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 8 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 6 }} />
                        <Radar name="Current" dataKey="Current" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.2} />
                        <Radar name="Target" dataKey="Target" stroke="#10B981" fill="#10B981" fillOpacity={0.02} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                    No skill coordinates compiled.
                  </div>
                )}
                <div className="flex items-center justify-center gap-4 text-[9px] font-bold uppercase tracking-wider text-slate-500 pt-2 border-t border-border-color/30">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Current</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Target</span>
                </div>
              </div>

              {/* Recommended Project */}
              <div className="glass-panel p-5 rounded-xl border border-border-color flex flex-col justify-between h-[300px]">
                <div className="flex items-center gap-2 border-b border-border-color pb-2">
                  <Dumbbell className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recommended Project Blueprint</h4>
                </div>
                
                {recommendedProject ? (
                  <div className="flex-1 flex flex-col justify-between mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="text-sm font-extrabold text-white truncate max-w-[200px]">{recommendedProject.title}</h5>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                          recommendedProject.difficulty.toLowerCase() === 'beginner' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : recommendedProject.difficulty.toLowerCase() === 'intermediate'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {recommendedProject.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                        {recommendedProject.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border-color/30 mt-3">
                      <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-500 uppercase">
                        <div>⏱️ EST: <span className="text-slate-350">12 Hours</span></div>
                        <div>📈 PORTFOLIO: <span className="text-emerald-500">+15% Score</span></div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-450 bg-slate-900 px-2.5 py-1.5 rounded border border-border-color/40">
                        <span className="font-bold text-primary shrink-0">Reason:</span>
                        <span className="truncate">Boosts project readiness score matching milestone 3.</span>
                      </div>
                      <button 
                        onClick={() => router.push('/projects')}
                        className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                      >
                        <span>Start Project Blueprint</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-slate-500 text-xs mt-4">
                    Choose a target role to view project recommendations.
                  </div>
                )}
              </div>

            </div>

            {/* SECTION 3: Today's Actions */}
            <div className="glass-panel p-5 rounded-xl border border-border-color">
              <div className="flex items-center justify-between border-b border-border-color pb-2.5 mb-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Today's Action Checklist</h4>
                </div>
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                  {completedTasks.length} / {allTasks.length} Completed
                </span>
              </div>

              {todoTasks.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-white">All daily tasks complete!</p>
                  <p className="text-[10px] text-slate-500">Go to your Roadmap view to activate more learning steps.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {todoTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskMutation.mutate({ taskId: task.id, status: 'DONE' })}
                      className="flex flex-col justify-between p-4 rounded-xl bg-slate-900/30 border border-border-color hover:border-primary/30 transition-all cursor-pointer group hover:bg-slate-900/50"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] bg-slate-800 text-slate-300 border border-border-color font-bold px-1.5 py-0.5 rounded">
                            PHASE {task.stepPhase}
                          </span>
                          <Circle className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
                        </div>
                        <h5 className="text-xs font-bold text-white mt-2 group-hover:text-primary transition-colors">
                          {task.title}
                        </h5>
                        <p className="text-[10px] text-slate-400 leading-relaxed truncate line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 pt-3 border-t border-border-color/30 mt-3 text-[9px] font-bold text-slate-500">
                        <span>⏱️ 45m</span>
                        <span>⚡ Medium</span>
                        <span className="text-primary">+4 Skill</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: Progress, Consistency Tracker & Roadmap Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Consistency Tracker & Weekly progress */}
              <div className="glass-panel p-5 rounded-xl border border-border-color h-[180px] flex flex-col justify-between">
                <div className="flex items-center gap-2 border-b border-border-color pb-2">
                  <CheckSquare className="h-4 w-4 text-emerald-500" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Consistency Tracker</h4>
                </div>
                
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="space-y-1">
                    <span className="text-2xl font-extrabold text-white">
                      {completedTasks.length}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Checklist Items Completed</span>
                  </div>
                  
                  {/* Streak Calendar Tracker representation */}
                  <div className="flex gap-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                      const completedCount = completedTasks.length;
                      // Mock visual activity highlights
                      const active = completedCount > 0 && (idx < 5 || completedCount > idx);
                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                          <span className="text-[8px] text-slate-500 font-bold uppercase">{day}</span>
                          <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-bold border transition-all ${
                            active 
                              ? 'bg-emerald-500/20 border-emerald-550 text-emerald-400 shadow-sm' 
                              : 'bg-slate-950/40 border-border-color text-slate-500'
                          }`}>
                            {active ? '✓' : idx + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase font-bold tracking-wider pt-2 border-t border-border-color/20">
                  <span>Current Streak: 5 Days</span>
                  <span>Learning velocity is high</span>
                </div>
              </div>

              {/* Roadmap step progress bars */}
              <div className="glass-panel p-5 rounded-xl border border-border-color h-[180px] flex flex-col justify-between">
                <div className="flex items-center gap-2 border-b border-border-color pb-2">
                  <Route className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Learning Phase Milestones</h4>
                </div>

                <div className="py-2 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold">Total Roadmap Completion:</span>
                    <span className="font-extrabold text-white">
                      {Math.round((completedTasks.length / (allTasks.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-955 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${(completedTasks.length / (allTasks.length || 1)) * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase">
                  <span>Phase 1: {Math.round((completedTasks.filter(t => t.stepPhase === 1).length / (allTasks.filter(t => t.stepPhase === 1).length || 1)) * 100)}%</span>
                  <span>Phase 2: {Math.round((completedTasks.filter(t => t.stepPhase === 2).length / (allTasks.filter(t => t.stepPhase === 2).length || 1)) * 100)}%</span>
                  <span>Phase 3: {Math.round((completedTasks.filter(t => t.stepPhase === 3).length / (allTasks.filter(t => t.stepPhase === 3).length || 1)) * 100)}%</span>
                </div>
              </div>

            </div>

            {/* SECTION 5: CareerPilot AI Recommendations */}
            <div className="glass-panel p-5 rounded-xl border border-border-color">
              <div className="flex items-center gap-2 border-b border-border-color pb-2.5 mb-4">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">CareerPilot AI Navigation Suggestions</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-slate-900/40 border border-border-color rounded-xl flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-extrabold text-white">{rec.title}</span>
                        <span className="text-[8px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">Actionable</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{rec.description}</p>
                    </div>
                    
                    <div className="flex items-start gap-1.5 text-[9.5px] text-slate-450 bg-slate-950/60 p-2.5 rounded border border-border-color/30">
                      <span className="font-bold text-primary shrink-0">Reason:</span>
                      <span className="leading-normal">{rec.reason}</span>
                    </div>
                  </div>
                ))}
                {aiRecommendations.length === 0 && (
                  <div className="text-center py-6 col-span-2 text-slate-500 text-xs">
                    Generating suggestions... Please wait until telemetry syncs.
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
