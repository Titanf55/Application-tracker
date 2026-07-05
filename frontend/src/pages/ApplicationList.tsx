import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ApplicationModal } from '../components/ApplicationModal';
import { ResumeModal } from '../components/ResumeModal';
import { AiPanel } from '../components/AiPanel';
import { LogOut, Plus, Search, Briefcase, Calendar, TrendingUp, CheckCircle, XCircle, Clock, Sparkles } from 'lucide-react';

interface Application {
  id: number;
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

export const ApplicationList: React.FC = () => {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI State Variables
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [selectedAppForAi, setSelectedAppForAi] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/applications');
      setApplications(response.data);
    } catch (err: any) {
      setError('Failed to fetch applications. Make sure the Spring Boot server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (appData: any) => {
    try {
      if (editingApp) {
        const response = await api.put(`/applications/${editingApp.id}`, appData);
        setApplications(applications.map(app => app.id === editingApp.id ? response.data : app));
      } else {
        const response = await api.post('/applications', appData);
        setApplications([...applications, response.data]);
      }
    } catch (err: any) {
      throw err; // Forward error to the modal to show it to the user
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.delete(`/applications/${id}`);
        setApplications(applications.filter(app => app.id !== id));
      } catch (err) {
        alert('Failed to delete application.');
      }
    }
  };

