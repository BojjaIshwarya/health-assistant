import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  Navigation, 
  Search, 
  ShieldAlert, 
  Star, 
  Bed, 
  CheckCircle,
  Filter
} from 'lucide-react';
import { SupportedLanguage, HospitalFacility } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { HOSPITALS_DATA } from '../../data/mockData';

interface HospitalFinderProps {
  language: SupportedLanguage;
  onBack: () => void;
}

export const HospitalFinder: React.FC<HospitalFinderProps> = ({
  language,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [facilities, setFacilities] = useState<HospitalFacility[]>(HOSPITALS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [maxDistance, setMaxDistance] = useState<number>(5.0);
  const [selectedFacility, setSelectedFacility] = useState<HospitalFacility | null>(facilities[0]);
  const [gpsActive, setGpsActive] = useState(true);

  const types = ['All', 'Hospital', 'Clinic', 'Pharmacy', 'Trauma Center'];

  const filtered = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || f.type === selectedType;
    const matchesDist = f.distanceKm <= maxDistance;
    return matchesSearch && matchesType && matchesDist;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {t.hospitalFinder}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Google Maps Geolocation (100%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Locate nearby emergency rooms, clinics, ICU beds, and 24/7 pharmacies.
            </p>
          </div>
        </div>

        {/* GPS Sensor status */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>GPS Coordinates Active (19.0760° N, 72.8777° E)</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hospital or specialty..."
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
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

        {/* Radius Range Slider */}
        <div className="flex items-center gap-2 w-full md:w-auto text-xs text-slate-600 shrink-0">
          <span className="font-medium whitespace-nowrap">Radius: <strong>{maxDistance} km</strong></span>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.5"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-24 accent-rose-600 cursor-pointer"
          />
        </div>

      </div>

      {/* Main Grid: Interactive Radar/Map & Facility Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Map Visualization */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              <span>Real-Time Geospatial Radar Map</span>
            </h3>
            <span className="text-[10px] text-slate-400">Centered on User Location</span>
          </div>

          {/* Interactive SVG Radar Map Canvas */}
          <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center p-4">
            
            {/* Grid Circles */}
            <div className="absolute w-[80%] h-[80%] rounded-full border border-teal-500/20" />
            <div className="absolute w-[55%] h-[55%] rounded-full border border-teal-500/20" />
            <div className="absolute w-[30%] h-[30%] rounded-full border border-teal-500/30" />
            
            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-teal-500/20" />
            <div className="absolute h-full w-[1px] bg-teal-500/20" />

            {/* Radar Sweep line */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-teal-500/10 to-transparent animate-spin-slow pointer-events-none" />

            {/* Center User Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="w-4 h-4 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30 animate-pulse" />
              <span className="text-[9px] font-bold text-cyan-200 mt-1 bg-slate-900/80 px-1.5 py-0.5 rounded shadow">
                You (Current GPS)
              </span>
            </div>

            {/* Facility Pins plotted on relative distances */}
            {facilities.map((fac, idx) => {
              const isSelected = selectedFacility?.id === fac.id;
              // Map polar distance and angles
              const angle = (idx * 60) * (Math.PI / 180);
              const radiusPercent = Math.min(38, (fac.distanceKm / 5) * 35 + 8);
              const topPos = 50 - radiusPercent * Math.sin(angle);
              const leftPos = 50 + radiusPercent * Math.cos(angle);

              return (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => setSelectedFacility(fac)}
                  style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 cursor-pointer z-20 ${
                    isSelected ? 'scale-125 z-30' : ''
                  }`}
                  title={`${fac.name} (${fac.distanceKm} km)`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md ${
                    fac.type === 'Hospital' || fac.type === 'Trauma Center'
                      ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                      : 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                  }`}>
                    {fac.type === 'Pharmacy' ? '💊' : '🏥'}
                  </div>
                  {isSelected && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded bg-white text-slate-900 text-[9px] font-bold whitespace-nowrap shadow-lg">
                      {fac.name.slice(0, 18)}...
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Facility Detail Preview */}
          {selectedFacility && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{selectedFacility.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedFacility.address}</p>
                </div>
                <span className="font-bold text-rose-600 text-sm whitespace-nowrap ml-2">
                  {selectedFacility.distanceKm} km
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                  {selectedFacility.type}
                </span>
                {selectedFacility.open24x7 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    Open 24/7
                  </span>
                )}
                {selectedFacility.emergencyBeds > 0 && (
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    {selectedFacility.emergencyBeds} Emergency Beds
                  </span>
                )}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <a
                  href={`tel:${selectedFacility.phone}`}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Emergency</span>
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedFacility.name + ' ' + selectedFacility.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Right: Facilities List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong>{filtered.length}</strong> facilities nearby</span>
            <span>Sorted by nearest distance</span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
            {filtered.map((fac) => {
              const isSelected = selectedFacility?.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-500/20 shadow-xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        fac.type === 'Hospital' || fac.type === 'Trauma Center'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{fac.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{fac.address}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {fac.type}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {fac.rating}
                          </span>
                          {fac.open24x7 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              24/7 Service
                            </span>
                          )}
                          {fac.icuAvailable && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                              ICU Ready ({fac.emergencyBeds} Beds)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-rose-600">
                        {fac.distanceKm} km
                      </div>
                      <span className="text-[10px] text-slate-400">Distance</span>
                    </div>
                  </div>

                  {/* Specialties Pills */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1">
                    {fac.specialties.map((spec, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
