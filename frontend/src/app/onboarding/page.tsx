'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Loader2, Compass, ArrowRight, ArrowLeft, Upload, FileText, CheckCircle2,
  GraduationCap, Target, Brain, Sparkles, AlertCircle
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

interface CareerRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  salaryRange?: string;
  demandScore?: number;
}

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Onboarding Wizard Steps: 1 (Welcome) -> 2 (Status) -> 3 (Goal) -> 4 (Confidence) -> 5 (Resume) -> 6 (GitHub) -> 7 (LinkedIn) -> 8 (Processing) -> 9 (Complete)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [saving, setSaving] = useState(false);

  // Profile data state variables
  const [education, setEducation] = useState('');
  const [targetRoleId, setTargetRoleId] = useState('');
  const [confidence, setConfidence] = useState(''); // Beginner, Intermediate, Advanced
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Resume file state
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI loading milestones step tracker
  const [milestoneIndex, setMilestoneIndex] = useState(0);
  const milestones = [
    'Parsing resume text layout...',
    'Correlating experience vectors with Career Knowledge Graph...',
    'Analyzing skill gaps...',
    'Synthesizing dynamic 30-90-180 day phases...',
    'Compiling day-by-day task schedules...',
    'Initializing telemetry dashboard command center...'
  ];

  // Token injector helper
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

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Initial data loading
  useEffect(() => {
    if (user) {
      // Fetch career roles list
      axios.get('/api/careers/roles', { headers: getAuthHeaders() })
        .then(res => {
          setRoles(res.data);
          // Fetch current profile to pre-fill
          return axios.get('/api/profile', { headers: getAuthHeaders() });
        })
        .then(res => {
          const p = res.data;
          if (p) {
            setEducation(p.education || '');
            setTargetRoleId(p.targetRoleId || '');
            setGithubUsername(p.githubUsername || '');
            setLinkedinUrl(p.linkedinUrl || '');
            // Map experience yrs to confidence
            if (p.experienceYrs >= 5) setConfidence('Advanced');
            else if (p.experienceYrs >= 2) setConfidence('Intermediate');
            else if (p.experienceYrs > 0) setConfidence('Beginner');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load profile details during onboarding:', err);
          setLoading(false);
        });
    }
  }, [user]);

  // Milestone simulation loop during step 8 (AI Generation)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 8) {
      timer = setInterval(() => {
        setMilestoneIndex((prev) => {
          if (prev < milestones.length - 1) return prev + 1;
          return prev;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [step]);

  // Auto-save fields to profile in background on step transition
  const autoSaveFields = async (fieldsToSave: any) => {
    setSaving(true);
    try {
      await axios.post('/api/profile', fieldsToSave, {
        headers: getAuthHeaders()
      });
    } catch (e) {
      console.error('Failed to auto-save progress step:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleNextStep = async () => {
    // Perform background save on transition for required questions
    if (step === 2) {
      await autoSaveFields({ education });
      setStep(3);
    } else if (step === 3) {
      await autoSaveFields({ targetRoleId });
      setStep(4);
    } else if (step === 4) {
      // Map confidence level selection to experience years (Beginner=1, Intermediate=2, Advanced=5)
      const yrs = confidence === 'Advanced' ? 5 : confidence === 'Intermediate' ? 2 : 1;
      await autoSaveFields({ experienceYrs: yrs });
      setStep(5);
    } else if (step === 6) {
      await autoSaveFields({ githubUsername });
      setStep(7);
    } else if (step === 7) {
      await autoSaveFields({ linkedinUrl });
      // Proceed to processing phase
      runAIGenerator();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  // Resume drag and drop handlers
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

  const uploadResume = async () => {
    if (!file) return;
    setUploadStatus('uploading');
    setUploadProgress(30);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(60);
      await axios.post('/api/profile/resume', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
        },
      });
      setUploadProgress(100);
      setUploadStatus('success');
      setTimeout(() => {
        setStep(6);
      }, 1000);
    } catch (err: any) {
      setUploadStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to upload and parse resume format.');
    }
  };

  // Run the AI roadmap compiler trigger
  const runAIGenerator = async () => {
    setStep(8);
    setMilestoneIndex(0);
    try {
      // Trigger backend roadmap generator
      await axios.post('/api/roadmaps/generate', {}, {
        headers: getAuthHeaders()
      });
      // Pause slightly at the final stage to make the UI smooth
      setTimeout(() => {
        setStep(9);
      }, 5000);
    } catch (err) {
      console.error('Failed to generate roadmap in onboarding:', err);
      // Fallback safely to completion screen anyway
      setStep(9);
    }
  };

  // Career card metadata descriptors
  const getRoleCardDetails = (roleName: string) => {
    const name = roleName.toLowerCase();
    if (name.includes('mern')) {
      return {
        prep: '3-5 Months',
        desc: 'Build full stack applications using MongoDB, Express, React, and Node.js.'
      };
    } else if (name.includes('frontend')) {
      return {
        prep: '3-4 Months',
        desc: 'Craft premium interactive user interfaces, pages, routing, and client states.'
      };
    } else if (name.includes('backend')) {
      return {
        prep: '4-6 Months',
        desc: 'Build server structures, secure JWT authentication middleware, databases, and microservices.'
      };
    } else if (name.includes('full stack') || name.includes('fullstack')) {
      return {
        prep: '5-8 Months',
        desc: 'Master both client-facing frontend displays and deep server-side logic database pipelines.'
      };
    } else if (name.includes('ai engineer') || name.includes('artificial')) {
      return {
        prep: '6-9 Months',
        desc: 'Build agentic AI workflows, deploy RAG pipelines, LLM telemetry integrations, and model routing.'
      };
    } else if (name.includes('machine learning') || name.includes('ml')) {
      return {
        prep: '8-12 Months',
        desc: 'Train numerical model datasets, feature regression metrics, tensor nodes, and pipelines.'
      };
    } else if (name.includes('devops')) {
      return {
        prep: '5-7 Months',
        desc: 'Automate build pipelines, CI/CD, Docker configurations, Kubernetes pods, and shell actions.'
      };
    } else if (name.includes('cloud')) {
      return {
        prep: '4-6 Months',
        desc: 'Provision virtual server hardware, security domains, and serverless scripts on AWS/Azure.'
      };
    } else if (name.includes('cyber')) {
      return {
        prep: '6-8 Months',
        desc: 'Perform network vulnerability audits, penetration tests, encryption, and threat models.'
      };
    } else if (name.includes('mobile')) {
      return {
        prep: '3-5 Months',
        desc: 'Deploy native phone apps for iOS and Android environments using React Native or Flutter.'
      };
    } else if (name.includes('game')) {
      return {
        prep: '6-10 Months',
        desc: 'Program physics pipelines, lighting shaders, and assets in Unity, Unreal, or WebGL.'
      };
    } else if (name.includes('analyst')) {
      return {
        prep: '3-5 Months',
        desc: 'Extract database data, formulate spreadsheets, clean records, and design visual BI charts.'
      };
    } else if (name.includes('scientist')) {
      return {
        prep: '6-9 Months',
        desc: 'Conduct statistical analyses, predict patterns, and structure raw business databases.'
      };
    }
    // Default database fallback
    return {
      prep: '4-6 Months',
      desc: 'Verify target competencies and daily progression checklists.'
    };
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-slate-50/40">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Retrieving coordinates...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Percentage calculations for steps
  const progressPercent = Math.min(100, Math.round(((step - 1) / 8) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 selection:bg-primary/20 selection:text-slate-900">
      
      {/* ONBOARDING HEADER */}
      <header className="h-[72px] border-b border-slate-200/50 flex items-center px-8 justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <span className="font-outfit text-sm font-bold text-slate-905">CareerPilot AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Onboarding Wizard</span>
          {step > 1 && step < 8 && (
            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>
      </header>

      {/* STEP CONTAINER */}
      <main className="flex-1 flex flex-col justify-center max-w-[1280px] w-full mx-auto px-6 py-12">
        <div className="max-w-2xl w-full mx-auto">
          
          {/* STEP 1: Welcome Screen */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in text-center">
              <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary mx-auto shadow-sm">
                <Compass className="h-6 w-6" />
              </div>

              <div className="space-y-3">
                <h1 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome to CareerPilot
                </h1>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Let's personalize your Career Operating System. This quick setup takes less than 2 minutes and helps us map your technical skill coordinates.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleNextStep}
                  type="button"
                  className="inline-flex items-center gap-2 px-6 h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10 cursor-pointer"
                >
                  Let's Begin
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Current Education Status */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 02/08</span>
                <h2 className="font-outfit text-2xl font-extrabold text-slate-905">Where are you today?</h2>
                <p className="text-xs text-slate-500">Select your current educational phase or status.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'First Year Student',
                  'Second Year Student',
                  'Third Year Student',
                  'Final Year Student',
                  'Graduate',
                  'Working Professional'
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => setEducation(option)}
                    type="button"
                    className={`p-4 text-xs font-bold text-left rounded-xl border transition-all cursor-pointer ${
                      education === option
                        ? 'bg-indigo-50/50 border-primary text-slate-900 ring-2 ring-primary/10'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50/30'
                    }`}
                  >
                    <GraduationCap className={`h-4.5 w-4.5 mb-2.5 ${education === option ? 'text-primary' : 'text-slate-400'}`} />
                    {option}
                  </button>
                ))}
              </div>

              {/* Stepper Navigation bar */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!education || saving}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-5 h-[42px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? 'Saving...' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Target Career Role */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 03/08</span>
                <h2 className="font-outfit text-2xl font-extrabold text-slate-905">Which career are you aiming for?</h2>
                <p className="text-xs text-slate-500">Choose your target position. We map your roadmap checklist to this destination.</p>
              </div>

              {/* Custom Scrollable Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                {roles.map((role) => {
                  const details = getRoleCardDetails(role.name);
                  const isSelected = targetRoleId === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setTargetRoleId(role.id)}
                      type="button"
                      className={`p-4 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                        isSelected
                          ? 'bg-indigo-50/50 border-primary text-slate-900 ring-2 ring-primary/10'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-350 hover:bg-slate-50/30'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <Target className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                          <span className={`text-[8.5px] font-bold border rounded-full px-2 py-0.5 uppercase tracking-wide shrink-0 ${
                            isSelected 
                              ? 'bg-primary/15 border-primary/20 text-primary' 
                              : 'bg-slate-50 border-slate-200 text-slate-450'
                          }`}>
                            {details.prep}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-850 mt-3">{role.name}</h4>
                        <p className="text-[10.5px] text-slate-450 mt-1 leading-relaxed">{details.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Stepper Navigation bar */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!targetRoleId || saving}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-5 h-[42px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? 'Saving...' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Current Confidence level */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 04/08</span>
                <h2 className="font-outfit text-2xl font-extrabold text-slate-905">How confident are you today?</h2>
                <p className="text-xs text-slate-500">Pick the tier that best matches your programming capabilities.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'Beginner', title: 'Beginner', desc: 'I am just starting to learn programming or core software engineering concepts.' },
                  { key: 'Intermediate', title: 'Intermediate', desc: 'I can build basic projects but struggle with backend scaling, optimization, and system design.' },
                  { key: 'Advanced', title: 'Advanced', desc: 'I write clean code, design microservices, and want to verify my placement readiness.' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setConfidence(item.key)}
                    type="button"
                    className={`p-4 text-left rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      confidence === item.key
                        ? 'bg-indigo-50/50 border-primary text-slate-900 ring-2 ring-primary/10'
                        : 'bg-white border-slate-200 text-slate-650 hover:border-slate-350 hover:bg-slate-50/30'
                    }`}
                  >
                    <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      confidence === item.key ? 'border-primary bg-primary' : 'border-slate-300'
                    }`}>
                      {confidence === item.key && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stepper Navigation bar */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!confidence || saving}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-5 h-[42px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {saving ? 'Saving...' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Resume Upload (Optional) */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="text-left space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 05/08</span>
                <h2 className="font-outfit text-2xl font-extrabold text-slate-905">Upload Resume</h2>
                <p className="text-xs text-slate-500">Optional. Upload your CV to receive targeted skill recommendations.</p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs text-left">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {uploadStatus === 'idle' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-slate-200 hover:border-primary/50 p-10 rounded-2xl cursor-pointer hover:bg-slate-50/50 transition-all group bg-white shadow-xs"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  <FileText className="h-8 w-8 text-slate-400 group-hover:text-primary mx-auto mb-3 transition-colors" />
                  <span className="text-xs font-bold text-slate-800 block">
                    {file ? file.name : 'Drag & drop your PDF resume here, or browse'}
                  </span>
                  <span className="text-[10px] text-slate-405 block mt-1">PDF format only • Maximum 5MB</span>
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div className="p-8 border border-slate-200 rounded-2xl bg-white space-y-4">
                  <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Parsing Document...</span>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="p-8 border border-emerald-100 bg-emerald-50/20 rounded-2xl space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <span className="text-xs font-bold text-slate-905 block uppercase tracking-wider">CV Analyzed Successfully</span>
                  <span className="text-[11px] text-slate-405 block">Connecting social integrations next...</span>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                  {file && uploadStatus === 'idle' ? (
                    <button
                      onClick={uploadResume}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-5 h-[42px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                    >
                      Process Resume
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setStep(6)}
                      type="button"
                      className="inline-flex items-center gap-1.5 px-5 h-[42px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Skip Resume
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: GitHub Connection (Optional) */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 06/08</span>
                <h2 className="font-outfit text-2xl font-extrabold text-slate-905">Connect GitHub</h2>
                <p className="text-xs text-slate-500">Optional. Enter your username to catalog your public repository projects.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <Github className="h-5 w-5 text-slate-700" />
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="github-username"
                    className="bg-transparent border-none text-xs focus:ring-0 outline-none w-full text-slate-800 placeholder-slate-400 font-semibold"
                  />
                </div>
                <p className="text-[10.5px] text-slate-405 leading-relaxed">
                  We only look at your public repositories and contributions. We will never ask for your password or credential tokens.
                </p>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setGithubUsername(''); setStep(7); }}
                    type="button"
                    className="text-xs font-bold text-slate-405 hover:text-slate-700 transition-colors"
                  >
                    Skip Connection
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={saving}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-5 h-[42px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    {saving ? 'Saving...' : 'Continue'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: LinkedIn Connection (Optional) */}
          {step === 7 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step 07/08</span>
                <h2 className="font-outfit text-2xl font-extrabold text-slate-905">Connect LinkedIn</h2>
                <p className="text-xs text-slate-500">Optional. Paste your URL to extract details about your education and experience.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                  <Linkedin className="h-5 w-5 text-indigo-650" />
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="bg-transparent border-none text-xs focus:ring-0 outline-none w-full text-slate-800 placeholder-slate-400 font-semibold"
                  />
                </div>
                <p className="text-[10.5px] text-slate-405 leading-relaxed">
                  We use your public summary and experience highlights. Password authentication tokens are never requested.
                </p>
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                <button
                  onClick={handlePrevStep}
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setLinkedinUrl(''); runAIGenerator(); }}
                    type="button"
                    className="text-xs font-bold text-slate-405 hover:text-slate-700 transition-colors"
                  >
                    Skip Connection
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={saving}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-5 h-[42px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    {saving ? 'Compiling...' : 'Complete Profile'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: AI Analysis / Processing Screen */}
          {step === 8 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center space-y-8 animate-fade-in shadow-xs">
              <Brain className="h-10 w-10 text-primary animate-pulse mx-auto" />
              
              <div className="space-y-1">
                <h3 className="font-outfit text-xl font-extrabold text-slate-900">Synthesizing Career GPS Route</h3>
                <p className="text-xs text-slate-500">Our engine is compiling your telemetry checklist.</p>
              </div>

              {/* Custom Stepper milestone indicator */}
              <div className="space-y-3.5 text-left max-w-sm mx-auto">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-3 transition-all duration-300">
                    <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      idx < milestoneIndex
                        ? 'bg-emerald-500 shadow-sm'
                        : idx === milestoneIndex
                        ? 'bg-primary animate-ping'
                        : 'bg-slate-200'
                    }`} />
                    <span className={`text-xs font-semibold ${
                      idx <= milestoneIndex ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {m}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 9: Completion Screen */}
          {step === 9 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 text-center space-y-8 animate-fade-in shadow-xs">
              <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-555 mx-auto">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] bg-emerald-50 text-emerald-650 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Success
                </span>
                <h2 className="font-outfit text-2xl font-extrabold text-slate-905 tracking-tight">
                  Career Profile Created
                </h2>
                <p className="text-xs text-slate-550 max-w-md mx-auto">
                  Your coordinates are mapped. Your dashboard, skill assessments, and checklist are initialized.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto border-t border-b border-slate-100 py-4 text-left">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wide">Target Role</span>
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {roles.find(r => r.id === targetRoleId)?.name || 'Technical Engineer'}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wide">Readiness Estimate</span>
                  <div className="text-xs font-bold text-primary">
                    {file ? '55% Score' : '40% Score'}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  type="button"
                  className="inline-flex items-center gap-2 px-6 h-[46px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm shadow-primary/10 cursor-pointer"
                >
                  Go To Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
