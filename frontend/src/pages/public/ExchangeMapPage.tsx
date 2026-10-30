import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import { listingsApi } from '../../services/api';
import {
  InteractiveMap,
  MapMarkerItem,
} from '../../components/InteractiveMap';
import { PublicNavbar } from '../../components/PublicNavbar';
import { PublicFooter } from '../../components/PublicFooter';
import {
  MapPin,
  Filter,
  Navigation,
  Layers,
  Search,
  Route as RouteIcon,
  Building2,
  Weight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { MaterialImage } from '../../components/MaterialImage';
import { useCurrency } from '../../context/CurrencyContext';

const COUNTRIES = [
  { code: 'ALL', name: 'All Worldwide' },
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
];

export const ExchangeMapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const { formatPrice } = useCurrency();

  const [allItems, setAllItems] = useState<MapMarkerItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MapMarkerItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [radiusKm, setRadiusKm] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Role visibility toggles
  const [showSuppliers, setShowSuppliers] = useState(true);
  const [showBuyers, setShowBuyers] = useState(true);
  const [showRecyclers, setShowRecyclers] = useState(true);
  const [showPartners, setShowPartners] = useState(true);

  // Route calculation state
  const [routeSupplier, setRouteSupplier] = useState<MapMarkerItem | null>(null);
  const [routeBuyer, setRouteBuyer] = useState<MapMarkerItem | null>(null);

  // Tab on right panel: 'all' | 'suppliers' | 'buyers' | 'recyclers'
  const [activeTab, setActiveTab] = useState<'all' | 'suppliers' | 'buyers' | 'recyclers'>('all');

  useEffect(() => {
    const fetchMapListings = async () => {
      setIsLoading(true);
      try {
        const data = await listingsApi.getMapListings();
        setAllItems(data);

        // Check if query params have lat/lng or id
        const paramId = searchParams.get('id');
        if (paramId) {
          const match = data.find((d: any) => String(d.id) === String(paramId));
          if (match) setSelectedItem(match);
        } else if (data.length > 0) {
          setSelectedItem(data[0]);
        }
      } catch (err) {
        console.error('Failed to load global map data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapListings();
  }, [searchParams]);

  // Categories list derived from items
  const categories = Array.from(
    new Set(allItems.map((i) => i.category_name).filter(Boolean))
  );

  // Filter items
  const filteredItems = allItems.filter((item) => {
    // Role filter
    if (item.role === 'supplier' && !showSuppliers) return false;
    if (item.role === 'buyer' && !showBuyers) return false;
    if (item.role === 'recycler' && !showRecyclers) return false;
    if (item.role === 'partner' && !showPartners) return false;

    // Category filter
    if (selectedCategory !== 'all' && item.category_name !== selectedCategory) {
      return false;
    }

    // Condition filter
    if (selectedCondition !== 'all') {
      if (item.condition && !item.condition.toLowerCase().includes(selectedCondition.toLowerCase())) {
        return false;
      }
    }

    // Country filter
    if (selectedCountry !== 'ALL') {
      const loc = (item.location || '').toLowerCase();
      if (selectedCountry === 'IN' && !loc.includes('india') && !loc.includes('tamil nadu') && !loc.includes('karnataka') && !loc.includes('coimbatore') && !loc.includes('chennai')) {
        return false;
      }
      if (selectedCountry === 'US' && !loc.includes('usa') && !loc.includes('united states') && !loc.includes('detroit') && !loc.includes('new york')) {
        return false;
      }
      if (selectedCountry === 'DE' && !loc.includes('germany') && !loc.includes('duisburg')) return false;
      if (selectedCountry === 'AE' && !loc.includes('dubai') && !loc.includes('uae')) return false;
      if (selectedCountry === 'GB' && !loc.includes('uk') && !loc.includes('birmingham') && !loc.includes('london')) return false;
      if (selectedCountry === 'JP' && !loc.includes('japan') && !loc.includes('tokyo')) return false;
    }

    return true;
  });

  // Right panel items segmented by tab
  const tabItems = filteredItems.filter((i) => {
    if (activeTab === 'suppliers') return i.role === 'supplier';
    if (activeTab === 'buyers') return i.role === 'buyer';
    if (activeTab === 'recyclers') return i.role === 'recycler' || i.role === 'partner';
    return true;
  });

  const handleSetRoute = (item: MapMarkerItem) => {
    if (item.role === 'supplier') {
      setRouteSupplier(item);
      // Auto-select a compatible buyer if none selected
      if (!routeBuyer) {
        const potentialBuyer = allItems.find((i) => i.role === 'buyer');
        if (potentialBuyer) setRouteBuyer(potentialBuyer);
      }
    } else {
      setRouteBuyer(item);
      if (!routeSupplier) {
        const potentialSupplier = allItems.find((i) => i.role === 'supplier');
        if (potentialSupplier) setRouteSupplier(potentialSupplier);
      }
    }
  };

  const routePair =
    routeSupplier && routeBuyer
      ? {
          supplier: {
            lat: routeSupplier.latitude,
            lng: routeSupplier.longitude,
            label: `${routeSupplier.company_name} (${routeSupplier.location})`,
          },
          buyer: {
            lat: routeBuyer.latitude,
            lng: routeBuyer.longitude,
            label: `${routeBuyer.company_name} (${routeBuyer.location})`,
          },
        }
      : null;

  return (
    <div className={isAppRoute ? 'space-y-4' : 'min-h-screen bg-[#F5F7FA] flex flex-col'}>
      {!isAppRoute && <PublicNavbar />}

      {/* Main Map Explorer Container */}
      <div className={isAppRoute ? 'w-full space-y-4' : 'flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 flex flex-col gap-4'}>
        {/* Top Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#18324B] flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#20A486]" />
              Global Live Industrial Exchange Map
            </h1>
            <p className="text-xs text-[#64748B]">
              Real-time geospatial discovery of declared secondary feedstocks, buyer procurement demands, and licensed recyclers worldwide.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              {filteredItems.length} Network Nodes Available
            </span>
          </div>
        </div>

        {/* 3-Column Layout: Left Filters (3 cols) | Center Map (6 cols) | Right Feed (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* ========================================================= */}
          {/* LEFT PANEL: Filters, Radius, Country & Network Roles (3 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2.5">
                <span className="text-xs font-bold text-[#18324B] uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#20A486]" />
                  Map Filters
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedCondition('all');
                    setSelectedCountry('ALL');
                    setRadiusKm(0);
                    setShowSuppliers(true);
                    setShowBuyers(true);
                    setShowRecyclers(true);
                    setShowPartners(true);
                    setRouteSupplier(null);
                    setRouteBuyer(null);
                  }}
                  className="text-[11px] text-[#20A486] font-semibold hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Country Selector */}
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1.5">
                  Country / Region
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#18324B] focus:border-[#20A486] focus:outline-none"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Category */}
              <div>
                <label className="text-xs font-bold text-[#1E293B] block mb-1.5">
                  Material Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[#CBD5E1] rounded-lg bg-white text-[#18324B] focus:border-[#20A486] focus:outline-none"
                >
                  <option value="all">All Material Categories</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Radius Filter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#1E293B]">Radius Filter</span>
                  <span className="text-[11px] font-bold text-[#20A486]">
                    {radiusKm === 0 ? 'Worldwide (No Limit)' : `${radiusKm} km`}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 10, 25, 50, 100, 250].map((km) => (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setRadiusKm(km)}
                      className={`text-[11px] py-1.5 rounded-md font-semibold border transition-all ${
                        radiusKm === km
                          ? 'bg-[#20A486] text-white border-[#20A486]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {km === 0 ? 'Worldwide' : `${km} km`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network Node Visibility Toggles */}
              <div className="pt-2 border-t border-[#F1F5F9] space-y-2">
                <span className="text-xs font-bold text-[#1E293B] block mb-1">
                  Network Roles
                </span>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#15803D] border border-white shadow-sm"></span>
                    <span className="font-semibold text-slate-800">Suppliers (Declared Lots)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showSuppliers}
                    onChange={(e) => setShowSuppliers(e.target.checked)}
                    className="accent-[#15803D] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#2563EB] border border-white shadow-sm"></span>
                    <span className="font-semibold text-slate-800">Buyers (Procurement)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showBuyers}
                    onChange={(e) => setShowBuyers(e.target.checked)}
                    className="accent-[#2563EB] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#EA580C] border border-white shadow-sm"></span>
                    <span className="font-semibold text-slate-800">Recycling Centers</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showRecyclers}
                    onChange={(e) => setShowRecyclers(e.target.checked)}
                    className="accent-[#EA580C] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#9333EA] border border-white shadow-sm"></span>
                    <span className="font-semibold text-slate-800">Repair & Overhaul Partners</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showPartners}
                    onChange={(e) => setShowPartners(e.target.checked)}
                    className="accent-[#9333EA] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* Route Tracker Configuration Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-[#18324B] flex items-center gap-1">
                  <RouteIcon className="w-3.5 h-3.5 text-[#20A486]" />
                  Commercial Route Planning
                </span>
                <div className="text-[11px] text-slate-600">
                  Select a supplier and buyer to compute highway distance, transport freight time, and route preview.
                </div>
                {routePair ? (
                  <button
                    type="button"
                    onClick={() => {
                      setRouteSupplier(null);
                      setRouteBuyer(null);
                    }}
                    className="w-full py-1 text-[11px] bg-red-50 text-red-700 border border-red-200 rounded font-semibold hover:bg-red-100"
                  >
                    Clear Active Route
                  </button>
                ) : (
                  <div className="text-[10px] text-slate-400 italic">
                    Click 'Trace Route' on any listing or buyer card to preview path.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTER PANEL: Interactive World Map (6 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col min-h-[550px] lg:min-h-[650px]">
            <InteractiveMap
              items={filteredItems}
              selectedItem={selectedItem}
              onSelectItem={(item) => setSelectedItem(item)}
              radiusKm={radiusKm}
              userCoords={userLocation}
              onLocationSelect={(coords) => {
                setUserLocation({ latitude: coords.lat, longitude: coords.lng });
              }}
              routePair={routePair}
              height="100%"
            />
          </div>

          {/* ========================================================= */}
          {/* RIGHT PANEL: Nearby Listings, Buyer Requests & Recyclers (3 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-3 flex flex-col">
            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-sm grid grid-cols-4 text-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#18324B] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#18324B]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('suppliers')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'suppliers'
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#18324B]'
                }`}
              >
                Lots
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('buyers')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'buyers'
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#18324B]'
                }`}
              >
                Demand
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recyclers')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'recyclers'
                    ? 'bg-[#EA580C] text-white shadow-sm'
                    : 'text-[#64748B] hover:text-[#18324B]'
                }`}
              >
                Plants
              </button>
            </div>

            {/* Selected Item Full Details Card (Requirement 4) */}
            {selectedItem && (
              <div className="bg-white rounded-xl border-2 border-[#20A486] p-4 shadow-md space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded text-white bg-[#18324B] uppercase tracking-wide">
                      {selectedItem.category_name}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#18324B] mt-1 line-clamp-2">
                      {selectedItem.title}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                      selectedItem.role === 'supplier'
                        ? 'bg-[#15803D]'
                        : selectedItem.role === 'buyer'
                        ? 'bg-[#2563EB]'
                        : selectedItem.role === 'recycler'
                        ? 'bg-[#EA580C]'
                        : 'bg-[#9333EA]'
                    }`}
                  >
                    {selectedItem.role.toUpperCase()}
                  </span>
                </div>

                <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-900">
                  <MaterialImage
                    images={selectedItem.imageUrl ? [{ image_url: selectedItem.imageUrl }] : []}
                    categoryName={selectedItem.category_name}
                    title={selectedItem.title}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Location</span>
                    <strong className="text-slate-800 truncate block">{selectedItem.location}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Asking / Budget</span>
                    <strong className="text-emerald-700 text-sm">
                      {selectedItem.seller_price ? formatPrice(selectedItem.seller_price) : 'On Inquiry'}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => handleSetRoute(selectedItem)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#18324B] rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <RouteIcon className="w-3.5 h-3.5 text-[#20A486]" />
                    <span>Trace Route</span>
                  </button>

                  {String(selectedItem.id).startsWith('comp-') ? null : (
                    <Link
                      to={`/marketplace/${String(selectedItem.id).replace('req-', '')}`}
                      className="flex-1 py-1.5 bg-[#20A486] hover:bg-[#18836b] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition shadow-sm"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Scrollable List */}
            <div className="flex-1 space-y-2 overflow-y-auto max-h-[420px] pr-1">
              {tabItems.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] text-center text-xs text-slate-400">
                  No network nodes match your filter criteria.
                </div>
              ) : (
                tabItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all bg-white hover:border-[#20A486] ${
                      selectedItem?.id === item.id
                        ? 'border-[#20A486] ring-1 ring-[#20A486]/30 shadow-sm'
                        : 'border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="text-[11px] font-bold text-[#1E293B] line-clamp-1">
                        {item.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white flex-shrink-0 ${
                          item.role === 'supplier'
                            ? 'bg-[#15803D]'
                            : item.role === 'buyer'
                            ? 'bg-[#2563EB]'
                            : item.role === 'recycler'
                            ? 'bg-[#EA580C]'
                            : 'bg-[#9333EA]'
                        }`}
                      >
                        {item.role}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1.5">
                      <span className="truncate max-w-[130px]">{item.location}</span>
                      <span className="font-bold text-[#18324B]">
                        {item.seller_price ? formatPrice(item.seller_price) : 'Quote on Request'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {!isAppRoute && <PublicFooter />}
    </div>
  );
};
