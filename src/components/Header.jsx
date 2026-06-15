import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header({ activePage }) {
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'sales': return 'Sales & Leads Management';
      case 'service': return 'Service & AMC Hub';
      case 'rma': return 'Repair & RMA brand tracking';
      case 'financials': return 'Central Payment Hub';
      case 'analytics': return 'Performance Analytics';
      case 'settings': return 'System Configurations & RBAC';
      default: return 'Tech IT World CRM';
    }
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 border-b border-slate-200 shadow-sm z-10">
      
      <div className="flex items-center space-x-4">
        {/* Page Context/Title */}
        <div className="flex items-center space-x-2 hidden sm:flex">
          <span className="text-slate-400 text-xs font-medium">Workspace</span>
          <span className="text-slate-300 text-xs">/</span>
          <span className="text-sm font-bold tracking-wide text-slate-800 capitalize">{getPageTitle()}</span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-6">
        
        {/* Real-time Notifications Bell */}
        <button className="relative p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-all duration-150">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        {/* User Profile Info */}
        <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800 capitalize">{user.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{user.email}</p>
          </div>
          
          {/* Unique Animated Logout button */}
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-xs font-bold bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 px-3 py-1.5 rounded-lg transition-all duration-200 group shadow-sm border border-rose-100 hover:shadow-rose-200/50 hover:border-transparent"
          >
            <span>Sign Out</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}
