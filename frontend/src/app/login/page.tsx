'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex justify-center items-center px-4 py-12">
      <div className="absolute inset-0 bg-radial from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-8">
          <Compass className="h-10 w-10 text-primary mb-3" />
          <h2 className="font-outfit text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
          <p className="text-sm text-slate-500 mt-1">Navigate your tech career journey</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl bg-white">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm mb-6 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-3 text-sm"
                  placeholder="name@college.edu"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-3 text-sm"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-btn w-full py-3.5 px-4 bg-primary text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Direct Demo Sign-In Options */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold tracking-wider">Direct Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  await login('user@careerpilot.ai', 'UserPass123!');
                } catch (err: any) {
                  setError(err.message);
                  setLoading(false);
                }
              }}
              className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-primary/45 hover:bg-slate-50/50 rounded-xl transition-all cursor-pointer text-center group disabled:opacity-50"
            >
              <span className="text-xs font-bold text-slate-750 group-hover:text-primary transition-colors">Demo User</span>
              <span className="text-[10px] text-slate-400 mt-0.5">One-click sign in</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  await login('admin@careerpilot.ai', 'AdminPass123!');
                } catch (err: any) {
                  setError(err.message);
                  setLoading(false);
                }
              }}
              className="flex flex-col items-center justify-center p-3 border border-slate-200 hover:border-primary/45 hover:bg-slate-50/50 rounded-xl transition-all cursor-pointer text-center group disabled:opacity-50"
            >
              <span className="text-xs font-bold text-slate-750 group-hover:text-primary transition-colors">Demo Admin</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Full control access</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">New to CareerPilot? </span>
            <Link href="/register" className="text-sm font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
