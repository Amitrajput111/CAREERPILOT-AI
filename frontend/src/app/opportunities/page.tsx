'use client';

import React from 'react';
import { ShellLayout } from '../../components/ShellLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { Briefcase, MapPin, ExternalLink, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { SkeletonCard } from '../../components/ui/SkeletonCard';

// Curated opportunities seeded statically (real opportunities engine comes in later phase)
const CURATED_OPPORTUNITIES = [
  {
    id: '1',
    title: 'Software Engineer Intern',
    company: 'Google',
    type: 'Internship',
    location: 'Bangalore, India',
    remote: true,
    url: 'https://careers.google.com',
    matchReasons: ['Backend skills', 'DSA preparation', 'Strong CS fundamentals'],
    requiredSkills: ['Python', 'Data Structures', 'Algorithms'],
    deadline: '2026-12-01',
    salary: '₹80,000/month',
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Razorpay',
    type: 'Full-time',
    location: 'Bangalore, India',
    remote: true,
    url: 'https://razorpay.com/jobs',
    matchReasons: ['React experience', 'Frontend skills', 'JavaScript proficiency'],
    requiredSkills: ['React', 'TypeScript', 'CSS'],
    deadline: '2026-11-30',
    salary: '₹12-18 LPA',
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'Zepto',
    type: 'Full-time',
    location: 'Mumbai, India',
    remote: false,
    url: 'https://zepto.com/careers',
    matchReasons: ['MERN stack', 'Full-stack experience', 'Node.js skills'],
    requiredSkills: ['MongoDB', 'Express', 'React', 'Node.js'],
    deadline: '2026-12-15',
    salary: '₹15-25 LPA',
  },
  {
    id: '4',
    title: 'Backend Engineer',
    company: 'Swiggy',
    type: 'Full-time',
    location: 'Bangalore, India',
    remote: true,
    url: 'https://bytes.swiggy.com/careers',
    matchReasons: ['Backend development', 'REST APIs', 'Database skills'],
    requiredSkills: ['Node.js', 'PostgreSQL', 'Redis', 'System Design'],
    deadline: '2026-11-25',
    salary: '₹18-30 LPA',
  },
  {
    id: '5',
    title: 'Open Source Contributor',
    company: 'Next.js / Vercel',
    type: 'Open Source',
    location: 'Remote',
    remote: true,
    url: 'https://github.com/vercel/next.js',
    matchReasons: ['Portfolio building', 'Real-world experience', 'Community recognition'],
    requiredSkills: ['TypeScript', 'React', 'Node.js'],
    deadline: 'Ongoing',
    salary: 'Volunteer',
  },
  {
    id: '6',
    title: 'GSSoC Participant',
    company: 'GirlScript Summer of Code',
    type: 'Program',
    location: 'Remote',
    remote: true,
    url: 'https://gssoc.girlscript.tech',
    matchReasons: ['Open source contribution', 'Portfolio projects', 'Beginner-friendly'],
    requiredSkills: ['Any programming language', 'Git', 'GitHub'],
    deadline: '2027-03-01',
    salary: 'Certificate + Points',
  },
];

export default function OpportunitiesPage() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/api/profile')).data,
    enabled: !!user,
  });

  const targetRole = profile?.targetRole?.name || 'your target role';

  return (
    <ShellLayout>
      <div className="max-w-5xl mx-auto px-5 py-6 space-y-6">
        <PageHeader
          title="Opportunities"
          subtitle={`Relevant jobs, internships, and programs matched to ${targetRole}`}
        />

        {/* AI Match Banner */}
        <div className="glass-panel p-4 flex items-start gap-3 border-l-4 border-primary">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-800">Personalized Recommendations</p>
            <p className="text-xs text-slate-500 mt-0.5">
              These opportunities are curated based on your target role <strong>{targetRole}</strong>.
              Complete more of your roadmap to unlock better matches and higher readiness scores before applying.
            </p>
          </div>
        </div>

        {/* Opportunities Grid */}
        <div className="space-y-4">
          {CURATED_OPPORTUNITIES.map((opp) => (
            <div key={opp.id} className="glass-panel p-5 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="text-sm font-bold text-slate-900">{opp.title}</h3>
                    <Badge variant={opp.type === 'Internship' ? 'info' : opp.type === 'Open Source' ? 'success' : opp.type === 'Program' ? 'warning' : 'default'}>
                      {opp.type}
                    </Badge>
                    {opp.remote && <Badge variant="success">Remote</Badge>}
                  </div>
                  <p className="text-sm font-semibold text-primary mb-1">{opp.company}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{opp.location}</span>
                    <span className="font-semibold text-slate-700">{opp.salary}</span>
                    <span>Deadline: {opp.deadline}</span>
                  </div>

                  {/* Why matched */}
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Why You Match</p>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.matchReasons.map(r => (
                        <span key={r} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          <Star className="h-2.5 w-2.5" />{r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Skills Required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.requiredSkills.map(s => (
                        <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <a
                  href={opp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors"
                >
                  Apply
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 py-4">
          More personalized opportunities unlock as you build your profile and improve your career readiness.
        </p>
      </div>
    </ShellLayout>
  );
}
