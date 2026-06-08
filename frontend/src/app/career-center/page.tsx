'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { Compass, Briefcase, DollarSign, Flame, Layers, ListChecks, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface RoleSkill {
  skill: { name: string; slug: string; description: string; assessments: Array<{ id: string }> };
  importance: number;
}

interface ProjectTemplate {
  id: string;
  title: string;
  difficulty: string;
  description: string;
}

interface CareerRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  salaryRange: string;
  demandScore: number;
  skills: RoleSkill[];
  projectTemplates: ProjectTemplate[];
}

export default function CareerCenterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);
  const [updating, setUpdating] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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

  // Fetch Career Roles
  const { data: roles, isLoading, error } = useQuery<CareerRole[]>({
    queryKey: ['career-roles'],
    queryFn: async () => {
      const res = await axios.get('/api/careers/roles', {
        headers: getAuthHeaders()
      });
      return res.data;
    },
    enabled: !!user,
  });

  // Set default selected role when roles load
  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  const handleSelectRole = async () => {
    if (!selectedRole || !user) return;
    setUpdating(true);
    try {
      await axios.post(
        '/api/profile',
        { targetRoleId: selectedRole.id },
        { headers: getAuthHeaders() }
      );
      router.push('/onboarding');
    } catch (err) {
      console.error('Failed to set target role:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading Career Center...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <ShellLayout>
      <div className="max-w-7xl w-full mx-auto px-4 py-8">
        {/* Banner */}
        <div className="mb-8">
          <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">
            Career <span className="gradient-text">Center</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Compare target industry career paths. Evaluate skill sets, average compensations, and lock in your target destination.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Roles list */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Available Destinations</h2>
            <div className="space-y-3">
              {roles?.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedRole?.id === role.id
                      ? 'bg-primary/10 border-primary text-white shadow-lg'
                      : 'bg-card-bg/40 border-border-color text-slate-300 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className={`h-5 w-5 ${selectedRole?.id === role.id ? 'text-primary' : 'text-slate-400'}`} />
                    <div>
                      <h3 className="font-outfit font-bold text-sm">{role.name}</h3>
                      <span className="text-xs text-slate-400">{role.salaryRange}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main - Role detail panel */}
          {selectedRole && (
            <div className="lg:col-span-2">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-8">
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-color pb-6">
                  <div>
                    <h2 className="font-outfit text-xl sm:text-2xl font-bold text-white">{selectedRole.name}</h2>
                    <p className="text-slate-300 text-xs mt-2 leading-relaxed">{selectedRole.description}</p>
                  </div>
                  <button
                    onClick={handleSelectRole}
                    disabled={updating}
                    className="glow-btn shrink-0 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {updating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Select Target Role
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/40 border border-border-color">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Estimated Compensation</span>
                      <span className="text-sm font-bold text-white">{selectedRole.salaryRange}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/40 border border-border-color">
                    <Flame className="h-8 w-8 text-warning" />
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Market Demand Score</span>
                      <span className="text-sm font-bold text-white">{selectedRole.demandScore} / 10</span>
                    </div>
                  </div>
                </div>

                {/* Skills Graph */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white">
                    <Layers className="h-4 w-4 text-primary" />
                    <h3 className="font-outfit font-bold text-sm">Prerequisite Skill Vector</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRole.skills?.map((rs, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/20 border border-border-color">
                        <div>
                          <span className="text-sm font-semibold text-white">{rs.skill.name}</span>
                          <span className="text-xs text-slate-400 block">{rs.skill.description}</span>
                        </div>
                        <span className="text-xs bg-primary/20 text-primary font-bold px-2 py-0.5 rounded">
                          Imp: {rs.importance}/10
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portfolio Project Requirement */}
                {selectedRole.projectTemplates && selectedRole.projectTemplates.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <ListChecks className="h-4 w-4 text-accent" />
                      <h3 className="font-outfit font-bold text-sm">Required Portfolio Project Blueprint</h3>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/30 border border-border-color border-dashed">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h4 className="text-sm font-bold text-white">{selectedRole.projectTemplates[0].title}</h4>
                        <span className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                          {selectedRole.projectTemplates[0].difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {selectedRole.projectTemplates[0].description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ShellLayout>
  );
}
