import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { Package, Search, Filter, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getListings(statusFilter || undefined);
      setListings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [statusFilter]);

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.company_name.toLowerCase().includes(search.toLowerCase()) ||
    l.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
            <Package className="w-6 h-6 text-[#20A486]" />
            All Industrial Material Listings
          </h1>
          <p className="text-sm text-[#64748B]">
            Global catalog oversight across all registered suppliers and material categories.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by title, company, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#20A486]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-[#20A486]"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Under Negotiation">Under Negotiation</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F7FA] text-[#64748B] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4 font-semibold">Listing</th>
                <th className="py-3 px-4 font-semibold">Supplier</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Quantity</th>
                <th className="py-3 px-4 font-semibold">Seller Price</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading listings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No listings found.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">
                      {l.title}
                      <div className="text-xs text-slate-400">{l.location}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{l.company_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                        {l.category_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {l.quantity} {l.unit}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-emerald-700">
                      ₹{l.seller_price?.toLocaleString('en-IN') || 'Open'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/marketplace/${l.id}`}
                        className="inline-flex items-center gap-1 text-xs text-[#20A486] font-medium hover:underline"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
