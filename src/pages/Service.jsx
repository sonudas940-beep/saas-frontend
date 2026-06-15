import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Service() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customDropdowns, setCustomDropdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal Panels
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [whatsappLog, setWhatsappLog] = useState(null);

  // Manual Ticket Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [device, setDevice] = useState('');
  const [description, setDescription] = useState('');
  const [customFields, setCustomFields] = useState({});

  // QR Webform Simulation State
  const [qrName, setQrName] = useState('');
  const [qrPhone, setQrPhone] = useState('');
  const [qrEmail, setQrEmail] = useState('');
  const [qrDevice, setQrDevice] = useState('');
  const [qrDescription, setQrDescription] = useState('');

  // Assignment Modal State
  const [assignedEngineerId, setAssignedEngineerId] = useState('');
  const [engineerPhone, setEngineerPhone] = useState('');

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/service', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data.tickets);
      } else {
        setError(data.error || 'Failed to fetch tickets');
      }
    } catch (err) {
      setError('Connection failure to API server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees list
  const fetchEmployees = async () => {
    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/auth/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error('Failed to load employees for assignment list', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const custom = {};
        const ignored = ['dropdown_lead_sources', 'dropdown_brands', 'dropdown_device_types', 'dropdown_expense_categories'];
        Object.keys(data).forEach(key => {
          if (key.startsWith('dropdown_') && !ignored.includes(key)) {
            custom[key] = data[key];
          }
        });
        setCustomDropdowns(custom);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchEmployees();
    fetchSettings();
  }, [token]);

  // Handle Manual Support Ticket submission
  const handleAddTicket = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/service', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'manual',
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          device_details: device,
          issue_description: description,
          custom_fields: customFields
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Manual support ticket created successfully`);
        setName('');
        setPhone('');
        setEmail('');
        setDevice('');
        setDescription('');
        setCustomFields({});
        setShowAddForm(false);
        fetchTickets();
      } else {
        setError(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  // Handle Public QR Form Scan simulation submit
  const handleQRFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/service/public/qr-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'qr_code',
          customer_name: qrName,
          customer_phone: qrPhone,
          customer_email: qrEmail,
          device_details: qrDevice,
          issue_description: qrDescription
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Customer QR ticket submitted successfully. Refreshing live dashboard...`);
        setQrName('');
        setQrPhone('');
        setQrEmail('');
        setQrDevice('');
        setQrDescription('');
        setShowQRModal(false);
        fetchTickets();
      } else {
        setError(data.error || 'Failed to submit QR form');
      }
    } catch (err) {
      setError('Server connection error during QR logging');
    }
  };

  // Dispatch assignment PUT request
  const handleAssignEngineer = async (e) => {
    e.preventDefault();
    if (!assignedEngineerId) return;

    setError(null);
    setSuccessMsg(null);
    setWhatsappLog(null);

    try {
      const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/service/assign/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigned_engineer_id: assignedEngineerId,
          engineer_phone: engineerPhone
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Ticket assigned successfully`);
        setWhatsappLog({
          message: `Dispatched WhatsApp Smart Link text to +${engineerPhone || '919876543210'} successfully.`,
          link: data.smart_link
        });
        setAssignedEngineerId('');
        setEngineerPhone('');
        setSelectedTicket(data.ticket);
        fetchTickets();
      } else {
        setError(data.error || 'Failed to assign ticket');
      }
    } catch (err) {
      setError('Failed to contact server for assignment updates');
    }
  };

  const openTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setWhatsappLog(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-rose-100">Pending</span>;
      case 'assigned': return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-amber-100">Dispatched</span>;
      case 'solved': return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-emerald-100">Solved</span>;
      default: return <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase capitalize">{status}</span>;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'qr_code': return <span className="bg-indigo-100 text-indigo-800 text-[9px] font-bold px-2 py-0.5 rounded border border-indigo-200">QR Scan Form</span>;
      case 'manual': return <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-200">Manual Log</span>;
      default: return <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded capitalize">{source}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Service & AMC Register</h1>
          <p className="text-slate-500 text-sm">Review QR-scanned support tickets and call logs. Assign tasks to engineers and verify client ratings.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowQRModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
          >
            📱 Simulate Customer QR Scan
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
          >
            {showAddForm ? 'Close Intake Form' : '+ Add Manual Ticket'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}

      {/* Add Manual Support Ticket Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Log Manual Customer Support Ticket</h2>
          <form onSubmit={handleAddTicket} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Sharma"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9123456789"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rohit@gmail.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Device Details</label>
              <input
                type="text"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                placeholder="HP LaserJet M1005 Printer (Serial #HP-9921)"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Support Issue Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paper jam error popping up constantly. Printing is locked."
                required
                rows="3"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
              />
            </div>

            {/* Dynamic Custom Dropdowns */}
            {Object.keys(customDropdowns).map(key => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {key.replace('dropdown_', '').replace(/_/g, ' ')}
                </label>
                <select
                  value={customFields[key] || ''}
                  onChange={(e) => setCustomFields({ ...customFields, [key]: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 capitalize focus:outline-none"
                >
                  <option value="">Select...</option>
                  {customDropdowns[key].map(opt => (
                    <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            ))}

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md"
              >
                File Support Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Unified List and Action Center Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Unified Tickets Table List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Support Operations Desk</h3>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
              Manual + QR scan merged
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex-1 flex items-center justify-center">
              Loading support logs...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm flex-1 flex items-center justify-center">
              No active tickets found. Simluate a QR scan to begin.
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/10 sticky top-0 bg-white">
                    <th className="py-3 px-5">Source</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Device</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => openTicketDetails(t)}
                      className={`hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer ${selectedTicket?.id === t.id ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="py-4 px-5">{getSourceBadge(t.source)}</td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-800 capitalize">{t.customer_name}</p>
                        <p className="text-slate-400 text-[10px]">{t.customer_phone}</p>
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-600 truncate max-w-[150px]">{t.device_details}</td>
                      <td className="py-4 px-5">{getStatusBadge(t.status)}</td>
                      <td className="py-4 px-5 text-right">
                        <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded hover:bg-blue-100">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Support Ticket Detailed Panel */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col h-[600px] overflow-y-auto">
          {selectedTicket ? (
            <div className="space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-800 capitalize">{selectedTicket.customer_name}</h3>
                  {getSourceBadge(selectedTicket.source)}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">📞 {selectedTicket.customer_phone}</p>
                {selectedTicket.customer_email && (
                  <p className="text-xs text-slate-400 mt-0.5">✉️ {selectedTicket.customer_email}</p>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Device & Issue Profile</h4>
                <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  🔧 {selectedTicket.device_details}
                </p>
                <p className="text-xs text-slate-500 italic mt-2 pl-2 border-l-2 border-blue-500">
                  "{selectedTicket.issue_description}"
                </p>
              </div>

              {/* Dynamic Custom Fields Rendering */}
              {selectedTicket.custom_fields && Object.keys(selectedTicket.custom_fields).length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(selectedTicket.custom_fields).map(key => (
                    <div key={key}>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {key.replace('dropdown_', '').replace(/_/g, ' ')}
                      </h4>
                      <p className="text-xs font-semibold text-slate-700 capitalize">
                        {selectedTicket.custom_fields[key] || 'Not specified'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Status information panel */}
              <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Status</span>
                {getStatusBadge(selectedTicket.status)}
              </div>

              {/* Dispatch Action form */}
              {selectedTicket.status === 'pending' && (
                <div className="p-4 border border-blue-100 bg-blue-50/20 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-slate-700">Assign Field Engineer Dispatch</h4>
                  <form onSubmit={handleAssignEngineer} className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Select Technician</label>
                      <select
                        value={assignedEngineerId}
                        onChange={(e) => setAssignedEngineerId(e.target.value)}
                        required
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs capitalize bg-white"
                      >
                        <option value="">Choose Engineer...</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name.replace('Employee: ', '')}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Technician Phone (WhatsApp)</label>
                      <input
                        type="tel"
                        value={engineerPhone}
                        onChange={(e) => setEngineerPhone(e.target.value)}
                        placeholder="9876543210"
                        required
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-[10px] font-bold shadow-sm"
                    >
                      Assign & Send Smart Link
                    </button>
                  </form>
                </div>
              )}

              {/* Whatsapp Logs and Link generator preview */}
              {selectedTicket.status === 'assigned' && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-800">📡 Dispatched to Field Technician:</p>
                    <p className="text-xs text-amber-700 mt-0.5 font-semibold capitalize">👤 {selectedTicket.engineer_name?.replace('Employee: ', '')}</p>
                  </div>

                  <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-xl space-y-2">
                    <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">🔒 Security Smart Link:</p>
                    <p className="text-[9px] text-slate-500 break-all select-all font-mono bg-white p-2 border border-slate-100 rounded">
                      http://localhost:5173/?engineer_token={selectedTicket.smart_link_token}
                    </p>
                    <a
                      href={`http://localhost:5173/?engineer_token=${selectedTicket.smart_link_token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold px-3 py-1.5 rounded-md shadow-sm"
                    >
                      Open Field Engineer View ↗
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp Action Log indicator */}
              {whatsappLog && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-800 space-y-1">
                  <p>✓ {whatsappLog.message}</p>
                  <a
                    href={whatsappLog.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 block text-[9px]"
                  >
                    Open Smart Link in simulated test tab
                  </a>
                </div>
              )}

              {/* Solved details panel */}
              {selectedTicket.status === 'solved' && (
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Report Outcomes</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-slate-400 font-bold text-[9px] uppercase">Rating Given</p>
                      <p className="text-amber-500 font-bold text-sm">{'★'.repeat(selectedTicket.customer_rating)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold text-[9px] uppercase">Cash Collected</p>
                      <p className="font-extrabold text-slate-800 text-sm">₹{parseFloat(selectedTicket.amount_billed).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-100">
                      <p className="text-slate-400 font-bold text-[9px] uppercase">Technician Expenses</p>
                      <p className="font-bold text-slate-700 text-xs">₹{parseFloat(selectedTicket.job_expense).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {selectedTicket.customer_signature_url && (
                    <div>
                      <p className="text-slate-400 font-bold text-[9px] uppercase mb-1">Customer Sign-off</p>
                      {selectedTicket.customer_signature_url.startsWith('data:image') ? (
                        <img
                          src={selectedTicket.customer_signature_url}
                          alt="Customer Signature"
                          className="w-full max-h-[80px] bg-slate-50 border border-slate-150 rounded object-contain"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded">{selectedTicket.customer_signature_url}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Select a support ticket from the log list to load management center</span>
            </div>
          )}
        </div>

      </div>

      {/* Customer QR Scan Simulation Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-100 animate-fade-in relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>
            <div className="text-center">
              <span className="text-3xl">📱</span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">Customer QR Support Portal</h3>
              <p className="text-slate-500 text-xs mt-1">This simulates scanning a QR code sticker placed on client equipment.</p>
            </div>

            <form onSubmit={handleQRFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                <input
                  type="text"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                  placeholder="Sumit Das"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={qrPhone}
                  onChange={(e) => setQrPhone(e.target.value)}
                  placeholder="9830098300"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={qrEmail}
                  onChange={(e) => setQrEmail(e.target.value)}
                  placeholder="sumit@yahoo.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Device / Machine Model</label>
                <input
                  type="text"
                  value={qrDevice}
                  onChange={(e) => setQrDevice(e.target.value)}
                  placeholder="Dell OptiPlex 3080 Desktop PC"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Explain the Issue</label>
                <textarea
                  value={qrDescription}
                  onChange={(e) => setQrDescription(e.target.value)}
                  placeholder="Windows is showing blue screen error (BSOD) on boot."
                  required
                  rows="2"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-xs font-bold shadow-md"
              >
                Submit QR Ticket Request
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
