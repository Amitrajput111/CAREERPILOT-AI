'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, Route, BarChart3, Award, ArrowRight, ShieldAlert, 
  Sparkles, BookOpen, Layers, CheckCircle2, ChevronRight,
  Brain, FileText, CheckSquare, Target, Play, MessageSquare, 
  ListTodo, User, Star, ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'roadmap' | 'resume' | 'copilot' | 'tasks'>('dashboard');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-slate-50/30 text-slate-800 selection:bg-primary/20 selection:text-slate-900">
      
      {/* HEADER */}
      <header className="h-[72px] border-b border-slate-200/50 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Compass className="h-5.5 w-5.5 text-primary" />
            <span className="font-outfit text-base font-bold text-slate-900 tracking-tight">
              Career<span className="text-primary">Pilot</span>
            </span>
            <span className="text-[9px] font-bold text-primary bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-full ml-1 uppercase tracking-wide">
              AI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#product-preview" className="hover:text-slate-900 transition-colors">Roadmap</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#why-careerpilot" className="hover:text-slate-900 transition-colors">About</a>
          </nav>

          {/* Authentication CTAs */}
          <div className="flex items-center gap-4">
            {!mounted ? (
              <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-xl" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-xs font-bold text-primary hover:text-primary-hover transition-colors">
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="flex items-center justify-center px-4 h-[36px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10">
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-20 lg:py-32 px-6 overflow-hidden bg-white border-b border-slate-200/40">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-150">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Your Technical Career Operating System</span>
            </div>

            <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Stop Guessing <br className="hidden sm:inline" />
              Your Career. <br />
              <span className="text-primary">Know Exactly What To Do Next.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-550 leading-relaxed font-medium">
              CareerPilot analyzes your current skills, identifies your career gaps, creates a personalized roadmap, and guides your daily progress toward your target role.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link 
                href={user ? "/dashboard" : "/register"} 
                className="inline-flex items-center gap-2 px-5 h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10 hover:-translate-y-0.5"
              >
                Start Your Career Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a 
                href="#product-preview" 
                className="inline-flex items-center gap-2 px-5 h-[48px] bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all duration-200"
              >
                <Play className="h-3.5 w-3.5 text-slate-400 fill-slate-400" />
                See How It Works
              </a>
            </div>
          </div>

          {/* Hero Right Preview (Realistic Dashboard Simulation) */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50/50 p-4 shadow-lg relative overflow-hidden">
              
              {/* Decorative nodes */}
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl" />
              
              {/* Mini Dashboard HUD */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5 shadow-sm relative z-10">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4.5 w-4.5 text-primary" />
                    <span className="text-xs font-bold text-slate-800">Telemetry Terminal</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">
                    Live Session
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">Target Position</span>
                    <div className="text-xs font-bold text-slate-800">MERN Stack Developer</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">Readiness Metrics</span>
                    <div className="text-xs font-bold text-primary">72% Completed</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3.5 bg-indigo-50/40 border border-primary/10 rounded-xl">
                  {/* Gauge */}
                  <div className="relative h-12 w-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="20" stroke="#E2E8F0" strokeWidth="3.5" fill="transparent" />
                      <circle cx="24" cy="24" r="20" stroke="#4F46E5" strokeWidth="3.5" fill="transparent" strokeDasharray="125.6" strokeDashoffset="35.1" />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-slate-850">72%</span>
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900">Career GPS Aligned</h4>
                    <p className="text-[10px] text-slate-500">Skills overlap identified. 4 critical gaps remaining.</p>
                  </div>
                </div>

                {/* Actions checklist preview */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Flight Tasks</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-150 text-[11px] bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-slate-800 font-semibold">Deploy JWT Auth API</span>
                      </div>
                      <span className="text-slate-400 text-[9px] font-bold">+4 Score</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-150 text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-300" />
                        <span className="text-slate-650">Verify SQL Indexing Quiz</span>
                      </div>
                      <span className="text-slate-400 text-[9px] font-bold">+3 Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="py-16 px-6 bg-slate-50/50 border-b border-slate-200/40">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 bg-white border border-slate-200/70 rounded-2xl space-y-2 shadow-xs">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary mb-2">
                <Route className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">Personalized Career Roadmaps</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Step-by-step custom timelines mapped to your target career role, dynamically built based on your profile inputs and background context.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200/70 rounded-2xl space-y-2 shadow-xs">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">AI-Powered Skill Gap Analysis</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instant parsing of your resume to compare technical skills with industry expectations, exposing immediate gaps and formatting errors.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200/70 rounded-2xl space-y-2 shadow-xs">
              <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-warning mb-2">
                <CheckSquare className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">Daily Action Plans</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                A daily checklist of actionable portfolio projects, conceptual assessments, and resources to scale your readiness index methodically.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 bg-white border-b border-slate-200/40">
        <div className="max-w-[1280px] mx-auto space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-primary bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full tracking-wider">
              Onboarding Journey
            </span>
            <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">Four transparent steps to identify gaps, verify capabilities, and launch your timeline.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="space-y-4 text-left relative z-10 group">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                  01
                </span>
                <div className="h-[1px] flex-1 bg-slate-100 group-hover:bg-primary/20 hidden lg:block" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step One</h3>
              <h4 className="font-outfit text-base font-bold text-slate-900">Choose Your Career Goal</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select your target job profile (Frontend, Backend, MERN, or AI Engineer) from our structured, industry-aligned career catalog.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4 text-left relative z-10 group">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                  02
                </span>
                <div className="h-[1px] flex-1 bg-slate-100 group-hover:bg-primary/20 hidden lg:block" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step Two</h3>
              <h4 className="font-outfit text-base font-bold text-slate-900">Upload Resume</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drag and drop your PDF resume. Our parsing engine reads your tech stack, projects, and work history to compile a base coordinate profile.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4 text-left relative z-10 group">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                  03
                </span>
                <div className="h-[1px] flex-1 bg-slate-100 group-hover:bg-primary/20 hidden lg:block" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step Three</h3>
              <h4 className="font-outfit text-base font-bold text-slate-900">Receive Personalized Analysis</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instantly inspect your matched strengths, critical skill gaps, resume quality index, and AI-recommended improvements.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-4 text-left relative z-10 group">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                  04
                </span>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step Four</h3>
              <h4 className="font-outfit text-base font-bold text-slate-900">Follow Daily Roadmap</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive an evolving day-by-day roadmap timeline matching your gaps, pre-seeded guides, and quick validation assessments.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* PRODUCT PREVIEW (INTERACTIVE SWITCHER) */}
      <section id="product-preview" className="py-24 px-6 bg-slate-50/50 border-b border-slate-200/40">
        <div className="max-w-[1280px] mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-primary bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full tracking-wider">
              Telemetry Terminal
            </span>
            <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Interactive Product Preview</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Explore the exact telemetry dashboard screens and visual tools configured for your account.
            </p>
          </div>

          {/* Interactive tabs */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto border-b border-slate-200 pb-3">
            {[
              { key: 'dashboard', name: 'Dashboard', icon: Layers },
              { key: 'roadmap', name: 'Roadmap', icon: Route },
              { key: 'resume', name: 'Resume Analysis', icon: FileText },
              { key: 'copilot', name: 'AI Copilot', icon: MessageSquare },
              { key: 'tasks', name: 'Tasks', icon: ListTodo }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === tab.key 
                      ? 'bg-primary text-white shadow-sm shadow-primary/20' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-350'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Mockup Renderer Container */}
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md min-h-[380px] flex flex-col justify-between">
            
            {/* Dashboard tab preview */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Career Command Center</h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Candidate: Demo Account</p>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target: Frontend Engineer</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-center">
                    <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">Readiness Score</span>
                    <div className="text-xl font-extrabold text-primary">78%</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-center">
                    <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">Salary Estimate</span>
                    <div className="text-xl font-extrabold text-slate-800">$95k - $120k</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-center">
                    <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">Completed Gaps</span>
                    <div className="text-xl font-extrabold text-emerald-600">8 / 11</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1 text-center">
                    <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">Active Streak</span>
                    <div className="text-xl font-extrabold text-amber-500">12 Days</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-center p-4 bg-slate-50/60 border border-slate-150 rounded-xl">
                  {/* Gauge */}
                  <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="32" cy="32" r="26" stroke="#E2E8F0" strokeWidth="4.5" fill="transparent" />
                      <circle cx="32" cy="32" r="26" stroke="#4F46E5" strokeWidth="4.5" fill="transparent" strokeDasharray="163.3" strokeDashoffset="35.9" />
                    </svg>
                    <span className="absolute text-xs font-extrabold text-slate-850">78%</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Excellent Progress Matrix</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      You are in the top 15% of candidates tracking Frontend Developer roles. Bridge your remaining CSS grid and Tailwind configurations to unlock placement matchmaking.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Roadmap tab preview */}
            {activeTab === 'roadmap' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                  <h3 className="text-sm font-bold text-slate-900">Career GPS Journey Timeline</h3>
                  <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase">
                    3 Phases
                  </span>
                </div>

                <div className="relative border-l-2 border-slate-150 pl-6 ml-3 space-y-6">
                  
                  {/* Phase 1 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">Phase 1: Core Language Mechanics</h4>
                        <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.2 rounded-full font-bold">COMPLETED</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Master Javascript scoping, hoisting, event delegation, and asynchronous promises.</p>
                    </div>
                  </div>

                  {/* Phase 2 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary border border-white flex items-center justify-center animate-ping" />
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary border border-white flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">Phase 2: React Core & Ecosystem</h4>
                        <span className="text-[8px] bg-indigo-50 text-primary border border-indigo-100 px-1.5 py-0.2 rounded-full font-bold">ACTIVE</span>
                      </div>
                      <p className="text-[10px] text-slate-500">Analyze state updates, context providers, custom hooks, and page routing layouts.</p>
                    </div>
                  </div>

                  {/* Phase 3 */}
                  <div className="relative opacity-65">
                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-slate-200 border border-white flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">Phase 3: Scale & Deployment</h4>
                        <span className="text-[8px] bg-slate-100 text-slate-400 border border-slate-200 px-1.5 py-0.2 rounded-full font-bold uppercase">Locked</span>
                      </div>
                      <p className="text-[10px] text-slate-550">Verify Docker containerization, Vercel deployments, CI/CD pipeline triggers, and scaling.</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Resume tab preview */}
            {activeTab === 'resume' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                  <h3 className="text-sm font-bold text-slate-900">PDF Parsing & Quality Index</h3>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    Quality Score: <span className="text-emerald-500">82/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-150 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">✓ Parsed Strengths</h4>
                    <ul className="text-[10px] text-slate-550 space-y-1 list-disc pl-4">
                      <li>Strong core language skills (TypeScript, React, Node.js)</li>
                      <li>Well-defined projects catalog with tech stack declarations</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-150 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-danger tracking-wider">⚠️ Format Gaps</h4>
                    <ul className="text-[10px] text-slate-550 space-y-1 list-disc pl-4">
                      <li>Missing active cloud deployment URLs next to headings</li>
                      <li>Lack of metric impacts (e.g. key performance increases)</li>
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 border border-primary/10 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-primary uppercase">AI Formatting Suggestion</span>
                  <p className="text-[10px] text-slate-600">
                    "Change project descriptions from passive statements to metrics: 'Rebuilt task API boosting route response speeds by 22% using PostgreSQL query optimizations.'"
                  </p>
                </div>
              </div>
            )}

            {/* Copilot tab preview */}
            {activeTab === 'copilot' && (
              <div className="space-y-4 animate-fade-in flex flex-col justify-between h-full">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-905">AI Career Copilot Chat</h3>
                  <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-primary px-2.5 py-0.5 rounded-full font-bold uppercase">
                    Telemetry Connected
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[200px] p-2 bg-slate-50/50 rounded-xl border border-slate-150/60">
                  <div className="flex flex-col items-start max-w-[85%]">
                    <div className="p-3 bg-white text-slate-805 border border-slate-200 rounded-2xl rounded-tl-none text-[11px] leading-relaxed">
                      Hello! I noticed your SQL scores are below target for Backend roles. I recommend reading the PostgreSQL Indexing guide.
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 uppercase font-semibold">CareerPilot AI</span>
                  </div>
                  
                  <div className="flex flex-col items-end max-w-[85%] ml-auto">
                    <div className="p-3 bg-primary text-white rounded-2xl rounded-tr-none text-[11px] leading-relaxed">
                      What database project can I build to bridge this gap?
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 uppercase font-semibold">You</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks tab preview */}
            {activeTab === 'tasks' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                  <h3 className="text-sm font-bold text-slate-900">Evolving Daily Checklists</h3>
                  <span className="text-[9px] text-slate-450 font-bold uppercase">Next Step: Phase 2</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150/80 text-xs bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4.5 w-4.5 text-primary" />
                      <span className="text-slate-850 font-bold">Deploy database pool and migrations</span>
                    </div>
                    <span className="text-slate-405 text-[10px] font-bold uppercase">45 Mins • +4 Backend</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150/80 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="h-4.5 w-4.5 rounded-full border border-slate-350" />
                      <span className="text-slate-700 font-medium">Verify integration tests for signup endpoint</span>
                    </div>
                    <span className="text-slate-405 text-[10px] font-bold uppercase">30 Mins • +3 Backend</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-150/80 text-xs opacity-70">
                    <div className="flex items-center gap-2.5">
                      <div className="h-4.5 w-4.5 rounded-full border border-slate-350" />
                      <span className="text-slate-700 font-medium">Add loading skeletons to UI charts</span>
                    </div>
                    <span className="text-slate-405 text-[10px] font-bold uppercase">20 Mins • +2 Frontend</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 text-center">
              <Link 
                href={user ? "/dashboard" : "/register"}
                className="text-xs font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1.5"
              >
                Access this section in your portal
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CAREERPILOT */}
      <section id="why-careerpilot" className="py-24 px-6 bg-white border-b border-slate-200/40">
        <div className="max-w-[1280px] mx-auto space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-danger bg-danger/10 border border-danger/20 px-2.5 py-0.5 rounded-full tracking-wider">
              The Reality
            </span>
            <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">The Core Engineering Problem</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">Why standard tutorial pathways and courses fail candidates in competitive placements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                <h4 className="text-xs font-bold text-slate-450 uppercase">Problem 01</h4>
                <h3 className="font-outfit text-base font-bold text-slate-900">Students don't know what to learn</h3>
                <p className="text-xs text-slate-550 leading-relaxed">
                  YouTube playlists and docs are overwhelming. Without coordinates, you waste weeks on outdated libraries or trivial syntax, completely missing target skills.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                <h4 className="text-xs font-bold text-slate-450 uppercase">Problem 02</h4>
                <h3 className="font-outfit text-base font-bold text-slate-900">Following random static roadmaps</h3>
                <p className="text-xs text-slate-550 leading-relaxed">
                  Generic curriculum path charts assume everyone starts from scratch. They force you to waste time on concepts you already master while ignoring your personal gaps.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-indigo-50/50 border border-primary/10 space-y-2">
                <h4 className="text-xs font-bold text-primary uppercase">Solution 01</h4>
                <h3 className="font-outfit text-base font-bold text-slate-900">Dynamic coordinate definition</h3>
                <p className="text-xs text-slate-550 leading-relaxed">
                  CareerPilot scans your resume to match skills directly against live career matrices. You focus only on active gaps to unlock placement metrics.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-indigo-50/50 border border-primary/10 space-y-2">
                <h4 className="text-xs font-bold text-primary uppercase">Solution 02</h4>
                <h3 className="font-outfit text-base font-bold text-slate-900">Weighted progress telemetry</h3>
                <p className="text-xs text-slate-550 leading-relaxed">
                  Track your job-readiness index using a strict 40-30-20-10 index formula (40% skills, 30% projects, 20% tasks, 10% assessments), ensuring you know when you are placement-ready.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES (PROBLEM-SOLUTION CARDS) */}
      <section id="features" className="py-24 px-6 bg-slate-50/50 border-b border-slate-200/40">
        <div className="max-w-[1280px] mx-auto space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-primary bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full tracking-wider">
              Telemetry Engine
            </span>
            <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Platform Capabilities</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
              Every tool required to identify weaknesses, document improvements, and verify readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="h-9 w-9 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-primary">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">Career Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Discover suitable target career paths aligned with competitive industry parameters and salary ranges.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="h-9 w-9 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">Resume Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Understand your document strengths and ecosystem gaps instantly through PDF parse analysis.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="h-9 w-9 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-primary">
                <Route className="h-5 w-5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">Adaptive Roadmaps</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Roadmap timelines that evolve dynamically as you scale your assessments score and complete projects.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="h-9 w-9 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-primary">
                <ListTodo className="h-5 w-5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">Daily Tasks</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Know exactly what telemetry nodes and tasks to focus on today to maintain a high streak.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="h-9 w-9 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">Progress Tracking</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quantitative metrics tracking your target capabilities across multiple dashboard telemetry nodes.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-6 bg-white border border-slate-200/80 rounded-2xl space-y-3 hover:shadow-md transition-all">
              <div className="h-9 w-9 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-outfit text-sm font-bold text-slate-900">AI Career Copilot</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive contextual real-time guidelines and chat suggestions referencing your profile states.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="pricing" className="py-24 px-6 bg-white border-b border-slate-200/40 text-center">
        <div className="max-w-[700px] mx-auto p-12 bg-slate-50 border border-slate-200 rounded-3xl space-y-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="space-y-3 relative z-10">
            <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ready to Build Your Career with Confidence?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Join engineering candidates scaling their readiness index. Chart your course and navigate to landing a job.
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <Link 
              href={user ? "/dashboard" : "/register"} 
              className="inline-flex items-center gap-2 px-6 h-[46px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10 hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-16 px-6 border-t border-slate-200/50">
        <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-slate-100 pb-12">
          
          {/* Brand col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <span className="font-outfit text-base font-bold text-slate-900 tracking-tight">CareerPilot</span>
            </div>
            <p className="text-[11px] text-slate-405 leading-relaxed max-w-xs font-medium">
              The definitive career telemetry and operating system for engineering candidates. Map target gaps and scale placement metrics.
            </p>
          </div>

          {/* Product col */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Product</h4>
            <ul className="text-xs text-slate-500 space-y-2">
              <li><Link href="#features" className="hover:text-slate-800 transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-slate-800 transition-colors">How It Works</Link></li>
              <li><Link href="#product-preview" className="hover:text-slate-800 transition-colors">Roadmap Preview</Link></li>
            </ul>
          </div>

          {/* Company col */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Company</h4>
            <ul className="text-xs text-slate-500 space-y-2">
              <li><Link href="#why-careerpilot" className="hover:text-slate-800 transition-colors">About Us</Link></li>
              <li><span className="text-slate-400 cursor-not-allowed">Careers</span></li>
              <li><span className="text-slate-400 cursor-not-allowed">Blog</span></li>
            </ul>
          </div>

          {/* Legal col */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Legal</h4>
            <ul className="text-xs text-slate-500 space-y-2">
              <li><span className="text-slate-400 cursor-not-allowed">Privacy Policy</span></li>
              <li><span className="text-slate-400 cursor-not-allowed">Terms of Service</span></li>
              <li><span className="text-slate-400 cursor-not-allowed">Telemetry Standards</span></li>
            </ul>
          </div>

        </div>

        <div className="max-w-[1280px] mx-auto pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-405">
          <span>© 2026 CareerPilot AI. All rights reserved.</span>
          <span className="mt-2 sm:mt-0">Know Your Next Career Move.</span>
        </div>
      </footer>

    </div>
  );
}
