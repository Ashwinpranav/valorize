import React, { useState, useEffect } from 'react';
import { MapPin, Building2, Weight, Sparkles, Navigation, Layers, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listingsApi } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const ExchangeMapPage: React.FC = () => {
  const { t } = useLanguage();
  const [mapListings, setMapListings] = useState<any[]>([]);
  const [selectedLot, setSelectedLot] = useState<any | null>(null);
  const [activeHub, setActiveHub] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      setIsLoading(true);
      try {
        const data = await listingsApi.getMapListings();
        setMapListings(data);
        if (data.length > 0) setSelectedLot(data[0]);
      } catch (err) {
        console.error('Failed to load map listings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const hubs = [
    { id: 'all', name: 'All Regional Hubs' },
    { id: 'coimbatore', name: 'Coimbatore Foundry Cluster' },
    { id: 'tiruppur', name: 'Tiruppur Smelting Hub' },
    { id: 'chennai', name: 'Chennai Automotive Corridor' },
    { id: 'salem', name: 'Salem Steel & Mineral Hub' },
  ];

  const filteredLots = mapListings.filter((lot) => {
    if (activeHub === 'all') return true;
    return lot.location.toLowerCase().includes(activeHub);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#18324B]">{t('exchangeMap')}</h2>
          <p className="text-xs text-[#64748B]">
            Interactive geo-spatial discovery of declared scrap lots across South Indian industrial corridors
          </p>
        </div>

        {/* Hub selector */}
        <div className="flex items-center gap-2">
          <select
            value={activeHub}
            onChange={(e) => setActiveHub(e.target.value)}
            className="h-9 px-3 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#18324B] bg-white outline-none focus:border-[#20A486]"
          >
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
        {/* Interactive Visual Map View (Left) */}
        <div className="lg:col-span-8 bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Top banner over map */}
          <div className="flex items-center justify-between z-10 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#E2E8F0] shadow-sm mb-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#20A486] animate-pulse" />
              <span className="font-bold text-[#18324B]">Live Geocoded Listings</span>
              <span className="text-[#64748B]">({filteredLots.length} Lots in view)</span>
            </div>
            <span className="text-[11px] text-[#94A3B8] italic">
              *Approximate depot coordinates protect proprietary site locations.
            </span>
          </div>

          {/* Map Graphic Area */}
          <div className="flex-1 min-h-[360px] bg-[#F0F4F8] rounded-xl border border-[#D9E2EC] relative flex items-center justify-center p-6 overflow-hidden">
            {/* Background grid lines */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Simulated Regional Map Nodes */}
            <div className="relative w-full max-w-lg h-72 border border-dashed border-[#CBD5E1] rounded-2xl p-4 flex flex-col justify-between">
              {/* Regional Hub Labels */}
              <div className="flex justify-between text-[11px] font-bold text-[#64748B]">
                <span className="bg-white/80 px-2 py-0.5 rounded shadow-xs">Bengaluru Industrial (North)</span>
                <span className="bg-white/80 px-2 py-0.5 rounded shadow-xs">Chennai Port & Auto (East)</span>
              </div>

              <div className="flex justify-around my-auto">
                <span className="text-xs font-black text-[#18324B] tracking-wider uppercase bg-[#E6FFFA] px-3 py-1 rounded-full border border-[#20A486]/40 shadow-xs">
                  Tamil Nadu West Industrial Corridor
                </span>
              </div>

              <div className="flex justify-between text-[11px] font-bold text-[#64748B]">
                <span className="bg-white/80 px-2 py-0.5 rounded shadow-xs">Coimbatore Foundry & Textile (SIDCO)</span>
                <span className="bg-white/80 px-2 py-0.5 rounded shadow-xs">Madurai & South Engineering</span>
              </div>

              {/* Pin markers */}
              {filteredLots.map((lot, idx) => {
                const isSelected = selectedLot?.id === lot.id;
                // Position pins across the map area deterministically
                const leftPos = 20 + ((idx * 37) % 60);
                const topPos = 25 + ((idx * 29) % 50);

                return (
                  <button
                    key={lot.id}
                    onClick={() => setSelectedLot(lot)}
                    style={{ left: `${leftPos}%`, top: `${topPos}%` }}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all z-20 ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 transition-colors ${
                        isSelected
                          ? 'bg-[#20A486] text-white border-white ring-4 ring-[#20A486]/30'
                          : 'bg-[#18324B] text-white border-[#20A486]'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-[#18324B] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {lot.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Lot Detail Side Panel (Right) */}
        <div className="lg:col-span-4 bg-white rounded-card border border-[#E2E8F0] shadow-card p-6 flex flex-col justify-between">
          {selectedLot ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
                <span className="text-xs font-bold text-[#20A486] uppercase tracking-wider">
                  Pin Inspection
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  Available Lot
                </span>
              </div>

              {selectedLot.image_url && (
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[#F1F5F9] border border-[#E2E8F0]">
                  <img
                    src={selectedLot.image_url}
                    alt={selectedLot.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <span className="text-[11px] text-[#64748B] block">{selectedLot.category_name}</span>
                <h3 className="text-base font-bold text-[#18324B] mt-0.5">{selectedLot.title}</h3>
              </div>

              <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Volume:</span>
                  <span className="font-bold text-[#18324B]">
                    {selectedLot.quantity.toLocaleString()} {selectedLot.unit} ({selectedLot.condition})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Depot Hub:</span>
                  <span className="font-bold text-[#18324B]">{selectedLot.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Supplier:</span>
                  <span className="font-bold text-[#18324B]">{selectedLot.company_name}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                  <span className="text-[#64748B]">Asking Rate:</span>
                  <span className="font-extrabold text-[#15803D]">
                    {selectedLot.seller_price
                      ? `₹${selectedLot.seller_price.toLocaleString()} / ${selectedLot.unit}`
                      : 'Quote on request'}
                  </span>
                </div>
              </div>

              <Link
                to={`/marketplace/${selectedLot.id}`}
                className="w-full py-2.5 rounded-xl bg-[#20A486] hover:bg-[#17856C] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Inspect Full Manifest & Bid</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#64748B]">
              <MapPin className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
              <span>Click any map pin to inspect depot details and volume specifications.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
