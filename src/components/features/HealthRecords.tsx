import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  TrendingUp, 
  Plus, 
  Download, 
  Calendar, 
  Activity, 
  Heart, 
  Sparkles, 
  Trash2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { SupportedLanguage, UserProfile, HealthRecordEntry } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { getHealthRecords, addHealthRecord } from '../../services/storageService';

interface HealthRecordsProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

export const HealthRecords: React.FC<HealthRecordsProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [records, setRecords] = useState<HealthRecordEntry[]>(() => getHealthRecords(currentUser.id));
  const [showLogModal, setShowLogModal] = useState(false);
  
  // New Vitals Form
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [bloodSugar, setBloodSugar] = useState(95);
  const [heartRate, setHeartRate] = useState(72);
  const [weight, setWeight] = useState(currentUser.weightKg);
  const [notes, setNotes] = useState('');

  const handleAddVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const heightM = (currentUser.heightCm || 170) / 100;
    const computedBMI = parseFloat((weight / (heightM * heightM)).toFixed(1));

    const newRecord: HealthRecordEntry = {
      id: `rec_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: 'Vitals Log',
      title: 'Self-Monitored Vitals & Hemodynamics',
      summary: `BP: ${systolic}/${diastolic} mmHg • Fasting Sugar: ${bloodSugar} mg/dL • HR: ${heartRate} bpm.`,
      metrics: {
        systolicBP: systolic,
        diastolicBP: diastolic,
        bloodSugar,
        heartRate,
        weightKg: weight,
        bmi: computedBMI
      },
      notes: notes || 'Logged via HealthAssist AI dashboard.'
    };

    addHealthRecord(currentUser.id, newRecord);
    setRecords(getHealthRecords(currentUser.id));
    setShowLogModal(false);
    setNotes('');
  };

  const handleExportSummary = () => {
    const textData = `
HEALTHASSIST AI - PATIENT CLINICAL SUMMARY
Generated: ${new Date().toLocaleString()}
Patient: ${currentUser.name} (Age: ${currentUser.age}, Gender: ${currentUser.gender})
Blood Group: ${currentUser.bloodGroup} | BMI: ${currentUser.bmi}

HEALTH RECORD HISTORY:
${records.map(r => `[${r.date}] ${r.category}: ${r.title} - ${r.summary}`).join('\n')}

Research Reference: AI-Based Personal Health & Lifestyle Assistant (IJRIAS Vol. XI, 2026)
    `.trim();

    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HealthAssist_Report_${currentUser.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Vitals Trend Mock Data for Interactive SVG Charts
  const bpTrends = [
    { date: 'Oct 20', sys: 124, dia: 82, sugar: 99 },
    { date: 'Oct 25', sys: 122, dia: 80, sugar: 96 },
    { date: 'Oct 30', sys: 119, dia: 78, sugar: 94 },
    { date: 'Nov 04', sys: 121, dia: 79, sugar: 98 },
    { date: 'Nov 09', sys: 118, dia: 76, sugar: 94 },
  ];

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
                {t.healthRecords}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Encrypted Vault
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure health records, diagnostic evaluations, and continuous vitals trends.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLogModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Vitals</span>
          </button>

          <button
            type="button"
            onClick={handleExportSummary}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Interactive Charts & Graphs (Explicitly required in Research Paper Page 718) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Blood Pressure Trend Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Blood Pressure Hemodynamic Trend (mmHg)</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Optimal Trend
            </span>
          </div>

          <div className="h-48 w-full relative flex items-end justify-between pt-6 pb-2 px-4 bg-slate-50/70 rounded-2xl border border-slate-100">
            {bpTrends.map((point, i) => {
              const sysHeight = Math.max(20, ((point.sys - 90) / (140 - 90)) * 100);
              const diaHeight = Math.max(15, ((point.dia - 60) / (100 - 60)) * 60);

              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {point.sys}/{point.dia}
                  </div>
                  <div className="flex items-end gap-1.5">
                    {/* Systolic Bar */}
                    <div 
                      style={{ height: `${sysHeight}%` }} 
                      className="w-5 bg-gradient-to-t from-teal-600 to-cyan-500 rounded-t-md shadow-xs transition-all group-hover:from-teal-700 group-hover:to-cyan-600"
                      title={`Systolic: ${point.sys} mmHg`}
                    />
                    {/* Diastolic Bar */}
                    <div 
                      style={{ height: `${diaHeight}%` }} 
                      className="w-5 bg-gradient-to-t from-blue-400 to-indigo-400 rounded-t-md shadow-xs transition-all"
                      title={`Diastolic: ${point.dia} mmHg`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{point.date}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-600" />
              <span>Systolic (Target: &lt;120)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-400" />
              <span>Diastolic (Target: &lt;80)</span>
            </div>
          </div>
        </div>

        {/* Fasting Blood Sugar Curve */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Fasting Blood Glucose Profile (mg/dL)</span>
            </h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Euglycemic
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-48 w-full relative bg-slate-50/70 rounded-2xl border border-slate-100 p-4 flex flex-col justify-between">
            <svg className="w-full h-32 overflow-visible" viewBox="0 0 400 120">
              {/* Reference Band 70 - 100 mg/dL */}
              <rect x="0" y="30" width="400" height="60" fill="#10B981" fillOpacity="0.08" rx="4" />
              <line x1="0" y1="30" x2="400" y2="30" stroke="#10B981" strokeDasharray="3 3" strokeWidth="1" opacity="0.4" />
              <line x1="0" y1="90" x2="400" y2="90" stroke="#10B981" strokeDasharray="3 3" strokeWidth="1" opacity="0.4" />
              
              {/* Polyline */}
              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="40,50 120,65 200,75 280,55 360,70"
              />

              {/* Data points */}
              {[{ x: 40, y: 50, val: 99 }, { x: 120, y: 65, val: 96 }, { x: 200, y: 75, val: 94 }, { x: 280, y: 55, val: 98 }, { x: 360, y: 70, val: 94 }].map((pt, idx) => (
                <g key={idx} className="cursor-pointer">
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
                    {pt.val}
                  </text>
                </g>
              ))}
            </svg>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-3">
              {bpTrends.map((t, idx) => (
                <span key={idx}>{t.date}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Standard Normal Range: <strong>70 - 99 mg/dL</strong></span>
            <span className="font-semibold text-emerald-600">Stable Glycemic Control</span>
          </div>
        </div>

      </div>

      {/* Health Record Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Health History &amp; Diagnostics Timeline</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{records.length} Recorded Entries</span>
        </div>

        <div className="space-y-3">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 hover:bg-white hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{rec.summary}</p>
                  {rec.notes && (
                    <p className="text-[11px] text-slate-400 mt-0.5 italic">"{rec.notes}"</p>
                  )}
                </div>
              </div>

              <div className="text-right text-xs text-slate-400 shrink-0">
                <span className="font-medium">{rec.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Vitals Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-fadeIn space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Log Daily Vitals</h3>
            <p className="text-xs text-slate-500">Record your latest physiological measurements.</p>

            <form onSubmit={handleAddVitals} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={systolic}
                    onChange={(e) => setSystolic(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={diastolic}
                    onChange={(e) => setDiastolic(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Fasting Sugar (mg/dL)</label>
                  <input
                    type="number"
                    required
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    required
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Clinical / Activity Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Post-workout, feeling energetic"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
