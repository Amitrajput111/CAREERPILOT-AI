'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import axios from 'axios';
import { Upload, FileText, CheckCircle, Brain, ChevronRight, Loader2, AlertCircle, ArrowRight, BookOpen, Circle } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Assessment {
  id: string;
  title: string;
  difficulty: string;
  skillName: string;
  questions: Question[];
}

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Onboarding Stepper states
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Resume Upload states
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quiz states
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [grading, setGrading] = useState(false);

  // Loading steps
  const [genStepIndex, setGenStepIndex] = useState(0);
  const generationMilestones = [
    'Parsing resume text layout...',
    'Correlating experience vectors with Career Knowledge Graph...',
    'Analyzing skill gaps...',
    'Integrating assessment performance data...',
    'Synthesizing dynamic 30-90-180 day phases...',
    'Compiling day-by-day task schedules...',
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Token Injector Helper
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
  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile', {
        headers: getAuthHeaders(),
      });
      setProfile(res.data);
      if (!res.data.targetRoleId) {
        router.push('/career-center');
      }
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Load Quiz Assessment based on target role
  const loadQuiz = async () => {
    if (!profile?.targetRole) return;
    try {
      const rolesRes = await axios.get('/api/careers/roles', {
        headers: getAuthHeaders(),
      });
      const roles = rolesRes.data;
      const currentRole = roles.find((r: any) => r.id === profile.targetRoleId);
      
      let foundAssessmentId = '';
      if (currentRole) {
        for (const s of currentRole.skills) {
          if (s.skill.assessments && s.skill.assessments.length > 0) {
            foundAssessmentId = s.skill.assessments[0].id;
            break;
          }
        }
      }

      if (!foundAssessmentId) {
        for (const r of roles) {
          for (const s of r.skills) {
            if (s.skill.assessments && s.skill.assessments.length > 0) {
              foundAssessmentId = s.skill.assessments[0].id;
              break;
            }
          }
          if (foundAssessmentId) break;
        }
      }

      if (foundAssessmentId) {
        const quizRes = await axios.get(`/api/careers/assessments/${foundAssessmentId}`, {
          headers: getAuthHeaders(),
        });
        setAssessment(quizRes.data);
      }
    } catch (err) {
      console.error('Failed to load assessment:', err);
    }
  };

  useEffect(() => {
    if (step === 2 && profile) {
      loadQuiz();
    }
  }, [step, profile]);

  // Stepper milestones interval loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 3) {
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
  }, [step]);

  // Handle file drop / select
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

  const handleUploadResume = async () => {
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
        setStep(2);
      }, 1200);
    } catch (err: any) {
      setUploadStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to upload and parse resume.');
    }
  };

  // Submit Quiz
  const handleQuizSubmit = async () => {
    if (!assessment) {
      setStep(3);
      return;
    }

    const answersArray = Object.keys(quizAnswers).map(qId => ({
      questionId: qId,
      selectedOption: quizAnswers[qId]
    }));

    if (answersArray.length < assessment.questions.length) {
      setErrorMsg('Please answer all questions before submitting.');
      return;
    }

    setGrading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post(
        `/api/careers/assessments/${assessment.id}/submit`,
        { answers: answersArray },
        { headers: getAuthHeaders() }
      );
      setQuizScore(res.data.score);
      setGrading(false);
    } catch (err) {
      console.error(err);
      setGrading(false);
      setStep(3);
    }
  };

  const handleGenerateRoadmap = async () => {
    setStep(3);
    try {
      await axios.post('/api/roadmaps/generate', {}, {
        headers: getAuthHeaders()
      });
      setTimeout(() => {
        router.push('/dashboard');
      }, 3500);
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
      router.push('/dashboard');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        {/* Stepper HUD */}
        <div className="flex justify-between items-center mb-12 max-w-md mx-auto w-full">
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
              step >= 1 ? 'bg-primary text-white shadow-sm shadow-primary/10' : 'bg-slate-200 text-slate-500'
            }`}>
              1
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 mt-2 tracking-wider">Resume</span>
          </div>
          <div className={`h-[2px] flex-1 mx-4 transition-all duration-200 ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
              step >= 2 ? 'bg-primary text-white shadow-sm shadow-primary/10' : 'bg-slate-200 text-slate-500'
            }`}>
              2
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 mt-2 tracking-wider">Assessment</span>
          </div>
          <div className={`h-[2px] flex-1 mx-4 transition-all duration-200 ${step >= 3 ? 'bg-primary' : 'bg-slate-200'}`} />
          <div className="flex flex-col items-center">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
              step >= 3 ? 'bg-primary text-white shadow-sm shadow-primary/10' : 'bg-slate-200 text-slate-500'
            }`}>
              3
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-500 mt-2 tracking-wider">Navigation</span>
          </div>
        </div>

        {/* STEP 1: Upload Resume */}
        {step === 1 && (
          <div className="glass-panel p-8 sm:p-10 max-w-xl mx-auto w-full text-center space-y-6">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl w-fit mx-auto shadow-sm">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-sans text-xl font-bold text-slate-900">Upload Your Resume</h2>
              <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                Drag and drop your PDF resume. Our AI extracts your existing skills, portfolio projects, and work history.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs text-left">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {uploadStatus === 'idle' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-slate-250 hover:border-primary p-8 rounded-xl cursor-pointer hover:bg-slate-50 transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <FileText className="h-8 w-8 text-slate-400 group-hover:text-primary mx-auto mb-3 transition-colors" />
                <span className="text-sm font-semibold text-slate-700 block">
                  {file ? file.name : 'Select PDF Resume'}
                </span>
                <span className="text-xs text-slate-450 block mt-1">Maximum file size 5MB</span>
              </div>
            )}

            {uploadStatus === 'uploading' && (
              <div className="p-8 border border-slate-200 rounded-xl space-y-4 bg-white">
                <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs text-slate-500 block font-medium">Analyzing document layout...</span>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="p-8 border border-emerald-100 bg-emerald-50/20 rounded-xl space-y-3">
                <CheckCircle className="h-8 w-8 text-emerald-550 mx-auto animate-bounce" />
                <span className="text-sm font-bold text-slate-900 block">Resume Parsed Successfully</span>
                <span className="text-xs text-slate-500 block">Moving to assessment quiz...</span>
              </div>
            )}

            {file && uploadStatus === 'idle' && (
              <button
                onClick={handleUploadResume}
                className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm shadow-primary/10"
              >
                Upload & Process Resume
              </button>
            )}
          </div>
        )}

        {/* STEP 2: Assessment Quiz */}
        {step === 2 && (
          <div className="glass-panel p-6 sm:p-10 max-w-2xl mx-auto w-full space-y-6">
            {!assessment ? (
              <div className="py-12 text-center space-y-4">
                <BookOpen className="h-8 w-8 text-slate-400 mx-auto animate-pulse" />
                <div>
                  <h3 className="font-sans text-base font-bold text-slate-900">Preparing Quick Assessment...</h3>
                  <p className="text-slate-500 text-xs mt-1">Loading quiz questions tailored to target skills.</p>
                </div>
              </div>
            ) : quizScore === null ? (
              <>
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-[9px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded uppercase">
                    Required Assessment
                  </span>
                  <h2 className="font-sans text-lg font-bold text-slate-900 mt-2">{assessment.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    5 questions • Tests fundamental concept baseline for {assessment.skillName}.
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2">
                  {assessment.questions.map((q, qIdx) => (
                    <div key={q.id} className="space-y-3">
                      <h4 className="text-xs font-semibold text-slate-800">
                        {qIdx + 1}. {q.text}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`p-3.5 text-xs text-left rounded-xl border transition-all cursor-pointer ${
                              quizAnswers[q.id] === opt
                                ? 'bg-primary/10 border-primary text-slate-900 font-bold'
                                : 'bg-slate-50/50 border-slate-200/60 text-slate-650 hover:bg-slate-50 hover:border-slate-350'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleQuizSubmit}
                  disabled={grading}
                  className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex justify-center items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm shadow-primary/10 disabled:opacity-50"
                >
                  {grading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Quiz & Grade Answers'}
                </button>
              </>
            ) : (
              // Quiz Completed state
              <div className="text-center space-y-6 py-6">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-sans text-xl font-bold text-slate-900">Assessment Graded</h3>
                  <p className="text-xs text-slate-500">
                    You scored <span className="text-primary font-bold text-sm">{quizScore}%</span> on this topic.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-left text-xs max-w-sm mx-auto leading-relaxed">
                  <span className="text-slate-700 font-bold block mb-1">Impact on Roadmap:</span>
                  <p className="text-slate-500">
                    Quiz scores are factored directly into your defensive **Readiness Score** index (weighted at 10%). Steps will adjust based on correct/incorrect answers.
                  </p>
                </div>

                <button
                  onClick={handleGenerateRoadmap}
                  className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-sm shadow-primary/10"
                >
                  Generate My Career GPS Route
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Loading animation */}
        {step === 3 && (
          <div className="glass-panel p-8 sm:p-12 max-w-md mx-auto w-full text-center space-y-8">
            <Brain className="h-10 w-10 text-primary animate-pulse mx-auto" />
            
            <div className="space-y-1">
              <h3 className="font-sans text-lg font-bold text-slate-900">Synthesizing Career GPS Route</h3>
              <p className="text-xs text-slate-500">Please wait while the AI compiles your coordinates.</p>
            </div>

            <div className="space-y-3 text-left">
              {generationMilestones.map((m, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                    idx < genStepIndex
                      ? 'bg-emerald-500'
                      : idx === genStepIndex
                      ? 'bg-primary animate-ping'
                      : 'bg-slate-200'
                  }`} />
                  <span className={`text-xs ${
                    idx <= genStepIndex ? 'text-slate-800 font-medium' : 'text-slate-400'
                  }`}>
                    {m}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
