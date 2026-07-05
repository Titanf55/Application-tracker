import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ApplicationList } from './pages/ApplicationList';

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
    return <ApplicationList />;
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
