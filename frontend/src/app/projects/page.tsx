'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { FolderGit2, Calendar, Award, Code, Compass, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectTemplate {
  id: string;
  title: string;
  difficulty: string;
  description: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
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

  // Fetch Profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axios.get('/api/profile', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <ShellLayout>
      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-8">
        <div>
          <h1 className="font-sans text-3xl font-bold text-slate-900 tracking-tight">
            Portfolio Project Blueprints
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            Build production-grade applications requested by your target roadmap to validate your skills.
          </p>
        </div>

        {/* Empty state - No target role selected */}
        {!profile?.targetRoleId ? (
          <div className="glass-panel p-16 max-w-xl mx-auto text-center space-y-6">
            <FolderGit2 className="h-14 w-14 text-slate-400 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="font-sans text-xl font-bold text-slate-900">No Target Role Defined</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                Choose a target career path in the Career Center to unlock recommended portfolio project blueprints.
              </p>
            </div>
            <button
              onClick={() => router.push('/career-center')}
              className="px-6 h-[48px] bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-sm shadow-primary/10 transition-all duration-200"
            >
              Configure Target Career
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* Projects list */
          <div className="space-y-6">
            {profile?.targetRole?.projectTemplates && profile.targetRole.projectTemplates.length > 0 ? (
              profile.targetRole.projectTemplates.map((proj: ProjectTemplate) => (
                <div key={proj.id} className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4 hover:shadow-md transition-all duration-250">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-sans text-lg font-bold text-slate-900">{proj.title}</h3>
                      <span className="text-[11px] text-slate-450 font-semibold block mt-1">Required for: {profile.targetRole?.name}</span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-primary font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
                      {proj.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Est: 3 - 4 Weeks</span>
                    <span className="flex items-center gap-2"><Award className="h-4 w-4 text-warning" /> Impact: High Employability</span>
                    <span className="flex items-center gap-2"><Code className="h-4 w-4 text-indigo-500" /> Outcome: Portfolio Showcase</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 glass-panel rounded-2xl">
                <FolderGit2 className="h-12 w-12 text-slate-400 mx-auto mb-3 animate-pulse" />
                <span className="text-xs text-slate-500 font-medium">No projects pre-seeded for this target role.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </ShellLayout>
  );
}
