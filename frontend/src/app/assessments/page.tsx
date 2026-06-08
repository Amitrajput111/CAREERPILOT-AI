'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShellLayout } from '../../components/ShellLayout';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, CheckCircle, Circle, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface Assessment {
  id: string;
  title: string;
  difficulty: string;
  questions: Question[];
  skillId: string;
  skill: { name: string };
}

function AssessmentsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [activeQuiz, setActiveQuiz] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [grading, setGrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Fetch Profile details
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

  // Fetch available Assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery<Assessment[]>({
    queryKey: ['assessments'],
    queryFn: async () => {
      const res = await axios.get('/api/careers/roles', {
        headers: getAuthHeaders(),
      });
      const roles = res.data;
      const currentRole = roles.find((r: any) => r.id === profile?.targetRoleId);

      const list: Assessment[] = [];
      if (currentRole) {
        for (const s of currentRole.skills) {
          if (s.skill.assessments && s.skill.assessments.length > 0) {
            s.skill.assessments.forEach((ass: any) => {
              list.push({
                ...ass,
                skill: { name: s.skill.name }
              });
            });
          }
        }
      }
      return list;
    },
    enabled: !!user && !!profile?.targetRoleId,
  });

  const handleStartQuiz = async (quizId: string) => {
    setErrorMsg(null);
    setQuizScore(null);
    setAnswers({});
    try {
      const res = await axios.get(`/api/careers/assessments/${quizId}`, {
        headers: getAuthHeaders(),
      });
      setActiveQuiz(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-launch assessment if ?start= parameter is found in URL
  const startParam = searchParams ? searchParams.get('start') : null;
  useEffect(() => {
    if (startParam && assessments && assessments.length > 0 && !activeQuiz) {
      const exists = assessments.some(a => a.id === startParam);
      if (exists) {
        handleStartQuiz(startParam);
      }
    }
  }, [startParam, assessments, activeQuiz]);

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;

    const answersArray = Object.keys(answers).map(qId => ({
      questionId: qId,
      selectedOption: answers[qId]
    }));

    if (answersArray.length < activeQuiz.questions.length) {
      setErrorMsg('Please answer all questions before submitting.');
      return;
    }

    setGrading(true);
    setErrorMsg(null);

    try {
      const res = await axios.post(
        `/api/careers/assessments/${activeQuiz.id}/submit`,
        { answers: answersArray },
        { headers: getAuthHeaders() }
      );
      setQuizScore(res.data.score);
      setGrading(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (err) {
      console.error(err);
      setGrading(false);
      setActiveQuiz(null);
    }
  };

  if (profileLoading || assessmentsLoading) {
    return (
      <div className="flex-grow flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-sans text-3xl font-bold text-slate-900 tracking-tight">
          Skill Assessments
        </h1>
        <p className="text-slate-500 text-sm mt-1.5">
          Prove your skill capabilities with quick 5-question baseline validation quizzes.
        </p>
      </div>

      {/* Empty state - No target role selected */}
      {!profile?.targetRoleId ? (
        <div className="glass-panel p-16 max-w-xl mx-auto text-center space-y-6">
          <Award className="h-14 w-14 text-slate-400 mx-auto animate-pulse" />
          <div className="space-y-2">
            <h2 className="font-sans text-xl font-bold text-slate-900">No Target Role Defined</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
              Choose a target career path in the Career Center to unlock recommended skill assessments.
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
      ) : activeQuiz ? (
        /* Quiz Execution Panel */
        <div className="glass-panel p-8 rounded-2xl space-y-8">
          {quizScore === null ? (
            <>
              <div className="border-b border-slate-100 pb-5 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] bg-indigo-50 text-primary font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {(activeQuiz.skill?.name) || 'Skill'} Verification
                  </span>
                  <h2 className="font-sans text-xl font-bold text-slate-900 mt-2">{activeQuiz.title}</h2>
                </div>
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    router.push('/assessments');
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-8">
                {activeQuiz.questions?.map((q, qIdx) => (
                  <div key={q.id} className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {qIdx + 1}. {q.text}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options?.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`p-3.5 text-xs text-left rounded-xl border transition-all cursor-pointer ${
                            answers[q.id] === opt
                              ? 'bg-primary/10 border-primary text-slate-900 font-bold'
                              : 'bg-slate-50/50 border-slate-200/60 text-slate-650 hover:bg-slate-55 hover:border-slate-350'
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
                onClick={handleSubmitQuiz}
                disabled={grading}
                className="w-full h-[48px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex justify-center items-center gap-2 transition-all duration-200 cursor-pointer shadow-sm shadow-primary/10 disabled:opacity-50"
              >
                {grading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Answers & Grade'}
              </button>
            </>
          ) : (
            /* Quiz Score Graded state */
            <div className="text-center py-8 space-y-6">
              <CheckCircle className="h-12 w-12 text-emerald-550 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="font-sans text-xl font-bold text-slate-900">Assessment Complete</h3>
                <p className="text-xs text-slate-500">
                  Graded Score: <span className="text-emerald-600 font-bold text-lg">{quizScore}%</span>
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleStartQuiz(activeQuiz.id)}
                  className="px-5 h-[48px] bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded-xl flex items-center gap-2 text-xs font-semibold cursor-pointer transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4 text-slate-500" />
                  Retake Quiz
                </button>
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    router.push('/assessments');
                  }}
                  className="px-5 h-[48px] bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer transition-all duration-200 shadow-sm shadow-primary/10"
                >
                  Back to Assessments
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Available Assessments list */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {assessments && assessments.length > 0 ? (
            assessments.map((ass) => {
              // Check if user has taken it before
              const pastQuiz = profile?.userAssessments?.find(
                (ua: any) => ua.assessmentId === ass.id
              );
              return (
                <div key={ass.id} className="glass-panel p-6 flex flex-col justify-between min-h-[180px] hover:shadow-md transition-all duration-250">
                  <div>
                    <span className="text-[10px] bg-indigo-50 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {ass.skill?.name || 'Skill Quiz'}
                    </span>
                    <h3 className="font-sans text-base font-bold text-slate-900 mt-3.5 leading-snug">
                      {ass.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">Difficulty: {ass.difficulty}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-3">
                    {pastQuiz ? (
                      <div className="text-xs">
                        <span className="text-slate-450 block font-medium">Best Score:</span>
                        <span className="text-emerald-600 font-bold block text-sm">{pastQuiz.score}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-455 font-medium">Not attempted</span>
                    )}

                    <button
                      onClick={() => handleStartQuiz(ass.id)}
                      className="px-4 h-[36px] bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 shadow-sm shadow-primary/5"
                    >
                      {pastQuiz ? 'Retake Quiz' : 'Start Assessment'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-16 glass-panel">
              <Award className="h-12 w-12 text-slate-405 mx-auto mb-3 animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">No assessments pre-seeded for this target role.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex justify-center items-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    }>
      <ShellLayout>
        <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-8">
          <AssessmentsContent />
        </div>
      </ShellLayout>
    </Suspense>
  );
}
