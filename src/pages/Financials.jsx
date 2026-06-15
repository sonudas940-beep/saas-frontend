import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Financials() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [profitLedger, setProfitLedger] = useState([]);
  const [activeTab, setActiveTab] = useState('payments'); // 'payments', 'expenses', 'profits'
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [whatsappLog, setWhatsappLog] = useState(null);

  // Financial aggregation totals
  const [totals, setTotals] = useState({
    collected: 0,
    pending: 0,
    expenses: 0,
    netProfit: 0
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch payments
      const payResp = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/finance/payments', { headers });
      const payData = await payResp.json();

      // 2. Fetch expenses
      const expResp = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/finance/expenses', { headers });
      const expData = await expResp.json();

      // 3. Fetch profits ledger
      const profResp = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/finance/profit-ledger', { headers });
      const profData = await profResp.json();

      if (payResp.ok && expResp.ok && profResp.ok) {
        setPayments(payData.payments);
        setExpenses(expData.expenses);
        setProfitLedger(profData.netProfitList);
        calculateSummary(payData.payments, expData.expenses);
      } else {
        setError('Failed to fetch data registers');
      }
    } catch (err) {
      setError('Connection error to API server');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (payList, expList) => {
    let collectedSum = 0;
    let pendingSum = 0;
    let expSum = 0;

    payList.forEach((p) => {
      const amt = parseFloat(p.amount) || 0;
      if (p.status === 'settled') {
        collectedSum += amt;
      } else {
        pendingSum += amt;
      }
    });

    expList.forEach((e) => {
      expSum += parseFloat(e.amount) || 0;
    });

    setTotals({
      collected: collectedSum,
      pending: pendingSum,
      expenses: expSum,
      netProfit: collectedSum - expSum
    });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Cashier action: Settle collection and trigger WhatsApp PDF Receipt Hook
  const handleVerifyCollection = async (paymentId, customerName) => {
    setError(null);
    setSuccessMsg(null);
    setWhatsappLog(null);

    try {
      const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/finance/payments/${paymentId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Collection for ${customerName} verified and settled successfully`);
        setWhatsappLog(`Auto-dispatched PDF receipt to customer via WhatsApp API.`);
        fetchData();
      } else {
        setError(data.error || 'Failed to verify payment');
      }
    } catch (err) {
      setError('Failed to connect to API server');
    }
  };

  const getStatusBadge = (status) => {
    return status === 'settled'
      ? <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-emerald-200">✓ Settle Verified</span>
      : <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-amber-200 animate-pulse">⚡ Pending cashier</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Central Payment Hub</h1>
          <p className="text-slate-500 text-sm">Verify field engineer cash collections, check ticket expenses, and review net profits per job.</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
        >
          🔄 Refresh Ledger
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

      {whatsappLog && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-semibold">
          📡 WhatsApp Service: {whatsappLog}
        </div>
      )}

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-150">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settled Collections</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">₹{totals.collected.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-emerald-500 font-bold block mt-2">Verified in vault</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-150">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Cash Verification</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">₹{totals.pending.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-400 block mt-2">Requires Cashier approval</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-150">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ticket Expenses</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">₹{totals.expenses.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-400 block mt-2">Cables, parts & brand charges</span>
        </div>

        <div className="bg-[#0f172a] p-6 rounded-xl shadow-lg border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Net Profit</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">₹{totals.netProfit.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-blue-400 font-bold block mt-2">[Settled] - [Expenses]</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Payments & Collections
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 ${
              activeTab === 'expenses'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Ticket Expenses
          </button>
          <button
            onClick={() => setActiveTab('profits')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 ${
              activeTab === 'profits'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Net Profit Analyzer
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Syncing ledger database...
            </div>
          ) : (
            <>
              {/* Tab 1: Payments Register */}
              {activeTab === 'payments' && (
                payments.length === 0 ? (
                  <p className="p-12 text-center text-slate-400 text-xs font-semibold">No payment collections found in pipeline.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Billed Amount</th>
                        <th className="py-4 px-6">Source Module</th>
                        <th className="py-4 px-6">Current Status</th>
                        <th className="py-4 px-6 text-right">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/30 transition-all duration-150">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-800 capitalize">{p.customer_name}</p>
                            <p className="text-[10px] text-slate-400">Ref: #{p.id.slice(0, 8).toUpperCase()}</p>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800">₹{parseFloat(p.amount).toLocaleString('en-IN')}</td>
                          <td className="py-4 px-6 font-medium text-slate-500">{p.source_label}</td>
                          <td className="py-4 px-6">{getStatusBadge(p.status)}</td>
                          <td className="py-4 px-6 text-right">
                            {p.status === 'pending_verification' ? (
                              <button
                                onClick={() => handleVerifyCollection(p.id, p.customer_name)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-sm"
                              >
                                Approve Receipt
                              </button>
                            ) : (
                              <a
                                href={p.receipt_pdf_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold px-3 py-2 rounded-lg inline-block text-[10px]"
                              >
                                📄 Receipt PDF
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* Tab 2: Expenses List */}
              {activeTab === 'expenses' && (
                expenses.length === 0 ? (
                  <p className="p-12 text-center text-slate-400 text-xs font-semibold">No ticket-based job expenses registered.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                        <th className="py-4 px-6">Description</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Logged From</th>
                        <th className="py-4 px-6">Created Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {expenses.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/30 transition-all duration-150">
                          <td className="py-4 px-6 font-semibold text-slate-800 capitalize">{e.description}</td>
                          <td className="py-4 px-6 font-bold text-rose-600">₹{parseFloat(e.amount).toLocaleString('en-IN')}</td>
                          <td className="py-4 px-6 text-slate-500 font-medium">{e.source_label}</td>
                          <td className="py-4 px-6 text-slate-400 font-semibold">{formatDate(e.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* Tab 3: Net Profit Analyzer (Calculated dynamically per ticket) */}
              {activeTab === 'profits' && (
                profitLedger.length === 0 ? (
                  <p className="p-12 text-center text-slate-400 text-xs font-semibold">No closed jobs in database to calculate profits.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                        <th className="py-4 px-6">Ticket/Client</th>
                        <th className="py-4 px-6">Device Details</th>
                        <th className="py-4 px-6">Total Billed</th>
                        <th className="py-4 px-6">Job Expenses</th>
                        <th className="py-4 px-6 text-right">Net Profit Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {profitLedger.map((p) => {
                        const netProfit = parseFloat(p.net_profit);
                        return (
                          <tr key={p.ticket_id} className="hover:bg-slate-50/30 transition-all duration-150">
                            <td className="py-4 px-6">
                              <p className="font-bold text-slate-800 capitalize">{p.customer_name}</p>
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Module: {p.module}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-500 font-medium truncate max-w-[200px]">{p.details}</td>
                            <td className="py-4 px-6 font-semibold text-slate-800">₹{parseFloat(p.total_billed).toLocaleString('en-IN')}</td>
                            <td className="py-4 px-6 font-semibold text-rose-500">₹{parseFloat(p.job_expenses).toLocaleString('en-IN')}</td>
                            <td className="py-4 px-6 text-right font-black text-emerald-600 text-sm">
                              ₹{netProfit.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )
              )}

            </>
          )}

        </div>
      </div>

    </div>
  );
}
