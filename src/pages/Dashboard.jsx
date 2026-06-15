import React from 'react';

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Overview</h1>
          <p className="text-slate-500 text-sm">Welcome back, Administrator. Here's what's happening at Tech IT World today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl border border-blue-500/30 shadow-lg shadow-blue-900/20 flex flex-col justify-between transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/40 group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Active Leads</span>
            <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform origin-left">0</h3>
          </div>
          <span className="text-xs text-blue-100 font-medium mt-4 flex items-center relative z-10 bg-black/10 w-fit px-2 py-1 rounded-md">
            Fresh Database
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl border border-amber-400/30 shadow-lg shadow-orange-900/20 flex flex-col justify-between transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/40 group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <span className="text-xs font-semibold text-orange-100 uppercase tracking-wider">Service Tickets</span>
            <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform origin-left">0</h3>
          </div>
          <span className="text-xs text-orange-50 font-medium mt-4 flex items-center relative z-10 bg-black/10 w-fit px-2 py-1 rounded-md">
            0 Pending Engineer Assignment
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-xl border border-teal-400/30 shadow-lg shadow-teal-900/20 flex flex-col justify-between transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/40 group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <span className="text-xs font-semibold text-teal-100 uppercase tracking-wider">RMA In-Progress</span>
            <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform origin-left">0</h3>
          </div>
          <span className="text-xs text-teal-50 font-medium mt-4 flex items-center relative z-10 bg-black/10 w-fit px-2 py-1 rounded-md">
            0 Sent to Brand Center
          </span>
        </div>
        
        <div className="bg-gradient-to-br from-rose-500 to-pink-700 p-6 rounded-xl border border-pink-400/30 shadow-lg shadow-pink-900/20 flex flex-col justify-between transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-500/40 group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all duration-500"></div>
          <div className="relative z-10">
            <span className="text-xs font-semibold text-pink-100 uppercase tracking-wider">Pending Collections</span>
            <h3 className="text-3xl font-black text-white mt-2 group-hover:scale-105 transition-transform origin-left">₹0</h3>
          </div>
          <span className="text-xs text-pink-50 font-medium mt-4 flex items-center relative z-10 bg-black/10 w-fit px-2 py-1 rounded-md">
            Requires Admin Verification
          </span>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Sales & Service Activity</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-sm">
            Activity Charts and Timelines will load here
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pending Cash Verification</h2>
          <div className="space-y-4">
            <div className="p-6 text-center text-slate-400 text-sm flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-lg">
              No pending cash collections to verify.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
