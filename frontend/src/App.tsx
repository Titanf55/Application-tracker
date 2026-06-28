import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const path = window.location.pathname;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-medium text-sm">
        Loading...
      </div>
    );
  }

  // Basic path-based routing
  if (path === '/register') {
    return <Register />;
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_50%)] pointer-events-none" />
        
        <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl relative text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-sky-950 border border-sky-500/30 text-sky-400 mb-6">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Authenticated!</h1>
          <p className="text-sm text-slate-400 mb-6">You have successfully logged in via JWT.</p>
          
          <div className="bg-slate-950 rounded-lg p-4 mb-6 border border-slate-800 text-left space-y-2">
            <p className="text-xs text-slate-400"><strong className="text-slate-300">User ID:</strong> {user.id}</p>
            <p className="text-xs text-slate-400"><strong className="text-slate-300">Username:</strong> {user.username}</p>
            <p className="text-xs text-slate-400"><strong className="text-slate-300">Email:</strong> {user.email}</p>
            <p className="text-xs text-slate-400"><strong className="text-slate-300">Role:</strong> {user.role}</p>
          </div>

          <button
            onClick={logout}
            className="w-full py-3 px-4 rounded-lg bg-red-600/20 hover:bg-red-600/30 active:bg-red-600/40 text-red-400 border border-red-900/50 font-medium transition duration-200 text-sm cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Fallback to Login
  return <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
