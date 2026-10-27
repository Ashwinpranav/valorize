import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reportsApi, listingsApi, enquiriesApi } from '../../services/api';
import {
  Recycle,
  Wrench,
  Search,
  ArrowUpRight,
  Sparkles,
  Leaf,
  Layers,
  ArrowLeftRight
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { ListingCard } from '../../components/ListingCard';
import { WasteListing } from '../../types';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [reclaimableListings, setReclaimableListings] = useState<WasteListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overview, listings, enquiries] = await Promise.all([
          reportsApi.getOverview(),
          listingsApi.getListings({ limit: 4 }),
          enquiriesApi.getEnquiries('partner'),
        ]);

        setStats({
          ...overview,
          activeEnquiries: enquiries.length,
        });
        setReclaimableListings(listings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Recycling & Refurbishment Partner
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mt-1">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-sm text-[#64748B]">
            Discover salvageable parts, repairable industrial assets, and bulk recyclable materials.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/app/partner/materials"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#20A486] text-white text-sm font-semibold rounded-lg hover:bg-[#18836b] transition shadow-sm"
          >
            <Search className="w-4 h-4" />
            Discover Feedstocks
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Circular Stream Feedstocks"
          value={stats?.total_listings || 0}
          subtitle="Available for reclamation"
          icon={Layers}
        />
        <StatCard
          title="Active Partner Inquiries"
          value={stats?.activeEnquiries || 0}
          subtitle="Procurement conversations"
          icon={ArrowLeftRight}
        />
        <StatCard
          title="Carbon Diverted"
          value={`${stats?.total_co2_avoided_kg || 0} kg`}
          subtitle="Verified circular savings"
          icon={Leaf}
        />
        <StatCard
          title="Secondary Material Value"
          value={`₹${(stats?.total_transaction_value || 0).toLocaleString('en-IN')}`}
          subtitle="Total platform exchanges"
          icon={Recycle}
        />
      </div>

      {/* Refurbishment Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#20A486]" />
              High-Opportunity Secondary Streams
            </h2>
            <p className="text-xs text-[#64748B]">
              Listings classified with high recovery or repair potential.
            </p>
          </div>
          <Link
            to="/app/partner/materials"
            className="text-xs font-semibold text-[#20A486] hover:underline flex items-center gap-1"
          >
            Explore all feedstocks <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              Loading recovery opportunities...
            </div>
          ) : reclaimableListings.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              No matching listings currently available.
            </div>
          ) : (
            reclaimableListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
