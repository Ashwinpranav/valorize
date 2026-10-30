import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  searchWorldwideLocations,
  getUserLocation,
  getRouteBetweenPoints,
  GeocodingResult,
  RouteResult,
} from '../services/geocoding';
import { Search, Navigation, Layers, Route as RouteIcon, X, MapPin, ExternalLink } from 'lucide-react';
import { getCategoryPlaceholder } from '../utils/materialImages';
import { useCurrency } from '../context/CurrencyContext';

export interface MapMarkerItem {
  id: string | number;
  title: string;
  category_name?: string;
  condition?: string;
  role: 'supplier' | 'buyer' | 'partner' | 'recycler';
  latitude: number;
  longitude: number;
  quantity?: number;
  unit?: string;
  seller_price?: number;
  company_name?: string;
  location?: string;
  imageUrl?: string;
}

interface InteractiveMapProps {
  items: MapMarkerItem[];
  selectedItem?: MapMarkerItem | null;
  onSelectItem?: (item: MapMarkerItem | null) => void;
  onLocationSelect?: (coords: { lat: number; lng: number; address?: string }) => void;
  radiusKm?: number;
  userCoords?: { latitude: number; longitude: number } | null;
  height?: string;
  routePair?: {
    supplier: { lat: number; lng: number; label: string };
    buyer: { lat: number; lng: number; label: string };
  } | null;
  allowLocationPick?: boolean;
}

// Marker color schemes according to specification:
// Green = Supplier, Blue = Buyer, Orange = Recycler, Purple = Repair Partner
const MARKER_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  supplier: { bg: '#15803D', border: '#86EFAC', label: 'Supplier' },
  buyer: { bg: '#2563EB', border: '#93C5FD', label: 'Buyer' },
  recycler: { bg: '#EA580C', border: '#FDBA74', label: 'Recycler' },
  partner: { bg: '#9333EA', border: '#D8B4FE', label: 'Repair Partner' },
};

