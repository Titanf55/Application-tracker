import React, { useState, useEffect } from 'react';

interface ApplicationRequest {
  companyName: string;
  role: string;
  applicationDate: string;
  status: string;
  jobDescription?: string;
  oaDateTime?: string;
  interviewDateTime?: string;
  oaReminder?: boolean;
  interviewReminder?: boolean;
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appData: ApplicationRequest) => Promise<void>;
  initialData?: {
    companyName: string;
    role: string;
    applicationDate: string;
    status: string;
    jobDescription?: string;
    oaDateTime?: string;
    interviewDateTime?: string;
    oaReminder?: boolean;
    interviewReminder?: boolean;
  } | null;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [applicationDate, setApplicationDate] = useState('');
  const [status, setStatus] = useState('Applied');
  const [jobDescription, setJobDescription] = useState('');
  
  // Reminder States
  const [oaDateTime, setOaDateTime] = useState('');
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [oaReminder, setOaReminder] = useState(false);
  const [interviewReminder, setInterviewReminder] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.companyName);
      setRole(initialData.role);
      setApplicationDate(initialData.applicationDate);
      setStatus(initialData.status);
      setJobDescription(initialData.jobDescription || '');
      setOaDateTime(initialData.oaDateTime ? initialData.oaDateTime.substring(0, 16) : '');
      setInterviewDateTime(initialData.interviewDateTime ? initialData.interviewDateTime.substring(0, 16) : '');
      setOaReminder(!!initialData.oaReminder);
      setInterviewReminder(!!initialData.interviewReminder);
    } else {
      setCompanyName('');
      setRole('');
      setApplicationDate(new Date().toISOString().split('T')[0]);
      setStatus('Applied');
      setJobDescription('');
      setOaDateTime('');
      setInterviewDateTime('');
      setOaReminder(true); // Default to checked for convenience
      setInterviewReminder(true);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSave({
        companyName,
        role,
        applicationDate,
        status,
        jobDescription,
        oaDateTime: status === 'OA Received' && oaDateTime ? oaDateTime : undefined,
        interviewDateTime: status === 'Interview Scheduled' && interviewDateTime ? interviewDateTime : undefined,
        oaReminder: status === 'OA Received' ? oaReminder : false,
        interviewReminder: status === 'Interview Scheduled' ? interviewReminder : false,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6">
          {initialData ? 'Edit Application' : 'Add New Application'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-950/50 border border-red-900/50 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="company">
              Company Name
            </label>
            <input
              id="company"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm"
              placeholder="e.g. Google"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="role">
              Role
            </label>
            <input
              id="role"
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm"
              placeholder="e.g. Software Engineer Intern"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="date">
              Application Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm"
            >
              <option value="Applied">Applied</option>
              <option value="OA Received">OA Received</option>
              <option value="OA Cleared">OA Cleared</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
              <option value="Selected">Selected</option>
            </select>
          </div>

          {/* Conditional OA Received Inputs */}
          {status === 'OA Received' && (
            <div className="space-y-4 p-4 bg-slate-950/40 border border-slate-850 rounded-xl mt-2">
              <div>
                <label className="block text-sm font-medium text-sky-400 mb-1" htmlFor="oaDateTime">
                  OA Date & Time
                </label>
                <input
                  id="oaDateTime"
                  type="datetime-local"
                  required
                  value={oaDateTime}
                  onChange={(e) => setOaDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="oaReminder"
                  type="checkbox"
                  checked={oaReminder}
                  onChange={(e) => setOaReminder(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-sky-500 focus:ring-sky-500/50 focus:ring-offset-slate-900 focus:ring-2 h-4 w-4"
                />
                <label htmlFor="oaReminder" className="text-sm text-slate-300 select-none">
                  Set active dashboard reminder
                </label>
              </div>
            </div>
          )}

          {/* Conditional Interview Scheduled Inputs */}
          {status === 'Interview Scheduled' && (
            <div className="space-y-4 p-4 bg-slate-950/40 border border-slate-850 rounded-xl mt-2">
              <div>
                <label className="block text-sm font-medium text-emerald-400 mb-1" htmlFor="interviewDateTime">
                  Interview Date & Time
                </label>
                <input
                  id="interviewDateTime"
                  type="datetime-local"
                  required
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="interviewReminder"
                  type="checkbox"
                  checked={interviewReminder}
                  onChange={(e) => setInterviewReminder(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-slate-900 focus:ring-2 h-4 w-4"
                />
                <label htmlFor="interviewReminder" className="text-sm text-slate-300 select-none">
                  Set active dashboard reminder
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="jobDesc">
              Job Description / Details (Optional)
            </label>
            <textarea
              id="jobDesc"
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition text-sm resize-none"
              placeholder="Paste requirements, description, or notes here..."
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
              disabled={loading}
              className="flex-1 py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium transition text-sm flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
