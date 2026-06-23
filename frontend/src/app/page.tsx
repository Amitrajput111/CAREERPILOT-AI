'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, Route, BarChart3, Award, ArrowRight, ShieldAlert, 
  Sparkles, BookOpen, Layers, CheckCircle2, ChevronDown, ChevronUp,
  Brain, FileText, CheckSquare, Target
} from 'lucide-react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const faqs = [
    {
      q: "What makes CareerPilot AI a Career GPS?",
      a: "Unlike AI chatbots that provide generic advice in a chat window, CareerPilot AI acts as a turn-by-turn navigation system. It takes your target role, analyzes your resume to find skill gaps, validates your skills using conceptual assessments, and maps out a day-by-day action checklist to guide you to your destination."
    },
    {
      q: "How is the Career Readiness Score calculated?",
      a: "We calculate your progress using a strict, multi-dimensional formula to avoid 'vanity metrics': 40% is based on Skill Coverage, 30% on Portfolio Projects, 20% on Task Checklist Completions, and 10% on Assessment Quiz Scores."
    },
    {
      q: "Can I use the platform without a Gemini API Key?",
      a: "Yes! If no Gemini API key is configured in the environment, CareerPilot AI falls back to a high-fidelity deterministic regex parser that extracts skills directly from your resume, allowing you to test the complete application offline instantly."
    },
    {
      q: "Is the interface mobile-responsive?",
      a: "Yes. The entire design system is optimized for laptop screens and mobile devices. On mobile, the desktop sidebar transforms into an elegant bottom navigation bar designed for comfortable one-thumb usage."
    }
  ];

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-slate-900">
      
      {/* Header navbar */}
      <header className="h-[72px] border-b border-slate-200/60 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-sans text-lg font-bold text-slate-900 tracking-tight">
              Career<span className="text-primary">Pilot</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            {!mounted ? (
              <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-xl" />
            ) : user ? (
              <>
                <Link href="/dashboard" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                  Go to Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center justify-center px-4 h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-xs font-semibold text-slate-650 hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="flex items-center justify-center px-5 h-[40px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-28 px-8 text-center max-w-4xl mx-auto z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 mb-4 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Your Technical Career GPS</span>
        </div>

        <h1 className="font-sans text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
          Know Your Next <br />
          <span className="text-primary">Career Move.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
          Stop guessing your career path. Get personalized roadmaps, skill-gap analysis, and daily action plans to reach your target engineering roles.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          {!mounted ? (
            <div className="h-[48px] w-48 bg-slate-100 animate-pulse rounded-xl" />
          ) : user ? (
            <>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10 hover:-translate-y-0.5 animate-fade-in">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/career-center" className="inline-flex items-center gap-2 px-6 h-[48px] bg-white border border-slate-200 hover:border-slate-350 text-slate-700 text-xs font-semibold rounded-xl transition-all duration-200">
                Explore Careers
              </Link>
            </>
          ) : (
            <>
              <Link href="/register" className="inline-flex items-center gap-2 px-6 h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10 hover:-translate-y-0.5">
                Start Your Career Journey
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-6 h-[48px] bg-white border border-slate-200 hover:border-slate-350 text-slate-700 text-xs font-semibold rounded-xl transition-all duration-200">
                See Demo
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto px-8 text-center space-y-4">
          <span className="text-[10px] uppercase font-bold text-danger bg-danger/10 border border-danger/20 px-2.5 py-0.5 rounded-full tracking-wider">
            The Problem
          </span>
          <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">Too many tutorials, not enough direction</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            YouTube playlists, GitHub repositories, and documentation sites are abundant. The problem isn't access to information; it's the lack of structured coordination. You don't need another generic course—you need a turn-by-turn roadmap.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-8 space-y-16">
          <div className="text-center space-y-2">
            <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 text-sm">Four phases to chart your course and navigate to landing a job.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 space-y-4 hover:shadow-md transition-all duration-200">
              <span className="text-2xl font-bold text-primary">01</span>
              <h3 className="font-sans text-sm font-bold text-slate-900">Define Target Role</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Select MERN, Frontend, Backend, or AI Engineer from our structured catalog.</p>
            </div>
            <div className="glass-panel p-6 space-y-4 hover:shadow-md transition-all duration-200">
              <span className="text-2xl font-bold text-primary">02</span>
              <h3 className="font-sans text-sm font-bold text-slate-900">Upload Resume PDF</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Our parser analyzes your profile background, projects, and work history.</p>
            </div>
            <div className="glass-panel p-6 space-y-4 hover:shadow-md transition-all duration-200">
              <span className="text-2xl font-bold text-primary">03</span>
              <h3 className="font-sans text-sm font-bold text-slate-900">Verify Your Skills</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Take quick 5-question conceptual quizzes to test baseline capability.</p>
            </div>
            <div className="glass-panel p-6 space-y-4 hover:shadow-md transition-all duration-200">
              <span className="text-2xl font-bold text-primary">04</span>
              <h3 className="font-sans text-sm font-bold text-slate-900">Run the Career GPS</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Receive daily action items and a turn-by-turn learning path timeline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Career GPS Visualization Section */}
      <section className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-8 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-primary bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full tracking-wider">
              Visualizer
            </span>
            <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">The GPS In Action</h2>
            <p className="text-slate-500 text-sm">See how the navigation engine constructs your daily flight path.</p>
          </div>

          <div className="glass-panel p-8 max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-2xl -z-10" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-2xl -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Node 1 */}
              <div className="flex flex-col items-center text-center p-4 bg-slate-50/50 rounded-xl border border-slate-150">
                <FileText className="h-6 w-6 text-slate-400 mb-2" />
                <span className="text-[10px] text-slate-450 font-bold">STEP 1</span>
                <span className="text-xs font-bold text-slate-800 mt-1">Upload Resume</span>
                <span className="text-[10px] text-slate-500 mt-1">Parses skills & gaps</span>
              </div>

              {/* Line 1 */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
              </div>

              {/* Node 2 */}
              <div className="flex flex-col items-center text-center p-4 bg-slate-50/50 rounded-xl border border-slate-150">
                <Target className="h-6 w-6 text-warning mb-2" />
                <span className="text-[10px] text-slate-450 font-bold">STEP 2</span>
                <span className="text-xs font-bold text-slate-800 mt-1">Assess Skill</span>
                <span className="text-[10px] text-slate-500 mt-1">React/Node.js Quizzes</span>
              </div>

              {/* Line 2 */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
              </div>

              {/* Node 3 */}
              <div className="flex flex-col items-center text-center p-4 bg-indigo-50/65 rounded-xl border border-primary/20">
                <CheckSquare className="h-6 w-6 text-primary mb-2" />
                <span className="text-[10px] text-primary font-bold">STEP 3</span>
                <span className="text-xs font-bold text-slate-800 mt-1">GPS Checklist</span>
                <span className="text-[10px] text-primary/80 mt-1">Daily tasks & progress</span>
              </div>
            </div>

            {/* Mock Task Panel Preview */}
            <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-slate-200/60 pb-3">
                <span className="font-bold text-slate-650 uppercase">Active Flight Checklist</span>
                <span className="text-[10px] bg-indigo-50 text-primary px-2.5 py-0.5 rounded-full font-bold">72% READINESS</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-150/60 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-slate-800 font-semibold">Build JWT Authentication</span>
                  </div>
                  <span className="text-slate-500 text-[10px] font-medium">45 mins • +4 Backend Score</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/70 border border-slate-150/60 text-xs opacity-75">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border border-slate-350" />
                    <span className="text-slate-605">Implement React Context State</span>
                  </div>
                  <span className="text-slate-500 text-[10px] font-medium">30 mins • +3 Frontend Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-panel p-8 rounded-2xl space-y-4 hover:border-primary/30 transition-all duration-200">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg w-fit">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-sans text-base font-bold text-slate-900">Dynamic Roadmap Timelines</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Expandable timeline steps outlining skills, estimated completion hours, and curated learning routes.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4 hover:border-emerald-350 transition-all duration-200">
            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg w-fit">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-sans text-base font-bold text-slate-900">Scientific Readiness Metric</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Calculates your role preparedness using the weighted 40-30-20-10 ratio of skills, tasks, and assessment metrics.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl space-y-4 hover:border-warning/30 transition-all duration-200">
            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg w-fit">
              <Award className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-sans text-base font-bold text-slate-900">Curated Gaps Resources</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Access immediate links to verified courses, videos, and articles for every technology gap identified.
            </p>
          </div>

        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-24 border-t border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-8 space-y-16">
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold text-primary bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full tracking-wider">
              Testimonials
            </span>
            <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">Engineers who navigated with us</h2>
            <p className="text-slate-500 text-sm">See how developers mapped their transitions into tech.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 space-y-4 relative hover:shadow-md transition-all duration-200">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "I was stuck in tutorial hell for months, moving from one course to another without building real projects. CareerPilot AI structured my days. I completed my Node.js gaps, checked off my auth tasks, and landed my first Frontend role."
              </p>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Aravind Sharma</h4>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">MERN Dev at TechCorp</span>
              </div>
            </div>

            <div className="glass-panel p-8 space-y-4 relative hover:shadow-md transition-all duration-200">
              <p className="text-xs text-slate-600 italic leading-relaxed">
                "The Skill Radar chart was the turning point. It showed me my SQL knowledge was way below target for backend roles. The platform directed me to exact resources, tested me with quick quizzes, and let me map out my timeline clearly."
              </p>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Priya Patel</h4>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Backend Engineer at DevStudio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-3xl mx-auto px-8 space-y-16">
          <div className="text-center space-y-2">
            <h2 className="font-sans text-2xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-sm">Clear answers about platform mechanics.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="glass-panel overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-100 bg-white/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Banner / CTA Section */}
      <section className="py-24 border-t border-slate-100 bg-white text-center px-8 relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <Target className="h-8 w-8 text-primary mx-auto animate-bounce" />
          <h2 className="font-sans text-3xl font-bold text-slate-900 tracking-tight">
            Stop guessing. Start building.
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Join other engineering students who use CareerPilot AI to plan, check off, and verify their technical progression.
          </p>
          <div className="pt-2">
            {!mounted ? (
              <div className="h-[48px] w-48 bg-slate-100 animate-pulse rounded-xl mx-auto" />
            ) : user ? (
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10 hover:-translate-y-0.5">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/register" className="inline-flex items-center gap-2 px-6 h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10 hover:-translate-y-0.5">
                Start Your Journey Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-8">
          <span>© 2026 CareerPilot AI. All rights reserved. Know Your Next Career Move.</span>
        </div>
      </footer>

    </div>
  );
}
