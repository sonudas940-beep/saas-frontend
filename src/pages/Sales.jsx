import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sales() {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals & Panels State
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [showQuotePreview, setShowQuotePreview] = useState(false);

  // Manual Lead Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [requirement, setRequirement] = useState('');
  const [amount, setAmount] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  // Follow-up Form State
  const [followupNotes, setFollowupNotes] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [followupsList, setFollowupsList] = useState([]);

  // Fetch all leads
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/sales', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setLeads(data.leads);
      } else {
        setError(data.error || 'Failed to fetch leads');
      }
    } catch (err) {
      setError('Connection failure to API server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees list for assignment dropdown
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

  useEffect(() => {
    fetchLeads();
    fetchEmployees();
  }, [token]);

  // Handle Lead creation
  const handleAddLead = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/sales', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          requirement,
          total_amount: parseFloat(amount) || 0.00,
          assigned_to: assignedTo || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Lead for '${name}' created successfully`);
        setName('');
        setPhone('');
        setEmail('');
        setRequirement('');
        setAmount('');
        setAssignedTo('');
        setShowAddForm(false);
        fetchLeads();
      } else {
        setError(data.error || 'Failed to create lead');
      }
    } catch (err) {
      setError('Server connection error');
    }
  };

  // Handle lead status updates
  const handleStatusUpdate = async (leadId, newStatus) => {
    setError(null);
    setSuccessMsg(null);

    // If status is follow_up, require a date
    if (newStatus === 'follow_up' && !nextFollowupDate) {
      setError("Mandatory 'Next Follow-up Date' is required to place a lead in Follow-up state.");
      return;
    }

    try {
      const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/sales/${leadId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          next_follow_up_date: newStatus === 'follow_up' ? nextFollowupDate : null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Lead status transitioned to '${newStatus}'`);
        setSelectedLead(data.lead);
        fetchLeads();
      } else {
        setError(data.error || 'Failed to update lead status');
      }
    } catch (err) {
      setError('Communication error updating status');
    }
  };

  // Fetch followups for specific lead
  const loadFollowups = async (leadId) => {
    try {
      const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/sales/followup/${leadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setFollowupsList(data.followups);
      }
    } catch (err) {
      console.error('Failed to retrieve followups list', err);
    }
  };

  // Log a new followup notes entry
  const handleAddFollowup = async (e) => {
    e.preventDefault();
    if (!followupNotes || !nextFollowupDate) {
      setError('Notes and follow-up date are required');
      return;
    }

    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/sales/followup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          notes: followupNotes,
          followup_date: nextFollowupDate,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('Followup note logged and lead status set to Follow-up.');
        setFollowupNotes('');
        setNextFollowupDate('');
        setShowFollowupForm(false);
        loadFollowups(selectedLead.id);
        
        // Refresh selected lead state
        const refreshResp = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/sales', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rData = await refreshResp.json();
        if (refreshResp.ok) {
          const freshLead = rData.leads.find(l => l.id === selectedLead.id);
          setSelectedLead(freshLead);
          setLeads(rData.leads);
        }
      } else {
        setError(data.error || 'Failed to record followup');
      }
    } catch (err) {
      setError('Server logging error');
    }
  };

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    loadFollowups(lead.id);
    setShowQuotePreview(false);
    setShowFollowupForm(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'lead_entry': return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Lead Intake</span>;
      case 'follow_up': return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Follow-up</span>;
      case 'quotation_generated': return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Quote Active</span>;
      case 'closed_won': return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Closed Won</span>;
      case 'closed_lost': return <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Closed Lost</span>;
      default: return <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">{status}</span>;
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'justdial': return <span className="bg-purple-100 text-purple-800 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-200">JustDial API</span>;
      case 'manual': return <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-200">Casual Call</span>;
      default: return <span className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200 capitalize">{source}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Header View */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Sales & Leads Pipeline</h1>
          <p className="text-slate-500 text-sm">Review real-time JustDial lead webhooks and casual calls, issue quotations, and verify deals.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
        >
          {showAddForm ? 'Close Intake Form' : '+ Add Manual Lead'}
        </button>
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

      {/* Add Lead Form Block */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Log Casual/Manual Lead Entry</h2>
          <form onSubmit={handleAddLead} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Kumar"
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
                placeholder="9876543210"
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
                placeholder="ramesh@gmail.com"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Requirement Details</label>
              <input
                type="text"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Need AMC contract for 10 office desktop computers"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quoted Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assign to Sales Executive</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 capitalize"
              >
                <option value="">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name.replace('Employee: ', '')}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md"
              >
                Save Lead Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leads Table Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Leads Pipeline Register</h3>
            <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
              Webhooks active
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex-1 flex items-center justify-center">
              Fetching pipeline data...
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm flex-1 flex items-center justify-center">
              No leads recorded. Add manual lead or trigger JustDial webhook.
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/10 sticky top-0 bg-white">
                    <th className="py-3 px-5">Source</th>
                    <th className="py-3 px-5">Customer</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Total Billed</th>
                    <th className="py-3 px-5 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => openLeadDetails(lead)}
                      className={`hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer ${selectedLead?.id === lead.id ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="py-4 px-5">{getSourceBadge(lead.source)}</td>
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-800">{lead.customer_name}</p>
                        <p className="text-slate-400 text-[10px]">{lead.customer_phone}</p>
                      </td>
                      <td className="py-4 px-5">{getStatusBadge(lead.status)}</td>
                      <td className="py-4 px-5 font-semibold text-slate-800">₹{parseFloat(lead.total_amount).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-5 text-right">
                        <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Detailed Action Center */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col h-[600px] overflow-y-auto">
          {selectedLead ? (
            <div className="space-y-6">
              
              {/* Header profile info */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-800 capitalize">{selectedLead.customer_name}</h3>
                  {getSourceBadge(selectedLead.source)}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">📞 {selectedLead.customer_phone}</p>
                {selectedLead.customer_email && (
                  <p className="text-xs text-slate-400 mt-0.5">✉️ {selectedLead.customer_email}</p>
                )}
              </div>

              {/* Requirement Text */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Customer Requirement</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
                  {selectedLead.requirement || 'No details provided'}
                </p>
              </div>

              {/* Active Assigned Officer */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Executive Assigned</h4>
                <p className="text-xs font-semibold text-slate-700 capitalize">
                  👤 {selectedLead.assigned_name?.replace('Employee: ', '') || 'Unassigned Executive'}
                </p>
              </div>

              {/* Current Status Transitions panel */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Change Stage (Workflow)</h4>
                <div className="flex flex-wrap gap-2">
                  {['lead_entry', 'follow_up', 'quotation_generated', 'closed_won', 'closed_lost'].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStatusUpdate(selectedLead.id, stage)}
                      className={`text-[10px] px-2.5 py-1.5 rounded-md font-bold transition-all duration-150 border capitalize ${
                        selectedLead.status === stage
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {stage.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Next Followup banner (Required fields logic notice) */}
              {selectedLead.status === 'follow_up' && (
                <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-lg">
                  <p className="text-[10px] font-bold text-amber-800">🗓 Next Followup Scheduled:</p>
                  <p className="text-xs text-amber-700 mt-0.5 font-semibold">{formatDate(selectedLead.next_follow_up_date)}</p>
                </div>
              )}

              {/* Quotation generator block */}
              {selectedLead.status === 'quotation_generated' && (
                <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-700">Estimate Active: ₹{parseFloat(selectedLead.total_amount).toLocaleString('en-IN')}</p>
                    <button
                      onClick={() => setShowQuotePreview(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      View & Print PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Closed Won Payment Trigger Indicator */}
              {selectedLead.status === 'closed_won' && (
                <div className="p-4 border border-emerald-100 bg-emerald-50/40 rounded-xl text-center">
                  <p className="text-xs font-bold text-emerald-800">🎉 Deal Closed Won!</p>
                  <p className="text-[10px] text-emerald-600 mt-1">
                    ₹{parseFloat(selectedLead.total_amount).toLocaleString('en-IN')} has been sent to the Central Payment Hub for verification.
                  </p>
                </div>
              )}

              {/* Followups timeline */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Follow-up Ledger</h4>
                  <button
                    onClick={() => setShowFollowupForm(!showFollowupForm)}
                    className="text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    + Log Action
                  </button>
                </div>

                {showFollowupForm && (
                  <form onSubmit={handleAddFollowup} className="p-3 border border-slate-100 rounded-lg bg-slate-50 space-y-3 mb-4">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Action Notes</label>
                      <textarea
                        value={followupNotes}
                        onChange={(e) => setFollowupNotes(e.target.value)}
                        placeholder="Customer requested to call back on Thursday..."
                        required
                        rows="2"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Next Follow-up Date</label>
                      <input
                        type="datetime-local"
                        value={nextFollowupDate}
                        onChange={(e) => setNextFollowupDate(e.target.value)}
                        required
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-3 py-1 rounded text-[10px] font-bold"
                    >
                      Save Followup
                    </button>
                  </form>
                )}

                {followupsList.length === 0 ? (
                  <p className="text-slate-400 text-[10px] text-center py-4">No followups logged for this customer.</p>
                ) : (
                  <div className="space-y-3 mt-2">
                    {followupsList.map((f) => (
                      <div key={f.id} className="p-2.5 bg-slate-50 rounded border border-slate-100 text-[11px] leading-relaxed">
                        <p className="text-slate-700 font-medium">{f.notes}</p>
                        <div className="flex justify-between text-[9px] text-slate-400 mt-1.5 font-bold">
                          <span>By: {f.creator_name?.replace('Employee: ', '')}</span>
                          <span>Next: {formatDate(f.followup_date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>Select a lead from the register to show action center</span>
            </div>
          )}
        </div>

      </div>

      {/* PDF quotation preview modal */}
      {showQuotePreview && selectedLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 space-y-6 border border-slate-100 animate-fade-in relative">
            <button
              onClick={() => setShowQuotePreview(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕ Close
            </button>
            
            {/* Invoice Layout */}
            <div className="border-4 border-slate-800 p-6 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Tech IT World</h2>
                  <p className="text-xs text-slate-400 mt-1">Enterprise Networking & System AMC Contracts</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kolkata, West Bengal, India</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold text-blue-600">ESTIMATE / QUOTE</h3>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">QUOTE #: TQ-{selectedLead.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Customer address */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Prepared For:</h4>
                  <p className="font-bold text-slate-800 capitalize">{selectedLead.customer_name}</p>
                  <p className="text-slate-500 mt-0.5">📞 {selectedLead.customer_phone}</p>
                  {selectedLead.customer_email && <p className="text-slate-500">{selectedLead.customer_email}</p>}
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Validity:</h4>
                  <p className="text-slate-700 font-medium">Valid for 30 Days from date of issue</p>
                </div>
              </div>

              {/* Quote details */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-slate-400 text-[10px] uppercase font-bold">
                    <th className="py-2">Description of Services / Equipment</th>
                    <th className="py-2 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-700">
                      {selectedLead.requirement || 'Standard corporate systems service AMC contract'}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-800">
                      ₹{parseFloat(selectedLead.total_amount).toLocaleString('en-IN')}.00
                    </td>
                  </tr>
                  <tr className="font-bold text-slate-800 text-sm">
                    <td className="py-4 text-right pr-4">Total Quote Amount:</td>
                    <td className="py-4 text-right text-blue-600">
                      ₹{parseFloat(selectedLead.total_amount).toLocaleString('en-IN')}.00
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-slate-200 pt-4 text-[10px] text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-500">Terms & Conditions:</p>
                <p>1. Payments are due within 7 days of order confirmation/contract signing.</p>
                <p>2. Applicable taxes (GST) will be calculated additionally at the time of final invoice generation.</p>
              </div>
            </div>

            {/* Print Trigger */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow"
              >
                🖨 Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
