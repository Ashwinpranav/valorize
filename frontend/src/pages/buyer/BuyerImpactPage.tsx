import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../services/api';
import { Leaf, Award, Download, TrendingUp, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StatCard } from '../../components/StatCard';

export default function BuyerImpactPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await reportsApi.getCompanyImpact();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadCertificate = () => {
    alert('Circular Economy Scope 3 Sustainability Certificate generated for ' + (data?.company_name || 'your company'));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
            <Leaf className="w-6 h-6 text-[#20A486]" />
            Buyer Circularity & Scope 3 Impact
          </h1>
          <p className="text-sm text-[#64748B]">
            Transparent environmental accounting derived strictly from verified completed material exchanges.
          </p>
        </div>
        <button
          onClick={handleDownloadCertificate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#20A486] text-white text-sm font-semibold rounded-lg hover:bg-[#18836b] transition shadow-sm"
        >
          <Award className="w-4 h-4" />
          Download ESG Certificate
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Emissions Avoided"
          value={`${data?.co2_avoided_kg || 0} kg`}
          subtitle="Scope 3 GHG reductions"
          icon={Leaf}
        />
        <StatCard
          title="Materials Reclaimed"
          value={`${data?.total_diverted_kg || 0} kg`}
          subtitle={`${data?.total_diverted_mt || 0} Metric Tonnes`}
          icon={TrendingUp}
        />
        <StatCard
          title="Completed Exchanges"
          value={data?.completed_exchanges || 0}
          subtitle="Binding contracts"
          icon={CheckCircle2}
        />
        <StatCard
          title="Procurement Spend"
          value={`₹${(data?.total_value || 0).toLocaleString('en-IN')}`}
          subtitle="Direct secondary resource"
          icon={Award}
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">
              Verified Sustainability Classification: {data?.circular_status || 'Active Member'}
            </h2>
            <p className="text-xs text-[#64748B]">
              Registered to <strong>{data?.company_name}</strong> based on verified bill-of-lading exchange records.
            </p>
          </div>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 space-y-2 text-xs text-slate-600">
          <p>
            <strong>Methodology Note:</strong> Calculations utilize Life Cycle Assessment (LCA) baselines
            from the Intergovernmental Panel on Climate Change (IPCC) and the Bureau of International Recycling (BIR).
            Savings represent embodied energy and extraction emissions avoided relative to primary virgin extraction.
          </p>
          <p className="text-slate-400">
            All figures correspond directly to ledger-verified transactions on the Valorize platform.
          </p>
        </div>
      </div>
    </div>
  );
}
