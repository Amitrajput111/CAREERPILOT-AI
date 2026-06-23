'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Compass, ArrowRight, Sparkles, FileText, Upload, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  
  // Widget interactive states
  const [targetRoleId, setTargetRoleId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'parsing' | 'generating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [genStepIndex, setGenStepIndex] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generationMilestones = [
    'Parsing resume text layout...',
    'Analyzing career skill gaps...',
    'Synthesizing dynamic 30-90-180 day roadmap...',
    'Compiling day-by-day learning schedules...',
    'Readying your Career GPS Dashboard...'
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Career Roles once the user session (guest or normal) is active
  useEffect(() => {
    if (user) {
      setRolesLoading(true);
      axios.get('/api/careers/roles')
        .then(res => {
          setRoles(res.data);
          if (res.data.length > 0) {
            setTargetRoleId(res.data[0].id); // Select first by default
          }
          setRolesLoading(false);
        })
        .catch(err => {
          console.error('Failed to load career roles:', err);
          setRolesLoading(false);
        });
    }
  }, [user]);

  // Stepper milestones interval loop while generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (uploadStatus === 'parsing' || uploadStatus === 'generating') {
      interval = setInterval(() => {
        setGenStepIndex((prev) => {
          if (prev < generationMilestones.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [uploadStatus]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setErrorMsg('Only PDF files are supported.');
        return;
      }
      setFile(selectedFile);
      setErrorMsg(null);
    }
  };

  const handleStartProcess = async () => {
    if (!targetRoleId) {
      setErrorMsg('Please select a target career role.');
      return;
    }
    if (!file) {
      setErrorMsg('Please select your PDF resume file.');
      return;
    }

    setUploadStatus('uploading');
    setErrorMsg(null);
    setGenStepIndex(0);

    try {
      // 1. Update Profile Target Role
      await axios.post('/api/profile', { targetRoleId });

      // 2. Upload Resume PDF
      const formData = new FormData();
      formData.append('file', file);
      setUploadStatus('parsing');
      await axios.post('/api/profile/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 3. Generate Roadmap
      setUploadStatus('generating');
      await axios.post('/api/roadmaps/generate');

      setUploadStatus('success');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setUploadStatus('idle');
      setErrorMsg(err.response?.data?.message || 'Failed to process resume. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 text-foreground selection:bg-primary/20 selection:text-slate-900 min-h-screen">
      
      {/* Header navbar */}
      <header className="h-[72px] border-b border-slate-200/60 bg-white/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-outfit text-lg font-bold text-slate-900 tracking-tight">
              Career<span className="text-primary">Pilot</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            {!mounted ? (
              <div className="h-9 w-20 bg-slate-100 animate-pulse rounded-xl" />
            ) : user && !user.isGuest ? (
              <>
                <Link href="/dashboard" className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">
                  Go to Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center justify-center px-4 h-[36px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/dashboard" className="flex items-center justify-center px-5 h-[40px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10">
                Enter Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 py-12 md:py-20 w-full space-y-12">
        <div className="text-center space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 mb-2 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 tracking-wide uppercase">Your Technical Career GPS</span>
          </div>

          <h1 className="font-outfit text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Map Your Path to <br />
            <span className="text-primary">Engineering Success.</span>
          </h1>

          <p className="text-sm text-slate-500 leading-relaxed">
            Upload your resume and choose your target path. CareerPilot AI parses skill gaps, tests knowledge coordinates, and builds a day-by-day learning checklist automatically.
          </p>
        </div>

        {/* Interactive Widget Card */}
        <div className="w-full max-w-xl bg-white border border-slate-200/80 shadow-md rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          {uploadStatus === 'idle' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">1. Choose Target Role</h3>
                {rolesLoading ? (
                  <div className="h-[48px] bg-slate-100 animate-pulse rounded-xl" />
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setTargetRoleId(r.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          targetRoleId === r.id 
                            ? 'border-primary bg-indigo-50/50 text-primary ring-1 ring-primary/10' 
                            : 'border-slate-200 hover:border-slate-350 text-slate-650'
                        }`}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-2">2. Upload Resume PDF</h3>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    file 
                      ? 'border-emerald-350 bg-emerald-50/30' 
                      : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/30'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf"
                  />
                  {file ? (
                    <>
                      <FileText className="h-8 w-8 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">{file.name}</span>
                      <span className="text-[10px] text-slate-400">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">Drag & drop or click to upload PDF</span>
                      <span className="text-[10px] text-slate-400">PDF resumes only (Max 4MB)</span>
                    </>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                onClick={handleStartProcess}
                disabled={!targetRoleId || !file}
                className="w-full h-[48px] bg-primary hover:bg-primary-hover disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm shadow-primary/10 disabled:shadow-none cursor-pointer"
              >
                <span>Generate Free Roadmap</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Loading / Generating Roadmap State */}
          {(uploadStatus === 'uploading' || uploadStatus === 'parsing' || uploadStatus === 'generating') && (
            <div className="py-12 flex flex-col items-center text-center space-y-6">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Processing Your Profile</h4>
                <p className="text-xs text-slate-500 animate-pulse">{generationMilestones[genStepIndex]}</p>
              </div>
              <div className="w-full max-w-xs bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500 ease-out" 
                  style={{ width: `${(genStepIndex + 1) * 20}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Redirection State */}
          {uploadStatus === 'success' && (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Roadmap Generated successfully!</h4>
                <p className="text-xs text-slate-500">Redirecting to your command center...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white py-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-8">
          <span>© 2026 CareerPilot AI. All rights reserved. Know Your Next Career Move.</span>
        </div>
      </footer>

    </div>
  );
}
