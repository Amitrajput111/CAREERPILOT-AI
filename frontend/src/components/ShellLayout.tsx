'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Compass, LayoutDashboard, Route, ClipboardList, BarChart3, 
  FolderGit2, Award, User, Settings, LogOut, Menu, Bell,
  Sparkles, Send, X
} from 'lucide-react';

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { 
      sender: 'ai', 
      text: 'Hello! I am your Career GPS Copilot. I track your target role, roadmap, and skills. Ask me: "What should I focus on today?" or "How can I improve my resume?"' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, sending]);

  // Handle redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Verifying coordinates...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');
    setSending(true);
    try {
      const response = await axios.post('/api/ai/copilot', { message: text });
      setMessages(prev => [...prev, { sender: 'ai', text: response.data.response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an issue querying the telemetry nodes. Please try again.' }]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Career Roadmap', path: '/roadmap', icon: Route },
    { name: 'Skill Analysis', path: '/skills', icon: BarChart3 },
    { name: 'Opportunities', path: '/career-center', icon: Compass },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Mock Interviews', path: '/assessments', icon: Award },
    { name: 'AI Copilot', path: '#copilot', icon: Sparkles, onClick: () => setCopilotOpen(true) },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/profile#settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative overflow-hidden">
      
      {/* 1. Sidebar (Desktop) */}
      <aside 
        className={`hidden md:flex flex-col bg-white border-r border-border-color shrink-0 transition-all duration-200 ease-in-out ${
          collapsed ? 'w-[72px]' : 'w-[280px]'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-[72px] flex items-center justify-between px-5 border-b border-border-color">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Compass className="h-6 w-6 text-primary shrink-0" />
            {!collapsed && (
              <span className="font-outfit text-lg font-bold text-slate-900 tracking-tight truncate">
                Career<span className="text-primary">Pilot</span>
              </span>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.path.split('#')[0] && (
              link.name !== 'Settings'
            );

            const content = (
              <>
                <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
                {!collapsed && <span className="truncate">{link.name}</span>}
              </>
            );

            const className = `w-full flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all group cursor-pointer text-left ${
              active 
                ? 'bg-primary text-white border-l-4 border-indigo-700 pl-3 rounded-r-lg rounded-l-none' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-hover-bg px-3'
            }`;

            if (link.onClick) {
              return (
                <button key={link.name} onClick={link.onClick} className={className}>
                  {content}
                </button>
              );
            }

            return (
              <Link key={link.path} href={link.path} className={className}>
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border-color space-y-1 bg-slate-50/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-danger hover:bg-danger/10 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Page Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header */}
        <header className="h-[72px] sticky top-0 z-40 bg-white/80 border-b border-border-color backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-2 md:hidden">
            <Compass className="h-5 w-5 text-primary" />
            <span className="font-outfit text-sm font-bold text-slate-900">CareerPilot</span>
          </div>
          <div className="hidden md:block text-slate-500 text-xs font-semibold">
            System status: <span className="text-emerald-600 font-bold">Online</span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Copilot</span>
            </button>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 relative cursor-pointer transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full" />
            </button>
            <div className="h-4 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center font-bold text-xs text-white shadow-sm">
                {user.email.substring(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-700">{user.email.split('@')[0]}</span>
            </div>
          </div>
        </header>

        {/* Screen Content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* 3. Bottom Navigation (Mobile View) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border-color z-40 flex items-center justify-around px-2 shadow-lg">
        {[
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Roadmap', path: '/roadmap', icon: Route },
          { name: 'Skills', path: '/skills', icon: BarChart3 },
          { name: 'Opportunities', path: '/career-center', icon: Compass },
          { name: 'Profile', path: '/profile', icon: User },
        ].map((link) => {
          const Icon = link.icon;
          const active = pathname === link.path.split('#')[0];
          
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
                active ? 'text-primary font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 4. AI Copilot Right Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-[400px] bg-white border-l border-border-color shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          copilotOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-[72px] flex items-center justify-between px-5 border-b border-border-color bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-outfit font-bold text-sm text-slate-800">CareerPilot Intelligence</span>
          </div>
          <button 
            onClick={() => setCopilotOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="p-4 bg-slate-50/50 border-b border-border-color space-y-2 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Intelligence Queries</span>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              "What should I focus on today?",
              "Why is my readiness score low?",
              "Which project should I build next?",
              "How can I improve my resume?"
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={sending}
                className="text-left text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 transition-all truncate cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-slate-50/30">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <div 
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10' 
                    : 'bg-white text-slate-800 border border-border-color rounded-tl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-450 mt-1 font-semibold px-1">
                {m.sender === 'user' ? 'You' : 'CareerPilot AI'}
              </span>
            </div>
          ))}
          {sending && (
            <div className="self-start flex flex-col items-start max-w-[85%]">
              <div className="p-3 bg-white border border-border-color rounded-xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Drawer Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border-color bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
              placeholder="Ask CareerPilot..."
              className="flex-1 bg-slate-50 border border-border-color rounded-lg px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="bg-primary hover:bg-primary/95 text-white rounded-lg px-3.5 flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-primary/10"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Overlay Backdrop */}
      {copilotOpen && (
        <div 
          onClick={() => setCopilotOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-45 transition-opacity duration-300"
        />
      )}

    </div>
  );
};

export default ShellLayout;
