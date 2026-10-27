import React, { useState, useEffect } from 'react';
import { listingsApi } from '../../services/api';
import { Search, Filter, Recycle, MapPin, RefreshCw } from 'lucide-react';
import { ListingCard } from '../../components/ListingCard';
import { WasteListing, MaterialCategory } from '../../types';

export default function PartnerMaterialsPage() {
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cats, items] = await Promise.all([
        listingsApi.getCategories(),
        listingsApi.getListings({
          category_id: categoryFilter || undefined,
          condition: conditionFilter || undefined,
          q: search || undefined,
        }),
      ]);
      setCategories(cats);
      setListings(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, conditionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] flex items-center gap-2">
            <Recycle className="w-6 h-6 text-[#20A486]" />
            Partner Material Discovery
          </h1>
          <p className="text-sm text-[#64748B]">
            Browse industrial scrap, off-spec feedstocks, and machinery parts suitable for recycling, smelting, or refurbishment.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-[#18324B] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search material type, specifications, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#20A486]"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-[#20A486]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-[#20A486]"
          >
            <option value="">All Conditions</option>
            <option value="Scrap / Recyclable">Scrap / Recyclable</option>
            <option value="Used / Fair">Used / Fair</option>
            <option value="Used / Good">Used / Good</option>
            <option value="Surplus / New">Surplus / New</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            Scanning available industrial feedstocks...
          </div>
        ) : listings.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            No materials found matching your selected criteria.
          </div>
        ) : (
          listings.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))
        )}
      </div>
    </div>
  );
}