  const handleEditClick = (app: Application) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingApp(null);
    setIsModalOpen(true);
  };

  // Helper to format countdowns
  const getCountdown = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) return 'Starts now!';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    const remainingHrs = diffHrs % 24;
    
    if (diffDays > 0) {
      return `${diffDays}d ${remainingHrs}h left`;
    }
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${remainingHrs}h ${diffMins}m left`;
  };

  // Calculate active countdown reminders
  const activeReminders = applications.reduce((acc: any[], app) => {
    const now = new Date();
    
    if (app.status === 'OA Received' && app.oaDateTime && app.oaReminder) {
      const oaDate = new Date(app.oaDateTime);
      if (oaDate > now) {
        acc.push({
          id: `oa-${app.id}`,
          companyName: app.companyName,
          role: app.role,
          type: 'OA',
          message: `Scheduled for ${new Date(app.oaDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`,
          countdown: getCountdown(app.oaDateTime),
          date: oaDate,
        });
      }
    }
    
    if (app.status === 'Interview Scheduled' && app.interviewDateTime && app.interviewReminder) {
      const intDate = new Date(app.interviewDateTime);
      if (intDate > now) {
        acc.push({
          id: `int-${app.id}`,
          companyName: app.companyName,
          role: app.role,
          type: 'Interview',
          message: `Scheduled for ${new Date(app.interviewDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`,
          countdown: getCountdown(app.interviewDateTime),
          date: intDate,
        });
      }
    }
    
    return acc;
  }, []).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Metrics Calculations
  const totalApps = applications.length;
  
  const oaReceivedCount = applications.filter(app => 
    app.status === 'OA Received' || app.status === 'OA Cleared' || app.status === 'Interview Scheduled' || app.status === 'Selected'
  ).length;
  
  const oaClearedCount = applications.filter(app => 
    app.status === 'OA Cleared' || app.status === 'Interview Scheduled' || app.status === 'Selected'
  ).length;
  
  const interviewScheduledCount = applications.filter(app => 
    app.status === 'Interview Scheduled' || app.status === 'Selected'
  ).length;
  
  const selectedCount = applications.filter(app => app.status === 'Selected').length;

  const oaConversionRate = oaReceivedCount > 0 
    ? Math.round((oaClearedCount / oaReceivedCount) * 100) 
    : 0;
    
  const interviewConversionRate = interviewScheduledCount > 0 
    ? Math.round((selectedCount / interviewScheduledCount) * 100) 
    : 0;

  // Filter and Search Applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-950 text-blue-400 border border-blue-900/30';
      case 'OA Received':
        return 'bg-sky-950 text-sky-400 border border-sky-900/30';
      case 'OA Cleared':
        return 'bg-indigo-950 text-indigo-400 border border-indigo-900/30';
      case 'Interview Scheduled':
        return 'bg-emerald-950 text-emerald-400 border border-emerald-900/30';
      case 'Rejected':
        return 'bg-red-950 text-red-400 border border-red-900/30';
      case 'Selected':
        return 'bg-amber-950 text-amber-400 border border-amber-900/30';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Background visual decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-sky-500/10">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Internship Tracker</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400 mr-2">
              Welcome, <strong className="text-slate-200">{user?.username}</strong>
            </span>
            <button
              onClick={() => setIsResumeModalOpen(true)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-sky-400 hover:text-sky-300 transition text-xs cursor-pointer mr-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>My Resume</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white transition text-xs cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Metric Cards Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 text-sky-500/20">
              <Briefcase className="h-10 w-10" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Total Applications</h3>
            <p className="text-3xl font-bold text-white">{totalApps}</p>
            <span className="text-xs text-slate-500 mt-2 block">Tracked companies</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 text-amber-500/20">
              <TrendingUp className="h-10 w-10" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">OA Conversion Rate</h3>
            <p className="text-3xl font-bold text-white">{oaConversionRate}%</p>
            <span className="text-xs text-slate-500 mt-2 block">{oaClearedCount} of {oaReceivedCount} OAs cleared</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-4 right-4 text-emerald-500/20">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-sm font-medium text-slate-400 mb-1">Interview Success Rate</h3>
            <p className="text-3xl font-bold text-white">{interviewConversionRate}%</p>
            <span className="text-xs text-slate-500 mt-2 block">{selectedCount} of {interviewScheduledCount} scheduled offers</span>
          </div>
        </section>

        {/* Active Reminders Alert Banner */}
        {activeReminders.length > 0 && (
          <section className="mb-6 bg-amber-950/20 border border-amber-900/40 rounded-xl p-5 backdrop-blur-sm">
            <h4 className="text-amber-400 font-bold text-sm mb-3 flex items-center space-x-1.5">
              <span className="animate-pulse">🔔</span>
              <span>Upcoming Reminders</span>
            </h4>
            <div className="space-y-2">
              {activeReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 hover:border-slate-800 transition">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      reminder.type === 'OA' ? 'bg-sky-950 text-sky-400 border border-sky-900/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                    }`}>
                      {reminder.type}
                    </span>
                    <span className="font-medium">
                      <strong className="text-white">{reminder.companyName}</strong> ({reminder.role})
                    </span>
                    <span className="text-slate-400">— {reminder.message}</span>
                  </div>
                  <span className="font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {reminder.countdown}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter and Search Panel */}
        <section className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-1 flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search by company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="OA Received">OA Received</option>
              <option value="OA Cleared">OA Cleared</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Rejected">Rejected</option>
              <option value="Selected">Selected</option>
            </select>
          </div>

          <button
            onClick={handleAddClick}
            className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-medium text-sm transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </button>
        </section>

        {/* Applications List Section */}
        {error && (
          <div className="p-4 rounded-lg bg-red-950/40 border border-red-900/50 text-red-200 text-sm text-center mb-8">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <svg className="animate-spin h-8 w-8 text-sky-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm">Loading job trackers...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 border border-slate-900 rounded-2xl">
            <Briefcase className="mx-auto h-12 w-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No applications found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'All' 
                ? 'Try adjusting your search query or status filter.'
                : 'Click "Add Application" above to begin tracking your first role!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-xl p-5 hover:shadow-lg transition duration-200 relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-white mb-0.5">{app.companyName}</h4>
                      <p className="text-sm text-slate-400 font-medium flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{app.role}</span>
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${getStatusBadgeClass(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center space-x-1.5 mb-3">
                    <Calendar className="h-3.5 w-3.5 text-slate-600" />
                    <span>Applied on {app.applicationDate}</span>
                  </div>

                  {/* Scheduled OA Info Badge */}
                  {app.status === 'OA Received' && app.oaDateTime && (
                    <div className="text-xs bg-sky-950/40 border border-sky-900/30 p-2.5 rounded-lg text-sky-400 flex items-center space-x-2 mb-4">
                      <Clock className="h-3.5 w-3.5 text-sky-500 animate-pulse" />
                      <span>OA: {new Date(app.oaDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  )}

                  {/* Scheduled Interview Info Badge */}
                  {app.status === 'Interview Scheduled' && app.interviewDateTime && (
                    <div className="text-xs bg-emerald-950/40 border border-emerald-900/30 p-2.5 rounded-lg text-emerald-400 flex items-center space-x-2 mb-4">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                      <span>Intv: {new Date(app.interviewDateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-900 pt-3 mt-auto flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      setSelectedAppForAi(app);
                      setIsAiPanelOpen(true);
                    }}
                    className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>AI Insights</span>
                  </button>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEditClick(app)}
                      className="text-slate-400 hover:text-slate-200 font-semibold cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-red-500 hover:text-red-400 font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Form Modal popup */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingApp}
      />

      {/* Global Resume Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
      />

      {/* AI Insights slide-over drawer */}
      <AiPanel
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        application={selectedAppForAi}
      />
    </div>
  );
};
