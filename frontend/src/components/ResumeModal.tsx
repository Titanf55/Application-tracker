import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchResume();
    }
  }, [isOpen]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const response = await api.get('/user/resume');
      setResumeText(response.data.resumeText || '');
    } catch (err: any) {
      setError('Failed to fetch resume highlights. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await api.put('/user/resume', { resumeText });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError('Failed to save resume highlights.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative z-10">
        <h2 className="text-xl font-bold text-white mb-2">My Resume Highlights</h2>
        <p className="text-xs text-slate-400 mb-6">
          Paste your key skills, experience details, and achievements here. The AI will compare these highlights against each job description to calculate your Match Score!
        </p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded bg-emerald-950/50 border border-emerald-900/50 text-emerald-200 text-sm">
            Resume highlights updated successfully!
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 space-y-2">
            <svg className="animate-spin h-6 w-6 text-sky-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-xs">Loading resume highlights...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="resumeText">
                Resume Summary & Keywords
              </label>
              <textarea
                id="resumeText"
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm resize-none"
                placeholder="e.g.&#10;Skills: Java, React, Python, PostgreSQL, Docker, Git&#10;Experience: Frontend intern building dashboards at XYZ. Built REST APIs and full-stack applications."
              />
            </div>

            <div className="flex space-x-3 mt-6 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800/50 transition text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium transition text-sm flex items-center justify-center cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
