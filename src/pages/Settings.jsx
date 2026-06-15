import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  
  // Shared States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // --- TAB 1: USER MANAGEMENT STATES ---
  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState({
    sales: false, service: false, rma: false, financials: false,
  });

  // --- TAB 2: DROPDOWN MANAGER STATES ---
  const [dropdowns, setDropdowns] = useState({});
  const [newOptions, setNewOptions] = useState({});

  // --- TAB 3: WHATSAPP INTEGRATION STATES ---
  const [whatsappSettings, setWhatsappSettings] = useState({
    url: '', token: '', enabled: false
  });

  // Data Fetching
  useEffect(() => {
    if (activeTab === 'users') fetchEmployees();
    if (activeTab === 'dropdowns') fetchSettings('dropdowns');
    if (activeTab === 'integrations') fetchSettings('integrations');
  }, [activeTab, token]);

  const clearMessages = () => { setError(null); setSuccessMsg(null); };

  // --- API CALLS: USERS ---
  const fetchEmployees = async () => {
    setLoading(true); clearMessages();
    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/auth/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setEmployees(data.employees);
      else setError(data.error);
    } catch (err) { setError('API Connection Failed'); }
    finally { setLoading(false); }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault(); clearMessages();
    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/auth/employees', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, permissions }),
      });
      if (response.ok) {
        setSuccessMsg(`Employee created successfully`);
        setShowAddForm(false); setName(''); setEmail(''); setPassword('');
        setPermissions({ sales: false, service: false, rma: false, financials: false });
        fetchEmployees();
      } else { setError('Failed to create employee'); }
    } catch (err) { setError('Server Error'); }
  };

  const handleTogglePermission = async (employeeId, moduleName) => {
    clearMessages();
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    const updatedPermissions = { ...employee.permissions, [moduleName]: !employee.permissions[moduleName] };

    try {
      const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/auth/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: updatedPermissions }),
      });
      if (response.ok) {
        setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, permissions: updatedPermissions } : emp));
        setSuccessMsg(`Permissions updated for ${employee.name}`);
      } else setError('Failed to update permissions');
    } catch (err) { setError('Server communication failure'); }
  };

  const handleDeleteEmployee = async (id, empName) => {
    if (!window.confirm(`Delete ${empName}?`)) return;
    clearMessages();
    try {
      const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/auth/employees/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { setSuccessMsg(`Employee deleted`); fetchEmployees(); }
      else setError('Failed to delete');
    } catch (err) { setError('Server error'); }
  };

  // --- API CALLS: SETTINGS (DROPDOWNS & WHATSAPP) ---
  const fetchSettings = async (type) => {
    setLoading(true); clearMessages();
    try {
      const res = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        if (type === 'dropdowns') {
          const drops = {};
          Object.keys(data).forEach(key => {
            if (key.startsWith('dropdown_')) drops[key] = data[key];
          });
          setDropdowns(drops);
        } else if (type === 'integrations') {
          if (data.whatsapp_api) setWhatsappSettings(data.whatsapp_api);
        }
      } else setError('Failed to load settings');
    } catch (err) { setError('Server Error'); }
    finally { setLoading(false); }
  };

  const saveSetting = async (key, value) => {
    clearMessages();
    try {
      const res = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/settings/${key}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
      });
      if (res.ok) setSuccessMsg(`Settings saved successfully`);
      else setError('Failed to save settings');
    } catch (err) { setError('Server Error'); }
  };

  const handleAddOption = (key) => {
    if (!newOptions[key] || newOptions[key].trim() === '') return;
    const updated = [...(dropdowns[key] || []), newOptions[key].trim()];
    setDropdowns({ ...dropdowns, [key]: updated });
    setNewOptions({ ...newOptions, [key]: '' });
    saveSetting(key, updated);
  };

  const handleDeleteOption = (key, option) => {
    if (!window.confirm(`Delete option '${option}'?`)) return;
    const updated = dropdowns[key].filter(o => o !== option);
    setDropdowns({ ...dropdowns, [key]: updated });
    saveSetting(key, updated);
  };

  const saveWhatsapp = (e) => {
    e.preventDefault();
    saveSetting('whatsapp_api', whatsappSettings);
  };

  // --- DATA BACKUP IMPORT/EXPORT LOGIC ---
  const handleFileUpload = (e, module) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim() !== '');
      if (lines.length < 2) return setError('CSV must contain a header row and at least one data row');
      
      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/ /g, '_'));
      const parsedData = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((h, i) => obj[h] = values[i] ? values[i].trim() : null);
        return obj;
      });

      setLoading(true); clearMessages();
      try {
        const res = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/data/import/${module}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: parsedData })
        });
        const data = await res.json();
        if (res.ok) setSuccessMsg(data.message);
        else setError(data.error);
      } catch (err) { setError('Failed to upload data'); }
      finally { setLoading(false); e.target.value = null; }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = (module) => {
    let headers = '';
    if (module === 'sales') {
      headers = 'Source,Customer Name,Customer Phone,Customer Email,Requirement,Status,Total Amount\nmanual,John Doe,9876543210,john@example.com,Need new laptops,lead_entry,50000';
    } else if (module === 'service') {
      headers = 'Source,Customer Name,Customer Phone,Customer Email,Device Details,Issue Description,Status,Amount Billed\nmanual,Jane Smith,9876543210,jane@example.com,Dell XPS 15,Screen broken,pending,0';
    }
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${module}_import_template.csv`;
    a.click();
  };

  const handleExport = async (module) => {
    clearMessages();
    try {
      const res = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/data/export/${module}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data.length > 0) {
        const headers = Object.keys(data.data[0]);
        const csvRows = [
          headers.join(','),
          ...data.data.map(row => headers.map(h => {
             let val = row[h] === null ? '' : row[h];
             if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
             return val;
          }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${module}_backup_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        setSuccessMsg(`Backup downloaded successfully`);
      } else {
        setError('No data found to export');
      }
    } catch (err) { setError('Export failed'); }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h1>
        <p className="text-slate-500 text-sm">Manage users, dynamic dropdowns, integrations, and data backups.</p>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium">⚠️ {error}</div>}
      {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">✓ {successMsg}</div>}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto scrollbar-hide">
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          User Roles (RBAC)
        </button>
        <button onClick={() => setActiveTab('dropdowns')} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'dropdowns' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Dropdown Manager
        </button>
        <button onClick={() => setActiveTab('integrations')} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'integrations' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          WhatsApp Integration
        </button>
        <button onClick={() => setActiveTab('data')} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'data' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
          Data Backup & Import
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200">
              {showAddForm ? 'Close Form' : '+ Create Employee'}
            </button>
          </div>
          {/* User Form & Table implementation... */}
          {/* ... (reusing exact previous user table layout for brevity, simplified below) */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-semibold text-slate-800">Current Employees</h3>
             </div>
             {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : (
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b text-[10px] font-bold text-slate-400 uppercase bg-slate-50/20">
                     <th className="py-4 px-6">Name</th>
                     <th className="py-4 px-6">Email</th>
                     <th className="py-4 px-6 text-center">Sales</th>
                     <th className="py-4 px-6 text-center">Service</th>
                     <th className="py-4 px-6 text-center">RMA</th>
                     <th className="py-4 px-6 text-center">Finance</th>
                     <th className="py-4 px-6 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y text-sm text-slate-700">
                   {employees.map(emp => (
                     <tr key={emp.id} className="hover:bg-slate-50/30">
                       <td className="py-4 px-6 font-semibold capitalize">{emp.name.replace('Employee: ', '')}</td>
                       <td className="py-4 px-6">{emp.email}</td>
                       {['sales', 'service', 'rma', 'financials'].map(module => (
                         <td key={module} className="py-4 px-6 text-center">
                           <input type="checkbox" checked={emp.permissions[module]} onChange={() => handleTogglePermission(emp.id, module)} className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
                         </td>
                       ))}
                       <td className="py-4 px-6 text-right">
                         <button onClick={() => handleDeleteEmployee(emp.id, emp.name)} className="text-xs font-semibold bg-rose-50 text-rose-600 px-2 py-1 rounded border border-rose-200 hover:bg-rose-100">Remove</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </div>
        </div>
      )}

      {/* TAB 2: DROPDOWNS */}
      {activeTab === 'dropdowns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(dropdowns).map(key => {
            const title = key.replace('dropdown_', '').replace(/_/g, ' ');
            return (
              <div key={key} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 capitalize mb-4 border-b pb-2">{title} Options</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dropdowns[key].map((opt, idx) => (
                    <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full flex items-center shadow-sm">
                      <span className="capitalize">{opt.replace(/_/g, ' ')}</span>
                      <button onClick={() => handleDeleteOption(key, opt)} className="ml-2 text-slate-400 hover:text-rose-500 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input type="text" value={newOptions[key] || ''} onChange={e => setNewOptions({...newOptions, [key]: e.target.value})} placeholder="New option..." className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm" />
                  <button onClick={() => handleAddOption(key)} className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-slate-700">Add</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: WHATSAPP INTEGRATION */}
      {activeTab === 'integrations' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-2xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.098.824z"/></svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">WhatsApp API Connection</h2>
            </div>
          </div>
          <form onSubmit={saveWhatsapp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className={`w-12 h-6 rounded-full transition-colors relative ${whatsappSettings.enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <input type="checkbox" checked={whatsappSettings.enabled} onChange={e => setWhatsappSettings({...whatsappSettings, enabled: e.target.checked})} className="sr-only" />
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${whatsappSettings.enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </div>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">API URL Endpoint</label>
              <input type="url" value={whatsappSettings.url} onChange={e => setWhatsappSettings({...whatsappSettings, url: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm bg-slate-50 focus:border-green-500" />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold">Save</button>
          </form>
        </div>
      )}

      {/* TAB 4: DATA BACKUP & IMPORT */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Sales & Leads Data</h3>
              <p className="text-xs text-slate-500 mt-1">Import new leads from CSV or export existing leads to backup.</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => downloadTemplate('sales')} className="text-blue-600 hover:text-blue-800 text-xs font-semibold self-center mr-2 underline">
                Download Format
              </button>
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors border border-slate-300">
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, 'sales')} />
              </label>
              <button onClick={() => handleExport('sales')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
                Download Backup
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Service & AMC Tickets</h3>
              <p className="text-xs text-slate-500 mt-1">Import existing service tickets or export all ticket history.</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => downloadTemplate('service')} className="text-blue-600 hover:text-blue-800 text-xs font-semibold self-center mr-2 underline">
                Download Format
              </button>
              <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors border border-slate-300">
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, 'service')} />
              </label>
              <button onClick={() => handleExport('service')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors">
                Download Backup
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
