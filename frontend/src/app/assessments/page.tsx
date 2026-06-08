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
        <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">
          Skill <span className="gradient-text">Assessments</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Prove your skill capabilities with quick 5-question baseline validation quizzes.
        </p>
      </div>

      {/* Empty state - No target role selected */}
      {!profile?.targetRoleId ? (
        <div className="glass-panel p-12 rounded-2xl max-w-xl mx-auto text-center space-y-6">
          <Award className="h-12 w-12 text-slate-500 mx-auto animate-pulse" />
          <div>
            <h2 className="font-outfit text-xl font-bold text-white">No Target Role Defined</h2>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Choose a target career path in the Career Center to unlock recommended skill assessments.
            </p>
          </div>
          <button
            onClick={() => router.push('/career-center')}
            className="glow-btn px-6 py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            Configure Target Career
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : activeQuiz ? (
        /* Quiz Execution Panel */
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          {quizScore === null ? (
            <>
              <div className="border-b border-border-color pb-4 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[9px] bg-slate-850 text-slate-300 border border-border-color font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {(activeQuiz.skill?.name) || 'Skill'} Verification
                  </span>
                  <h2 className="font-outfit text-lg font-bold text-white mt-2">{activeQuiz.title}</h2>
                </div>
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    router.push('/assessments');
                  }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-6">
                {activeQuiz.questions?.map((q, qIdx) => (
                  <div key={q.id} className="space-y-3">
                    <h4 className="text-xs font-semibold text-white">
                      {qIdx + 1}. {q.text}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options?.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                          className={`p-3 text-xs text-left rounded-lg border transition-all cursor-pointer ${
                            answers[q.id] === opt
                              ? 'bg-primary/10 border-primary text-white font-bold'
                              : 'bg-slate-900/40 border-border-color text-slate-300 hover:border-white/10'
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
                className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg flex justify-center items-center gap-2 transition-colors cursor-pointer"
              >
                {grading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Answers & Grade'}
              </button>
            </>
          ) : (
            /* Quiz Score Graded state */
            <div className="text-center py-8 space-y-6">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
              <div>
                <h3 className="font-outfit text-xl font-bold text-white">Assessment Complete</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Graded Score: <span className="text-emerald-400 font-bold text-base">{quizScore}%</span>
                </p>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleStartQuiz(activeQuiz.id)}
                  className="px-5 py-2.5 bg-slate-900/40 border border-border-color hover:border-white/10 text-slate-350 hover:text-white rounded-lg flex items-center gap-2 text-xs font-semibold cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retake Quiz
                </button>
                <button
                  onClick={() => {
                    setActiveQuiz(null);
                    router.push('/assessments');
                  }}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-lg text-xs font-semibold cursor-pointer"
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
                <div key={ass.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4 border border-border-color">
                  <div>
                    <span className="text-[9px] bg-slate-850 text-slate-300 border border-border-color font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {ass.skill?.name || 'Skill Quiz'}
                    </span>
                    <h3 className="font-outfit text-base font-bold text-white mt-2 leading-snug">
                      {ass.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">Difficulty: {ass.difficulty}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-border-color pt-4 mt-2">
                    {pastQuiz ? (
                      <div className="text-xs">
                        <span className="text-slate-400">Best Score:</span>
                        <span className="text-emerald-400 font-bold block">{pastQuiz.score}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Not attempted</span>
                    )}

                    <button
                      onClick={() => handleStartQuiz(ass.id)}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      {pastQuiz ? 'Retake Quiz' : 'Start Assessment'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-12 glass-panel rounded-2xl border border-border-color">
              <Award className="h-10 w-10 text-slate-600 mx-auto mb-2 animate-pulse" />
              <span className="text-xs text-slate-405">No assessments pre-seeded for this target role.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <ShellLayout>
      <div className="max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        <Suspense fallback={
          <div className="flex-grow flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        }>
          <AssessmentsContent />
        </Suspense>
      </div>
    </ShellLayout>
  );
}
