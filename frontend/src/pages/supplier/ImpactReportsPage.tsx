import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Recycle,
  Leaf,
  TrendingUp,
  Download,
  AlertTriangle,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { StatCard } from '../../components/StatCard';
import { reportsApi } from '../../services/api';
import { PlatformImpactReport } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const COLORS = ['#20A486', '#18324B', '#F4B740', '#38B2AC', '#486581', '#B45309'];

export const ImpactReportsPage: React.FC = () => {
  const { t } = useLanguage();
  const [report, setReport] = useState<PlatformImpactReport | null>(null);
  const [companyImpact, setCompanyImpact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImpactData = async () => {
      setIsLoading(true);
      try {
        const [platformData, compData] = await Promise.all([
          reportsApi.getImpact(),
          reportsApi.getCompanyImpact(),
        ]);
        setReport(platformData);
        setCompanyImpact(compData);
      } catch (err) {
        console.error('Failed to load impact report:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImpactData();
  }, []);

  if (isLoading || !report) {
    return <div className="p-8 text-center text-xs text-[#64748B]">Calculating verified impact metrics...</div>;
  }

  const chartData = report.materials_breakdown.map((m) => ({
    name: m.category_name.replace(' scrap', ''),
    diverted_kg: m.total_quantity_kg,
    co2_saved_kg: m.co2_saved_kg,
    value: m.estimated_financial_value,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-[#18324B]">{t('impactReports')}</h2>
            <span className="text-xs font-bold bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" /> BIR Verified LCA Model
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Recorded secondary resource recovery and greenhouse gas avoidance strictly from completed transactions.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#18324B] hover:bg-[#F8FAFC] text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Certificate</span>
        </button>
      </div>

      {/* Top 4 Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Diverted Volume"
          value={`${report.total_material_exchanged_kg.toLocaleString()} KG`}
          subtitle={`${report.total_material_exchanged_mt} Metric Tons diverted`}
          icon={Recycle}
          highlight={true}
        />
        <StatCard
          title="CO2 Emissions Avoided"
          value={`${report.total_co2_avoided_kg.toLocaleString()} KG`}
          subtitle="Direct Scope 3 reduction"
          icon={Leaf}
          trend="+94% vs Virgin"
          trendPositive={true}
        />
        <StatCard
          title="Completed Transactions"
          value={report.total_completed_transactions}
          subtitle="Verified closed contracts"
          icon={FileBarChart}
        />
        <StatCard
          title="Recorded Exchange Gross"
          value={`₹${report.total_transaction_value.toLocaleString()}`}
          subtitle="Circular capital retained"
          icon={TrendingUp}
        />
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Volume by Material Stream (Bar chart) */}
        <div className="lg:col-span-7 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-bold text-[#18324B]">Diverted Weight by Material (KG)</h3>
            <span className="text-[11px] text-[#64748B]">Tonnage Transacted</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} KG`, 'Net Weight']}
                  contentStyle={{ backgroundColor: '#18324B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="diverted_kg" fill="#20A486" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: CO2 Avoided Breakdown (Donut/Pie Chart) */}
        <div className="lg:col-span-5 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <h3 className="text-sm font-bold text-[#18324B]">Avoided Carbon Distribution</h3>
            <span className="text-[11px] text-[#64748B]">KG CO2e</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="co2_saved_kg"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} KG CO2e`, 'Emissions Avoided']}
                  contentStyle={{ backgroundColor: '#18324B', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Material Breakdown Table */}
      <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden">
        <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <h3 className="text-xs font-bold text-[#18324B] uppercase tracking-wider">
            Material Stream Lifecycle Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase">
                <th className="py-3 px-4">Material Category</th>
                <th className="py-3 px-4">Recorded Exchanges</th>
                <th className="py-3 px-4">Net Recovered Weight</th>
                <th className="py-3 px-4">Landfill Diverted</th>
                <th className="py-3 px-4">Avoided CO2 (BIR Model)</th>
                <th className="py-3 px-4 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] font-medium text-[#1E293B]">
              {report.materials_breakdown.map((row, i) => (
                <tr key={i} className="hover:bg-[#F8FAFC]">
                  <td className="py-3 px-4 font-bold text-[#18324B]">{row.category_name}</td>
                  <td className="py-3 px-4">{row.total_transactions} Closed Lots</td>
                  <td className="py-3 px-4 font-bold text-[#20A486]">
                    {row.total_quantity_kg.toLocaleString()} KG
                  </td>
                  <td className="py-3 px-4 text-[#475569]">
                    {row.landfill_diverted_kg.toLocaleString()} KG
                  </td>
                  <td className="py-3 px-4 text-[#15803D] font-bold">
                    {row.co2_saved_kg.toLocaleString()} KG CO2e
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#18324B]">
                    ₹{row.estimated_financial_value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology Notice Banner */}
      <div className="bg-[#FFFBEB] rounded-card p-5 border border-[#FDE68A] flex items-start gap-3 text-xs text-[#92400E]">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#B45309]" />
        <div className="space-y-1">
          <strong className="block font-bold">Methodological Integrity Disclaimer:</strong>
          <p className="leading-relaxed">{report.methodology_notice}</p>
        </div>
      </div>
    </div>
  );
};
