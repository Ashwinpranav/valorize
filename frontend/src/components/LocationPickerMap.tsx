import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Search, Check, RefreshCw } from 'lucide-react';
import { searchNominatim, getCurrentPosition, reverseGeocode } from '../services/geocoding';

interface LocationPickerMapProps {
  initialLocation?: string;
  latitude?: number | null;
  longitude?: number | null;
  onChange: (data: { location: string; latitude: number; longitude: number }) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  initialLocation = '',
  latitude,
  longitude,
  onChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentLat, setCurrentLat] = useState<number>(latitude || 20.5937); // Default central coordinate
  const [currentLng, setCurrentLng] = useState<number>(longitude || 78.9629);
  const [locationName, setLocationName] = useState<string>(initialLocation || 'Mumbai Industrial Estate, India');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);

  // Custom marker pin
  const createPinIcon = () => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background-color: #20A486;
          border: 3px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: #FFFFFF;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: latitude && longitude ? 12 : 5,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Marker
      const marker = L.marker([currentLat, currentLng], {
        icon: createPinIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        setCurrentLat(pos.lat);
        setCurrentLng(pos.lng);
        try {
          const rev = await reverseGeocode(pos.lat, pos.lng);
          if (rev) {
            setLocationName(rev);
            onChange({ location: rev, latitude: pos.lat, longitude: pos.lng });
          } else {
            onChange({ location: locationName, latitude: pos.lat, longitude: pos.lng });
          }
        } catch {
          onChange({ location: locationName, latitude: pos.lat, longitude: pos.lng });
        }
      });

      // Map click handler to move marker
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCurrentLat(lat);
        setCurrentLng(lng);
        try {
          const rev = await reverseGeocode(lat, lng);
          if (rev) {
            setLocationName(rev);
            onChange({ location: rev, latitude: lat, longitude: lng });
          } else {
            onChange({ location: locationName, latitude: lat, longitude: lng });
          }
        } catch {
          onChange({ location: locationName, latitude: lat, longitude: lng });
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      // Map cleanup if container removed
    };
  }, []);

  // Sync if props change externally
  useEffect(() => {
    if (latitude && longitude && (latitude !== currentLat || longitude !== currentLng)) {
      setCurrentLat(latitude);
      setCurrentLng(longitude);
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 12);
      }
    }
  }, [latitude, longitude]);

  // Handle address search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchNominatim(searchQuery);
      if (results && results.length > 0) {
        const first = results[0];
        const newLat = typeof first.lat === 'number' ? first.lat : parseFloat(first.lat);
        const newLng = typeof first.lon === 'number' ? first.lon : parseFloat(first.lon);
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        setLocationName(first.display_name.split(',').slice(0, 3).join(','));

        if (markerRef.current) markerRef.current.setLatLng([newLat, newLng]);
        if (mapInstanceRef.current) mapInstanceRef.current.setView([newLat, newLng], 13);

        onChange({
          location: first.display_name.split(',').slice(0, 3).join(','),
          latitude: newLat,
          longitude: newLng,
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Detect current location
  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const coords = await getCurrentPosition();
      setCurrentLat(coords.latitude);
      setCurrentLng(coords.longitude);

      if (markerRef.current) markerRef.current.setLatLng([coords.latitude, coords.longitude]);
      if (mapInstanceRef.current) mapInstanceRef.current.setView([coords.latitude, coords.longitude], 13);

      const rev = await reverseGeocode(coords.latitude, coords.longitude);
      const locStr = rev || `Facility (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
      setLocationName(locStr);

      onChange({
        location: locStr,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (err) {
      console.error('Geo detect error:', err);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            placeholder="Search worldwide city, industrial park, or address..."
            className="w-full h-9 pl-8 pr-3 text-xs font-semibold rounded-lg border border-[#CBD5E1] bg-white focus:border-[#20A486] focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2.5" />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-3 py-1.5 bg-[#18324B] hover:bg-[#234566] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Search</span>
          </button>

          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            title="Auto-detect GPS coordinates from device"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>{isDetecting ? 'Detecting...' : 'Detect GPS'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-[#CBD5E1] shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-56 z-0" />
        
        {/* Floating instruction pill */}
        <div className="absolute top-2 right-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#18324B] shadow-sm border border-slate-200 pointer-events-none">
          Click map or drag pin to adjust factory depot
        </div>
      </div>

      {/* Coords & Address Output Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="sm:col-span-1">
          <label className="text-[11px] font-bold text-[#64748B] block mb-0.5">Latitude</label>
          <input
            type="number"
            step="any"
            value={currentLat}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setCurrentLat(val);
              if (markerRef.current) markerRef.current.setLatLng([val, currentLng]);
              onChange({ location: locationName, latitude: val, longitude: currentLng });
            }}
            className="w-full h-8 px-2.5 rounded-lg border border-[#CBD5E1] font-mono text-xs text-[#18324B] bg-white focus:border-[#20A486] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="text-[11px] font-bold text-[#64748B] block mb-0.5">Longitude</label>
          <input
            type="number"
            step="any"
            value={currentLng}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setCurrentLng(val);
              if (markerRef.current) markerRef.current.setLatLng([currentLat, val]);
              onChange({ location: locationName, latitude: currentLat, longitude: val });
            }}
            className="w-full h-8 px-2.5 rounded-lg border border-[#CBD5E1] font-mono text-xs text-[#18324B] bg-white focus:border-[#20A486] focus:outline-none"
          />
        </div>

        <div className="sm:col-span-1">
          <label className="text-[11px] font-bold text-[#64748B] block mb-0.5">Resolved Location Name</label>
          <input
            type="text"
            value={locationName}
            onChange={(e) => {
              setLocationName(e.target.value);
              onChange({ location: e.target.value, latitude: currentLat, longitude: currentLng });
            }}
            placeholder="e.g. Kurichi SIDCO, Coimbatore"
            className="w-full h-8 px-2.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#18324B] bg-white focus:border-[#20A486] focus:outline-none truncate"
          />
        </div>
      </div>
    </div>
  );
};
