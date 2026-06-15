import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RMA() {
  const { token } = useAuth();
  const [rmas, setRmas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Panels & Inputs State
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRma, setSelectedRma] = useState(null);
  const [whatsappLog, setWhatsappLog] = useState(null);

  // Manual Intake Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [warrantyStatus, setWarrantyStatus] = useState('in_warranty');

  // Estimate & Brand Charge Action States
  const [estimateAmount, setEstimateAmount] = useState('');
  const [brandCharge, setBrandCharge] = useState('');
  const [challanUrl, setChallanUrl] = useState('');

  // Fetch all RMAs
  const fetchRmas = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/rma', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRmas(data.rmas);
      } else {
        setError(data.error || 'Failed to fetch RMA register');
      }
    } catch (err) {
      setError('Connection failure to API server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRmas();
  }, [token]);

  // Handle product intake submit
  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setWhatsappLog(null);

    try {
      const response = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/rma', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail,
          product_name: productName,
          brand,
          serial_number: serialNumber,
          issue_description: issueDescription,
          warranty_status: warrantyStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`RMA intake registered successfully for ${productName}`);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setProductName('');
        setBrand('');
        setSerialNumber('');
        setIssueDescription('');
        setWarrantyStatus('in_warranty');
        setShowAddForm(false);
        fetchRmas();
      } else {
        setError(data.error || 'Failed to file RMA intake');
      }
    } catch (err) {
      setError('Server connection error during intake');
    }
  };

  // Perform workflow state transitions
  const handleStatusTransition = async (rmaId, newStatus, extraData = {}) => {
    setError(null);
    setSuccessMsg(null);
    setWhatsappLog(null);

    // Out-of-Warranty estimate requirements check
    if (newStatus === 'waiting_for_approval' && !estimateAmount) {
      setError("Mandatory 'Estimate Repair Cost' is required for Out-of-Warranty products before customer review.");
      return;
    }

    try {
      const payload = {
        status: newStatus,
        estimate_amount: parseFloat(estimateAmount) || undefined,
        brand_charge: parseFloat(brandCharge) || undefined,
        challan_pdf_url: challanUrl || undefined,
        ...extraData
      };

      const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/rma/${rmaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`RMA ticket moved to '${newStatus.replace(/_/g, ' ')}'`);
        setWhatsappLog(`Sent WhatsApp notification to customer at +${data.ticket.customer_phone} informing them of stage change: '${newStatus.replace(/_/g, ' ')}'`);
        setSelectedRma(data.ticket);
        setEstimateAmount('');
        setBrandCharge('');
        setChallanUrl('');
        fetchRmas();
      } else {
        setError(data.error || 'Failed to update RMA status');
      }
    } catch (err) {
      setError('Failed to reach server for RMA status change');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'received': return <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-slate-200">Product Received</span>;
      case 'sent_to_brand_center': return <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-blue-100">At Brand Center</span>;
      case 'waiting_for_approval': return <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-amber-100">Estimate Pending</span>;
      case 'approved': return <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-indigo-100">Repair Approved</span>;
      case 'rejected': return <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-rose-100">Estimate Rejected</span>;
      case 'ready': return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-emerald-100">Ready</span>;
      case 'delivered': return <span className="bg-slate-900 text-slate-100 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-slate-800">Delivered</span>;
      default: return <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">{status}</span>;
    }
  };

  const getWarrantyBadge = (wStatus) => {
    return wStatus === 'in_warranty'
      ? <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200">In-Warranty</span>
      : <span className="bg-rose-50 text-rose-800 text-[9px] font-bold px-2 py-0.5 rounded border border-rose-200">Out-Of-Warranty</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Header view */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Repair & RMA (Brand Center Tracking)</h1>
          <p className="text-slate-500 text-sm">Track diagnostic challans sent to brand centers, process customer approvals, and verify warranties.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
        >
          {showAddForm ? 'Close Intake Form' : '+ Receive Product (New Challan)'}
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

      {/* Intake intake Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Device Intake Form (Product Received)</h2>
          <form onSubmit={handleIntakeSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Product Info */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Inspiron 15 Laptop"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Dell"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Serial / Tag Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="DELL-99827-X"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              {/* Client Info */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Sanjay Roy"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Phone (WhatsApp)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9830012345"
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Warranty Status</label>
                <select
                  value={warrantyStatus}
                  onChange={(e) => setWarrantyStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 font-semibold text-slate-700"
                >
                  <option value="in_warranty">✓ In Warranty (Free Repair)</option>
                  <option value="out_of_warranty">⚠ Out of Warranty (Billable Estimate)</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue / Symptoms Description</label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Display flashes twice on boot then turns completely black. External HDMI out is working."
                  required
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
                />
              </div>

            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md"
              >
                Log Intake & Send WhatsApp Received Alert
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Operations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Intakes Table Register */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Product RMA Intake Desk</h3>
            <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">
              Live status mapping
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm flex-1 flex items-center justify-center">
              Fetching RMA database...
            </div>
          ) : rmas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm flex-1 flex items-center justify-center">
              No items received for RMA repairs.
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/10 sticky top-0 bg-white">
                    <th className="py-3 px-5">Device</th>
                    <th className="py-3 px-5">Warranty</th>
                    <th className="py-3 px-5">Current Step</th>
                    <th className="py-3 px-5">Estimate Cost</th>
                    <th className="py-3 px-5 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {rmas.map((rma) => (
                    <tr
                      key={rma.id}
                      onClick={() => setSelectedRma(rma)}
                      className={`hover:bg-slate-50/50 transition-colors duration-150 cursor-pointer ${selectedRma?.id === rma.id ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="py-4 px-5">
                        <p className="font-bold text-slate-800 capitalize">{rma.brand} {rma.product_name}</p>
                        <p className="text-slate-400 text-[10px]">Serial: {rma.serial_number}</p>
                      </td>
                      <td className="py-4 px-5">{getWarrantyBadge(rma.warranty_status)}</td>
                      <td className="py-4 px-5">{getStatusBadge(rma.status)}</td>
                      <td className="py-4 px-5 font-bold text-slate-800">
                        {rma.warranty_status === 'in_warranty' ? '₹0.00 (In-War)' : `₹${parseFloat(rma.estimate_amount).toLocaleString('en-IN')}`}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded hover:bg-blue-100">
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed RMA Action Panel */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col h-[600px] overflow-y-auto">
          {selectedRma ? (
            <div className="space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-800 capitalize">{selectedRma.brand} {selectedRma.product_name}</h3>
                  {getWarrantyBadge(selectedRma.warranty_status)}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">🏷 Serial Number: {selectedRma.serial_number}</p>
                <p className="text-xs text-slate-400 mt-0.5">👤 Client: {selectedRma.customer_name} (📞 {selectedRma.customer_phone})</p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnosis Notes</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed font-medium">
                  "{selectedRma.issue_description}"
                </p>
              </div>

              {/* Status Indicator banner */}
              <div className="flex justify-between items-center py-2.5 px-3 bg-slate-50 rounded-lg">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Step</span>
                {getStatusBadge(selectedRma.status)}
              </div>

              {/* Active Step Actions workflow block */}
              <div className="border border-slate-100 rounded-xl p-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-700">Repair Workflow Actions</h4>

                {/* Step 1: Move from Received to Dispatch to Brand Center */}
                {selectedRma.status === 'received' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-semibold">Ready to dispatch device to factory repair center?</p>
                    <input
                      type="text"
                      value={challanUrl}
                      onChange={(e) => setChallanUrl(e.target.value)}
                      placeholder="Enter Challan Document URL (Optional)"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-50"
                    />
                    <button
                      onClick={() => handleStatusTransition(selectedRma.id, 'sent_to_brand_center')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-[10px] font-bold shadow-sm"
                    >
                      Dispatch to Brand Center
                    </button>
                  </div>
                )}

                {/* Step 2: At brand center. Next stage checks warranty logic */}
                {selectedRma.status === 'sent_to_brand_center' && (
                  <div className="space-y-3">
                    {selectedRma.warranty_status === 'in_warranty' ? (
                      <>
                        <p className="text-[10px] text-slate-500 font-medium">In-Warranty repairs will be processed for free. Set ready when repaired.</p>
                        <button
                          onClick={() => handleStatusTransition(selectedRma.id, 'ready', { estimate_amount: 0.00 })}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-[10px] font-bold"
                        >
                          Mark Repair Completed (Ready)
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] text-rose-500 font-semibold">Out-of-Warranty: Estimate billing is required.</p>
                        <div className="space-y-2">
                          <input
                            type="number"
                            value={estimateAmount}
                            onChange={(e) => setEstimateAmount(e.target.value)}
                            placeholder="Enter Customer Estimate (₹)"
                            required
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-50"
                          />
                          <button
                            onClick={() => handleStatusTransition(selectedRma.id, 'waiting_for_approval')}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded text-[10px] font-bold"
                          >
                            Dispatch Estimate (WhatsApp Approval request)
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 3: Waiting Customer approval (Out of warranty only) */}
                {selectedRma.status === 'waiting_for_approval' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-amber-600 font-bold">Estimate of ₹{parseFloat(selectedRma.estimate_amount).toLocaleString('en-IN')} is pending client approval.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusTransition(selectedRma.id, 'approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-[10px] font-bold"
                      >
                        ✓ Customer Approved
                      </button>
                      <button
                        onClick={() => handleStatusTransition(selectedRma.id, 'rejected', { estimate_amount: 0.00 })}
                        className="bg-rose-600 hover:bg-rose-700 text-white py-2 rounded text-[10px] font-bold"
                      >
                        ✕ Rejected (Return Unpaid)
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Approved Out of warranty. Set ready and log brand charges */}
                {selectedRma.status === 'approved' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-indigo-600 font-semibold">Estimate approved. Register brand repairs charges (job expenses) if any, and set Ready.</p>
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={brandCharge}
                        onChange={(e) => setBrandCharge(e.target.value)}
                        placeholder="Enter Brand Repair Charge (Job Expense) if any (₹)"
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-50"
                      />
                      <button
                        onClick={() => handleStatusTransition(selectedRma.id, 'ready')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-[10px] font-bold"
                      >
                        Complete Repair (Set Ready)
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Repaired / Ready. Mark Delivered */}
                {selectedRma.status === 'ready' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 font-medium">Device is repaired. Complete delivery handover.</p>
                    <button
                      onClick={() => handleStatusTransition(selectedRma.id, 'delivered')}
                      className="w-full bg-slate-900 hover:bg-slate-850 text-white py-2 rounded text-[10px] font-bold"
                    >
                      Deliver Device to Customer
                    </button>
                  </div>
                )}

                {/* Step 6: Rejected Out of warranty. Mark returned/delivered without repair */}
                {selectedRma.status === 'rejected' && (
                  <div className="space-y-3">
                    <p className="text-[10px] text-rose-500 font-semibold">Estimate was rejected. Return unrepaired device to customer.</p>
                    <button
                      onClick={() => handleStatusTransition(selectedRma.id, 'delivered')}
                      className="w-full bg-slate-900 hover:bg-slate-850 text-white py-2 rounded text-[10px] font-bold"
                    >
                      Return Device (Mark Delivered)
                    </button>
                  </div>
                )}

                {/* Delivered state finished */}
                {selectedRma.status === 'delivered' && (
                  <div className="text-center p-2 text-[10px] text-slate-400 font-bold bg-slate-50 rounded">
                    ✓ RMA Ticket lifecycle is closed.
                  </div>
                )}

              </div>

              {/* Whatsapp log dispatch tracking */}
              {whatsappLog && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-800">
                  📡 {whatsappLog}
                </div>
              )}

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
              <svg className="w-12 h-12 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Select an intake challan to view detailed status and actions</span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
