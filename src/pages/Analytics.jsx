import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Analytics() {
  const { token } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [engineerData, setEngineerData] = useState([]);
  const [financialTrend, setFinancialTrend] = useState([]);
  
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'engineer', 'financials'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Top KPI achievements
  const [kpis, setKpis] = useState({
    topSales: 'N/A',
    topTech: 'N/A',
    bestMonth: 'N/A',
    overallRate: '0%'
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const salesResp = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/analytics/sales', { headers });
      const salesVal = await salesResp.json();

      const engResp = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/analytics/engineer', { headers });
      const engVal = await engResp.json();

      const finResp = await fetch('https://saas-backend-wheat-gamma.vercel.app/api/analytics/financial-trend', { headers });
      const finVal = await finResp.json();

      if (salesResp.ok && engResp.ok && finResp.ok) {
        setSalesData(salesVal.salesPerformance);
        setEngineerData(engVal.engineerPerformance);
        setFinancialTrend(finVal.financialTrend);
        deriveKPIs(salesVal.salesPerformance, engVal.engineerPerformance, finVal.financialTrend);
      } else {
        setError('Failed to fetch analytics metrics');
      }
    } catch (err) {
      setError('Connection error to API server');
    } finally {
      setLoading(false);
    }
  };

  const deriveKPIs = (sales, eng, trend) => {
    let topS = 'N/A';
    let topT = 'N/A';
    let bestM = 'N/A';
    let totalL = 0;
    let totalC = 0;

    // Derive top sales executive
    if (sales.length > 0) {
      const bestExec = sales.reduce((prev, current) => 
        (parseFloat(prev.total_sales_value) > parseFloat(current.total_sales_value)) ? prev : current
      );
      if (parseFloat(bestExec.total_sales_value) > 0) {
        topS = `${bestExec.executive_name.replace('Employee: ', '')} (₹${parseFloat(bestExec.total_sales_value).toLocaleString('en-IN')})`;
      }

      sales.forEach((e) => {
        totalL += parseInt(e.leads_assigned);
        totalC += parseInt(e.leads_closed_won);
      });
    }

    // Derive top rated technician
    if (eng.length > 0) {
      const solvedTechs = eng.filter(t => parseInt(t.tickets_solved) > 0);
      if (solvedTechs.length > 0) {
        const bestTech = solvedTechs.reduce((prev, current) => 
          (parseFloat(prev.average_rating) > parseFloat(current.average_rating)) ? prev : current
        );
        topT = `${bestTech.engineer_name.replace('Employee: ', '')} (${bestTech.average_rating} ★)`;
      }
    }

    // Derive best revenue month
    if (trend.length > 0) {
      const bestMth = trend.reduce((prev, current) => 
        (parseFloat(prev.revenue) > parseFloat(current.revenue)) ? prev : current
      );
      if (parseFloat(bestMth.revenue) > 0) {
        bestM = `${bestMth.month_label} (₹${parseFloat(bestMth.revenue).toLocaleString('en-IN')})`;
      }
    }

    const conversionRate = totalL === 0 ? '0%' : `${Math.round((totalC / totalL) * 100)}%`;

    setKpis({
      topSales: topS,
      topTech: topT,
      bestMonth: bestM,
      overallRate: conversionRate
    });
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Performance Analytics</h1>
          <p className="text-slate-500 text-sm">Review conversion rates, field engineer ticket metrics, and monthly profit summaries.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all duration-200"
        >
          🔄 Refresh Metrics
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-150">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Sales Executive</span>
            <p className="text-sm font-bold text-slate-700 mt-2 truncate capitalize">{kpis.topSales}</p>
          </div>
          <span className="text-[9px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded self-start mt-4">Highest Revenue</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-150">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Rated Field Engineer</span>
            <p className="text-sm font-bold text-slate-700 mt-2 truncate capitalize">{kpis.topTech}</p>
          </div>
          <span className="text-[9px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded self-start mt-4">Client Satisfaction</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-150">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Revenue Month</span>
            <p className="text-sm font-bold text-slate-700 mt-2 truncate">{kpis.bestMonth}</p>
          </div>
          <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded self-start mt-4">Revenue Spike</span>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Lead Conversion</span>
            <h3 className="text-2xl font-black text-white mt-1">{kpis.overallRate}</h3>
          </div>
          <span className="text-[9px] text-blue-400 font-bold block mt-4">Leads Closed Won / Total Leads</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 ${
              activeTab === 'sales'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Sales Executives Performance
          </button>
          <button
            onClick={() => setActiveTab('engineer')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 ${
              activeTab === 'engineer'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Technicians SLA & Ratings
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all duration-150 ${
              activeTab === 'financials'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Monthly Cash Summaries
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Calculating operational metrics...
            </div>
          ) : (
            <>
              {/* Tab 1: Sales Performance */}
              {activeTab === 'sales' && (
                salesData.length === 0 ? (
                  <p className="p-12 text-center text-slate-400 text-xs font-semibold">No sales executives logged in pipeline.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                        <th className="py-4 px-6">Sales Executive</th>
                        <th className="py-4 px-6">Leads Assigned</th>
                        <th className="py-4 px-6">Deals Won</th>
                        <th className="py-4 px-6">Conversion Rate</th>
                        <th className="py-4 px-6 text-right">Total Revenue Booked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {salesData.map((s) => (
                        <tr key={s.user_id} className="hover:bg-slate-50/30 transition-all duration-150">
                          <td className="py-4 px-6 font-bold text-slate-800 capitalize">
                            {s.executive_name.replace('Employee: ', '')}
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-semibold">{s.leads_assigned}</td>
                          <td className="py-4 px-6 text-slate-500 font-semibold">{s.leads_closed_won}</td>
                          <td className="py-4 px-6 font-bold text-blue-600">{s.conversion_rate}%</td>
                          <td className="py-4 px-6 text-right font-bold text-slate-800">
                            ₹{parseFloat(s.total_sales_value).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* Tab 2: Engineer Ratings */}
              {activeTab === 'engineer' && (
                engineerData.length === 0 ? (
                  <p className="p-12 text-center text-slate-400 text-xs font-semibold">No field engineers registered.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                        <th className="py-4 px-6">Field Technician</th>
                        <th className="py-4 px-6">Tickets Dispatched</th>
                        <th className="py-4 px-6">Solved (SLA)</th>
                        <th className="py-4 px-6">Pending</th>
                        <th className="py-4 px-6 text-right">Customer Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {engineerData.map((e) => (
                        <tr key={e.user_id} className="hover:bg-slate-50/30 transition-all duration-150">
                          <td className="py-4 px-6 font-bold text-slate-800 capitalize">
                            {e.engineer_name.replace('Employee: ', '')}
                          </td>
                          <td className="py-4 px-6 text-slate-500 font-semibold">{e.tickets_assigned}</td>
                          <td className="py-4 px-6 text-emerald-600 font-bold">{e.tickets_solved}</td>
                          <td className="py-4 px-6 text-amber-600 font-semibold">{e.tickets_pending}</td>
                          <td className="py-4 px-6 text-right text-amber-500 font-bold text-sm">
                            {parseFloat(e.average_rating) > 0 ? (
                              <>
                                <span className="mr-1">{e.average_rating}</span>
                                <span>★</span>
                              </>
                            ) : (
                              <span className="text-slate-300 font-medium text-xs">No Ratings</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {/* Tab 3: Monthly Financial margins */}
              {activeTab === 'financials' && (
                financialTrend.length === 0 ? (
                  <p className="p-12 text-center text-slate-400 text-xs font-semibold">No financial records settled to graph.</p>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/20">
                        <th className="py-4 px-6">Billing Period</th>
                        <th className="py-4 px-6">Total Settled Revenue</th>
                        <th className="py-4 px-6">Job Expenses</th>
                        <th className="py-4 px-6 text-right">Net Profit Margins</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {financialTrend.map((f) => {
                        const netProfit = parseFloat(f.net_profit);
                        return (
                          <tr key={f.month_label} className="hover:bg-slate-50/30 transition-all duration-150">
                            <td className="py-4 px-6 font-bold text-slate-800">{f.month_label}</td>
                            <td className="py-4 px-6 font-bold text-emerald-600">₹{parseFloat(f.revenue).toLocaleString('en-IN')}</td>
                            <td className="py-4 px-6 font-bold text-rose-500">₹{parseFloat(f.expenses).toLocaleString('en-IN')}</td>
                            <td className="py-4 px-6 text-right font-black text-slate-900 text-sm">
                              <span className={`px-2.5 py-1 rounded-lg ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                                ₹{netProfit.toLocaleString('en-IN')}
                              </span>
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
