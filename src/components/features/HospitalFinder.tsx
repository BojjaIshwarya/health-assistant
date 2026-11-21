import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Navigation,
  Search,
  Star,
  LocateFixed,
  Loader2,
  ExternalLink,
  AlertCircle,
  Clock,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { SupportedLanguage, HospitalFacility } from '../../types';
import { TRANSLATIONS } from '../../translations';

interface HospitalFinderProps {
  language: SupportedLanguage;
  onBack: () => void;
}

interface SearchCenter {
  lat: number;
  lng: number;
  label: string;
}

const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';
const RADIUS_PRESETS_KM = [2, 5, 10, 25, 50];

interface MapViewportEffectsProps {
  center: SearchCenter | null;
  radiusKm: number;
  selectedFacility: HospitalFacility | null;
  fitBoundsTrigger: number;
}

interface CircleLike {
  setMap: (m: unknown) => void;
  setCenter: (c: { lat: number; lng: number }) => void;
  setRadius: (r: number) => void;
  getBounds: () => unknown;
}

const MapViewportAndCircleOverlay: React.FC<MapViewportEffectsProps> = ({
  center,
  radiusKm,
  selectedFacility,
  fitBoundsTrigger,
}) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const circleRef = useRef<CircleLike | null>(null);

  // Render & update translucent distance radius circle around the active search center
  useEffect(() => {
    if (!map || !mapsLib || !center) {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      return;
    }

    if (!circleRef.current) {
      circleRef.current = new mapsLib.Circle({
        map,
        center: { lat: center.lat, lng: center.lng },
        radius: radiusKm * 1000,
        strokeColor: '#e11d48',
        strokeOpacity: 0.75,
        strokeWeight: 2,
        fillColor: '#fb7185',
        fillOpacity: 0.1,
        clickable: false,
      }) as unknown as CircleLike;
    } else {
      circleRef.current.setMap(map);
      circleRef.current.setCenter({ lat: center.lat, lng: center.lng });
      circleRef.current.setRadius(radiusKm * 1000);
    }
  }, [map, mapsLib, center, radiusKm]);

  useEffect(() => {
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, []);

  // Auto-fit map viewport whenever search center or radius commits
  useEffect(() => {
    if (!map || !center) return;
    if (circleRef.current) {
      const bounds = circleRef.current.getBounds();
      if (bounds) {
        map.fitBounds(bounds as Parameters<typeof map.fitBounds>[0], 36);
        return;
      }
    }
    map.panTo({ lat: center.lat, lng: center.lng });
  }, [map, center, radiusKm, fitBoundsTrigger]);

  // Smoothly pan to facility when user clicks a card in the list
  useEffect(() => {
    if (!map || !selectedFacility) return;
    map.panTo(selectedFacility.coordinates);
  }, [map, selectedFacility]);

  return null;
};

interface HospitalMarkerProps {
  facility: HospitalFacility;
  isSelected: boolean;
  onSelect: (facility: HospitalFacility) => void;
  onClose: () => void;
}

