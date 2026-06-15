import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { AuthProvider, useAuth } from './context/AuthContext';

// View Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Service from './pages/Service';
import RMA from './pages/RMA';
import Financials from './pages/Financials';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import EngineerSmartLinkView from './pages/EngineerSmartLinkView';

function Layout() {
  const { user, loading, hasPermission } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-600 animate-pulse flex items-center justify-center font-bold text-2xl text-white shadow-lg">
          T
        </div>
        <p className="text-slate-400 text-xs font-semibold tracking-wider uppercase">Loading Session...</p>
      </div>
    );
  }

  // If user session is not found, render Login page
  if (!user) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'sales':
        return hasPermission('sales') ? <Sales /> : <ForbiddenPage />;
      case 'service':
        return hasPermission('service') ? <Service /> : <ForbiddenPage />;
      case 'rma':
        return hasPermission('rma') ? <RMA /> : <ForbiddenPage />;
      case 'financials':
        return hasPermission('financials') ? <Financials /> : <ForbiddenPage />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return (user.role === 'owner' || user.role === 'admin') ? <Settings /> : <ForbiddenPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Strict Dark Blue Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Workspace Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Clean White Header */}
        <Header activePage={activePage} />

        {/* Off-White Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>
    </div>
  );
}

function ForbiddenPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in">
      <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4 border border-rose-100 shadow-sm">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-1">Access Restrained</h2>
      <p className="text-slate-500 text-sm max-w-sm">
        You do not have access credentials for this module. Please coordinate with an Administrator.
      </p>
    </div>
  );
}

export default function App() {
  // Read query parameters for field engineer view bypass
  const queryParams = new URLSearchParams(window.location.search);
  const engineerToken = queryParams.get('engineer_token');

  if (engineerToken) {
    return <EngineerSmartLinkView token={engineerToken} />;
  }

  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  );
}
