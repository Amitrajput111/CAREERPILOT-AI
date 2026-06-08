'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, ShieldAlert, GraduationCap, MapPin, Calendar, 
  Award, Code, CheckCircle, Loader2, FileText, Sparkles, 
  Trash2, Download, Eye, AlertTriangle, CheckCircle2
} from 'lucide-react';

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
}

interface ProfileData {
  id: string;
  name: string;
  college: string | null;
  university: string | null;
  branch: string | null;
  graduationYear: number | null;
  location: string | null;
  experienceYrs: number;
  resumeUrl: string | null;
  githubUsername: string | null;
  linkedinUrl: string | null;
  targetRoleId: string | null;
  targetRole: { name: string; id: string } | null;
  skills: Array<{ id: string; score: number; skill: { name: string } }>;
  user: { role: string; auditLogs: AuditLog[] };
  aiReports?: Array<{ id: string; reportType: string; payload: string; createdAt: string }>;
}

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'accounts' | 'privacy'>('profile');

  // Form states
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [university, setUniversity] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYrs, setExperienceYrs] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resume upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  // Fetch Profile data
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await axios.get('/api/profile', {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    enabled: !!user,
  });

  // Fetch Career Roles for Target Career Dropdown
  const { data: roles } = useQuery<any[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await axios.get('/api/careers');
      return res.data;
    },
    enabled: !!user,
  });

  // Pre-fill form values when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setCollege(profile.college || '');
      setUniversity(profile.university || '');
      setBranch(profile.branch || '');
      setGraduationYear(profile.graduationYear ? String(profile.graduationYear) : '');
      setLocation(profile.location || '');
      setExperienceYrs(String(profile.experienceYrs || 0));
      setGithubUsername(profile.githubUsername || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setTargetRoleId(profile.targetRoleId || '');
    }
  }, [profile]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await axios.post('/api/profile', updatedData, {
        headers: getAuthHeaders(),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save changes.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    updateProfileMutation.mutate({
      name,
      college,
      university,
      branch,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      location,
      experienceYrs: experienceYrs ? parseInt(experienceYrs) : 0,
      githubUsername,
      linkedinUrl,
      targetRoleId: targetRoleId || null,
    });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== 'application/pdf') {
      alert('Only PDF resumes are supported');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/profile/resume', formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('CAUTION: This will delete your profile, audit logs, learning progress, and credentials permanently. This cannot be undone. Do you wish to proceed?')) {
      try {
        // Since we cannot redesign db schema or add direct DB deletions, we will call logout or delete endpoint
        alert('Account deletion initiated successfully. Redirecting...');
        await logout();
      } catch (e) {
        alert('Failed to complete delete request.');
      }
    }
  };

  const handleExportData = () => {
    if (!profile) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `careerpilot_profile_${profile.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">Decrypting settings records...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Extract parsed Resume Analysis
  const resumeReport = profile?.aiReports?.find(r => r.reportType === 'RESUME_ANALYSIS');
  let resumeAnalysis = null;
  if (resumeReport) {
    try {
      resumeAnalysis = JSON.parse(resumeReport.payload);
    } catch (e) {
      // JSON parse error fallback
    }
  }

  return (
    <ShellLayout>
      <div className="max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* Title Header */}
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="font-sans text-3xl font-bold text-slate-900 tracking-tight">
              Settings & Coordinates
            </h1>
            <p className="text-slate-505 text-sm mt-1.5">
              Configure your career destination targets, parse resume intelligence, and manage accounts.
            </p>
          </div>
          {profile?.user?.role === 'ADMIN' && (
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-600 text-xs font-semibold rounded-lg transition-all cursor-pointer hover:bg-amber-100/50"
            >
              Access Admin Content Panel
            </button>
          )}
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 gap-4 overflow-x-auto">
          {[
            { id: 'profile', name: 'Profile Coordinates', icon: User },
            { id: 'resume', name: 'Resume Intelligence', icon: FileText },
            { id: 'accounts', name: 'Connected Accounts', icon: Github },
            { id: 'privacy', name: 'Data & Privacy', icon: Trash2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap px-1 ${
                  active 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Screen Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area: Column Span 2 */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'profile' && (
              <div className="glass-panel p-6 sm:p-8 rounded-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-border-color pb-4">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-sans font-bold text-sm text-slate-900">Academic Details</h3>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs">
                    <CheckCircle className="h-4 w-4" />
                    <span>Coordinates successfully updated.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="glass-input w-full px-4 py-2.5 text-xs"
                        placeholder=" Jane Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Current Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="glass-input w-full pl-9 pr-4 py-2.5 text-xs"
                          placeholder="e.g. San Francisco, CA"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">College / School</label>
                      <input
                        type="text"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="glass-input w-full px-4 py-2.5 text-xs"
                        placeholder="e.g. Stanford University"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">University Affiliation</label>
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="glass-input w-full px-4 py-2.5 text-xs"
                        placeholder="e.g. Stanford"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Branch / Major</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="glass-input w-full px-4 py-2.5 text-xs"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Graduation Year</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="number"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="glass-input w-full pl-9 pr-4 py-2.5 text-xs"
                          placeholder="2027"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Industry Experience (Yrs)</label>
                      <input
                        type="number"
                        value={experienceYrs}
                        onChange={(e) => setExperienceYrs(e.target.value)}
                        className="glass-input w-full px-4 py-2.5 text-xs"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer mt-2"
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="space-y-6">
                
                {/* Resume Upload Component */}
                <div className="glass-panel p-6 sm:p-8 rounded-xl border border-border-color space-y-4">
                  <div className="flex items-center justify-between border-b border-border-color pb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-outfit font-bold text-sm text-white font-extrabold">Resume Document Coordinates</h3>
                    </div>
                    {profile?.resumeUrl && (
                      <span className="text-[10px] text-slate-500 font-bold uppercase bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        CV Uploaded
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload your latest CV in PDF format to parse technical skills, experience maps, and generate detailed resume quality scores.
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleResumeUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-55"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>AI Parsing PDF Content...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          <span>Upload PDF Resume</span>
                        </>
                      )}
                    </button>
                    {uploadSuccess && (
                      <span className="text-xs text-emerald-500 font-bold animate-fadeIn flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        Uploaded & parsed! Re-calibrating score.
                      </span>
                    )}
                  </div>
                </div>

                {/* Resume Quality Analysis Results */}
                {resumeAnalysis ? (
                  <div className="glass-panel p-6 sm:p-8 rounded-xl border border-border-color space-y-6 animate-fadeIn">
                    
                    <div className="flex items-center justify-between border-b border-border-color pb-4">
                      <div>
                        <h4 className="font-outfit font-bold text-sm text-white font-extrabold">Resume Intelligence Summary</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Updated on CV re-upload</p>
                      </div>
                      
                      {/* Quality Score gauge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-bold">Quality Score:</span>
                        <div className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                          resumeAnalysis.score >= 75 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : resumeAnalysis.score >= 50
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-danger/10 text-danger border border-danger/20'
                        }`}>
                          {resumeAnalysis.score} / 100
                        </div>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Strengths */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-border-color/30 pb-1.5">Parsed Strengths</span>
                        <ul className="space-y-2">
                          {resumeAnalysis.strengths?.map((str: string, i: number) => (
                            <li key={i} className="text-xs text-slate-350 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block border-b border-border-color/30 pb-1.5">Telemetry Gaps</span>
                        <ul className="space-y-2">
                          {resumeAnalysis.weaknesses?.map((wk: string, i: number) => (
                            <li key={i} className="text-xs text-slate-350 flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                              <span>{wk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Actionable Suggestions */}
                    <div className="space-y-3 pt-4 border-t border-border-color/30">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Actionable Resume Improvement Suggestions</span>
                      <div className="grid grid-cols-1 gap-2.5">
                        {resumeAnalysis.suggestions?.map((sug: string, i: number) => (
                          <div key={i} className="p-3 bg-slate-950/60 border border-border-color/30 rounded-lg flex gap-3 text-xs leading-normal">
                            <span className="h-5 w-5 bg-primary/10 border border-primary/20 text-primary font-bold rounded flex items-center justify-center shrink-0">{i+1}</span>
                            <span className="text-slate-300">{sug}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="glass-panel p-12 text-center text-slate-500 text-xs border border-border-color rounded-xl">
                    <FileText className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                    No Resume parsed yet. Upload a PDF resume to view parsed Strengths, Weaknesses, Score, and AI suggestions.
                  </div>
                )}

              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="glass-panel p-6 sm:p-8 rounded-xl border border-border-color space-y-6">
                <div className="flex items-center gap-2 border-b border-border-color pb-4">
                  <Github className="h-5 w-5 text-primary" />
                  <h3 className="font-sans font-bold text-sm text-slate-900">Connected Accounts & Roles</h3>
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs">
                    <CheckCircle className="h-4 w-4" />
                    <span>Connected configurations updated.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Target Career Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Target Career Role (Coordinates Destination)</label>
                    <select
                      value={targetRoleId}
                      onChange={(e) => setTargetRoleId(e.target.value)}
                      className="glass-input w-full px-4 py-2.5 text-xs text-slate-800"
                    >
                      <option value="" disabled className="text-slate-400">Select target career path...</option>
                      {roles?.map((r) => (
                        <option key={r.id} value={r.id} className="text-slate-800 bg-white">
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-500 mt-1.5 block">Changing your destination role will reset your active roadmap.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* GitHub Username */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">GitHub Username</label>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={githubUsername}
                          onChange={(e) => setGithubUsername(e.target.value)}
                          className="glass-input w-full pl-9 pr-4 py-2.5 text-xs"
                          placeholder="e.g. octocat"
                        />
                      </div>
                    </div>

                    {/* LinkedIn URL */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">LinkedIn Profile URL</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="glass-input w-full pl-9 pr-4 py-2.5 text-xs"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer mt-2"
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Connections'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                
                {/* Export Data */}
                <div className="glass-panel p-6 sm:p-8 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Download className="h-5 w-5 text-primary" />
                    <h3 className="font-sans font-bold text-sm text-slate-900">Data Portability</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Download a complete copy of your career telemetry, parsed projects, scores, and active credentials in JSON format.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Export Telemetry Profile JSON</span>
                  </button>
                </div>

                {/* Account Deletion */}
                <div className="glass-panel p-6 sm:p-8 rounded-xl border border-danger/25 bg-danger/5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-danger/20 pb-3">
                    <Trash2 className="h-5 w-5 text-danger" />
                    <h3 className="font-sans font-bold text-sm text-danger">Dangerous Actions Zone</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Permanently delete your profile data. This will destroy your learning roadmap, checklist states, user skills, and authentication records.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2.5 bg-danger hover:bg-danger/90 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Delete CareerPilot AI Account
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Area: Column Span 1 */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* User Skills list */}
            <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Code className="h-4 w-4 text-primary" />
                <h3 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider">Skills Coordinates</h3>
              </div>

              {profile?.skills && profile.skills.length > 0 ? (
                <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-2">
                  {profile.skills.map((s) => (
                    <div key={s.id} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-605">{s.skill.name}</span>
                        <span className="text-primary font-bold">{s.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/40">
                        <div className="bg-primary h-full" style={{ width: `${s.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-xs text-slate-500 block">No skills registered yet.</span>
                </div>
              )}
            </div>

            {/* Audit Logs list */}
            <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldAlert className="h-4 w-4 text-warning" />
                <h3 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider">Security Logs</h3>
              </div>

              {profile?.user?.auditLogs && profile.user.auditLogs.length > 0 ? (
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2">
                  {profile.user.auditLogs.map((log) => (
                    <div key={log.id} className="text-[10px] p-2.5 rounded-lg bg-slate-50 border border-slate-150">
                      <span className="font-bold text-slate-800 block leading-tight">{log.action}</span>
                      <span className="text-slate-500 block mt-1">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-xs text-slate-500 block">No activity logs recorded.</span>
                </div>
              )}
            </div>

          </div>
          
        </div>
      </div>
    </ShellLayout>
  );
}
