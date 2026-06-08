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
      <div className="flex-grow flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <ShellLayout>
      <div className="max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">
            Recommended <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Build production-grade applications requested by your target roadmap to validate your skills.
          </p>
        </div>

        {/* Empty state - No target role selected */}
        {!profile?.targetRoleId ? (
          <div className="glass-panel p-12 rounded-2xl max-w-xl mx-auto text-center space-y-6">
            <FolderGit2 className="h-12 w-12 text-slate-500 mx-auto animate-pulse" />
            <div>
              <h2 className="font-outfit text-xl font-bold text-white">No Target Role Defined</h2>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Choose a target career path in the Career Center to unlock recommended portfolio project blueprints.
              </p>
            </div>
            <button
              onClick={() => router.push('/career-center')}
              className="glow-btn px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
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
                <div key={proj.id} className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color pb-4">
                    <div>
                      <h3 className="font-outfit text-lg font-bold text-white">{proj.title}</h3>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Required for: {profile.targetRole?.name}</span>
                    </div>
                    <span className="text-[9px] bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded uppercase tracking-wider self-start sm:self-auto">
                      {proj.difficulty}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Est: 3 - 4 Weeks</span>
                    <span className="flex items-center gap-2"><Award className="h-4 w-4 text-warning" /> Impact: High Employability</span>
                    <span className="flex items-center gap-2"><Code className="h-4 w-4 text-accent" /> Outcome: Portfolio Showcase</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 glass-panel rounded-2xl">
                <FolderGit2 className="h-10 w-10 text-slate-600 mx-auto mb-2 animate-pulse" />
                <span className="text-xs text-slate-400">No projects pre-seeded for this target role.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </ShellLayout>
  );
}
