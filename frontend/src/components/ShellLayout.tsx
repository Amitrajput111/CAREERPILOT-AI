'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
  Compass, LayoutDashboard, Route, BarChart3,
  FolderGit2, Award, User, LogOut, Menu, Bell,
  Sparkles, Send, X, Loader2, Briefcase, ClipboardList, ChevronRight
} from 'lucide-react';

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Career', path: '/career-center', icon: Compass },
  { name: 'Roadmap', path: '/roadmap', icon: Route },
  { name: 'Tasks', path: '/tasks', icon: ClipboardList },
  { name: 'Skills', path: '/skills', icon: BarChart3 },
  { name: 'Projects', path: '/projects', icon: FolderGit2 },
  { name: 'Assessments', path: '/assessments', icon: Award },
  { name: 'Opportunities', path: '/opportunities', icon: Briefcase },
  { name: 'Profile', path: '/profile', icon: User },
];

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/career-center': 'Career Intelligence',
  '/roadmap': 'My Roadmap',
  '/tasks': 'Tasks',
  '/skills': 'Skill Analysis',
  '/projects': 'Projects',
  '/assessments': 'Assessments',
  '/opportunities': 'Opportunities',
  '/profile': 'Profile',
};

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([{
    sender: 'ai',
    text: "Hi! I'm your Career GPS. Ask me: 'What should I focus on today?' or 'Why is my readiness score low?'"
  }]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading CareerPilot...</span>
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
      const res = await api.post('/api/ai/copilot', { message: text });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response || res.data.answer || 'Got it! Let me think about that.' }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I\'m having trouble connecting right now. Please try again in a moment.' }]);
    } finally {
      setSending(false);
    }
  };

  const currentTitle = pageTitles[pathname] || 'CareerPilot AI';

  return (
    <div className="min-h-screen bg-background flex">

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-border-color shrink-0 transition-all duration-200 ease-in-out ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-color">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Compass className="h-5 w-5 text-primary shrink-0" />
            {!collapsed && (
              <span className="font-outfit text-base font-bold text-slate-900 tracking-tight truncate">
                Career<span className="text-primary">Pilot</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.path || (link.path !== '/dashboard' && pathname.startsWith(link.path));
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                  active
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? link.name : undefined}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {!collapsed && <span>{link.name}</span>}
              </Link>
            );
          })}

          {/* AI Copilot */}
          <button
            onClick={() => setCopilotOpen(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-indigo-600 hover:bg-indigo-50 ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'AI Copilot' : undefined}
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            {!collapsed && <span>AI Copilot</span>}
          </button>
        </nav>

        {/* User Section */}
        <div className="p-2 border-t border-border-color space-y-0.5">
          <div className={`flex items-center gap-2.5 px-3 py-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-700 truncate">{user.email.split('@')[0]}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 sticky top-0 z-40 bg-white/90 border-b border-border-color backdrop-blur-md flex items-center justify-between px-5">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 md:hidden">
            <Compass className="h-5 w-5 text-primary" />
            <span className="font-outfit text-sm font-bold text-slate-900">CareerPilot</span>
          </div>

          {/* Desktop page title */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">{currentTitle}</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCopilotOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>
            <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full" />
            </button>
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border-color z-40 flex items-center justify-around px-2 shadow-lg">
        {[
          { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Roadmap', path: '/roadmap', icon: Route },
          { name: 'AI', path: '#', icon: Sparkles, onClick: () => setCopilotOpen(true) },
          { name: 'Skills', path: '/skills', icon: BarChart3 },
          { name: 'Profile', path: '/profile', icon: User },
        ].map((link) => {
          const Icon = link.icon;
          const active = pathname === link.path;
          if (link.onClick) {
            return (
              <button key={link.name} onClick={link.onClick} className="flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium text-indigo-600">
                <Icon className="h-5 w-5 mb-0.5" />
                <span>{link.name}</span>
              </button>
            );
          }
          return (
            <Link key={link.path} href={link.path} className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${active ? 'text-primary' : 'text-slate-500'}`}>
              <Icon className="h-5 w-5 mb-0.5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* AI Copilot Drawer */}
      <div className={`fixed top-0 right-0 h-full z-50 w-full sm:w-[400px] bg-white border-l border-border-color shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${copilotOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-border-color bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-bold text-slate-800">AI Copilot</p>
              <p className="text-[10px] text-slate-400">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={() => setCopilotOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick prompts */}
        <div className="p-3 bg-slate-50/50 border-b border-border-color">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Questions</p>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              'What should I focus on today?',
              'Why is my readiness score low?',
              'Which project should I build next?',
              'How can I improve my resume?',
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={sending}
                className="text-left text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-3.5 py-2.5 flex gap-1">
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }} className="p-4 border-t border-border-color bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
              placeholder="Ask CareerPilot anything..."
              className="flex-1 glass-input px-3 py-2.5 text-xs focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="bg-primary text-white rounded-lg px-3.5 flex items-center justify-center hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>

      {/* Copilot backdrop */}
      {copilotOpen && (
        <div onClick={() => setCopilotOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-45" />
      )}
    </div>
  );
};

export default ShellLayout;
