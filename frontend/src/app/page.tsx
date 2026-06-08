'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, Route, BarChart3, Award, ArrowRight, ShieldAlert, 
  Sparkles, BookOpen, Layers, CheckCircle2, ChevronDown, ChevronUp,
  Brain, FileText, CheckSquare, Target
} from 'lucide-react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
    <div className="flex-1 flex flex-col bg-background text-foreground selection:bg-primary/30 selection:text-white">
      
      {/* Header navbar */}
      <header className="h-[72px] border-b border-border-color bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-outfit text-base font-bold text-white tracking-tight">
              Career<span className="text-primary">Pilot</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="glow-btn px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-primary/25">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center max-w-4xl mx-auto z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border-color mb-4">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-bold text-slate-300 tracking-wide uppercase">Your Technical Career GPS</span>
        </div>

        <h1 className="font-outfit text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Know Your Next <br />
          <span className="gradient-text">Career Move.</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Stop guessing your career path. Get personalized roadmaps, skill-gap analysis, and daily action plans to reach your target engineering roles.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Link href="/register" className="glow-btn inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-transform hover:scale-[1.01] shadow-lg shadow-primary/20">
            Start Your Career Journey
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-card-bg border border-border-color hover:border-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all">
            See Demo
          </Link>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 border-t border-border-color bg-surface/30">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="text-[9px] uppercase font-bold text-danger bg-danger/10 border border-danger/20 px-2 py-0.5 rounded tracking-wider">
            The Problem
          </span>
          <h2 className="font-outfit text-2xl font-bold text-white tracking-tight">Too many tutorials, not enough direction</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            YouTube playlists, GitHub repositories, and documentation sites are abundant. The problem isn't access to information; it's the lack of structured coordination. You don't need another generic course—you need a turn-by-turn roadmap.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-border-color bg-background">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-outfit text-2xl font-bold text-white tracking-tight">How It Works</h2>
            <p className="text-slate-400 text-xs">Four phases to chart your course and navigate to landing a job.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <span className="text-2xl font-extrabold text-primary">01</span>
              <h3 className="font-outfit text-sm font-bold text-white">Define Target Role</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">Select MERN, Frontend, Backend, or AI Engineer from our structured catalog.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <span className="text-2xl font-extrabold text-primary">02</span>
              <h3 className="font-outfit text-sm font-bold text-white">Upload Resume PDF</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">Our parser analyzes your profile background, projects, and work history.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <span className="text-2xl font-extrabold text-primary">03</span>
              <h3 className="font-outfit text-sm font-bold text-white">Verify Your Skills</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">Take quick 5-question conceptual quizzes to test baseline capability.</p>
            </div>
            <div className="glass-panel p-6 rounded-xl space-y-4">
              <span className="text-2xl font-extrabold text-primary">04</span>
              <h3 className="font-outfit text-sm font-bold text-white">Run the Career GPS</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">Receive daily action items and a turn-by-turn learning path timeline.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Career GPS Visualization Section */}
      <section className="py-24 border-t border-border-color bg-surface/20">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded tracking-wider">
              Visualizer
            </span>
            <h2 className="font-outfit text-2xl font-bold text-white tracking-tight">The GPS In Action</h2>
            <p className="text-slate-400 text-xs">See how the navigation engine constructs your daily flight path.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl max-w-3xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-2xl -z-10" />
            <div className="absolute bottom-0 left-0 h-40 w-40 bg-accent/5 rounded-full blur-2xl -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Node 1 */}
              <div className="flex flex-col items-center text-center p-3 bg-slate-900/40 rounded-xl border border-border-color">
                <FileText className="h-6 w-6 text-slate-400 mb-2" />
                <span className="text-[10px] text-slate-500 font-bold">STEP 1</span>
                <span className="text-xs font-bold text-white mt-1">Upload Resume</span>
                <span className="text-[9px] text-slate-400 mt-1">Parses skills & gaps</span>
              </div>

              {/* Line 1 */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
              </div>

              {/* Node 2 */}
              <div className="flex flex-col items-center text-center p-3 bg-slate-900/40 rounded-xl border border-border-color">
                <Target className="h-6 w-6 text-warning mb-2" />
                <span className="text-[10px] text-slate-500 font-bold">STEP 2</span>
                <span className="text-xs font-bold text-white mt-1">Assess Skill</span>
                <span className="text-[9px] text-slate-400 mt-1">React/Node.js Quizzes</span>
              </div>

              {/* Line 2 */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-4 w-4 text-primary animate-pulse" />
              </div>

              {/* Node 3 */}
              <div className="flex flex-col items-center text-center p-3 bg-primary/10 rounded-xl border border-primary/30">
                <CheckSquare className="h-6 w-6 text-primary mb-2" />
                <span className="text-[10px] text-primary font-bold">STEP 3</span>
                <span className="text-xs font-bold text-white mt-1">GPS Checklist</span>
                <span className="text-[9px] text-primary/80 mt-1">Daily tasks & progress</span>
              </div>
            </div>

            {/* Mock Task Panel Preview */}
            <div className="mt-8 p-4 rounded-xl bg-slate-950/40 border border-border-color space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-border-color pb-2">
                <span className="font-bold text-slate-300">ACTIVE FLIGHT CHECKLIST</span>
                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded font-bold">72% READINESS</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-border-color text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    <span className="text-slate-300">Build JWT Authentication</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">45 mins • +4 Backend Score</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-900/30 border border-border-color text-xs opacity-75">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border border-slate-600" />
                    <span className="text-slate-400">Implement React Context State</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">30 mins • +3 Frontend Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 border-t border-border-color bg-background">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-xl space-y-4 hover:border-primary/30 transition-colors">
            <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-lg w-fit">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-outfit text-base font-bold text-white">Dynamic Roadmap timelines</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Expandable timeline steps outlining skills, estimated completion hours, and curated learning routes.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-xl space-y-4 hover:border-accent/30 transition-colors">
            <div className="p-2.5 bg-accent/10 border border-accent/20 rounded-lg w-fit">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-outfit text-base font-bold text-white">Scientific Readiness Metric</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Calculates your role preparedness using the weighted 40-30-20-10 ratio of skills, tasks, and assessment metrics.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-xl space-y-4 hover:border-warning/30 transition-colors">
            <div className="p-2.5 bg-warning/10 border border-warning/20 rounded-lg w-fit">
              <Award className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-outfit text-base font-bold text-white">Curated Gaps resources</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Access immediate links to verified courses, videos, and articles for every technology gap identified.
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 border-t border-border-color bg-surface/30">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[9px] uppercase font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded tracking-wider">
              Testimonials
            </span>
            <h2 className="font-outfit text-2xl font-bold text-white tracking-tight">Engineers who navigated with us</h2>
            <p className="text-slate-400 text-xs">See how developers mapped their transitions into tech.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-xl space-y-4 relative">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "I was stuck in tutorial hell for months, moving from one course to another without building real projects. CareerPilot AI structured my days. I completed my Node.js gaps, checked off my auth tasks, and landed my first Frontend role."
              </p>
              <div>
                <h4 className="text-xs font-bold text-white">Aravind Sharma</h4>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">MERN Dev at TechCorp</span>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-xl space-y-4 relative">
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "The Skill Radar chart was the turning point. It showed me my SQL knowledge was way below target for backend roles. The platform directed me to exact resources, tested me with quick quizzes, and let me map out my timeline clearly."
              </p>
              <div>
                <h4 className="text-xs font-bold text-white">Priya Patel</h4>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Backend Engineer at DevStudio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-t border-border-color bg-background">
        <div className="max-w-3xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="font-outfit text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-xs">Clear answers about platform mechanics.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="glass-panel rounded-xl overflow-hidden border border-border-color">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-white hover:text-primary transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-border-color/20 bg-slate-900/10">
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
      <section className="py-24 border-t border-border-color bg-gradient-to-b from-surface/50 to-background text-center px-4 relative overflow-hidden">
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <Target className="h-8 w-8 text-primary mx-auto animate-bounce" />
          <h2 className="font-outfit text-3xl font-extrabold text-white tracking-tight">
            Stop guessing. Start building.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Join other engineering students who use CareerPilot AI to plan, check off, and verify their technical progression.
          </p>
          <div className="pt-2">
            <Link href="/register" className="glow-btn inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-transform hover:scale-[1.01] shadow-lg shadow-primary/20">
              Start Your Journey Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-color bg-surface py-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span>© 2026 CareerPilot AI. All rights reserved. Know Your Next Career Move.</span>
        </div>
      </footer>

    </div>
  );
}
