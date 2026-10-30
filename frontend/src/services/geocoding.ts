/**
 * Global GIS Geocoding, Geolocation, and Routing Service
 * Uses OpenStreetMap Nominatim and OSRM with graceful fallbacks.
 */

export interface GeocodingResult {
  place_id: number;
  lat: number;
  lon: number;
  display_name: string;
  type: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng] array for Leaflet polyline
  distanceKm: number;
  durationMinutes: number;
  isDrivingRoute: boolean; // true if OSRM succeeded, false if straight-line geodesic fallback
  summary?: string;
}

// Well-known global industrial hubs for instant fallback if external network is unavailable
const GLOBAL_HUBS: GeocodingResult[] = [
  { place_id: 1, lat: 13.0827, lon: 80.2707, display_name: 'Chennai, Tamil Nadu, India', type: 'city' },
  { place_id: 2, lat: 11.0168, lon: 76.9558, display_name: 'Coimbatore, Tamil Nadu, India', type: 'city' },
  { place_id: 3, lat: 12.9716, lon: 77.5946, display_name: 'Bangalore, Karnataka, India', type: 'city' },
  { place_id: 4, lat: 19.0760, lon: 72.8777, display_name: 'Mumbai, Maharashtra, India', type: 'city' },
  { place_id: 5, lat: 40.7128, lon: -74.0060, display_name: 'New York, NY, United States', type: 'city' },
  { place_id: 6, lat: 42.3314, lon: -83.0458, display_name: 'Detroit, MI, United States', type: 'city' },
  { place_id: 7, lat: 51.5074, lon: -0.1278, display_name: 'London, Greater London, United Kingdom', type: 'city' },
  { place_id: 8, lat: 52.4862, lon: -1.8904, display_name: 'Birmingham, West Midlands, United Kingdom', type: 'city' },
  { place_id: 9, lat: 51.4344, lon: 6.7623, display_name: 'Duisburg, North Rhine-Westphalia, Germany', type: 'city' },
  { place_id: 10, lat: 25.2048, lon: 55.2708, display_name: 'Dubai, United Arab Emirates', type: 'city' },
  { place_id: 11, lat: 35.6762, lon: 139.6503, display_name: 'Tokyo, Japan', type: 'city' },
  { place_id: 12, lat: -33.8688, lon: 151.2093, display_name: 'Sydney, NSW, Australia', type: 'city' },
  { place_id: 13, lat: 43.6532, lon: -79.3832, display_name: 'Toronto, Ontario, Canada', type: 'city' },
];

/**
 * Searches worldwide locations via OpenStreetMap Nominatim with fast local index fallback.
 */
export async function searchWorldwideLocations(query: string): Promise<GeocodingResult[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&limit=6&addressdetails=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          place_id: item.place_id,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
          display_name: item.display_name,
          type: item.type || 'location',
          address: item.address,
        }));
      }
    }
  } catch (err) {
    // Graceful offline fallback
    console.debug('Nominatim network lookup offline, using local global index');
  }

  // Filter local global hubs
  const lowerQ = q.toLowerCase();
  return GLOBAL_HUBS.filter(
    (h) => h.display_name.toLowerCase().includes(lowerQ)
  );
}

/**
 * Calculate Haversine distance in kilometers between two coordinates.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Fetches driving route between two points using OSRM, or calculates geodesic straight-line preview.
 */
export async function getRouteBetweenPoints(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number
): Promise<RouteResult> {
  const distanceKm = calculateHaversineDistance(startLat, startLon, endLat, endLon);
  // Default estimated duration: ~60 km/h average commercial trucking speed
  const defaultMinutes = Math.round((distanceKm / 60) * 60) + 15;

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // GeoJSON coordinates are [lon, lat], Leaflet polyline needs [lat, lon]
        const coords: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );
        return {
          coordinates: coords,
          distanceKm: Math.round((route.distance / 1000) * 10) / 10,
          durationMinutes: Math.round(route.duration / 60),
          isDrivingRoute: true,
          summary: 'OSRM Highway Network Route',
        };
      }
    }
  } catch (err) {
    console.debug('OSRM route calculation unavailable, falling back to straight-line path');
  }

  // Straight line fallback (generates intermediate points for smooth curve)
  const steps = 10;
  const straightLineCoords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const factor = i / steps;
    straightLineCoords.push([
      startLat + (endLat - startLat) * factor,
      startLon + (endLon - startLon) * factor,
    ]);
  }

  return {
    coordinates: straightLineCoords,
    distanceKm,
    durationMinutes: defaultMinutes,
    isDrivingRoute: false,
    summary: 'Straight-line preview (Driving routing service unavailable)',
  };
}

/**
 * Gets user's browser location via Geolocation API.
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  });
}

/**
 * Reverse geocodes coordinates to address name using Nominatim with fallback.
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { signal: controller.signal, headers: { 'Accept-Language': 'en' } });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name.split(',').slice(0, 3).join(',');
      }
    }
  } catch {
    // ignore
  }
  return `Industrial Zone (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
}

// Aliases for compatibility
export const searchNominatim = searchWorldwideLocations;
export const getCurrentPosition = getUserLocation;


