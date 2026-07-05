import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Sparkles, Award, BookOpen, AlertCircle, RefreshCw, Cpu, CheckCircle } from 'lucide-react';

interface Application {
  id: number;
  companyName: string;
  role: string;
  jobDescription?: string;
}

interface AiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application | null;
}

export const AiPanel: React.FC<AiPanelProps> = ({ isOpen, onClose, application }) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'prep' | 'match'>('skills');
  
  // Data States
  const [skills, setSkills] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [matchData, setMatchData] = useState<{ score: number; gaps: string[] } | null>(null);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && application) {
      // Reset states
      setSkills([]);
      setQuestions([]);
      setMatchData(null);
      setError(null);
      // Load current tab data
      loadTabData(activeTab);
    }
  }, [isOpen, application, activeTab]);

  const loadTabData = async (tab: 'skills' | 'prep' | 'match') => {
    if (!application) return;
    
    // Check if job description is present
    if (!application.jobDescription || application.jobDescription.trim().length === 0) {
      setError('Please add a Job Description to this application first to unlock AI insights.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (tab === 'skills') {
        const res = await api.get(`/applications/${application.id}/ai/skills`);
        setSkills(res.data);
      } else if (tab === 'prep') {
        const res = await api.get(`/applications/${application.id}/ai/prep`);
        setQuestions(res.data);
      } else if (tab === 'match') {
        const res = await api.get(`/applications/${application.id}/ai/match`);
        setMatchData(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch AI insights. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !application) return null;

  const hasJobDesc = application.jobDescription && application.jobDescription.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-sky-400" />
              <div>
                <h3 className="text-lg font-bold text-white">{application.companyName}</h3>
                <p className="text-xs text-slate-400">{application.role}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab Bar */}
          <div className="border-b border-slate-850 flex text-sm text-slate-400">
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex-1 py-3 text-center border-b-2 font-medium transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'skills' ? 'border-sky-500 text-white bg-slate-800/20' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>Skills</span>
            </button>
            <button
              onClick={() => setActiveTab('prep')}
              className={`flex-1 py-3 text-center border-b-2 font-medium transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'prep' ? 'border-sky-500 text-white bg-slate-800/20' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Interview</span>
            </button>
            <button
              onClick={() => setActiveTab('match')}
              className={`flex-1 py-3 text-center border-b-2 font-medium transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'match' ? 'border-sky-500 text-white bg-slate-800/20' : 'border-transparent hover:text-slate-200'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Resume Match</span>
            </button>
          </div>

          {/* Drawer Body content */}
          <div className="flex-1 overflow-y-auto p-6 relative">
            {!hasJobDesc ? (
              <div className="text-center py-12 flex flex-col items-center justify-center space-y-4">
                <AlertCircle className="h-12 w-12 text-amber-500/80" />
                <h4 className="text-white font-semibold">Missing Job Description</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Please click "Edit" on the application card and paste the job details. The AI needs the description text to perform skill extractions, questions, and resume matching.
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-xs text-center space-y-3">
                <p>{error}</p>
                <button
                  onClick={() => loadTabData(activeTab)}
                  className="mx-auto flex items-center space-x-1.5 py-1 px-3 bg-red-900/40 hover:bg-red-900/60 transition rounded-lg text-[11px] font-semibold border border-red-800"
                >
                  <RefreshCw className="h-3 w-3 animate-spin-hover" />
                  <span>Retry Connection</span>
                </button>
              </div>
            ) : loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70 z-10 space-y-3">
                <svg className="animate-spin h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs text-slate-400">Gemini AI is parsing details...</span>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                
                {/* 1. SKILLS EXTRACTOR TAB VIEW */}
                {activeTab === 'skills' && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-350 mb-3 uppercase tracking-wider text-[11px]">Required Keywords & Skills</h4>
                    {skills.length === 0 ? (
                      <p className="text-xs text-slate-500">No skills extracted yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-slate-950 border border-slate-800 text-sky-400 font-medium px-3 py-1.5 rounded-lg shadow-sm hover:border-sky-500/20 transition duration-150"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. INTERVIEW PREP QUESTIONS TAB VIEW */}
                {activeTab === 'prep' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-350 mb-1 uppercase tracking-wider text-[11px]">Practice Questions</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4">Practice answering these tailored technical & behavioral questions generated directly from requirements.</p>
                    {questions.length === 0 ? (
                      <p className="text-xs text-slate-500">No questions generated.</p>
                    ) : (
                      <ol className="space-y-3.5 list-none">
                        {questions.map((q, idx) => (
                          <li key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl relative flex items-start space-x-3 hover:border-slate-800 transition">
                            <span className="flex-shrink-0 flex items-center justify-center bg-slate-900 border border-slate-800 text-sky-400 font-bold text-xs h-6 w-6 rounded-lg">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-300 leading-relaxed font-medium pt-0.5">{q}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}

                {/* 3. RESUME MATCH TAB VIEW */}
                {activeTab === 'match' && matchData && (
                  <div className="space-y-6">
                    {/* Circle Score Indicator */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-850 rounded-2xl">
                      <div className="relative flex items-center justify-center h-28 w-28 mb-3">
                        {/* Circular track */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="56" cy="56" r="48" strokeWidth="6" stroke="#1e293b" fill="transparent" />
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            strokeWidth="6"
                            stroke={matchData.score >= 75 ? "#10b981" : matchData.score >= 50 ? "#f59e0b" : "#ef4444"}
                            strokeDasharray={2 * Math.PI * 48}
                            strokeDashoffset={2 * Math.PI * 48 * (1 - matchData.score / 100)}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                        </svg>
                        <span className="absolute text-2xl font-black text-white">{matchData.score}%</span>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resume Compatibility</span>
                    </div>

                    {/* Missing Details / Gaps */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-350 mb-3 uppercase tracking-wider text-[11px]">Identified Gaps & Missing Keywords</h4>
                      {matchData.gaps.length === 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50 flex items-start space-x-2.5">
                          <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5" />
                          <p className="text-xs text-emerald-300 leading-relaxed">
                            Excellent match! No significant keyword or skill gaps detected between your highlights and the job requirements.
                          </p>
                        </div>
                      ) : (
                        <ul className="space-y-2 list-none">
                          {matchData.gaps.map((gap, idx) => (
                            <li key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-start space-x-2 text-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                              <span className="text-slate-300">{gap}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
