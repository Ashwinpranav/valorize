import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Boxes, Sparkles, Trash2, Edit3, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../../components/StatusBadge';
import { listingsApi } from '../../services/api';
import { WasteListing } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const MyListingsPage: React.FC = () => {
  const { t } = useLanguage();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyListings = async () => {
    setIsLoading(true);
    try {
      const data = await listingsApi.getListings({ my_listings: true });
      setListings(data);
    } catch (err) {
      console.error('Error loading my listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this material lot?')) return;
    try {
      await listingsApi.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete listing');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#18324B]">{t('myListings')}</h2>
          <p className="text-xs text-[#64748B]">Manage your plant inventory and material declarations</p>
        </div>

        <Link
          to="/app/supplier/listings/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addListing')}</span>
        </Link>
      </div>

      <div className="bg-white rounded-card border border-[#E2E8F0] shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#64748B]">Loading declared lots...</div>
        ) : listings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-4">Lot ID & Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Net Quantity</th>
                  <th className="py-3 px-4">Asking Rate</th>
                  <th className="py-3 px-4">AI Spot Range</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs font-medium text-[#1E293B]">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#18324B]">
                        <Link to={`/marketplace/${l.id}`} className="hover:text-[#20A486]">
                          {l.title}
                        </Link>
                      </div>
                      <span className="text-[10px] text-[#94A3B8]">Depot: {l.location}</span>
                    </td>
                    <td className="py-3 px-4 text-[#475569]">{l.category_name}</td>
                    <td className="py-3 px-4 font-bold text-[#18324B]">
                      {l.quantity.toLocaleString()} {l.unit}
                    </td>
                    <td className="py-3 px-4">
                      {l.seller_price ? `₹${l.seller_price}/${l.unit}` : 'Quote on request'}
                    </td>
                    <td className="py-3 px-4 text-[#15803D] font-semibold">
                      {l.ai_estimated_price_min && l.ai_estimated_price_max
                        ? `₹${l.ai_estimated_price_min} - ₹${l.ai_estimated_price_max}`
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={l.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        to={`/marketplace/${l.id}`}
                        className="text-[#64748B] hover:text-[#20A486] inline-block p-1"
                        title="View Live Listing"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/app/supplier/listings/${l.id}/edit`}
                        className="text-[#64748B] hover:text-[#18324B] inline-block p-1"
                        title="Edit Lot Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="text-[#64748B] hover:text-[#B91C1C] inline-block p-1"
                        title="Delete Lot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-[#64748B] space-y-3">
            <Boxes className="w-10 h-10 text-[#94A3B8] mx-auto" />
            <h4 className="text-sm font-bold text-[#18324B]">No industrial lots declared yet</h4>
            <p className="max-w-sm mx-auto">
              List unused metal scrap, machinery parts, or manufacturing offcuts to discover registered buyers.
            </p>
            <Link
              to="/app/supplier/listings/new"
              className="inline-block px-4 py-2 bg-[#20A486] text-white font-bold rounded-lg"
            >
              + List Your First Material Lot
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

