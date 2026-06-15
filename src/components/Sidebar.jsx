import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activePage, setActivePage, isSidebarOpen, setIsSidebarOpen }) {
  const { user, hasPermission } = useAuth();
  
  // Sub-menu open states
  const [openSubMenus, setOpenSubMenus] = useState({
    sales: false,
    service: false,
    rma: false,
    financials: false,
  });

  const toggleSubMenu = (menu) => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true); // Auto-open sidebar if they click a menu while collapsed
      setOpenSubMenus({ ...openSubMenus, [menu]: true });
      return;
    }
    setOpenSubMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const navItemClass = (page) =>
    `relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer group ${
      activePage === page
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-blue-100 hover:bg-blue-700/50 hover:text-white'
    } ${!isSidebarOpen && 'justify-center px-0'}`;

  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside 
      className={`bg-blue-800 text-white flex flex-col h-full border-r border-blue-900 shadow-2xl select-none transition-all duration-300 ease-in-out z-50 ${
        isSidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Logo Header & Hamburger */}
      <div className={`h-16 flex items-center border-b border-blue-900 transition-all ${isSidebarOpen ? 'px-4 justify-between' : 'justify-center'}`}>
        {isSidebarOpen && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <svg className="w-10 h-10 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 10 h16 a2 2 0 0 1 0 4 h-16 a2 2 0 0 1 0 -4 z" fill="#38bdf8" />
              <path d="M10 14 h4 v10 a2 2 0 0 1 -4 0 z" fill="#2563eb" />
              <g stroke="#3b82f6" strokeWidth="1.2" fill="none">
                <circle cx="21" cy="20" r="6" />
                <ellipse cx="21" cy="20" rx="3" ry="6" />
                <path d="M15 20 h12" />
                <path d="M16 17 h10" />
                <path d="M16 23 h10" />
              </g>
            </svg>
            <div className="whitespace-nowrap">
              <span className="font-bold text-sm tracking-wide text-white block">Tech IT World</span>
              <span className="text-[9px] text-blue-300 font-bold tracking-widest uppercase">CRM Platform</span>
            </div>
          </div>
        )}

        {/* Hamburger Menu */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-blue-800/50 text-blue-200 hover:text-white transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation Content */}
      <nav className="flex-1 px-3 py-6 space-y-2 scrollbar-hide">
        
        {/* Dashboard */}
        <div onClick={() => setActivePage('dashboard')} className={navItemClass('dashboard')}>
          <svg className={`w-6 h-6 flex-shrink-0 ${!isSidebarOpen && 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z" />
          </svg>
          <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Overview</span>
          {/* Tooltip */}
          {!isSidebarOpen && <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Dashboard Overview</div>}
        </div>

        {/* Sales & Leads */}
        {hasPermission('sales') && (
          <div>
            <div onClick={() => toggleSubMenu('sales')} className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-lg text-blue-100 hover:bg-blue-700/50 hover:text-white cursor-pointer transition-all duration-200 group ${!isSidebarOpen && 'justify-center px-0'}`}>
              <svg className={`w-6 h-6 flex-shrink-0 ${!isSidebarOpen && 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {isSidebarOpen && (
                <>
                  <span className="ml-3 flex-1 whitespace-nowrap">Sales & Leads</span>
                  <svg className={`w-4 h-4 transform transition-transform duration-200 ${openSubMenus.sales ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </>
              )}
              {!isSidebarOpen && <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Sales & Leads</div>}
            </div>
            {isSidebarOpen && openSubMenus.sales && (
              <div className="mt-1 space-y-1">
                <div onClick={() => setActivePage('sales')} className="flex items-center px-6 py-2.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer pl-12 text-blue-200 hover:bg-blue-700/30 hover:text-white">Leads Pipeline</div>
              </div>
            )}
          </div>
        )}

        {/* Service & AMC */}
        {hasPermission('service') && (
          <div>
            <div onClick={() => toggleSubMenu('service')} className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-lg text-blue-100 hover:bg-blue-700/50 hover:text-white cursor-pointer transition-all duration-200 group ${!isSidebarOpen && 'justify-center px-0'}`}>
              <svg className={`w-6 h-6 flex-shrink-0 ${!isSidebarOpen && 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {isSidebarOpen && (
                <>
                  <span className="ml-3 flex-1 whitespace-nowrap">Service & AMC</span>
                  <svg className={`w-4 h-4 transform transition-transform duration-200 ${openSubMenus.service ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </>
              )}
              {!isSidebarOpen && <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Service & AMC</div>}
            </div>
            {isSidebarOpen && openSubMenus.service && (
              <div className="mt-1 space-y-1">
                <div onClick={() => setActivePage('service')} className="flex items-center px-6 py-2.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer pl-12 text-blue-200 hover:bg-blue-700/30 hover:text-white">Active Tickets</div>
              </div>
            )}
          </div>
        )}

        {/* RMA */}
        {hasPermission('rma') && (
          <div>
            <div onClick={() => toggleSubMenu('rma')} className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-lg text-blue-100 hover:bg-blue-700/50 hover:text-white cursor-pointer transition-all duration-200 group ${!isSidebarOpen && 'justify-center px-0'}`}>
              <svg className={`w-6 h-6 flex-shrink-0 ${!isSidebarOpen && 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              {isSidebarOpen && (
                <>
                  <span className="ml-3 flex-1 whitespace-nowrap">Repair & RMA</span>
                  <svg className={`w-4 h-4 transform transition-transform duration-200 ${openSubMenus.rma ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </>
              )}
              {!isSidebarOpen && <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Repair & RMA</div>}
            </div>
            {isSidebarOpen && openSubMenus.rma && (
              <div className="mt-1 space-y-1">
                <div onClick={() => setActivePage('rma')} className="flex items-center px-6 py-2.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer pl-12 text-blue-200 hover:bg-blue-700/30 hover:text-white">RMA Tickets</div>
              </div>
            )}
          </div>
        )}

        {/* Financials */}
        {hasPermission('financials') && (
          <div>
            <div onClick={() => toggleSubMenu('financials')} className={`relative flex items-center px-4 py-3 text-sm font-medium rounded-lg text-blue-100 hover:bg-blue-700/50 hover:text-white cursor-pointer transition-all duration-200 group ${!isSidebarOpen && 'justify-center px-0'}`}>
              <svg className={`w-6 h-6 flex-shrink-0 ${!isSidebarOpen && 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isSidebarOpen && (
                <>
                  <span className="ml-3 flex-1 whitespace-nowrap">Financial Hub</span>
                  <svg className={`w-4 h-4 transform transition-transform duration-200 ${openSubMenus.financials ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </>
              )}
              {!isSidebarOpen && <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Financial Hub</div>}
            </div>
            {isSidebarOpen && openSubMenus.financials && (
              <div className="mt-1 space-y-1">
                <div onClick={() => setActivePage('financials')} className="flex items-center px-6 py-2.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer pl-12 text-blue-200 hover:bg-blue-700/30 hover:text-white">Ledger Hub</div>
              </div>
            )}
          </div>
        )}

        {/* Analytics */}
        <div onClick={() => setActivePage('analytics')} className={navItemClass('analytics')}>
          <svg className={`w-6 h-6 flex-shrink-0 ${!isSidebarOpen && 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
          <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Performance</span>
          {!isSidebarOpen && <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Performance</div>}
        </div>

        {/* Settings */}
        {(user.role === 'owner' || user.role === 'admin') && (
          <div onClick={() => setActivePage('settings')} className={navItemClass('settings')}>
            <svg className={`w-6 h-6 flex-shrink-0 ${!isSidebarOpen && 'mx-auto'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`ml-3 whitespace-nowrap transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>Settings</span>
            {!isSidebarOpen && <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">Settings</div>}
          </div>
        )}

      </nav>

      {/* Footer Profile Status */}
      <div className={`p-4 border-t border-blue-900 bg-blue-900 transition-all duration-300 ${isSidebarOpen ? 'items-center space-x-3' : 'justify-center'} flex`}>
        <div className="w-9 h-9 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white border border-blue-500 shadow-sm relative group cursor-pointer">
          {getInitials(user.name)}
          {/* Tooltip for profile when closed */}
          {!isSidebarOpen && <div className="absolute left-12 bottom-0 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">{user.name}</div>}
        </div>
        
        {isSidebarOpen && (
          <div className="overflow-hidden flex-1">
            <h4 className="text-xs font-bold text-white truncate capitalize">{user.name}</h4>
            <span className="text-[9px] text-emerald-400 font-bold tracking-wide uppercase flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1 shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span>
              {user.role}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
