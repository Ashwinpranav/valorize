import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, MapPin, X, Layers, AlertCircle } from 'lucide-react';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import { ListingCard } from '../../components/ListingCard';
import { listingsApi } from '../../services/api';
import { WasteListing, MaterialCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const MarketplacePage: React.FC = () => {
  const { t } = useLanguage();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'qty_desc' | 'price_asc'>('latest');

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const params: any = { status_filter: 'Available' };
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedCondition !== 'All') params.condition = selectedCondition;
      if (location.trim()) params.location = location.trim();
      if (search.trim()) params.search = search.trim();

      const data = await listingsApi.getListings(params);
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch marketplace listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await listingsApi.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedCondition, location, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setSelectedCondition('All');
    setLocation('');
  };

  // Client sort
  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'qty_desc') return b.quantity - a.quantity;
    if (sortBy === 'price_asc') return (a.seller_price || 0) - (b.seller_price || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      <PublicNavbar />

      {/* Header bar */}
      <div className="bg-[#18324B] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-[#243B53]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#20A486] tracking-wider uppercase">
                Open Resource Exchange
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white mt-1">
                Material Marketplace
              </h1>
              <p className="text-xs text-[#BCCCDC] max-w-xl mt-1">
                Discover verified surplus metals, components, and recyclable materials available for industrial procurement across South India.
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-3">
              <div className="bg-[#243B53] px-3.5 py-2 rounded-xl text-center border border-[#334E68]">
                <span className="text-xs text-[#9FB3C8] block">Available Lots</span>
                <span className="text-lg font-bold text-[#20A486]">{listings.length} Lots</span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-3xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by material (e.g. Copper wire, Aluminium offcuts, Motors)..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white text-[#18324B] text-xs font-medium placeholder-[#94A3B8] shadow-sm outline-none focus:ring-2 focus:ring-[#20A486]"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-card p-5 border border-[#E2E8F0] shadow-card space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#20A486]" />
                  <span className="text-sm font-bold text-[#18324B]">Filter Lots</span>
                </div>
                {(selectedCategory || selectedCondition !== 'All' || location) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#B91C1C] hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-2">Material Category</label>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                      selectedCategory === null
                        ? 'bg-[#20A486] text-white'
                        : 'text-[#475569] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-[#20A486] text-white'
                          : 'text-[#475569] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-2">Accepted Grade</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-xs font-medium text-[#1E293B] outline-none focus:border-[#20A486]"
                >
                  <option value="All">All Conditions</option>
                  <option value="Recyclable">Recyclable</option>
                  <option value="Reusable">Reusable</option>
                  <option value="Repairable">Repairable</option>
                  <option value="New Surplus">New Surplus</option>
                </select>
              </div>

              {/* Location Input */}
              <div>
                <label className="text-xs font-bold text-[#18324B] block mb-2">Location / Hub</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Coimbatore, SIDCO..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-[#CBD5E1] text-xs font-medium text-[#1E293B] outline-none focus:border-[#20A486]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sort toolbar */}
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-card border border-[#E2E8F0] shadow-card">
              <span className="text-xs text-[#64748B]">
                Showing <strong className="text-[#18324B]">{sortedListings.length}</strong> available lots
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#64748B] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-8 px-2.5 rounded-md bg-[#F8FAFC] border border-[#CBD5E1] text-xs font-semibold text-[#18324B] outline-none"
                >
                  <option value="latest">Latest Listed</option>
                  <option value="qty_desc">Volume (High to Low)</option>
                  <option value="price_asc">Price (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-card h-80 border border-[#E2E8F0] animate-pulse p-4 space-y-4">
                    <div className="bg-[#E2E8F0] h-40 rounded-lg w-full" />
                    <div className="bg-[#E2E8F0] h-4 w-3/4 rounded" />
                    <div className="bg-[#E2E8F0] h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : sortedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-card p-12 text-center border border-[#E2E8F0] shadow-card space-y-3">
                <AlertCircle className="w-10 h-10 text-[#94A3B8] mx-auto" />
                <h3 className="text-base font-bold text-[#18324B]">No matching material lots found</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Try clearing your active filters or expanding your geographic search radius.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-[#20A486] text-white text-xs font-bold hover:bg-[#17856C] transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
