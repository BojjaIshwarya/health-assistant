import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  TrendingUp,
  Plus,
  Download,
  Activity,
  HeartPulse,
  Search,
  Trash2,
  Droplets,
  Scale,
  Clock,
  X,
} from 'lucide-react';
import { SupportedLanguage, UserProfile, HealthRecordEntry } from '../../types';
import { TRANSLATIONS } from '../../translations';
import {
  getHealthRecords,
  addHealthRecord,
  deleteHealthRecord,
} from '../../services/storageService';
import healthJournalImg from '../../assets/images/health_journal_calm_1795259461885.jpg';

interface HealthRecordsProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

type CategoryFilter = 'All' | 'Check-Ins' | 'Symptom Checks' | 'Screenings' | 'Diet Goals';

function formatFriendlyCategory(category: HealthRecordEntry['category']): string {
  switch (category) {
    case 'Vitals Log':
    case 'Daily Check-In':
      return 'Daily Check-In';
    case 'Specialized ML':
    case 'Health Screening':
      return 'Health Screening';
    case 'Symptom Check':
      return 'Symptom Check';
    case 'Diet Goal':
      return 'Meal & Nutrition';
    default:
      return category;
  }
}

export const HealthRecords: React.FC<HealthRecordsProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [records, setRecords] = useState<HealthRecordEntry[]>(() =>
    getHealthRecords(currentUser.id)
  );
  const [showLogModal, setShowLogModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Daily Check-In form state
  const [systolic, setSystolic] = useState(118);
  const [diastolic, setDiastolic] = useState(78);
  const [bloodSugar, setBloodSugar] = useState(92);
  const [heartRate, setHeartRate] = useState(72);
  const [weight, setWeight] = useState(currentUser.weightKg || 68);
  const [notes, setNotes] = useState('');

  const handleAddCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const heightM = (currentUser.heightCm || 170) / 100;
    const computedBMI = parseFloat((weight / (heightM * heightM)).toFixed(1));

    const newRecord: HealthRecordEntry = {
      id: `rec_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: 'Daily Check-In',
      title: 'Daily Health Check-In',
      summary: `Blood Pressure: ${systolic}/${diastolic} mmHg · Morning Sugar: ${bloodSugar} mg/dL · Resting Heart Rate: ${heartRate} bpm · Weight: ${weight} kg`,
      metrics: {
        systolicBP: systolic,
        diastolicBP: diastolic,
        bloodSugar,
        heartRate,
        weightKg: weight,
        bmi: computedBMI,
      },
      notes: notes.trim() || 'Feeling calm and keeping track of daily wellness.',
    };

    addHealthRecord(currentUser.id, newRecord);
    setRecords(getHealthRecords(currentUser.id));
    setShowLogModal(false);
    setNotes('');
  };

  const handleDeleteEntry = (id: string) => {
    const next = deleteHealthRecord(currentUser.id, id);
    setRecords(next);
    setConfirmDeleteId(null);
  };

  const handleExportSummary = () => {
    const textData = [
      'PERSONAL HEALTH SUMMARY',
      `Prepared on: ${new Date().toLocaleString()}`,
      `Name: ${currentUser.name} (Age: ${currentUser.age}, Blood Group: ${currentUser.bloodGroup})`,
      '',
      'SAVED CHECK-INS & CARE NOTES:',
      ...records.map(
        (r) =>
          `[${r.date}] ${formatFriendlyCategory(r.category)} — ${r.title}: ${r.summary}${
            r.notes ? ` (Note: ${r.notes})` : ''
          }`
      ),
    ].join('\n');

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Health_Summary_${currentUser.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Extract latest recorded measurements cleanly
  const latestMetricsRecord = useMemo(
    () =>
      records.find(
        (r) =>
          r.metrics &&
          (r.metrics.systolicBP ||
            r.metrics.bloodSugar ||
            r.metrics.heartRate ||
            r.metrics.weightKg)
      ),
    [records]
  );

  // Build chronological points from real user check-ins (up to 6 most recent)
  const bpPoints = useMemo(() => {
    const matches = records
      .filter((r) => r.metrics?.systolicBP && r.metrics?.diastolicBP)
      .slice(0, 6)
      .reverse();
    return matches.map((r) => ({
      date: r.date.slice(5),
      sys: r.metrics!.systolicBP!,
      dia: r.metrics!.diastolicBP!,
    }));
  }, [records]);

  const sugarPoints = useMemo(() => {
    const matches = records
      .filter((r) => r.metrics?.bloodSugar)
      .slice(0, 6)
      .reverse();
    return matches.map((r) => ({
      date: r.date.slice(5),
      sugar: r.metrics!.bloodSugar!,
    }));
  }, [records]);

  // Plain-English BP status helper
  const bpStatusLabel = useMemo(() => {
    const last = bpPoints[bpPoints.length - 1];
    if (!last) return 'Ready when you are';
    if (last.sys < 125 && last.dia < 82) return 'Within healthy range';
    if (last.sys < 140 && last.dia < 90) return 'Slightly above ideal';
    return 'Worth sharing with a doctor';
  }, [bpPoints]);

  const sugarStatusLabel = useMemo(() => {
    const last = sugarPoints[sugarPoints.length - 1];
    if (!last) return 'Ready when you are';
    if (last.sugar >= 70 && last.sugar <= 105) return 'Balanced & steady';
    if (last.sugar <= 125) return 'Mildly elevated fasting level';
    return 'Higher than usual — check with a doctor';
  }, [sugarPoints]);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const friendlyCat = formatFriendlyCategory(rec.category);
      if (categoryFilter === 'Check-Ins' && friendlyCat !== 'Daily Check-In') return false;
      if (categoryFilter === 'Symptom Checks' && friendlyCat !== 'Symptom Check') return false;
      if (categoryFilter === 'Screenings' && friendlyCat !== 'Health Screening') return false;
      if (categoryFilter === 'Diet Goals' && friendlyCat !== 'Meal & Nutrition') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          rec.title.toLowerCase().includes(q) ||
          rec.summary.toLowerCase().includes(q) ||
          (rec.notes || '').toLowerCase().includes(q) ||
          rec.date.includes(q)
        );
      }
      return true;
    });
  }, [records, categoryFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Clean Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
            title={t.backToDashboard}
          >
            <ArrowLeft className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold whitespace-nowrap">{t.back}</span>
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t.healthRecords}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              A calm, easy-to-read home for your daily health numbers, check-ups, and care notes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Daily Check-In</span>
          </button>

          <button
            type="button"
            onClick={handleExportSummary}
            disabled={records.length === 0}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Summary</span>
          </button>
        </div>
      </div>

      {/* Refreshing Wellness Banner + Latest Snapshot */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-5 relative min-h-[210px] bg-gradient-to-br from-teal-50 via-emerald-50 to-amber-50">
            <img
              src={healthJournalImg}
              alt="Peaceful morning table with wellness journal and lemon water"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-5">
            <div>
              <p className="text-xs font-semibold text-teal-700">
                Your Personal Wellness Journal
              </p>
              <blockquote className="mt-2 text-base sm:text-lg font-bold text-slate-900 leading-snug text-balance">
                &ldquo;Gentle daily awareness is one of the kindest gifts you can give your future self.&rdquo;
              </blockquote>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Keep simple notes on blood pressure, morning blood sugar, heart rate, and how you are feeling. Everything stays neatly organized for your doctor visits.
              </p>
            </div>

            {/* Quick Latest Snapshot Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-teal-600" />
                  Blood Pressure
                </span>
                <div className="text-base font-black text-slate-900 mt-0.5 tabular-nums">
                  {latestMetricsRecord?.metrics?.systolicBP &&
                  latestMetricsRecord?.metrics?.diastolicBP
                    ? `${latestMetricsRecord.metrics.systolicBP}/${latestMetricsRecord.metrics.diastolicBP}`
                    : '—'}
                  <span className="text-[11px] font-normal text-slate-400 ml-1">mmHg</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-sky-600" />
                  Morning Sugar
                </span>
                <div className="text-base font-black text-slate-900 mt-0.5 tabular-nums">
                  {latestMetricsRecord?.metrics?.bloodSugar ?? '—'}
                  <span className="text-[11px] font-normal text-slate-400 ml-1">mg/dL</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <HeartPulse className="w-3 h-3 text-rose-600" />
                  Heart Rate
                </span>
                <div className="text-base font-black text-slate-900 mt-0.5 tabular-nums">
                  {latestMetricsRecord?.metrics?.heartRate ?? '—'}
                  <span className="text-[11px] font-normal text-slate-400 ml-1">bpm</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Scale className="w-3 h-3 text-emerald-600" />
                  Weight
                </span>
                <div className="text-base font-black text-slate-900 mt-0.5 tabular-nums">
                  {latestMetricsRecord?.metrics?.weightKg ?? currentUser.weightKg ?? '—'}
                  <span className="text-[11px] font-normal text-slate-400 ml-1">kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Easy-to-Read Health Number Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Pressure Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Blood Pressure Over Time</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Healthy everyday goal: around 120 / 80 mmHg
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700">{bpStatusLabel}</span>
          </div>

          {bpPoints.length > 0 ? (
            <>
              <div className="h-48 w-full flex items-end justify-around pt-6 pb-2 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                {bpPoints.map((point, i) => {
                  const sysHeight = Math.min(95, Math.max(25, ((point.sys - 80) / 80) * 100));
                  const diaHeight = Math.min(80, Math.max(18, ((point.dia - 50) / 60) * 75));

                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5 h-full justify-end group"
                    >
                      <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                        {point.sys}/{point.dia}
                      </span>
                      <div className="flex items-end gap-1.5 h-28">
                        <div
                          style={{ height: `${sysHeight}%` }}
                          className="w-4 sm:w-5 bg-gradient-to-t from-teal-600 to-cyan-500 rounded-t-md transition-all"
                          title={`Top number: ${point.sys} mmHg`}
                        />
                        <div
                          style={{ height: `${diaHeight}%` }}
                          className="w-4 sm:w-5 bg-gradient-to-t from-sky-400 to-indigo-400 rounded-t-md transition-all"
                          title={`Bottom number: ${point.dia} mmHg`}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums">{point.date}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                  <span>Top number (Systolic)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span>Bottom number (Diastolic)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center p-5 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">
                No blood pressure readings added yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Save your first daily check-in to watch how steady your blood pressure stays over time.
              </p>
              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Record First Reading
              </button>
            </div>
          )}
        </div>

        {/* Blood Sugar Trend Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                <span>Morning Blood Sugar (mg/dL)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Healthy fasting range: 70 – 99 mg/dL
              </p>
            </div>
            <span className="text-xs font-semibold text-sky-700">{sugarStatusLabel}</span>
          </div>

          {sugarPoints.length > 0 ? (
            <>
              <div className="h-48 w-full bg-slate-50/70 rounded-2xl border border-slate-100 p-4 flex flex-col justify-between">
                {(() => {
                  const pts = sugarPoints.map((p, idx) => {
                    const x =
                      sugarPoints.length === 1
                        ? 200
                        : 36 + (idx * 328) / (sugarPoints.length - 1);
                    const clamped = Math.max(60, Math.min(180, p.sugar));
                    const y = 100 - ((clamped - 60) / 120) * 80;
                    return { x, y, val: p.sugar, date: p.date };
                  });
                  const polylineStr = pts.map((p) => `${p.x},${p.y}`).join(' ');

                  return (
                    <>
                      <svg className="w-full h-32 overflow-visible" viewBox="0 0 400 120">
                        <rect
                          x="0"
                          y="45"
                          width="400"
                          height="45"
                          fill="#10B981"
                          fillOpacity="0.09"
                          rx="6"
                        />
                        <line
                          x1="0"
                          y1="45"
                          x2="400"
                          y2="45"
                          stroke="#10B981"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                          opacity="0.45"
                        />
                        {pts.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={polylineStr}
                          />
                        )}
                        {pts.map((pt, idx) => (
                          <g key={idx}>
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="5"
                              fill="#ffffff"
                              stroke="#0284c7"
                              strokeWidth="3"
                            />
                            <text
                              x={pt.x}
                              y={pt.y - 11}
                              textAnchor="middle"
                              fill="#0f172a"
                              fontSize="11"
                              fontWeight="bold"
                            >
                              {pt.val}
                            </text>
                          </g>
                        ))}
                      </svg>
                      <div className="flex items-center justify-around text-[11px] text-slate-400 tabular-nums">
                        {pts.map((pt, idx) => (
                          <span key={idx}>{pt.date}</span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Green band shows healthy fasting range (70 – 99)</span>
                <span className="font-semibold text-emerald-700 tabular-nums">
                  {sugarPoints.length} {sugarPoints.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
            </>
          ) : (
            <div className="h-48 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center p-5 space-y-2.5">
              <p className="text-xs font-semibold text-slate-700">
                No blood sugar readings added yet
              </p>
              <p className="text-xs text-slate-500 max-w-xs">
                Log morning or fasting readings anytime to build a clear, easy-to-share trend.
              </p>
              <button
                type="button"
                onClick={() => setShowLogModal(true)}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Add Sugar Reading
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Timeline with Filter & Search */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Your Health &amp; Care Timeline</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {records.length} saved {records.length === 1 ? 'note' : 'notes'} on your account
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes or dates..."
                className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none w-full sm:w-52"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
              {(
                ['All', 'Check-Ins', 'Symptom Checks', 'Screenings', 'Diet Goals'] as CategoryFilter[]
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-white text-teal-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 text-center space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {records.length === 0 ? 'Your timeline is ready for your first note' : 'No matching entries found'}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {records.length === 0
                  ? 'Tap "Add Daily Check-In" above to save blood pressure, blood sugar, weight, or how you felt today.'
                  : 'Try clearing your search box or picking another filter tab.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {rec.title === 'Self-Monitored Vitals & Hemodynamics'
                          ? 'Daily Health Check-In'
                          : rec.title}
                      </span>
                      <span className="text-xs text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs font-medium text-teal-700">
                        {formatFriendlyCategory(rec.category)}
                      </span>
                      <span className="text-xs text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs text-slate-500 tabular-nums">{rec.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.summary}</p>
                    {rec.notes && (
                      <p className="text-xs text-slate-500 mt-1">Note: {rec.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {confirmDeleteId === rec.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteEntry(rec.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(rec.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friendly Record Daily Check-In Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-fadeIn space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Today&apos;s Check-In</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save your everyday health numbers in plain, easy steps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCheckIn} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Pressure (Top)
                  </label>
                  <input
                    type="number"
                    required
                    min={60}
                    max={250}
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 tabular-nums"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Typical: 90 – 120 mmHg
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Pressure (Bottom)
                  </label>
                  <input
                    type="number"
                    required
                    min={40}
                    max={160}
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 tabular-nums"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Typical: 60 – 80 mmHg
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Morning Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    required
                    min={40}
                    max={500}
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 tabular-nums"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Fasting: 70 – 99 mg/dL
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    required
                    min={35}
                    max={220}
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 tabular-nums"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Resting: 60 – 100 bpm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Weight (kg)
                </label>
                <input
                  type="number"
                  required
                  min={20}
                  max={300}
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  How are you feeling today? (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Slept well, feeling calm after morning walk"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Save Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
