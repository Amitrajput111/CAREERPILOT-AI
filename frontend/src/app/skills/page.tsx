'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { 
  Loader2, Award, ArrowRight, BarChart3, Compass, CheckCircle2, 
  ShieldAlert, BookOpen, Sparkles, TrendingUp, Trophy
} from 'lucide-react';

interface UserSkill {
  skillId: string;
  score: number;
  skill: { name: string; slug: string };
}

interface RoleSkill {
  skillId: string;
  skill: { name: string; slug: string; description: string };
  importance: number;
}

interface Profile {
  skills: UserSkill[];
  targetRoleId: string | null;
  targetRole: {
    name: string;
    skills: RoleSkill[];
  } | null;
}

export default function SkillAnalysisPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

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

  // Fetch Profile (Skills and Target Role)
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axios.get('/api/profile', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user,
  });

  if (authLoading || profileLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-slate-550 font-semibold">Analyzing skill coordinates...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Format Radar Data
  const getRadarData = () => {
    if (!profile || !profile.targetRole || !profile.skills) return [];
    return profile.targetRole.skills.map((rs) => {
      const userSkill = profile.skills.find((us) => us.skillId === rs.skillId);
      return {
        subject: rs.skill.name,
        Current: userSkill ? userSkill.score : 0,
        Target: rs.importance * 10,
        skillId: rs.skillId,
      };
    });
  };

  const radarData = getRadarData();

  // Calculate Strengths vs Gaps
  const getSkillGroups = () => {
    if (!profile || !profile.targetRole || !profile.skills) return { strengths: [], weaknesses: [] };
    
    const strengths: any[] = [];
    const weaknesses: any[] = [];

    profile.targetRole.skills.forEach((rs) => {
      const userSkill = profile.skills.find((us) => us.skillId === rs.skillId);
      const score = userSkill ? userSkill.score : 0;
      const targetScore = rs.importance * 10;
      
      const skillInfo = {
        skillId: rs.skillId,
        name: rs.skill.name,
        description: rs.skill.description,
        score,
        targetScore,
        gap: targetScore - score
      };

      if (score >= targetScore || score >= 70) {
        strengths.push(skillInfo);
      } else {
        weaknesses.push(skillInfo);
      }
    });

    // Sort gaps by severity/importance
    weaknesses.sort((a, b) => b.gap - a.gap);

    return { strengths, weaknesses };
  };

  const { strengths, weaknesses } = getSkillGroups();

  return (
    <ShellLayout>
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-12">
        
        {/* Header Banner */}
        <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-sans text-3xl font-bold text-slate-900 tracking-tight">
              Skill Vector Analysis
            </h1>
            <p className="text-slate-500 text-sm mt-1.5">
              Visualize your technical readiness, review core target gaps, and launch verification assessments.
            </p>
          </div>
          <button 
            onClick={() => router.push('/career-center')}
            className="flex items-center gap-2 px-5 h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer border border-slate-200"
          >
            <span>Change Target Career</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Empty state */}
        {!profile?.targetRoleId ? (
          <div className="glass-panel p-16 max-w-xl mx-auto text-center space-y-6">
            <BarChart3 className="h-14 w-14 text-slate-400 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="font-sans text-xl font-bold text-slate-900">No Target Profile Mapped</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
                Please select a target job path in the Opportunities center to review and align your technical skill vectors.
              </p>
            </div>
            <button
              onClick={() => router.push('/career-center')}
              className="px-6 h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm shadow-primary/10 transition-all duration-200"
            >
              Choose Target Role
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Main Layout Content */
          <div className="space-y-8">
            
            {/* Upper Section: Radar + Strengths/Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Radar Chart Card (5 cols) */}
              <div className="lg:col-span-5 glass-panel p-6 flex flex-col justify-between min-h-[420px]">
                <div>
                  <h3 className="font-sans text-lg font-bold text-slate-900">Target Role Alignment Radar</h3>
                  <p className="text-slate-500 text-xs mt-1">Comparing your current scores against {profile.targetRole?.name} benchmarks.</p>
                </div>

                <div className="h-[280px] w-full mt-4 flex items-center justify-center">
                  {radarData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 8 }} />
                        <Radar 
                          name="Current" 
                          dataKey="Current" 
                          stroke="#4F46E5" 
                          fill="#4F46E5" 
                          fillOpacity={0.15} 
                          strokeWidth={2}
                        />
                        <Radar 
                          name="Target Requirement" 
                          dataKey="Target" 
                          stroke="#22C55E" 
                          fill="#22C55E" 
                          fillOpacity={0.02} 
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-slate-400 text-xs font-semibold">Gathering telemetry...</span>
                  )}
                </div>

                <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-t border-slate-100 pt-4 mt-2">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Your level</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Target level</span>
                </div>
              </div>

              {/* Strengths & Weaknesses (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Strengths Card */}
                <div className="glass-panel p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <h3 className="font-sans text-base font-bold text-slate-900">Verified Strengths</h3>
                    </div>
                    
                    <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1">
                      {strengths.map((skill, index) => (
                        <div 
                          key={skill.skillId}
                          onClick={() => router.push(`/skills/${skill.skillId}`)}
                          className="p-3 bg-emerald-50/20 border border-emerald-100/40 hover:border-emerald-350 rounded-xl transition-all cursor-pointer flex justify-between items-center group"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors block truncate">{skill.name}</span>
                            <span className="text-[10px] text-slate-500 block truncate mt-0.5">{skill.description || 'Verified target capability'}</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                            {skill.score}%
                          </span>
                        </div>
                      ))}
                      {strengths.length === 0 && (
                        <div className="text-center py-16 text-slate-400 text-xs">
                          No verified strengths above benchmark yet. Complete milestones to raise scores.
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-450 block">Click a skill to view guides and topics</span>
                </div>

                {/* Weaknesses / Gaps Card */}
                <div className="glass-panel p-6 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <ShieldAlert className="h-5 w-5 text-amber-500" />
                      <h3 className="font-sans text-base font-bold text-slate-900">Target Skill Gaps</h3>
                    </div>
                    
                    <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-1">
                      {weaknesses.map((skill) => (
                        <div 
                          key={skill.skillId}
                          onClick={() => router.push(`/skills/${skill.skillId}`)}
                          className="p-3 bg-amber-50/20 border border-amber-100/40 hover:border-amber-350 rounded-xl transition-all cursor-pointer flex justify-between items-center group"
                        >
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors block truncate">{skill.name}</span>
                            <span className="text-[10px] text-slate-550 block truncate mt-0.5">Required: {skill.targetScore}% (Current: {skill.score}%)</span>
                          </div>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full shrink-0">
                            -{skill.gap}%
                          </span>
                        </div>
                      ))}
                      {weaknesses.length === 0 && (
                        <div className="text-center py-16 text-slate-400 text-xs">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                          <span>All skill coordinates aligned with benchmark parameters!</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-450 block">High-priority targets are sorted at top</span>
                </div>

              </div>

            </div>

            {/* Actionable Improvement Plan (Full Width) */}
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-sans text-lg font-bold text-slate-900">Actionable Improvement Plan</h3>
              </div>

              {weaknesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Step 1 */}
                  <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between min-h-[180px]">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Priority 01</span>
                      <h4 className="text-sm font-semibold text-slate-900 mt-2.5">Bridge Gap in {weaknesses[0].name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">
                        Your current level is {weaknesses[0].score}%. Target required is {weaknesses[0].targetScore}%. Focus on documentation resources to bridge the remaining {weaknesses[0].gap}% gap.
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push(`/skills/${weaknesses[0].skillId}`)}
                      className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 mt-4 text-left cursor-pointer"
                    >
                      <span>Study {weaknesses[0].name}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Step 2 */}
                  <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between min-h-[180px]">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Priority 02</span>
                      <h4 className="text-sm font-semibold text-slate-900 mt-2.5">Build Portfolio Project Blueprint</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">
                        Technical project exercises in your roadmap are calibrated to target and boost your weak skills. Check off project milestones to verify practical implementation.
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push('/projects')}
                      className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 mt-4 text-left cursor-pointer"
                    >
                      <span>Open Projects Blueprint</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Step 3 */}
                  <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between min-h-[180px]">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-full uppercase">Priority 03</span>
                      <h4 className="text-sm font-semibold text-slate-900 mt-2.5">Validate via Short Assessment</h4>
                      <p className="text-xs text-slate-550 mt-1 leading-normal">
                        Ready to prove your skills? Take a quick validation assessment to recalibrate your scores, update the dashboard telemetry, and verify your interview readiness.
                      </p>
                    </div>
                    <button 
                      onClick={() => router.push('/assessments')}
                      className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 mt-4 text-left cursor-pointer"
                    >
                      <span>Start Assessments</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>
              ) : (
                <div className="py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                  <Trophy className="h-10 w-10 text-emerald-500 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">Career Vector Fully Aligned</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    All your skills meet or exceed the target role thresholds. Your coordinate values are ready for active placements!
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </ShellLayout>
  );
}
