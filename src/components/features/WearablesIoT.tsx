import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Watch, 
  Heart, 
  Activity, 
  Flame, 
  Moon, 
  Thermometer, 
  Wifi, 
  Battery, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { SupportedLanguage, UserProfile, WearableDeviceState } from '../../types';
import { TRANSLATIONS } from '../../translations';

interface WearablesIoTProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

export const WearablesIoT: React.FC<WearablesIoTProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];

  const [deviceState, setDeviceState] = useState<WearableDeviceState>({
    connected: true,
    deviceName: 'HealthAssist PulseBand Pro (v4.2 IoT)',
    batteryPercent: 88,
    heartRateBpm: 72,
    spo2Percent: 99,
    stepCount: 7842,
    caloriesBurned: 412,
    bodyTempCelsius: 36.6,
    sleepHours: 7.4,
    sleepQuality: 'Deep & Restful',
    isAlert: false,
    historyRates: [70, 72, 74, 71, 73, 72, 75, 72]
  });

  // Real-time telemetry simulation
  useEffect(() => {
    if (!deviceState.connected) return;

    const interval = setInterval(() => {
      setDeviceState(prev => {
        // Natural jitter around 70-76 BPM
        const delta = Math.floor(Math.random() * 5) - 2;
        const newHR = Math.max(62, Math.min(88, prev.heartRateBpm + delta));
        const updatedHistory = [...prev.historyRates.slice(-14), newHR];

        return {
          ...prev,
          heartRateBpm: newHR,
          historyRates: updatedHistory,
          stepCount: prev.stepCount + (Math.random() > 0.6 ? 2 : 0),
          caloriesBurned: prev.caloriesBurned + (Math.random() > 0.8 ? 1 : 0),
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [deviceState.connected]);

  const toggleConnection = () => {
    setDeviceState(prev => ({
      ...prev,
      connected: !prev.connected
    }));
  };

  const triggerTestAlert = () => {
    setDeviceState(prev => ({
      ...prev,
      heartRateBpm: 128,
      isAlert: true,
      alertMessage: 'Acute Tachycardia Detected: Heart Rate 128 BPM at rest. Automated emergency contact notified.'
    }));
  };

  const dismissAlert = () => {
    setDeviceState(prev => ({
      ...prev,
      heartRateBpm: 72,
      isAlert: false,
      alertMessage: undefined
    }));
  };

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
                {t.wearablesIoT}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Research Extension (Page 720)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live continuous telemetry stream: PPG photoplethysmography, SpO2, and sleep metrics.
            </p>
          </div>
        </div>

        {/* Connection Toggle & Battery */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Battery className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{deviceState.batteryPercent}%</span>
          </div>

          <button
            type="button"
            onClick={toggleConnection}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              deviceState.connected
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            <Wifi className={`w-3.5 h-3.5 ${deviceState.connected ? 'animate-pulse' : ''}`} />
            <span>{deviceState.connected ? 'IoT Connected' : 'Disconnected (Click to Connect)'}</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banner if triggered */}
      {deviceState.isAlert && (
        <div className="p-4 rounded-2xl bg-rose-500 text-white shadow-lg flex items-start justify-between gap-4 animate-shake">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-white shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Critical Telemetry Threshold Triggered!</h4>
              <p className="text-xs text-rose-100 mt-0.5">{deviceState.alertMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissAlert}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors cursor-pointer"
          >
            Acknowledge &amp; Reset
          </button>
        </div>
      )}

      {/* Primary Biometrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Heart Rate Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resting Heart Rate</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-5 h-5 animate-pulse" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{deviceState.heartRateBpm}</span>
              <span className="text-xs font-bold text-slate-400">BPM</span>
            </div>

            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <Activity className="w-3.5 h-3.5" /> Sinus Rhythm
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Range: 60 - 100</span>
            <span className="text-teal-600 font-bold">Stable</span>
          </div>
        </div>

        {/* SpO2 Blood Oxygen */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blood Oxygen (SpO2)</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{deviceState.spo2Percent}</span>
              <span className="text-xs font-bold text-slate-400">%</span>
            </div>

            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Oxygenation
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Target: &gt;95%</span>
            <span className="text-teal-600 font-bold">High</span>
          </div>
        </div>

        {/* Step Count & Calories */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Activity</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{deviceState.stepCount.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400">Steps</span>
            </div>

            <span className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-2">
              <Flame className="w-3.5 h-3.5" /> {deviceState.caloriesBurned} kcal Burned
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Goal: 10,000 steps</span>
            <span className="text-amber-600 font-bold">78%</span>
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sleep Architecture</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{deviceState.sleepHours}</span>
              <span className="text-xs font-bold text-slate-400">hrs</span>
            </div>

            <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1 mt-2">
              <Sparkles className="w-3.5 h-3.5" /> {deviceState.sleepQuality}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>2.1h Deep • 1.8h REM</span>
            <span className="text-indigo-600 font-bold">Good</span>
          </div>
        </div>

      </div>

      {/* Real-Time Live Telemetry Waveform */}
      <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <h3 className="text-sm font-bold">Live ECG Rhythm Stream (Lead II Simulation)</h3>
              <p className="text-xs text-slate-400">Streaming at 250 Hz from connected smartwatch IoT gateway.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={triggerTestAlert}
            className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
          >
            Simulate Tachycardia Threshold Alert
          </button>
        </div>

        {/* Animated ECG Waveform */}
        <div className="relative h-32 w-full bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center overflow-hidden px-4">
          <svg className="w-full h-24 overflow-visible" viewBox="0 0 800 100">
            {/* Grid */}
            <defs>
              <pattern id="ecgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="800" height="100" fill="url(#ecgGrid)" />

            {/* Continuous Rhythm Path */}
            <path
              d="M 0 50 L 80 50 L 90 45 L 95 50 L 100 50 L 110 20 L 120 85 L 130 50 L 140 50 L 155 42 L 170 50 
                 L 250 50 L 260 45 L 265 50 L 270 50 L 280 20 L 290 85 L 300 50 L 310 50 L 325 42 L 340 50 
                 L 420 50 L 430 45 L 435 50 L 440 50 L 450 20 L 460 85 L 470 50 L 480 50 L 495 42 L 510 50 
                 L 590 50 L 600 45 L 605 50 L 610 50 L 620 20 L 630 85 L 640 50 L 650 50 L 665 42 L 680 50 L 800 50"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Sweep scan bar */}
          <div className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-emerald-500/20 animate-radarSweep" />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Calibration: 10 mm/mV, 25 mm/s</span>
          <span>Device: {deviceState.deviceName}</span>
        </div>
      </div>

    </div>
  );
};
