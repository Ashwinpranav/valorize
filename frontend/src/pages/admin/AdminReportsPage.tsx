import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../services/api';
import { BarChart3, TrendingUp, Download, PieChart as PieIcon, RefreshCw, Leaf } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#20A486', '#18324B', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function AdminReportsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getOverview();
      setOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!overview) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Listings', overview.total_listings],
      ['Active Listings', overview.active_listings],
      ['Total Companies', overview.total_companies],
      ['Completed Transactions', overview.completed_transactions],
      ['Total Material Exchanged (MT)', overview.total_material_exchanged_mt],
      ['Total Transaction Value (INR)', overview.total_transaction_value],
      ['CO2 Avoided (kg)', overview.total_co2_avoided_kg],
      ['Landfill Diverted (kg)', overview.total_landfill_diverted_kg],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `valorize_platform_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pieData = overview?.materials_breakdown
    ? Object.entries(overview.materials_breakdown).map(([name, val]: any) => ({
        name,
        value: val.weight_kg,
        co2: val.co2_saved_kg,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#20A486]" />
            Reports & Platform Analytics
          </h1>
          <p className="text-sm text-[#64748B]">
            Circular economy impact metrics, transaction velocity, and material recovery analytics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#18324B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-[#20A486] hover:bg-[#18836b] rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs font-medium text-[#64748B]">Total Exchange Value</div>
          <div className="text-2xl font-extrabold text-[#18324B] mt-1">
            ₹{overview?.total_transaction_value?.toLocaleString('en-IN') || '0'}
          </div>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> High industrial retention
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs font-medium text-[#64748B]">Material Diverted</div>
          <div className="text-2xl font-extrabold text-[#20A486] mt-1">
            {overview?.total_material_exchanged_mt || 0} <span className="text-sm font-normal">MT</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {(overview?.total_landfill_diverted_kg || 0).toLocaleString()} kg total
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs font-medium text-[#64748B]">Emissions Avoided</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">
            {overview?.total_co2_avoided_kg?.toLocaleString('en-IN') || 0} <span className="text-sm font-normal">kg CO₂e</span>
          </div>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <Leaf className="w-3.5 h-3.5" /> Scope 3 GHG savings
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div className="text-xs font-medium text-[#64748B]">Active Listings</div>
          <div className="text-2xl font-extrabold text-[#18324B] mt-1">
            {overview?.active_listings || 0}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {overview?.total_listings || 0} cumulative listings
          </p>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
          <h2 className="text-base font-bold text-[#1E293B] mb-1">
            Material Exchanged by Category (kg)
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            Aggregated volume from completed exchange transactions.
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val.toLocaleString()} kg`, 'Volume']}
                />
                <Bar dataKey="value" fill="#20A486" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CO2 Savings Distribution */}
        <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
          <h2 className="text-base font-bold text-[#1E293B] mb-1">
            CO₂ Avoidance Share by Material Stream
          </h2>
          <p className="text-xs text-[#64748B] mb-6">
            IPCC/BIR certified emission reduction factors.
          </p>
          <div className="h-72 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="co2"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} kg CO₂e`, 'Avoided']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-400">No transaction data available yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

