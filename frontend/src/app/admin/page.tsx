'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, ShieldAlert, Plus, Trash2, Database, LayoutGrid, 
  Award, BookOpen, User, Briefcase, BarChart3, Settings, Link2, CheckCircle
} from 'lucide-react';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'stats' | 'roles' | 'skills' | 'mappings' | 'projects' | 'resources' | 'assessments'>('stats');

  // Form states
  // Role Form
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleSalary, setRoleSalary] = useState('');
  const [roleDemand, setRoleDemand] = useState('5');

  // Skill Form
  const [skillName, setSkillName] = useState('');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillCategoryId, setSkillCategoryId] = useState('');

  // Map Form
  const [mapRoleId, setMapRoleId] = useState('');
  const [mapSkillId, setMapSkillId] = useState('');
  const [mapImportance, setMapImportance] = useState('5');

  // Project Form
  const [projRoleId, setProjRoleId] = useState('');
  const [projTitle, setProjTitle] = useState('');
  const [projDifficulty, setProjDifficulty] = useState('Intermediate');
  const [projDesc, setProjDesc] = useState('');

  // Resource Form
  const [resSkillId, setResSkillId] = useState('');
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resType, setResType] = useState('DOCUMENTATION');
  const [resDifficulty, setResDifficulty] = useState('Beginner');

  // Assessment Form
  const [assSkillId, setAssSkillId] = useState('');
  const [assTitle, setAssTitle] = useState('');
  const [assDifficulty, setAssDifficulty] = useState('Beginner');
  const [assQText, setAssQText] = useState('');
  const [assQOptA, setAssQOptA] = useState('');
  const [assQOptB, setAssQOptB] = useState('');
  const [assQOptC, setAssQOptC] = useState('');
  const [assQOptD, setAssQOptD] = useState('');
  const [assQAns, setAssQAns] = useState('');

  // Success/Error logs
  const [feedback, setFeedback] = useState<string | null>(null);

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

  // Fetch user profile to verify ADMIN role
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axios.get('/api/profile', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Restrict access if not ADMIN
  useEffect(() => {
    if (profile && profile.user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [profile, router]);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/stats', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!profile && profile.user.role === 'ADMIN',
  });

  // Fetch categories
  const { data: categories } = useQuery<any[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/categories', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!profile && profile.user.role === 'ADMIN',
  });

  // Fetch Career Roles
  const { data: roles, refetch: refetchRoles } = useQuery<any[]>({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const res = await axios.get('/api/careers');
      return res.data;
    },
    enabled: !!profile && profile.user.role === 'ADMIN',
  });

  // Fetch Skills
  const { data: skills, refetch: refetchSkills } = useQuery<any[]>({
    queryKey: ['admin-skills'],
    queryFn: async () => {
      // Find all seeded skills by checking role relationships or admin data models
      // For MVP ease we can query existing seeded skills
      const res = await axios.get('/api/careers');
      const list: any[] = [];
      const seen = new Set();
      res.data.forEach((r: any) => {
        r.skills.forEach((s: any) => {
          if (!seen.has(s.skill.id)) {
            seen.add(s.skill.id);
            list.push(s.skill);
          }
        });
      });
      return list;
    },
    enabled: !!profile && profile.user.role === 'ADMIN',
  });

  // Create Career Role Mutation
  const createRoleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/admin/roles', data, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      refetchRoles();
      setRoleName('');
      setRoleDesc('');
      setRoleSalary('');
      setRoleDemand('5');
      showFeedback('Career role created successfully.');
    }
  });

  // Delete Career Role Mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/admin/roles/${id}`, { headers: getAuthHeaders() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      refetchRoles();
      showFeedback('Career role deleted.');
    }
  });

  // Create Skill Mutation
  const createSkillMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/admin/skills', data, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      refetchSkills();
      setSkillName('');
      setSkillDesc('');
      showFeedback('Skill created successfully.');
    }
  });

  // Map Skill to Role Mutation
  const mapSkillMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/admin/role-skills', data, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchRoles();
      showFeedback('Skill mapped to Career role successfully.');
    }
  });

  // Unmap Skill Mutation
  const unmapSkillMutation = useMutation({
    mutationFn: async ({ roleId, skillId }: { roleId: string; skillId: string }) => {
      await axios.delete(`/api/admin/role-skills/${roleId}/${skillId}`, { headers: getAuthHeaders() });
    },
    onSuccess: () => {
      refetchRoles();
      showFeedback('Skill mapping removed.');
    }
  });

  // Create Project Template Mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/admin/projects', data, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      refetchRoles();
      setProjTitle('');
      setProjDesc('');
      showFeedback('Project template added.');
    }
  });

  // Delete Project Mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/admin/projects/${id}`, { headers: getAuthHeaders() });
    },
    onSuccess: () => {
      refetchRoles();
      showFeedback('Project template deleted.');
    }
  });

  // Create Resource Mutation
  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/admin/resources', data, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setResTitle('');
      setResUrl('');
      showFeedback('Learning resource link added.');
    }
  });

  // Create Assessment Mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.post('/api/admin/assessments', data, { headers: getAuthHeaders() });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setAssTitle('');
      setAssQText('');
      setAssQOptA('');
      setAssQOptB('');
      setAssQOptC('');
      setAssQOptD('');
      setAssQAns('');
      showFeedback('Skill assessment quiz created.');
    }
  });

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  if (authLoading || profileLoading || statsLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Restrict screen rendering
  if (profile?.user.role !== 'ADMIN') return null;

  return (
    <ShellLayout>
      <div className="max-w-7xl w-full mx-auto px-4 py-8 space-y-8 animate-fadeIn">
        
        {/* Title Header */}
        <div>
          <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">
            Administrative Control Panel
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Seeding content vectors, role weights, assessments metadata, and matching learning systems.
          </p>
        </div>

        {feedback && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-fadeIn">
            <CheckCircle className="h-4 w-4" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-border-color gap-4 overflow-x-auto">
          {[
            { id: 'stats', name: 'Database Stats', icon: Database },
            { id: 'roles', name: 'Career Roles', icon: Briefcase },
            { id: 'skills', name: 'Skills Registry', icon: BarChart3 },
            { id: 'mappings', name: 'Skill Weights', icon: LayoutGrid },
            { id: 'projects', name: 'Project Blueprints', icon: Award },
            { id: 'resources', name: 'Learning Resources', icon: BookOpen },
            { id: 'assessments', name: 'Assessments Builder', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap px-1 ${
                  active 
                    ? 'border-primary text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-350'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="space-y-6">
          
          {/* Stats View */}
          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { name: 'Active Users', val: stats.users, desc: 'Registered accounts' },
                { name: 'Career Roles', val: stats.roles, desc: 'Destination paths' },
                { name: 'Skills Seeded', val: stats.skills, desc: 'registry items' },
                { name: 'Assessments', val: stats.assessments, desc: 'validation tests' },
                { name: 'Learning Links', val: stats.resources, desc: 'external nodes' },
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-5 rounded-xl border border-border-color space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{stat.name}</span>
                  <h3 className="font-outfit text-3xl font-extrabold text-white">{stat.val}</h3>
                  <span className="text-[9px] text-slate-550 block font-semibold">{stat.desc}</span>
                </div>
              ))}
            </div>
          )}

          {/* Roles View */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form creation */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-border-color space-y-4 h-fit">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Add Target Career Role</span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createRoleMutation.mutate({ name: roleName, description: roleDesc, salaryRange: roleSalary, demandScore: roleDemand });
                  }} 
                  className="space-y-3"
                >
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Role Name</label>
                    <input type="text" value={roleName} onChange={e => setRoleName(e.target.value)} required placeholder="e.g. MERN Developer" className="glass-input w-full p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Description</label>
                    <textarea value={roleDesc} onChange={e => setRoleDesc(e.target.value)} required placeholder="Write a summary description..." className="glass-input w-full p-2 text-xs h-20" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Salary Range</label>
                    <input type="text" value={roleSalary} onChange={e => setRoleSalary(e.target.value)} placeholder="e.g. $90k - $125k" className="glass-input w-full p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Market Demand Score (1-10)</label>
                    <input type="number" min="1" max="10" value={roleDemand} onChange={e => setRoleDemand(e.target.value)} className="glass-input w-full p-2 text-xs" />
                  </div>
                  <button type="submit" disabled={createRoleMutation.isPending} className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer">
                    Create Career Role
                  </button>
                </form>
              </div>

              {/* Roles list */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-border-color space-y-4">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Existing Target Roles</span>
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {roles?.map((r) => (
                    <div key={r.id} className="p-3.5 bg-slate-900/40 border border-border-color/30 rounded-lg flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{r.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">{r.description}</p>
                        <div className="flex gap-4 mt-2 text-[9px] text-slate-500 font-bold uppercase">
                          <span>💰 Salary: {r.salaryRange || 'N/A'}</span>
                          <span>📈 Demand: {r.demandScore}/10</span>
                          <span>📦 {r.skills.length} skills</span>
                        </div>
                      </div>
                      <button onClick={() => deleteRoleMutation.mutate(r.id)} className="p-1.5 rounded hover:bg-danger/10 text-slate-550 hover:text-danger cursor-pointer shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Skills View */}
          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form creation */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-border-color space-y-4 h-fit">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Add Technical Skill Registry</span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createSkillMutation.mutate({ name: skillName, description: skillDesc, categoryId: skillCategoryId });
                  }} 
                  className="space-y-3"
                >
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Skill Name</label>
                    <input type="text" value={skillName} onChange={e => setSkillName(e.target.value)} required placeholder="e.g. JWT Authentication" className="glass-input w-full p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Category</label>
                    <select value={skillCategoryId} onChange={e => setSkillCategoryId(e.target.value)} required className="glass-input w-full p-2 text-xs text-slate-300">
                      <option value="">Select category...</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Description</label>
                    <textarea value={skillDesc} onChange={e => setSkillDesc(e.target.value)} required placeholder="Explain this technical skill capability..." className="glass-input w-full p-2 text-xs h-20" />
                  </div>
                  <button type="submit" disabled={createSkillMutation.isPending} className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer">
                    Register Skill
                  </button>
                </form>
              </div>

              {/* Skills list */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-border-color space-y-4">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Skills Registry</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2">
                  {skills?.map((sk) => (
                    <div key={sk.id} className="p-3 bg-slate-900/40 border border-border-color/30 rounded-lg flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{sk.name}</h4>
                        <p className="text-[9px] text-slate-400 mt-1 leading-normal line-clamp-2">{sk.description || 'No description seeded.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mappings View */}
          {activeTab === 'mappings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form creation */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-border-color space-y-4 h-fit">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Map Skill Weight to Career Role</span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    mapSkillMutation.mutate({ roleId: mapRoleId, skillId: mapSkillId, importance: mapImportance });
                  }} 
                  className="space-y-3"
                >
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Career Role</label>
                    <select value={mapRoleId} onChange={e => setMapRoleId(e.target.value)} required className="glass-input w-full p-2 text-xs text-slate-350">
                      <option value="">Select target role...</option>
                      {roles?.map(r => (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-white">{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Technical Skill</label>
                    <select value={mapSkillId} onChange={e => setMapSkillId(e.target.value)} required className="glass-input w-full p-2 text-xs text-slate-350">
                      <option value="">Select skill registry...</option>
                      {skills?.map(sk => (
                        <option key={sk.id} value={sk.id} className="bg-slate-900 text-white">{sk.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Importance (1-10)</label>
                    <input type="number" min="1" max="10" value={mapImportance} onChange={e => setMapImportance(e.target.value)} className="glass-input w-full p-2 text-xs" />
                  </div>
                  <button type="submit" disabled={mapSkillMutation.isPending} className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer">
                    Apply Mapping Weight
                  </button>
                </form>
              </div>

              {/* Mappings list */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-border-color space-y-4">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Career Knowledge Graph weights</span>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {roles?.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-950 border border-border-color/20 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-white">{r.name} Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {r.skills.map((s: any) => (
                          <div key={s.skillId} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-border-color/30 rounded-full text-[10px]">
                            <span className="font-semibold text-slate-300">{s.skill.name}</span>
                            <span className="text-primary font-bold">Imp: {s.importance}</span>
                            <button 
                              onClick={() => unmapSkillMutation.mutate({ roleId: r.id, skillId: s.skillId })}
                              className="text-slate-500 hover:text-danger ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Projects View */}
          {activeTab === 'projects' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form creation */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-border-color space-y-4 h-fit">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Add Project Template Blueprint</span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createProjectMutation.mutate({ roleId: projRoleId, title: projTitle, difficulty: projDifficulty, description: projDesc });
                  }} 
                  className="space-y-3"
                >
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Career Role</label>
                    <select value={projRoleId} onChange={e => setProjRoleId(e.target.value)} required className="glass-input w-full p-2 text-xs text-slate-350">
                      <option value="">Select target role...</option>
                      {roles?.map(r => (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-white">{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Project Title</label>
                    <input type="text" value={projTitle} onChange={e => setProjTitle(e.target.value)} required placeholder="e.g. ATS Platform" className="glass-input w-full p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Difficulty</label>
                    <select value={projDifficulty} onChange={e => setProjDifficulty(e.target.value)} className="glass-input w-full p-2 text-xs text-slate-350">
                      <option value="Beginner" className="bg-slate-900 text-white">Beginner</option>
                      <option value="Intermediate" className="bg-slate-900 text-white">Intermediate</option>
                      <option value="Advanced" className="bg-slate-900 text-white">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Project Blueprint Description</label>
                    <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} required placeholder="Write requirements, skills mapped, and estimated timelines..." className="glass-input w-full p-2 text-xs h-20" />
                  </div>
                  <button type="submit" disabled={createProjectMutation.isPending} className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer">
                    Save Project Blueprint
                  </button>
                </form>
              </div>

              {/* Projects list */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-border-color space-y-4">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Project Blueprints</span>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {roles?.map((r) => (
                    <div key={r.id} className="p-3 bg-slate-950 border border-border-color/20 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-white">{r.name} Blueprints</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {r.projectTemplates?.map((p: any) => (
                          <div key={p.id} className="p-2.5 bg-slate-900 border border-border-color/30 rounded-lg flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-white leading-none truncate">{p.title}</span>
                                <span className="text-[7.5px] bg-primary/20 text-primary border border-primary/30 font-bold px-1 py-0.5 rounded leading-none uppercase">{p.difficulty}</span>
                              </div>
                              <p className="text-[9px] text-slate-450 mt-1 leading-normal line-clamp-2">{p.description}</p>
                            </div>
                            <button onClick={() => deleteProjectMutation.mutate(p.id)} className="p-1 text-slate-500 hover:text-danger shrink-0 cursor-pointer">
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resources View */}
          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form creation */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-border-color space-y-4 h-fit">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Add Learning Resource link</span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    createResourceMutation.mutate({ skillId: resSkillId, title: resTitle, url: resUrl, type: resType, difficulty: resDifficulty });
                  }} 
                  className="space-y-3"
                >
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Technical Skill</label>
                    <select value={resSkillId} onChange={e => setResSkillId(e.target.value)} required className="glass-input w-full p-2 text-xs text-slate-350">
                      <option value="">Select skill...</option>
                      {skills?.map(sk => (
                        <option key={sk.id} value={sk.id} className="bg-slate-900 text-white">{sk.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Resource Title</label>
                    <input type="text" value={resTitle} onChange={e => setResTitle(e.target.value)} required placeholder="e.g. Official JWT Docs" className="glass-input w-full p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Resource URL</label>
                    <input type="url" value={resUrl} onChange={e => setResUrl(e.target.value)} required placeholder="https://example.com" className="glass-input w-full p-2 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 block mb-1">Resource Type</label>
                      <select value={resType} onChange={e => setResType(e.target.value)} className="glass-input w-full p-2 text-xs text-slate-350">
                        <option value="DOCUMENTATION" className="bg-slate-900 text-white">Docs</option>
                        <option value="VIDEO" className="bg-slate-900 text-white">Video</option>
                        <option value="ARTICLE" className="bg-slate-900 text-white">Article</option>
                        <option value="PRACTICE" className="bg-slate-900 text-white">Practice</option>
                        <option value="PROJECT" className="bg-slate-900 text-white">Mini Project</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] font-bold text-slate-400 block mb-1">Difficulty</label>
                      <select value={resDifficulty} onChange={e => setResDifficulty(e.target.value)} className="glass-input w-full p-2 text-xs text-slate-350">
                        <option value="Beginner" className="bg-slate-900 text-white">Beginner</option>
                        <option value="Intermediate" className="bg-slate-900 text-white">Intermediate</option>
                        <option value="Advanced" className="bg-slate-900 text-white">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={createResourceMutation.isPending} className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer">
                    Save Resource Node
                  </button>
                </form>
              </div>

              {/* Resource info message */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-border-color flex flex-col justify-center items-center text-center space-y-4">
                <Link2 className="h-10 w-10 text-slate-700 animate-pulse" />
                <div>
                  <h3 className="font-outfit font-bold text-white text-sm">Learning Resource Nodes</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                    Learning resources are directly linked to technical skills. Navigate to specific Skill detail pages to view how links are grouped dynamically.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assessments Builder */}
          {activeTab === 'assessments' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form creation */}
              <div className="lg:col-span-1 glass-panel p-6 rounded-xl border border-border-color space-y-4 h-fit">
                <span className="text-xs font-extrabold text-white uppercase tracking-wider block">Add Validation Assessment Quiz</span>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const qObj = [{
                      id: 'q1',
                      text: assQText,
                      options: [assQOptA, assQOptB, assQOptC, assQOptD].filter(Boolean),
                      answer: assQAns
                    }];
                    createAssessmentMutation.mutate({ skillId: assSkillId, title: assTitle, difficulty: assDifficulty, questions: qObj });
                  }} 
                  className="space-y-3"
                >
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Target Skill</label>
                    <select value={assSkillId} onChange={e => setAssSkillId(e.target.value)} required className="glass-input w-full p-2 text-xs text-slate-350">
                      <option value="">Select skill...</option>
                      {skills?.map(sk => (
                        <option key={sk.id} value={sk.id} className="bg-slate-900 text-white">{sk.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Assessment Title</label>
                    <input type="text" value={assTitle} onChange={e => setAssTitle(e.target.value)} required placeholder="e.g. React Hooks Quiz" className="glass-input w-full p-2 text-xs" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-1">Difficulty</label>
                    <select value={assDifficulty} onChange={e => setAssDifficulty(e.target.value)} className="glass-input w-full p-2 text-xs text-slate-350">
                      <option value="Beginner" className="bg-slate-900 text-white">Beginner</option>
                      <option value="Intermediate" className="bg-slate-900 text-white">Intermediate</option>
                      <option value="Advanced" className="bg-slate-900 text-white">Advanced</option>
                    </select>
                  </div>

                  {/* Seed Question 1 */}
                  <div className="border-t border-border-color/30 pt-3 space-y-2">
                    <span className="text-[8px] font-bold text-slate-450 uppercase block">Seed Base Question 1</span>
                    <input type="text" value={assQText} onChange={e => setAssQText(e.target.value)} required placeholder="Question description text" className="glass-input w-full p-2 text-[10px]" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={assQOptA} onChange={e => setAssQOptA(e.target.value)} required placeholder="Option A" className="glass-input w-full p-1.5 text-[9px]" />
                      <input type="text" value={assQOptB} onChange={e => setAssQOptB(e.target.value)} required placeholder="Option B" className="glass-input w-full p-1.5 text-[9px]" />
                      <input type="text" value={assQOptC} onChange={e => setAssQOptC(e.target.value)} placeholder="Option C" className="glass-input w-full p-1.5 text-[9px]" />
                      <input type="text" value={assQOptD} onChange={e => setAssQOptD} placeholder="Option D" className="glass-input w-full p-1.5 text-[9px]" />
                    </div>
                    <input type="text" value={assQAns} onChange={e => setAssQAns(e.target.value)} required placeholder="Exact Correct Option string matching text" className="glass-input w-full p-2 text-[9px] text-emerald-400" />
                  </div>

                  <button type="submit" disabled={createAssessmentMutation.isPending} className="w-full py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer">
                    Save Assessment Quiz
                  </button>
                </form>
              </div>

              {/* Assessment building info card */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-border-color flex flex-col justify-center items-center text-center space-y-4">
                <Award className="h-10 w-10 text-slate-700 animate-pulse" />
                <div>
                  <h3 className="font-outfit font-bold text-white text-sm">Assessments Builder</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
                    Assessments are structured question lists mapping directly to skill ID validation logic. Seed tests to enable user skill score upgrades.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ShellLayout>
  );
}