function createCustomPin(role: 'supplier' | 'buyer' | 'partner' | 'recycler', isSelected: boolean = false): L.DivIcon {
  const c = MARKER_COLORS[role] || MARKER_COLORS.supplier;
  const size = isSelected ? 38 : 30;

  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      background: ${c.bg};
      border: 2.5px solid ${isSelected ? '#FFFFFF' : c.border};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    ">
      <div style="
        width: ${size * 0.4}px;
        height: ${size * 0.4}px;
        background: #FFFFFF;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-pin',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function createUserLocationPin(): L.DivIcon {
  const html = `
    <div style="position: relative; width: 24px; height: 24px;">
      <div class="user-location-ping" style="
        position: absolute;
        inset: -6px;
        background: #20A486;
        border-radius: 50%;
        opacity: 0.6;
      "></div>
      <div style="
        position: absolute;
        inset: 0;
        background: #20A486;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      "></div>
    </div>
  `;
  return L.divIcon({
    className: 'user-pin',
    html,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onLocationSelect,
  radiusKm,
  userCoords,
  height = '600px',
  routePair,
  allowLocationPick = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const { formatPrice } = useCurrency();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeRouteInfo, setActiveRouteInfo] = useState<RouteResult | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default global center: Center of worldwide industrial corridors
    const initialLat = userCoords?.latitude || (items.length > 0 ? items[0].latitude : 20.5937);
    const initialLng = userCoords?.longitude || (items.length > 0 ? items[0].longitude : 78.9629);
    const initialZoom = userCoords ? 11 : items.length > 0 ? 6 : 3;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: false,
    });

    // Add high-resolution standard OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Marker Layer Group
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // Handle map click for manual location selection (if enabled)
    map.on('click', (e) => {
      if (allowLocationPick && onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    items.forEach((item) => {
      if (!item.latitude || !item.longitude) return;

      const isSelected = selectedItem?.id === item.id;
      const marker = L.marker([item.latitude, item.longitude], {
        icon: createCustomPin(item.role, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      // Craft rich responsive popup
      const placeholder = getCategoryPlaceholder(item.category_name, item.title);
      const imgSrc = item.imageUrl || placeholder;
      const roleBadge = MARKER_COLORS[item.role] || MARKER_COLORS.supplier;

      const popupHtml = `
        <div style="font-family: 'Inter', system-ui, sans-serif; width: 240px; overflow: hidden;">
          <div style="position: relative; height: 110px; background: #0F172A;">
            <img src="${imgSrc}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='${placeholder}'"/>
            <span style="position: absolute; top: 6px; left: 6px; background: ${roleBadge.bg}; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-transform: uppercase;">
              ${roleBadge.label}
            </span>
          </div>
          <div style="padding: 10px 12px; background: #FFFFFF;">
            <div style="font-size: 12px; font-weight: 700; color: #1E293B; line-height: 1.3; margin-bottom: 4px;">
              ${item.title}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
              ${item.company_name || 'Industrial Partner'} • ${item.location || 'Location'}
            </div>
            ${item.quantity ? `
              <div style="font-size: 11px; font-weight: 600; color: #18324B; margin-bottom: 4px;">
                Lot: ${item.quantity.toLocaleString()} ${item.unit || 'KG'}
              </div>` : ''
            }
            ${item.seller_price ? `
              <div style="font-size: 12px; font-weight: 800; color: #15803D; margin-bottom: 8px;">
                ${formatPrice(item.seller_price)} / ${item.unit || 'KG'}
              </div>` : ''
            }
            <a href="/marketplace/${item.id}" style="display: block; text-align: center; background: #20A486; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 6px 0; border-radius: 6px; text-decoration: none;">
              Inspect Listing
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260 });

      marker.on('click', () => {
        if (onSelectItem) {
          onSelectItem(item);
        }
      });

      marker.addTo(layer);
    });
  }, [items, selectedItem, formatPrice]);

  // Handle Selected Item FlyTo
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedItem || !selectedItem.latitude || !selectedItem.longitude) return;

    map.flyTo([selectedItem.latitude, selectedItem.longitude], 12, {
      duration: 1.2,
    });
  }, [selectedItem]);

  // Handle User Location Pin & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (userCoords && userCoords.latitude && userCoords.longitude) {
      const userMarker = L.marker([userCoords.latitude, userCoords.longitude], {
        icon: createUserLocationPin(),
        zIndexOffset: 500,
      }).addTo(map);

      userMarker.bindPopup(`
        <div style="padding: 8px; font-family: sans-serif; font-size: 12px;">
          <strong>Your Current Location</strong><br/>
          Lat: ${userCoords.latitude.toFixed(4)}, Lng: ${userCoords.longitude.toFixed(4)}
        </div>
      `);

      userMarkerRef.current = userMarker;

      if (radiusKm && radiusKm > 0) {
        const circle = L.circle([userCoords.latitude, userCoords.longitude], {
          radius: radiusKm * 1000,
          color: '#20A486',
          fillColor: '#20A486',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 4',
        }).addTo(map);

        radiusCircleRef.current = circle;
      }
    }
  }, [userCoords, radiusKm]);

  // Handle Route Tracing (Requirement 3)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    setActiveRouteInfo(null);

    if (!routePair || !routePair.supplier || !routePair.buyer) return;

    const traceRoute = async () => {
      setIsRouting(true);
      try {
        const routeData = await getRouteBetweenPoints(
          routePair.supplier.lat,
          routePair.supplier.lng,
          routePair.buyer.lat,
          routePair.buyer.lng
        );

        setActiveRouteInfo(routeData);

        const polyline = L.polyline(routeData.coordinates, {
          color: routeData.isDrivingRoute ? '#20A486' : '#F59E0B',
          weight: 5,
          opacity: 0.85,
          dashArray: routeData.isDrivingRoute ? undefined : '8, 8',
          lineCap: 'round',
        }).addTo(map);

        routeLayerRef.current = polyline;

        // Fit map bounds to show full route
        map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      } catch (err) {
        console.error('Failed to trace route:', err);
      } finally {
        setIsRouting(false);
      }
    };

    traceRoute();
  }, [routePair]);

  // Location Search Handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchWorldwideLocations(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
      if (results.length > 0) {
        handleSelectSearchResult(results[0]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: GeocodingResult) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([result.lat, result.lon], 11, { duration: 1.5 });
    setShowSearchResults(false);

    if (allowLocationPick && onLocationSelect) {
      onLocationSelect({
        lat: result.lat,
        lng: result.lon,
        address: result.display_name,
      });
    }
  };

  const handleLocateMe = async () => {
    try {
      const pos = await getUserLocation();
      const map = mapInstanceRef.current;
      if (map) {
        map.flyTo([pos.latitude, pos.longitude], 12, { duration: 1.2 });
      }
      if (onLocationSelect) {
        onLocationSelect({ lat: pos.latitude, lng: pos.longitude });
      }
    } catch (err: any) {
      alert('Could not detect location: ' + (err.message || 'Permission denied'));
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-[#E2E8F0] shadow-sm bg-[#0F172A]" style={{ height }}>
      {/* Top Overlay Controls: Location Search & Geolocation */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md pointer-events-auto">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search city, state, country or industrial zone (OSM)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white/95 backdrop-blur-md border border-[#E2E8F0] rounded-lg shadow-md text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#20A486]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Autocomplete dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-[#E2E8F0] overflow-hidden max-h-56 overflow-y-auto">
              {searchResults.map((r) => (
                <button
                  key={r.place_id}
                  onClick={() => handleSelectSearchResult(r)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-none flex items-start gap-2 text-slate-700"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#20A486] flex-shrink-0 mt-0.5" />
                  <span className="truncate">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Locate Me button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleLocateMe}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md hover:bg-white text-[#18324B] border border-[#E2E8F0] rounded-lg text-xs font-semibold shadow-md transition"
            title="Detect My Location"
          >
            <Navigation className="w-3.5 h-3.5 text-[#20A486]" />
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>
      </div>

      {/* Legend Overlay at Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-[#E2E8F0] shadow-md text-[11px] text-[#1E293B] space-y-1.5 hidden sm:block">
        <div className="font-bold text-[#18324B] text-[10px] uppercase tracking-wider mb-1">
          Material Network
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#15803D] inline-block border border-white"></span>
          <span>Supplier Lot</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2563EB] inline-block border border-white"></span>
          <span>Buyer Requirement</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EA580C] inline-block border border-white"></span>
          <span>Recycling Center</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#9333EA] inline-block border border-white"></span>
          <span>Repair Partner</span>
        </div>
      </div>

      {/* Route Info Overlay (Requirement 3) */}
      {activeRouteInfo && routePair && (
        <div className="absolute top-14 left-4 z-[400] bg-[#18324B]/95 text-white p-3.5 rounded-xl border border-white/10 shadow-xl max-w-xs text-xs space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <RouteIcon className="w-4 h-4" />
              Route Tracking
            </span>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">
              {activeRouteInfo.isDrivingRoute ? 'Highway Driving' : 'Geodesic Path'}
            </span>
          </div>
          <div className="text-slate-300 text-[11px]">
            From: <strong>{routePair.supplier.label}</strong><br/>
            To: <strong>{routePair.buyer.label}</strong>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 text-[11px]">
            <div>
              <span className="text-slate-400 block">Est. Distance</span>
              <strong className="text-white text-sm">{activeRouteInfo.distanceKm} km</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Est. Transit Time</span>
              <strong className="text-white text-sm">
                {Math.floor(activeRouteInfo.durationMinutes / 60)}h {activeRouteInfo.durationMinutes % 60}m
              </strong>
            </div>
          </div>
          {!activeRouteInfo.isDrivingRoute && (
            <p className="text-[10px] text-amber-300 italic">
              *Straight-line preview (OSRM driving routing currently unavailable)
            </p>
          )}
        </div>
      )}

      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