const HospitalMarkerItem: React.FC<HospitalMarkerProps> = ({
  facility,
  isSelected,
  onSelect,
  onClose,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const pinPalette = isSelected
    ? { background: '#0f172a', borderColor: '#ffffff', glyphColor: '#ffffff' }
    : facility.type === 'Pharmacy'
    ? { background: '#059669', borderColor: '#ecfdf5', glyphColor: '#ffffff' }
    : facility.type === 'Clinic'
    ? { background: '#0d9488', borderColor: '#f0fdfa', glyphColor: '#ffffff' }
    : { background: '#e11d48', borderColor: '#fff1f2', glyphColor: '#ffffff' };

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={facility.coordinates}
        title={`${facility.name} (${facility.distanceKm} km)`}
        zIndex={isSelected ? 50 : 10}
        onClick={() => onSelect(facility)}
      >
        <Pin
          background={pinPalette.background}
          borderColor={pinPalette.borderColor}
          glyphColor={pinPalette.glyphColor}
          scale={isSelected ? 1.25 : 1.0}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow anchor={marker} onCloseClick={onClose} maxWidth={270}>
          <div className="text-slate-900 space-y-1.5 p-0.5 text-xs">
            <div className="font-bold text-sm leading-snug">{facility.name}</div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                {facility.primaryTypeDisplay || facility.type}
              </span>
              {facility.rating > 0 && (
                <span className="font-semibold text-amber-700">
                  ★ {facility.rating}
                  {facility.userRatingCount ? ` (${facility.userRatingCount})` : ''}
                </span>
              )}
              {facility.distanceKm > 0 && (
                <span className="font-bold text-slate-700">{facility.distanceKm} km</span>
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">{facility.address}</p>
            <div className="pt-1 flex items-center gap-2">
              {facility.phone && (
                <a
                  href={`tel:${facility.phone}`}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
                >
                  Call
                </a>
              )}
              <a
                href={
                  facility.directionsUri ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${facility.name} ${facility.address}`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800"
              >
                Directions
              </a>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapLoadGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-600 p-6 text-center rounded-2xl">
        <AlertCircle className="w-8 h-8 text-amber-600 mb-2" />
        <p className="text-sm font-bold text-slate-800">Interactive Map Temporarily Unavailable</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Hospital search results remain available in the list view, and you can open any facility directly in Google Maps.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export const HospitalFinder: React.FC<HospitalFinderProps> = ({
  language,
  onBack,
}) => {
  const t = TRANSLATIONS[language];

  // Google Maps JS API Key (loaded from Vite env or /api/maps/config)
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [configLoaded, setConfigLoaded] = useState<boolean>(
    () => Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
  );

  // Search Inputs
  const [hospitalQuery, setHospitalQuery] = useState('');
  const [placeQuery, setPlaceQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [strictRadius, setStrictRadius] = useState<boolean>(true);

  // Active Geolocation / Search Center
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'detecting' | 'active' | 'denied' | 'idle'>('detecting');
  const [searchCenter, setSearchCenter] = useState<SearchCenter | null>(null);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState<number>(0);

  // Search Results State
  const [facilities, setFacilities] = useState<HospitalFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<HospitalFacility | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [expandedOutsideRadius, setExpandedOutsideRadius] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearchedOnce, setHasSearchedOnce] = useState<boolean>(false);

  const facilityCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const debounceTimerRef = useRef<number | null>(null);

  const types = ['All', 'Hospital', 'Clinic', 'Pharmacy', 'Trauma Center'];

  // Fetch server-configured Google Maps key if not bundled via VITE_GOOGLE_MAPS_API_KEY
  useEffect(() => {
    if (mapsApiKey) return;
    let active = true;
    fetch('/api/maps/config')
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data?.apiKey) setMapsApiKey(data.apiKey);
        setConfigLoaded(true);
      })
      .catch(() => {
        if (active) setConfigLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [mapsApiKey]);

  const executeSearch = useCallback(
    async (opts?: {
      overrideQuery?: string;
      overridePlace?: string;
      overrideLat?: number;
      overrideLng?: number;
      overrideRadiusKm?: number;
      overrideType?: string;
      overrideOpenNow?: boolean;
      overrideStrictRadius?: boolean;
      pageToken?: string;
      append?: boolean;
    }) => {
      const q = opts?.overrideQuery !== undefined ? opts.overrideQuery : hospitalQuery;
      const p = opts?.overridePlace !== undefined ? opts.overridePlace : placeQuery;
      const rKm = opts?.overrideRadiusKm !== undefined ? opts.overrideRadiusKm : radiusKm;
      const fType = opts?.overrideType !== undefined ? opts.overrideType : selectedType;
      const oNow = opts?.overrideOpenNow !== undefined ? opts.overrideOpenNow : openNowOnly;
      const sRad = opts?.overrideStrictRadius !== undefined ? opts.overrideStrictRadius : strictRadius;
      const useLat = opts?.overrideLat !== undefined ? opts.overrideLat : gpsCoords?.lat;
      const useLng = opts?.overrideLng !== undefined ? opts.overrideLng : gpsCoords?.lng;

      if (!p.trim() && !q.trim() && (useLat === undefined || useLng === undefined)) {
        return;
      }

      if (opts?.append) {
        setIsLoadingMore(true);
      } else {
        setIsSearching(true);
        setSearchError(null);
      }

      try {
        const res = await fetch('/api/hospitals/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q.trim(),
            place: p.trim(),
            lat: p.trim() ? undefined : useLat,
            lng: p.trim() ? undefined : useLng,
            radiusKm: rKm,
            facilityType: fType,
            openNow: oNow,
            strictRadius: sRad,
            pageToken: opts?.pageToken,
            language,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 429 || data?.quotaExceeded) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
          setSearchError(
            'Unable to load live hospital results right now due to quota limits.'
          );
          return;
        }

        if (!res.ok) {
          setSearchError(data?.error || 'Could not search hospitals for this query.');
          if (!opts?.append) setFacilities([]);
          return;
        }

        const incoming: HospitalFacility[] = Array.isArray(data?.facilities)
          ? data.facilities
          : [];

        if (opts?.append) {
          setFacilities((prev) => {
            const seen: Record<string, boolean> = {};
            const merged: HospitalFacility[] = [];
            for (const item of prev) {
              seen[item.id] = true;
              merged.push(item);
            }
            for (const item of incoming) {
              if (!seen[item.id]) {
                seen[item.id] = true;
                merged.push(item);
              }
            }
            return merged;
          });
        } else {
          setFacilities(incoming);
          setSelectedFacility(incoming[0] || null);
          if (data?.center) {
            setSearchCenter(data.center);
            setFitBoundsTrigger((n) => n + 1);
          }
        }

        setNextPageToken(data?.nextPageToken || null);
        setExpandedOutsideRadius(Boolean(data?.expandedOutsideRadius));
        setHasSearchedOnce(true);
      } catch {
        setSearchError('Network error while searching hospitals. Please try again.');
      } finally {
        setIsSearching(false);
        setIsLoadingMore(false);
      }
    },
    [
      hospitalQuery,
      placeQuery,
      radiusKm,
      selectedType,
      openNowOnly,
      strictRadius,
      gpsCoords,
      language,
    ]
  );

  // Request user's real browser GPS location on mount
  const detectMyLocation = useCallback(
    (autoTriggerSearch = true) => {
      if (!('geolocation' in navigator)) {
        setGpsStatus('denied');
        return;
      }

      setGpsStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          setGpsCoords({ lat, lng });
          setGpsStatus('active');
          setPlaceQuery('');
          if (autoTriggerSearch) {
            void executeSearch({
              overridePlace: '',
              overrideLat: lat,
              overrideLng: lng,
            });
          }
        },
        () => {
          setGpsStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    },
    [executeSearch]
  );

  useEffect(() => {
    detectMyLocation(true);
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-run debounced search automatically when radius, type filter, openNow, or strictRadius changes
  useEffect(() => {
    if (!hasSearchedOnce && !gpsCoords && !placeQuery.trim() && !hospitalQuery.trim()) {
      return;
    }
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      void executeSearch();
    }, 450);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm, selectedType, openNowOnly, strictRadius]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    void executeSearch();
  };

  const handleSelectFacility = (fac: HospitalFacility) => {
    setSelectedFacility(fac);
    const el = facilityCardRefs.current[fac.id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleLoadMoreNearbyOrText = () => {
    if (nextPageToken) {
      void executeSearch({ pageToken: nextPageToken, append: true });
      return;
    }
    // If initial Nearby Search returned 20 items, seamlessly query Text Search for additional facilities in the area
    if (searchCenter) {
      const queryText = hospitalQuery.trim()
        ? hospitalQuery.trim()
        : selectedType === 'All'
        ? placeQuery.trim()
          ? `hospital and medical clinic in ${placeQuery.trim()}`
          : 'hospital medical clinic pharmacy'
        : placeQuery.trim()
        ? `${selectedType} in ${placeQuery.trim()}`
        : selectedType;
      void executeSearch({
        overrideQuery: queryText,
        append: true,
      });
    }
  };

  const mapCenter = searchCenter ||
    (gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng, label: 'Current Location' } : null) || {
      lat: 20.5937,
      lng: 78.9629,
      label: 'Search a place or hospital',
    };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            title={t.backToDashboard}
          >
            <ArrowLeft className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold">{t.back}</span>
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {t.hospitalFinder}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Search hospitals and clinics by name or place, and adjust your distance from 0.5 km to 50 km — care is close at hand.
            </p>
          </div>
        </div>

        {/* Location Status Indicator */}
        <div className="flex items-center gap-2">
          {gpsStatus === 'active' && !placeQuery.trim() && gpsCoords ? (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                GPS Active ({gpsCoords.lat.toFixed(3)}°, {gpsCoords.lng.toFixed(3)}°)
              </span>
            </div>
          ) : searchCenter ? (
            <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-2 max-w-xs truncate">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate">{searchCenter.label}</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-2">
              <LocateFixed className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {gpsStatus === 'detecting'
                  ? 'Detecting GPS location...'
                  : 'Enter a place or hospital name'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Criteria Search & Distance Radius Control Card */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search by Hospital Name or Specialty */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={hospitalQuery}
              onChange={(e) => setHospitalQuery(e.target.value)}
              placeholder="Hospital name or specialty (e.g. Apollo, AIIMS, Dental)..."
              className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:outline-none"
            />
          </div>

          {/* Search by Place / City / Area + Use GPS button */}
          <div className="md:col-span-5 flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={placeQuery}
                onChange={(e) => setPlaceQuery(e.target.value)}
                placeholder="City, area, or pincode (blank = My GPS)..."
                className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => detectMyLocation(true)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
              title="Use my current GPS location"
            >
              <LocateFixed className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">My GPS</span>
            </button>
          </div>

          {/* Submit Search Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Second Row: Type Filters + Radius Slider & Presets + Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          {/* Facility Type Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Distance Radius Slider & Presets */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="font-semibold whitespace-nowrap">
                Radius: <strong className="text-rose-700">{radiusKm} km</strong>
              </span>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-28 sm:w-36 accent-rose-600 cursor-pointer"
                aria-label="Search radius in kilometers"
              />
            </div>

            {/* Quick Radius Presets */}
            <div className="flex items-center gap-1">
              {RADIUS_PRESETS_KM.map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => setRadiusKm(km)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    radiusKm === km
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {km}km
                </button>
              ))}
            </div>

            {/* Open Now & Strict Radius Toggles */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={openNowOnly}
                onChange={(e) => setOpenNowOnly(e.target.checked)}
                className="accent-emerald-600 rounded cursor-pointer"
              />
              <span>Open Now</span>
            </label>

            <label
              className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-slate-600"
              title="Strictly filter results within the selected distance radius"
            >
              <input
                type="checkbox"
                checked={strictRadius}
                onChange={(e) => setStrictRadius(e.target.checked)}
                className="accent-rose-600 rounded cursor-pointer"
              />
              <span>Within {radiusKm} km</span>
            </label>
          </div>
        </div>
      </form>

      {/* Alerts / Helpful Search Notices */}
      {searchError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {expandedOutsideRadius && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between gap-2 flex-wrap">
          <span>
            No facilities named <strong>&ldquo;{hospitalQuery}&rdquo;</strong> were found within {radiusKm} km — showing matching facilities found farther away with their exact distances.
          </span>
          <button
            type="button"
            onClick={() => setRadiusKm(50)}
            className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold text-[11px] hover:bg-amber-100 cursor-pointer"
          >
            Expand to 50 km
          </button>
        </div>
      )}

      {/* Main Split View: Live Google Map (Left) + Real Hospital Results List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real Interactive Google Map */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Interactive Hospital Map</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              {radiusKm} km radius
            </span>
          </div>

          <div className="w-full h-[380px] sm:h-[440px] lg:h-[500px] rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100">
            {!configLoaded ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                <span>Initializing Google Maps...</span>
              </div>
            ) : !mapsApiKey ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-600 text-xs">
                <AlertCircle className="w-7 h-7 text-amber-500 mb-2" />
                <p className="font-bold text-slate-800">Google Maps Key Pending</p>
                <p className="mt-1">
                  Configure your Google Maps API key to load the interactive map view.
                </p>
              </div>
            ) : (
              <APIProvider
                apiKey={mapsApiKey}
                libraries={['places', 'marker']}
                language={language}
              >
                <MapLoadGuard>
                  <GoogleMap
                    defaultCenter={{ lat: mapCenter.lat, lng: mapCenter.lng }}
                    defaultZoom={12}
                    mapId="DEMO_MAP_ID"
                    gestureHandling="greedy"
                    internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <MapViewportAndCircleOverlay
                      center={searchCenter}
                      radiusKm={radiusKm}
                      selectedFacility={selectedFacility}
                      fitBoundsTrigger={fitBoundsTrigger}
                    />

                    {/* Active Search Center Marker */}
                    {searchCenter && (
                      <AdvancedMarker
                        position={{ lat: searchCenter.lat, lng: searchCenter.lng }}
                        title={searchCenter.label}
                        zIndex={5}
                      >
                        <div className="flex flex-col items-center">
                          <span className="w-4 h-4 rounded-full bg-teal-600 border-2 border-white shadow-md ring-4 ring-teal-500/30" />
                        </div>
                      </AdvancedMarker>
                    )}

                    {/* Facility Markers + Anchored InfoWindow */}
                    {facilities.map((fac) => (
                      <HospitalMarkerItem
                        key={fac.id}
                        facility={fac}
                        isSelected={selectedFacility?.id === fac.id}
                        onSelect={handleSelectFacility}
                        onClose={() => setSelectedFacility(null)}
                      />
                    ))}
                  </GoogleMap>
                </MapLoadGuard>
              </APIProvider>
            )}
          </div>

          {/* Selected Facility Quick Action Strip */}
          {selectedFacility && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{selectedFacility.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {selectedFacility.address}
                  </p>
                </div>
                {selectedFacility.distanceKm > 0 && (
                  <span className="font-black text-rose-600 text-sm whitespace-nowrap shrink-0">
                    {selectedFacility.distanceKm} km
                  </span>
                )}
              </div>

              <div className="pt-1 flex items-center gap-2">
                {selectedFacility.phone && (
                  <a
                    href={`tel:${selectedFacility.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedFacility.phone}</span>
                  </a>
                )}
                <a
                  href={
                    selectedFacility.directionsUri ||
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedFacility.name} ${selectedFacility.address}`
                    )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Search Results List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 flex-wrap gap-2">
            <span>
              {isSearching ? (
                'Searching Google Maps...'
              ) : (
                <>
                  Showing <strong>{facilities.length}</strong>{' '}
                  {facilities.length === 1 ? 'facility' : 'facilities'}
                  {searchCenter ? ` near ${searchCenter.label}` : ''}
                </>
              )}
            </span>
            <span>Sorted by nearest distance</span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
            {isSearching && facilities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center justify-center text-slate-500 text-xs gap-2.5">
                <Loader2 className="w-7 h-7 animate-spin text-rose-600" />
                <p className="font-semibold text-slate-700">
                  Finding hospitals and clinics within {radiusKm} km...
                </p>
              </div>
            ) : !isSearching && facilities.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {hasSearchedOnce
                      ? `No matching facilities found within ${radiusKm} km`
                      : gpsStatus === 'denied'
                      ? 'Location Access Needed or Enter a Place'
                      : 'Ready to Search Any Hospital'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {hasSearchedOnce
                      ? 'Try increasing the distance radius slider (up to 50 km), switching category to All, or searching a broader city or hospital name.'
                      : 'Enter any hospital name (e.g. Apollo, AIIMS, Mayo Clinic) or city/neighborhood above, or tap My GPS to scan around you.'}
                  </p>
                </div>
                {hasSearchedOnce && radiusKm < 50 && (
                  <button
                    type="button"
                    onClick={() => setRadiusKm(Math.min(50, Math.max(radiusKm + 15, 25)))}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Expand Radius to {Math.min(50, Math.max(radiusKm + 15, 25))} km
                  </button>
                )}
              </div>
            ) : (
              <>
                {facilities.map((fac) => {
                  const isSelected = selectedFacility?.id === fac.id;
                  return (
                    <div
                      key={fac.id}
                      ref={(el) => {
                        facilityCardRefs.current[fac.id] = el;
                      }}
                      onClick={() => setSelectedFacility(fac)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500/20 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              fac.type === 'Pharmacy'
                                ? 'bg-emerald-100 text-emerald-700'
                                : fac.type === 'Clinic'
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {fac.name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                              {fac.address}
                            </p>

                            {/* Metadata Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {fac.primaryTypeDisplay || fac.type}
                              </span>

                              {fac.rating > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  {fac.rating}
                                  {fac.userRatingCount ? ` (${fac.userRatingCount})` : ''}
                                </span>
                              )}

                              {fac.open24x7 ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" /> Open 24/7
                                </span>
                              ) : fac.openNow === true ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  Open Now
                                </span>
                              ) : fac.openNow === false ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  Currently Closed
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base font-black text-rose-600">
                            {fac.distanceKm > 0 ? `${fac.distanceKm} km` : 'Match'}
                          </div>
                          <span className="text-[10px] text-slate-400">Distance</span>
                        </div>
                      </div>

                      {/* Categories & Quick Action Links */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1">
                          {fac.specialties.map((spec, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>

                        <div
                          className="flex items-center gap-2 text-[11px] font-bold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {fac.phone && (
                            <a
                              href={`tel:${fac.phone}`}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>Call</span>
                            </a>
                          )}
                          {fac.websiteUri && (
                            <a
                              href={fac.websiteUri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Website</span>
                            </a>
                          )}
                          <a
                            href={
                              fac.directionsUri ||
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${fac.name} ${fac.address}`
                              )}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Directions</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Facilities Button */}
                {(nextPageToken || facilities.length >= 20) && (
                  <div className="pt-2 flex justify-center">
                    <button
                      type="button"
                      disabled={isLoadingMore}
                      onClick={handleLoadMoreNearbyOrText}
                      className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-800 text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
                    >
                      {isLoadingMore ? (
                        <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                      ) : (
                        <Search className="w-3.5 h-3.5 text-teal-600" />
                      )}
                      <span>Load More Hospitals &amp; Clinics</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
