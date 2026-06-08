'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Compass, LayoutDashboard, Route, User, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-color bg-background/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary animate-pulse" />
            <Link href="/dashboard" className="font-outfit text-xl font-bold tracking-tight text-white">
              Career<span className="text-primary">Pilot</span> <span className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full ml-1 uppercase tracking-wider">AI</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/career-center"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/career-center') ? 'text-primary' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="h-4 w-4" />
              Career Center
            </Link>
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-primary' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/roadmap"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/roadmap') ? 'text-primary' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Route className="h-4 w-4" />
              Roadmap
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/profile') ? 'text-primary' : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-400">Welcome back,</span>
              <span className="text-sm font-semibold text-slate-200">{user.email.split('@')[0]}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-danger transition-colors cursor-pointer bg-slate-900/50 hover:bg-danger/10 px-3 py-1.5 rounded-lg border border-border-color hover:border-danger/30"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
