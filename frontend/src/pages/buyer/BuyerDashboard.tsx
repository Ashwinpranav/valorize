import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ClipboardList,
  ArrowRightLeft,
  Plus,
  ArrowRight,
  TrendingUp,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { MatchScoreCard } from '../../components/MatchScoreCard';
import { requirementsApi, reportsApi } from '../../services/api';
import { BuyerRequirement, BuyerMatch } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const BuyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [matches, setMatches] = useState<BuyerMatch[]>([]);
  const [companyImpact, setCompanyImpact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerData = async () => {
      setIsLoading(true);
      try {
        const [reqs, matchData, impact] = await Promise.all([
          requirementsApi.getRequirements(true),
          requirementsApi.getMatches(),
          reportsApi.getCompanyImpact(),
        ]);
        setRequirements(reqs);
        setMatches(matchData);
        setCompanyImpact(impact);
      } catch (err) {
        console.error('Failed to load buyer dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuyerData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#18324B] to-[#243B53] text-white rounded-card p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#20A486] uppercase tracking-wider">
            Procurement & Buyer Desk
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            Welcome back, {user?.full_name}
          </h2>
          <p className="text-xs text-[#BCCCDC] mt-1">
            {user?.company?.name} • Secondary Material Procurement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/app/buyer/requirements"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addRequirement')}</span>
          </Link>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
          >
            <Compass className="w-4 h-4" />
            <span>{t('exploreMaterialsBtn')}</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Procurement Demands"
          value={requirements.length}
          subtitle="Open buyer requirements"
          icon={ClipboardList}
          highlight={true}
        />
        <StatCard
          title="Candidate Lot Matches"
          value={matches.length}
          subtitle="Ranked by 4-factor engine"
          icon={Sparkles}
          trend="+5 New"
          trendPositive={true}
        />
        <StatCard
          title="Acquired Secondary Volume"
          value={companyImpact ? `${companyImpact.total_diverted_kg.toLocaleString()} KG` : '1,250 KG'}
          subtitle="Circularity feed stock"
          icon={TrendingUp}
          trend="Certified"
          trendPositive={true}
        />
        <StatCard
          title="Carbon Offset Savings"
          value={companyImpact ? `${companyImpact.co2_avoided_kg.toLocaleString()} KG` : '4,250 KG'}
          subtitle="Scope 3 ESG benefit"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Grid: Matches & Active Demands */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Ranked Matches */}
        <div className="lg:col-span-7 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#20A486]" />
                <span>AI Ranked Inventory Matches</span>
              </h3>
              <span className="text-[11px] text-[#64748B]">
                Compatible scrap lots currently available for procurement
              </span>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-semibold text-[#20A486] hover:underline flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-28 bg-[#F1F5F9] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-3">
              {matches.slice(0, 4).map((match, i) => (
                <MatchScoreCard key={i} match={match} targetType="listing" />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#64748B] space-y-2">
              <p>No compatible matches found yet.</p>
              <Link to="/app/buyer/requirements" className="text-xs font-bold text-[#20A486] hover:underline">
                + Declare Procurement Demand to Enable Auto-Matching
              </Link>
            </div>
          )}
        </div>

        {/* Right: Active Procurement Requirements */}
        <div className="lg:col-span-5 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-bold text-[#18324B]">{t('buyerRequirements')}</h3>
              <span className="text-[11px] text-[#64748B]">Your active demand manifests</span>
            </div>
            <Link
              to="/app/buyer/requirements"
              className="text-xs font-semibold text-[#20A486] hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {requirements.length > 0 ? (
            <div className="divide-y divide-[#F1F5F9]">
              {requirements.map((req) => (
                <div key={req.id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#18324B] truncate">{req.title}</h4>
                    <span className="text-[10px] text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded font-bold">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                    <span>
                      {req.min_quantity} – {req.max_quantity} {req.unit}
                    </span>
                    <span>•</span>
                    <span>Max Dist: {req.max_distance_km} km</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#64748B] space-y-2">
              <p>No procurement demands configured.</p>
              <Link to="/app/buyer/requirements" className="text-xs font-bold text-[#20A486] hover:underline">
                + Add Procurement Target
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

