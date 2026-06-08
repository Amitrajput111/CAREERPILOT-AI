'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { ShellLayout } from '../../../components/ShellLayout';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2, ArrowLeft, BookOpen, Video, FileText, Award, 
  Dumbbell, CheckCircle, HelpCircle, Compass, Star, ShieldAlert
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  difficulty: string;
}

interface Assessment {
  id: string;
  title: string;
  difficulty: string;
}

interface SkillDetails {
  id: string;
  name: string;
  description: string | null;
  userScore: number;
  resources: Resource[];
  assessments: Assessment[];
  usedInRoles: string[];
}

export default function SkillDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();

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

  // Fetch skill details
  const { data: skill, isLoading, error } = useQuery<SkillDetails>({
    queryKey: ['skill-details', id],
    queryFn: async () => {
      const res = await axios.get(`/api/careers/skills/${id}`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user && !!id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Aligning skill vectors...</span>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <ShellLayout>
        <div className="max-w-4xl w-full mx-auto px-4 py-8 text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="text-lg font-bold text-white">Skill coordinates not found</h2>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </ShellLayout>
    );
  }

  // Group learning resources
  const docs = skill.resources.filter(r => r.type === 'DOCUMENTATION');
  const videos = skill.resources.filter(r => r.type === 'VIDEO');
  const articles = skill.resources.filter(r => r.type === 'ARTICLE');
  const practice = skill.resources.filter(r => r.type === 'PRACTICE');
  const projects = skill.resources.filter(r => r.type === 'PROJECT' || r.type === 'COURSE');

  // Static Fallback Interview Topics for key skill types to build premium feel
  const getInterviewTopics = (skillName: string) => {
    const name = skillName.toLowerCase();
    if (name.includes('react')) {
      return ['React Hooks (useState, useEffect, custom hooks)', 'Context API & State Propagation', 'Reconciliation & Virtual DOM', 'Performance tuning (useMemo, useCallback, React.memo)'];
    }
    if (name.includes('node') || name.includes('express')) {
      return ['Event Loop & Async I/O throughput', 'Middleware architecture patterns', 'Error handling & uncaughtExceptions', 'Stream API & Buffer handling'];
    }
    if (name.includes('db') || name.includes('sql') || name.includes('postgres') || name.includes('mongo')) {
      return ['Index optimization & execution plans', 'ACID transaction isolation states', 'Data normalization vs denormalization', 'Connection pool tuning'];
    }
    if (name.includes('jwt') || name.includes('auth') || name.includes('security')) {
      return ['JWT signing & token encryption keys', 'CSRF/XSS defense strategies', 'Access token rotation & secure cookies', 'OAuth2 consent flow sequences'];
    }
    // Default general tech topics
    return ['Core syntactic execution rules', 'Common design patterns & interfaces', 'Testing baseline code (Unit vs Integration)', 'Production deployment bottlenecks'];
  };

  const interviewTopics = getInterviewTopics(skill.name);

  return (
    <ShellLayout>
      <div className="max-w-5xl w-full mx-auto px-4 py-8 space-y-8 animate-fadeIn">
        
        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Skill Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-xl border border-border-color flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[9px] bg-primary/15 border border-primary/30 text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wide">
              Skill Profile Detail
            </span>
            <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">{skill.name}</h1>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {skill.description || 'Core technical skill required for your active roadmap step.'}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {skill.usedInRoles.map((role, idx) => (
                <span key={idx} className="text-[9px] text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
                  Required for {role}
                </span>
              ))}
            </div>
          </div>

          {/* User Score Gauge */}
          <div className="flex items-center gap-4 bg-slate-900/60 border border-border-color/60 p-4 rounded-xl shrink-0">
            <div className="relative flex items-center justify-center h-14 w-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="23" stroke="rgba(255,255,255,0.03)" strokeWidth="3" fill="transparent" />
                <circle cx="28" cy="28" r="23" stroke="#4F46E5" strokeWidth="3" fill="transparent"
                  strokeDasharray={2 * Math.PI * 23}
                  strokeDashoffset={((100 - skill.userScore) / 100) * (2 * Math.PI * 23)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute font-outfit text-[10px] font-extrabold text-white">{skill.userScore}%</div>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Your Score</span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {skill.userScore >= 70 ? 'Proficient' : 'Training Required'}
              </span>
              <span className="text-[9px] text-slate-400">Target is 70% level</span>
            </div>
          </div>
        </div>

        {/* Dynamic content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Learning Resources */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 sm:p-8 rounded-xl border border-border-color space-y-6">
              
              <div className="flex items-center gap-2 border-b border-border-color pb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-outfit font-extrabold text-sm text-white">Recommended Learning Resources</h3>
              </div>

              {skill.resources.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No learning resources registered for this skill yet.
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Documentation */}
                  {docs.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Documentation & Manuals</span>
                      <div className="grid grid-cols-1 gap-2">
                        {docs.map(r => (
                          <a 
                            key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-border-color/40 hover:border-primary/20 rounded-lg flex items-center justify-between text-xs transition-all group"
                          >
                            <span className="font-semibold text-slate-200 group-hover:text-white">{r.title}</span>
                            <span className="text-[9px] text-primary font-bold uppercase shrink-0">View Docs ↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Tutorials */}
                  {videos.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Video Tutorials & Courses</span>
                      <div className="grid grid-cols-1 gap-2">
                        {videos.map(r => (
                          <a 
                            key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-border-color/40 hover:border-primary/20 rounded-lg flex items-center justify-between text-xs transition-all group"
                          >
                            <span className="font-semibold text-slate-200 group-hover:text-white">{r.title}</span>
                            <span className="text-[9px] text-accent font-bold uppercase shrink-0">Watch Video ↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Articles */}
                  {articles.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Articles & Design Guides</span>
                      <div className="grid grid-cols-1 gap-2">
                        {articles.map(r => (
                          <a 
                            key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-border-color/40 hover:border-primary/20 rounded-lg flex items-center justify-between text-xs transition-all group"
                          >
                            <span className="font-semibold text-slate-200 group-hover:text-white">{r.title}</span>
                            <span className="text-[9px] text-slate-500 font-bold uppercase shrink-0">Read ↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practice exercises */}
                  {practice.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Practice Labs & Exercises</span>
                      <div className="grid grid-cols-1 gap-2">
                        {practice.map(r => (
                          <a 
                            key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-border-color/40 hover:border-primary/20 rounded-lg flex items-center justify-between text-xs transition-all group"
                          >
                            <span className="font-semibold text-slate-200 group-hover:text-white">{r.title}</span>
                            <span className="text-[9px] text-amber-500 font-bold uppercase shrink-0">Run Practice ↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mini Projects */}
                  {projects.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mini Project blueprints</span>
                      <div className="grid grid-cols-1 gap-2">
                        {projects.map(r => (
                          <a 
                            key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="p-3 bg-slate-900/40 hover:bg-slate-900 border border-border-color/40 hover:border-primary/20 rounded-lg flex items-center justify-between text-xs transition-all group"
                          >
                            <span className="font-semibold text-slate-200 group-hover:text-white">{r.title}</span>
                            <span className="text-[9px] text-emerald-500 font-bold uppercase shrink-0">View Blueprint ↗</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

          {/* Right Column: Assessment & Interview Prep */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Assessments */}
            <div className="glass-panel p-6 rounded-xl border border-border-color space-y-4">
              <div className="flex items-center gap-2 border-b border-border-color pb-3">
                <Award className="h-4 w-4 text-primary" />
                <h3 className="font-outfit font-bold text-xs text-white uppercase tracking-wider">Skill Verification</h3>
              </div>

              <p className="text-[11px] text-slate-450 leading-relaxed">
                Take a baseline assessment quiz to validate this skill. Scores are mapped to your Career Readiness score.
              </p>

              {skill.assessments.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {skill.assessments.map(ass => (
                    <div key={ass.id} className="p-3 bg-slate-900/50 border border-border-color/30 rounded-lg flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-white block">{ass.title}</span>
                        <span className="text-[8px] text-slate-500 font-semibold uppercase mt-0.5 block">Level: {ass.difficulty}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/assessments?start=${ass.id}`)}
                        className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Start Verification
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 py-2">
                  No validation assessments found for this skill yet.
                </div>
              )}
            </div>

            {/* Interview Topics */}
            <div className="glass-panel p-6 rounded-xl border border-border-color space-y-4">
              <div className="flex items-center gap-2 border-b border-border-color pb-3">
                <HelpCircle className="h-4 w-4 text-warning" />
                <h3 className="font-outfit font-bold text-xs text-white uppercase tracking-wider">Interview topics</h3>
              </div>

              <p className="text-[11px] text-slate-450 leading-relaxed">
                Expect validation questions on the following sub-topics during technical screens:
              </p>

              <ul className="space-y-2 pt-1">
                {interviewTopics.map((topic, i) => (
                  <li key={i} className="text-xs text-slate-350 flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-2" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

      </div>
    </ShellLayout>
  );
}
