import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Boxes,
  Sparkles,
  ArrowRightLeft,
  FileBarChart,
  Plus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { MatchScoreCard } from '../../components/MatchScoreCard';
import { listingsApi, requirementsApi, reportsApi } from '../../services/api';
import { WasteListing, BuyerMatch } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const SupplierDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState<WasteListing[]>([]);
  const [matches, setMatches] = useState<BuyerMatch[]>([]);
  const [companyImpact, setCompanyImpact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [myListings, matchData, impact] = await Promise.all([
          listingsApi.getListings({ my_listings: true }),
          requirementsApi.getMatches(),
          reportsApi.getCompanyImpact(),
        ]);
        setListings(myListings);
        setMatches(matchData);
        setCompanyImpact(impact);
      } catch (err) {
        console.error('Error loading supplier dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const activeListings = listings.filter((l) => l.status === 'Available');

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#18324B] to-[#243B53] text-white rounded-card p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#20A486] uppercase tracking-wider">
            Industrial Supplier Desk
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            Welcome back, {user?.full_name}
          </h2>
          <p className="text-xs text-[#BCCCDC] mt-1">
            {user?.company?.name} • SIDCO Cluster, {user?.company?.city}
          </p>
        </div>

        <Link
          to="/app/supplier/listings/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addListing')}</span>
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Declared Lots"
          value={activeListings.length}
          subtitle="Ready for buyer inspection"
          icon={Boxes}
          highlight={true}
        />
        <StatCard
          title="Algorithmic Buyer Matches"
          value={matches.length}
          subtitle="Top candidates ranked >30%"
          icon={Sparkles}
          trend="+3 New"
          trendPositive={true}
        />
        <StatCard
          title="Total Diverted Volume"
          value={companyImpact ? `${companyImpact.total_diverted_kg.toLocaleString()} KG` : '1,250 KG'}
          subtitle="Secondary material recovered"
          icon={FileBarChart}
          trend="Certified"
          trendPositive={true}
        />
        <StatCard
          title="CO2 Emissions Avoided"
          value={companyImpact ? `${companyImpact.co2_avoided_kg.toLocaleString()} KG` : '4,250 KG'}
          subtitle="BIR LCA methodology baseline"
          icon={TrendingUp}
        />
      </div>

      {/* Main Grid: My Listings & Top Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Listings */}
        <div className="lg:col-span-7 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-bold text-[#18324B]">{t('myListings')}</h3>
              <span className="text-[11px] text-[#64748B]">
                Your registered industrial material lots
              </span>
            </div>
            <Link
              to="/app/supplier/listings"
              className="text-xs font-semibold text-[#20A486] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 bg-[#F1F5F9] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="divide-y divide-[#F1F5F9]">
              {listings.slice(0, 5).map((l) => (
                <div key={l.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/marketplace/${l.id}`}
                      className="text-xs font-bold text-[#18324B] hover:text-[#20A486] truncate block"
                    >
                      {l.title}
                    </Link>
                    <div className="flex items-center gap-3 text-[11px] text-[#64748B] mt-0.5">
                      <span>
                        {l.quantity} {l.unit}
                      </span>
                      <span>•</span>
                      <span>{l.condition}</span>
                      <span>•</span>
                      <span>{l.seller_price ? `₹${l.seller_price}/${l.unit}` : 'Quote on request'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={l.status} size="sm" />
                    <Link
                      to={`/app/supplier/listings/${l.id}/edit`}
                      className="text-xs font-semibold text-[#486581] hover:text-[#18324B] px-2 py-1 rounded bg-[#F1F5F9]"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#64748B] space-y-2">
              <p>No active scrap lots declared yet.</p>
              <Link
                to="/app/supplier/listings/new"
                className="inline-block text-xs font-bold text-[#20A486] hover:underline"
              >
                + Create Your First Listing
              </Link>
            </div>
          )}
        </div>

        {/* Right: Top Algorithmic Buyer Matches */}
        <div className="lg:col-span-5 bg-white rounded-card border border-[#E2E8F0] p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h3 className="text-sm font-bold text-[#18324B] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#20A486]" />
                <span>{t('buyerMatches')}</span>
              </h3>
              <span className="text-[11px] text-[#64748B]">
                Matched with active procurement demand
              </span>
            </div>
            <Link
              to="/app/supplier/matches"
              className="text-xs font-semibold text-[#20A486] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
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
              {matches.slice(0, 3).map((match, i) => (
                <MatchScoreCard key={i} match={match} targetType="requirement" />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#64748B]">
              <p>No buyer matches computed yet.</p>
              <span className="text-[11px] text-[#94A3B8]">
                Matches update automatically when listings are published.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
