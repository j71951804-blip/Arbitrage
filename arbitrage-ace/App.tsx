import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/Auth/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Performance from './components/Performance';
import Settings from './components/Settings';
import Spinner from './components/ui/Spinner';
import type { View } from './types';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'performance':
        return <Performance />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
