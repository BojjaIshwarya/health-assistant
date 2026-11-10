import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  SupportedLanguage, 
  ActiveView, 
  HealthRecordEntry 
} from '../types';
import { TRANSLATIONS } from '../translations';
import { 
  getBMICategory, 
  calculatePersonalTargets, 
  getHealthRecords 
} from '../services/storageService';
import { 
  Heart, 
  Activity, 
  TrendingUp, 
  Droplets, 
  Flame, 
  Plus, 
  CheckCircle, 
  Clock, 
  FileText,
  UserCheck
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: UserProfile;
  language: SupportedLanguage;
  onNavigate: (view: ActiveView) => void;
  onOpenSidebar: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  language,
  onNavigate,
}) => {
  const t = TRANSLATIONS[language];
  const bmiInfo = getBMICategory(currentUser.bmi);
  const targets = calculatePersonalTargets(currentUser);

  // Retrieve user's actual personal recordings (isolated to this user)
  const [userRecords, setUserRecords] = useState<HealthRecordEntry[]>([]);

  useEffect(() => {
    setUserRecords(getHealthRecords(currentUser.id));
  }, [currentUser.id]);

  // Find latest recorded vitals for this person
  const latestVitals = userRecords.find(r => r.metrics && (r.metrics.systolicBP || r.metrics.heartRate || r.metrics.bloodSugar));

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* Personalized Welcome Banner - NO 'Active Health Profile' and NO 'Member ID' */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t.brandTitle}
            </h1>
            <p className="mt-2 text-sm text-teal-100/90 leading-relaxed">
              {t.coreServicesSubtitle}
            </p>

            {/* Person's Demographic Baseline */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center gap-2">
                <span className="text-teal-200">{t.age}:</span>
                <span className="font-bold">{currentUser.age} yrs</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center gap-2">
                <span className="text-teal-200">{t.bloodGroup}:</span>
                <span className="font-bold text-rose-300">{currentUser.bloodGroup}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 flex items-center gap-2">
                <span className="text-teal-200">{t.height} / {t.weight}:</span>
                <span className="font-bold">{currentUser.heightCm} cm / {currentUser.weightKg} kg</span>
              </div>
            </div>
          </div>

          {/* BMI Status Card */}
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[260px] text-center lg:text-right shrink-0">
            <div className="text-xs text-teal-200 uppercase tracking-wider font-semibold">
              {t.bmiStatus}
            </div>
            <div className="text-4xl font-black text-white mt-1">
              {currentUser.bmi}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-teal-900 shadow-sm">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>{bmiInfo.label}</span>
            </div>
            <p className="text-[11px] text-teal-200/80 mt-2">
              {t.normalRange}: 18.5 – 24.9 kg/m²
            </p>
          </div>
        </div>
      </div>

      {/* Person's Specific Physiological Targets (Calculated from user's height, weight, age, and gender) */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>{t.calculatedTargets}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">{t.recommendedBp}</span>
            <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
              <span>{targets.targetBP}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">{t.normalRange}</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Target Resting Heart Rate</span>
            <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
              <span>{targets.targetRestingHR}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Resting pulse range</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">{t.recommendedCalories}</span>
            <div className="text-xl font-black text-amber-600 mt-1 flex items-baseline gap-1">
              <span>{targets.dailyCalories}</span>
              <span className="text-xs font-semibold text-slate-400">kcal / day</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Calculated from BMR &amp; activity</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">{t.recommendedWater}</span>
            <div className="text-xl font-black text-blue-600 mt-1 flex items-baseline gap-1">
              <span>{targets.dailyWaterLiters}</span>
              <span className="text-xs font-semibold text-slate-400">Liters / day</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Based on {currentUser.weightKg} kg body weight</span>
          </div>

        </div>
      </div>

      {/* Latest Logged Vitals (Derived strictly from this user's actual recordings) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{t.latestRecordedVitals}</span>
          </h2>

          <button
            type="button"
            onClick={() => onNavigate('health-records')}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.logFirstVitals}</span>
          </button>
        </div>

        {latestVitals && latestVitals.metrics ? (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-slate-900">{latestVitals.title}</span>
                <p className="text-xs text-slate-500">{latestVitals.summary}</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">Recorded: {latestVitals.date}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              {latestVitals.metrics.systolicBP && latestVitals.metrics.diastolicBP && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Blood Pressure</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5">
                    {latestVitals.metrics.systolicBP}/{latestVitals.metrics.diastolicBP} <span className="text-xs text-slate-400 font-normal">mmHg</span>
                  </div>
                </div>
              )}

              {latestVitals.metrics.bloodSugar && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Fasting Sugar</span>
                  <div className="text-xl font-black text-blue-600 mt-0.5">
                    {latestVitals.metrics.bloodSugar} <span className="text-xs text-slate-400 font-normal">mg/dL</span>
                  </div>
                </div>
              )}

              {latestVitals.metrics.heartRate && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Resting Heart Rate</span>
                  <div className="text-xl font-black text-rose-600 mt-0.5">
                    {latestVitals.metrics.heartRate} <span className="text-xs text-slate-400 font-normal">BPM</span>
                  </div>
                </div>
              )}

              {latestVitals.metrics.weightKg && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block">Recorded Weight</span>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">
                    {latestVitals.metrics.weightKg} <span className="text-xs text-slate-400 font-normal">kg</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t.noRecordsYet}</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                You have not logged any personal vitals yet. Click below to record your blood pressure, heart rate, or blood glucose.
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

      {/* NO DUPLICATE HEALTHCARE MODULES FIG 2 AND NO RESEARCH EXTENSION PAGE 720 CARDS HERE!
          All features are accessible directly from the 3-line Sidebar menu! */}

    </div>
  );
};
