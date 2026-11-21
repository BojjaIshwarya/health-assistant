import React, { useState, useEffect, useMemo } from 'react';
import {
  UserProfile,
  SupportedLanguage,
  ActiveView,
  HealthRecordEntry,
} from '../types';
import { TRANSLATIONS } from '../translations';
import {
  getBMICategory,
  calculatePersonalTargets,
  getHealthRecords,
} from '../services/storageService';
import {
  Activity,
  Plus,
  CheckCircle,
  Clock,
  Sun,
} from 'lucide-react';
import wellnessHeroImg from '../assets/images/wellness_sanctuary_hero_1795259460501.jpg';
import photoVoiceImg from '../assets/images/photo_voice_checkin_1795259460982.jpg';

interface DashboardViewProps {
  currentUser: UserProfile;
  language: SupportedLanguage;
  onNavigate: (view: ActiveView) => void;
  onOpenSidebar: () => void;
}

const DAILY_QUOTES = [
  '“Take a deep breath. Every gentle step toward caring for yourself makes today brighter.”',
  '“Health is a peaceful harmony of body, mind, and small daily habits done with kindness.”',
  '“Listen softly to your body, nourish it well, and allow yourself time to rest and heal.”',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  language,
  onNavigate,
}) => {
  const t = TRANSLATIONS[language];
  const bmiInfo = getBMICategory(currentUser.bmi);
  const targets = calculatePersonalTargets(currentUser);

  const [userRecords, setUserRecords] = useState<HealthRecordEntry[]>([]);

  useEffect(() => {
    setUserRecords(getHealthRecords(currentUser.id));
  }, [currentUser.id]);

  const greetingLabel = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const quoteOfDay = useMemo(() => {
    const idx = new Date().getDate() % DAILY_QUOTES.length;
    return DAILY_QUOTES[idx];
  }, []);

  const latestCheckIn = userRecords.find(
    (r) =>
      r.metrics &&
      (r.metrics.systolicBP || r.metrics.heartRate || r.metrics.bloodSugar)
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Refreshing Sanctuary Welcome Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>
                  {greetingLabel}, {currentUser.name}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2 text-balance">
                Welcome back to your calm wellness space
              </h1>

              <blockquote className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                {quoteOfDay}
              </blockquote>
            </div>

            {/* Clean Unboxed Baseline Summary + Body Balance */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 tabular-nums">
                <span>
                  <strong className="text-slate-900">{currentUser.age}</strong> yrs
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Blood Group <strong className="text-rose-600">{currentUser.bloodGroup}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="text-slate-900">{currentUser.heightCm}</strong> cm /{' '}
                  <strong className="text-slate-900">{currentUser.weightKg}</strong> kg
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-bold text-slate-900 tabular-nums">
                  BMI {currentUser.bmi}
                </span>
                <span className="text-slate-400" aria-hidden="true">
                  ·
                </span>
                <span className="font-semibold text-teal-700">{bmiInfo.label}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[220px] bg-gradient-to-br from-teal-50 via-emerald-50 to-amber-50">
            <img
              src={wellnessHeroImg}
              alt="Peaceful sunlit oak table with herbal tea and wellness journal"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Healthy Daily Goals */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>{t.calculatedTargets}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">
              {t.recommendedBp}
            </span>
            <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
              {targets.targetBP}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {t.normalRange}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">
              Resting Heart Rate Goal
            </span>
            <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">
              {targets.targetRestingHR}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Calm everyday heartbeat range
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">
              {t.recommendedCalories}
            </span>
            <div className="text-xl font-black text-amber-600 mt-1 tabular-nums">
              {targets.dailyCalories}
              <span className="text-xs font-semibold text-slate-400 ml-1">
                kcal / day
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Balanced energy for your day
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">
              {t.recommendedWater}
            </span>
            <div className="text-xl font-black text-sky-600 mt-1 tabular-nums">
              {targets.dailyWaterLiters}
              <span className="text-xs font-semibold text-slate-400 ml-1">
                Liters / day
              </span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block tabular-nums">
              Matched to {currentUser.weightKg} kg body weight
            </span>
          </div>
        </div>
      </div>

      {/* Latest Health Check-In */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>{t.latestRecordedVitals}</span>
          </h2>

          <button
            type="button"
            onClick={() => onNavigate('health-records')}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.logFirstVitals}</span>
          </button>
        </div>

        {latestCheckIn && latestCheckIn.metrics ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-900">
                  {latestCheckIn.title === 'Self-Monitored Vitals & Hemodynamics'
                    ? 'Daily Health Check-In'
                    : latestCheckIn.title}
                </span>
                <p className="text-xs text-slate-500">{latestCheckIn.summary}</p>
              </div>
              <span className="text-xs text-slate-400 font-medium tabular-nums">
                Saved {latestCheckIn.date}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              {latestCheckIn.metrics.systolicBP && latestCheckIn.metrics.diastolicBP && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">
                    Blood Pressure
                  </span>
                  <div className="text-xl font-black text-slate-900 mt-0.5 tabular-nums">
                    {latestCheckIn.metrics.systolicBP}/
                    {latestCheckIn.metrics.diastolicBP}{' '}
                    <span className="text-xs text-slate-400 font-normal">mmHg</span>
                  </div>
                </div>
              )}

              {latestCheckIn.metrics.bloodSugar && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">
                    Morning Sugar
                  </span>
                  <div className="text-xl font-black text-sky-600 mt-0.5 tabular-nums">
                    {latestCheckIn.metrics.bloodSugar}{' '}
                    <span className="text-xs text-slate-400 font-normal">mg/dL</span>
                  </div>
                </div>
              )}

              {latestCheckIn.metrics.heartRate && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">
                    Resting Heart Rate
                  </span>
                  <div className="text-xl font-black text-rose-600 mt-0.5 tabular-nums">
                    {latestCheckIn.metrics.heartRate}{' '}
                    <span className="text-xs text-slate-400 font-normal">bpm</span>
                  </div>
                </div>
              )}

              {latestCheckIn.metrics.weightKg && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">
                    Saved Weight
                  </span>
                  <div className="text-xl font-black text-emerald-600 mt-0.5 tabular-nums">
                    {latestCheckIn.metrics.weightKg}{' '}
                    <span className="text-xs text-slate-400 font-normal">kg</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t.noRecordsYet}</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Start your gentle wellness log by saving your blood pressure, morning sugar, heart rate, or how you feel today.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('health-records')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t.logFirstVitals}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Care Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <button
          type="button"
          onClick={() => onNavigate('health-chatbot')}
          className="text-left bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-full h-36 rounded-2xl overflow-hidden bg-teal-50 mb-3">
            <img
              src="/images/chatbot-assistant.svg"
              alt="24/7 Health Chatbot Assistant"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {t.healthChatbot}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ask any question gently by typing, speaking, or sharing a photo.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('diet-planner')}
          className="text-left bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-full h-36 rounded-2xl overflow-hidden bg-amber-50 mb-3">
            <img
              src="/images/nutrition-diet.svg"
              alt="Personalized Diet Planner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {t.dietPlanner}
            </h3>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              Nourishing everyday meals shaped around your {targets.dailyCalories} kcal goal.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('hospital-finder')}
          className="text-left bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-full h-36 rounded-2xl overflow-hidden bg-sky-50 mb-3">
            <img
              src="/images/hospital-care.svg"
              alt="Nearby Hospital Finder"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {t.hospitalFinder}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Search nearby clinics and hospitals by name, area, and distance.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('vision-audio')}
          className="text-left bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="w-full h-36 rounded-2xl overflow-hidden bg-emerald-50 mb-3">
            <img
              src={photoVoiceImg}
              alt="Photo and Voice Health Check-In Sanctuary"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              {t.visionAudioModels}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Share a photo or voice clip for calm, easy-to-follow guidance.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
