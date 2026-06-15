import React, { useState, useEffect, useRef } from 'react';

export default function EngineerSmartLinkView({ token }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Field Engineer form states
  const [status, setStatus] = useState('solved');
  const [rating, setRating] = useState(5);
  const [amountBilled, setAmountBilled] = useState('');
  const [jobExpense, setJobExpense] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [signatureText, setSignatureText] = useState('');

  // Signature Canvas Ref
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Fetch ticket details via public token
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/service/public/token/${token}`);
        const data = await response.json();
        if (response.ok) {
          setTicket(data.ticket);
          setAmountBilled(data.ticket.amount_billed || '');
          setJobExpense(data.ticket.job_expense || '');
        } else {
          setError(data.error || 'Invalid or expired job link');
        }
      } catch (err) {
        setError('Server communication failure');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [token]);

  // Canvas drawing functions for signature capture
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // Slate 900
    
    // Get mouse/touch coordinates
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let signatureDataUrl = '';
    const canvas = canvasRef.current;
    if (canvas) {
      signatureDataUrl = canvas.toDataURL(); // Converts canvas drawing to base64 image string
    }

    try {
      const response = await fetch(`https://saas-backend-wheat-gamma.vercel.app/api/service/public/token/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          customer_signature_url: signatureDataUrl || signatureText || 'Signed electronically',
          customer_rating: parseInt(rating, 10),
          job_expense: parseFloat(jobExpense) || 0.00,
          amount_billed: parseFloat(amountBilled) || 0.00,
          expense_description: expenseDesc
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit updates');
      }
    } catch (err) {
      setError('Failed to submit updates. Verify server is running.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-500 text-sm font-semibold animate-pulse">Loading Job Ticket details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-4">
          ✕
        </div>
        <h2 className="text-lg font-bold text-slate-800">Access Error</h2>
        <p className="text-slate-500 text-xs mt-1 max-w-xs">{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-sm">
          ✓
        </div>
        <h2 className="text-xl font-bold text-slate-800">Job Updates Registered</h2>
        <p className="text-slate-500 text-xs mt-2 max-w-xs">
          The ticket state has been synced live with the office. Cash collection and job expenses are dispatched to the Cashier.
        </p>
        <span className="text-[10px] bg-slate-200/50 text-slate-600 px-3 py-1 rounded-full font-bold mt-6">
          You can safely close this browser window.
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 flex justify-center items-start">
      <div className="w-full max-w-lg bg-white rounded-xl border border-slate-100 shadow-xl p-6 space-y-6">
        
        {/* Brand header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Field Service Portal</h2>
            <h1 className="text-xl font-extrabold text-slate-800 mt-0.5">Tech IT World Jobs</h1>
          </div>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
            Active Job
          </span>
        </div>

        {/* Customer Ticket Context info card */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 shadow-inner">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Customer Client</span>
            <p className="font-bold text-sm capitalize">{ticket.customer_name}</p>
            <p className="text-[10px] text-slate-300 font-medium">📞 {ticket.customer_phone}</p>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Device Model Details</span>
            <p className="text-xs text-slate-200 font-semibold">{ticket.device_details}</p>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Issue Description</span>
            <p className="text-xs text-slate-300 leading-relaxed italic">"{ticket.issue_description}"</p>
          </div>
        </div>

        {/* Action input update form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('solved')}
                className={`py-2.5 rounded-lg text-xs font-bold border ${
                  status === 'solved'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ✓ Job Solved
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2.5 rounded-lg text-xs font-bold border ${
                  status === 'pending'
                    ? 'bg-amber-500 border-amber-500 text-white shadow'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ⚠ Still Pending
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount Billed (₹)</label>
              <input
                type="number"
                value={amountBilled}
                onChange={(e) => setAmountBilled(e.target.value)}
                placeholder="2500"
                required
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Job Expense (₹)</label>
              <input
                type="number"
                value={jobExpense}
                onChange={(e) => setJobExpense(e.target.value)}
                placeholder="450"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense Description</label>
            <input
              type="text"
              value={expenseDesc}
              onChange={(e) => setExpenseDesc(e.target.value)}
              placeholder="CAT6 Network cables replaced (15 meters)"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Rating</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-xl focus:outline-none transition-transform duration-100 active:scale-125 ${
                    rating >= star ? 'text-amber-400' : 'text-slate-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Signature Capture Area */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
              <span>Customer Signature Drawing</span>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-[10px] text-rose-500 font-bold hover:underline"
              >
                Clear Drawing
              </button>
            </label>
            
            <canvas
              ref={canvasRef}
              width={350}
              height={120}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full border border-slate-200 bg-slate-50 rounded-lg cursor-crosshair touch-none h-[120px]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-sm font-bold shadow-lg mt-4 active:scale-[0.99] transition-transform duration-150"
          >
            Submit Report & Settle
          </button>

        </form>
      </div>
    </div>
  );
}
