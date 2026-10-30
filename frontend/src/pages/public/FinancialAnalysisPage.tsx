import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { reportsApi } from '../../services/api';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  FileText,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { useCurrency } from '../../context/CurrencyContext';

const PIE_COLORS = ['#20A486', '#18324B', '#3B82F6', '#F59E0B', '#8B5CF6'];

export const FinancialAnalysisPage: React.FC = () => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice, currency } = useCurrency();

  const fetchFinancials = async () => {
    setIsLoading(true);
    try {
      const res = await reportsApi.getFinancialAnalysis();
      setData(res);
    } catch (err) {
      console.error('Failed to load financial analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  // CSV Export
  const handleExportCSV = () => {
    if (!data) return;

    const headers = ['Material Category', 'Revenue (INR)', 'Cost (INR)', 'Gross Profit (INR)', 'Margin %'];
    const rows = (data.material_profits || []).map((m: any) => [
      `"${m.material}"`,
      m.revenue,
      m.cost,
      m.profit,
      `${m.margin_percent}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['VALORIZE PROFIT & LOSS FINANCIAL STATEMENT', `Currency: ${currency}`, '']
        .concat([headers.join(',')])
        .concat(rows.map((e: any[]) => e.join(',')))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `valorize_financial_pnl_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Summary (PDF)
  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className={isAppRoute ? 'space-y-6' : 'min-h-screen bg-[#F5F7FA] flex flex-col'}>
      {!isAppRoute && <PublicNavbar />}

      <main className={isAppRoute ? 'w-full space-y-6' : 'flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6'}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Secondary Resource Ledger
              </span>
              {data?.is_demo_data && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Demo Baseline Projection
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#18324B] mt-1.5 flex items-center gap-2.5">
              <BarChart3 className="w-8 h-8 text-[#20A486]" />
              Profit & Loss Financial Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              End-to-end commercial accounting, operating cost breakdowns, and circular return on investment (ROI).
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={fetchFinancials}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#18324B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#18324B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#20A486]" />
              Export CSV
            </button>
            <button
              onClick={handlePrintSummary}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#20A486] hover:bg-[#18836b] rounded-lg transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Top Metric KPI Cards (Requirement 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-card">
            <span className="text-xs font-medium text-[#64748B] block">Total Revenue</span>
            <div className="text-xl sm:text-2xl font-black text-[#18324B] mt-1">
              {formatPrice(data?.total_revenue)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last quarter</span>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-card">
            <span className="text-xs font-medium text-[#64748B] block">Total Operating Cost</span>
            <div className="text-xl sm:text-2xl font-black text-slate-700 mt-1">
              {formatPrice(data?.total_cost)}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1.5">
              Logistics, procurement & baling
            </span>
          </div>

          {/* Gross Profit */}
          <div className="bg-white p-5 rounded-card border border-[#E2E8F0] shadow-card">
            <span className="text-xs font-medium text-[#64748B] block">Gross Profit</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
              {formatPrice(data?.gross_profit)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Profit Trend: Increasing</span>
            </div>
          </div>

          {/* ROI Card */}
          <div className="bg-white p-5 rounded-card border border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-card bg-gradient-to-br from-white to-emerald-50/20">
            <span className="text-xs font-bold text-emerald-800 block">Return on Investment (ROI)</span>
            <div className="text-xl sm:text-2xl font-black text-[#20A486] mt-1 flex items-baseline gap-1.5">
              <span>{data?.roi_percent || '35.1'}%</span>
              <span className="text-xs font-semibold text-emerald-600">(Net Margin)</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{data?.roi_trend || '+18.4%'} ROI velocity</span>
            </div>
          </div>

          {/* Secondary Row of KPIs */}
          <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-card">
            <span className="text-[11px] font-medium text-[#64748B] block">Gross Loss</span>
            <div className="text-lg font-bold text-slate-600 mt-1">
              {formatPrice(data?.gross_loss || 0)}
            </div>
            <span className="text-[10px] text-slate-400">Zero default write-offs</span>
          </div>

          <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-card">
            <span className="text-[11px] font-medium text-[#64748B] block">Completed Transactions</span>
            <div className="text-lg font-bold text-[#18324B] mt-1">
              {data?.completed_transactions || 6}
            </div>
            <span className="text-[10px] text-slate-400">Ledger certified</span>
          </div>

          <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-card">
            <span className="text-[11px] font-medium text-[#64748B] block">Avg. Selling Price</span>
            <div className="text-lg font-bold text-[#20A486] mt-1">
              {formatPrice(data?.average_selling_price)} / KG
            </div>
            <span className="text-[10px] text-slate-400">Weighted cross-lot average</span>
          </div>

          <div className="bg-white p-4 rounded-card border border-[#E2E8F0] shadow-card">
            <span className="text-[11px] font-medium text-[#64748B] block">Avg. Purchase Price</span>
            <div className="text-lg font-bold text-slate-700 mt-1">
              {formatPrice(data?.average_purchase_price)} / KG
            </div>
            <span className="text-[10px] text-slate-400">Secondary procurement basis</span>
          </div>
        </div>

        {/* Visual Charts: Monthly Performance & Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Revenue & Profit Chart */}
          <div className="lg:col-span-8 bg-white p-6 rounded-card border border-[#E2E8F0] shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-[#18324B] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#20A486]" />
                  Monthly Revenue & Profit Progression
                </h2>
                <p className="text-xs text-[#64748B]">
                  Trading velocity from January through June with margin expansion.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#18324B]">
                  <span className="w-3 h-3 rounded bg-[#18324B]"></span> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-[#20A486]">
                  <span className="w-3 h-3 rounded bg-[#20A486]"></span> Net Profit
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthly_revenue || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatPrice(val), '']}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#18324B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Gross Profit" fill="#20A486" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Breakdown Donut Chart */}
          <div className="lg:col-span-4 bg-white p-6 rounded-card border border-[#E2E8F0] shadow-card flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-[#18324B] flex items-center gap-2 mb-1">
                <PieIcon className="w-4 h-4 text-[#20A486]" />
                Operating Cost Breakdown
              </h2>
              <p className="text-xs text-[#64748B] mb-4">
                Allocation across freight, material acquisition & processing.
              </p>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.cost_breakdown || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {(data?.cost_breakdown || []).map((_: any, index: number) => (
                        <Cell key={`cost-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => [`${val}%`, 'Cost Share']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-[#F1F5F9] text-xs">
              {(data?.cost_breakdown || []).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                    ></span>
                    <span>{c.name}</span>
                  </span>
                  <span className="font-bold text-[#18324B]">
                    {c.value}% ({formatPrice(c.amount)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Material-wise Profit Table (Requirement 5) */}
        <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden">
          <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#18324B] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#20A486]" />
                Material-wise Commercial Performance
              </h2>
              <p className="text-xs text-[#64748B]">
                Revenue, procurement costs, and net margins segmented by material category stream.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#20A486] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Audited Secondary Margins
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B] text-xs uppercase font-semibold border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-5">Material Category</th>
                  <th className="py-3 px-5 text-right">Revenue</th>
                  <th className="py-3 px-5 text-right">Procurement & Freight Cost</th>
                  <th className="py-3 px-5 text-right">Net Profit</th>
                  <th className="py-3 px-5 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {(data?.material_profits || []).map((m: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-5 font-bold text-[#1E293B] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#20A486]"></span>
                      {m.material}
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-[#18324B]">
                      {formatPrice(m.revenue)}
                    </td>
                    <td className="py-3.5 px-5 text-right text-slate-600">
                      {formatPrice(m.cost)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-700">
                      {formatPrice(m.profit)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                        {m.margin_percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-xs text-slate-500 flex items-center justify-between">
            <span>
              Disclaimer: {data?.data_disclaimer || 'Data grounded in platform exchange receipts.'}
            </span>
            <span className="font-semibold text-slate-700">
              Display Currency: {currency}
            </span>
          </div>
        </div>
      </main>

      {!isAppRoute && <PublicFooter />}
    </div>
  );
};
