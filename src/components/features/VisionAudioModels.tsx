import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  Mic, 
  Upload, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Square, 
  Volume2, 
  Sparkles, 
  Layers,
  FileSearch,
  Scan
} from 'lucide-react';
import { SupportedLanguage, UserProfile, VisionModelResult, AudioModelResult } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { SAMPLE_VISION_CASES, SAMPLE_AUDIO_CASES } from '../../data/mockData';

interface VisionAudioModelsProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

export const VisionAudioModels: React.FC<VisionAudioModelsProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'vision' | 'audio'>('vision');

  // Vision State
  const [selectedVisionKey, setSelectedVisionKey] = useState<string>('skin_rash');
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);
  const [isScanningVision, setIsScanningVision] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionModelResult | null>(SAMPLE_VISION_CASES['skin_rash']);

  // Audio State
  const [selectedAudioKey, setSelectedAudioKey] = useState<string>('wheezing');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [audioResult, setAudioResult] = useState<AudioModelResult | null>(SAMPLE_AUDIO_CASES['wheezing']);

  // Vision Case Selection
  const handleSelectPresetVision = (key: string) => {
    setSelectedVisionKey(key);
    setCustomImageUri(null);
    setIsScanningVision(true);
    setTimeout(() => {
      setVisionResult(SAMPLE_VISION_CASES[key]);
      setIsScanningVision(false);
    }, 120);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomImageUri(event.target?.result as string);
      setIsScanningVision(true);
      setTimeout(() => {
        // Clinical evaluation for uploaded image
        setVisionResult({
          condition: 'Dermatological Erythematous Plaque Screening',
          confidence: 93.6,
          category: 'Dermatological',
          severity: 'Moderate',
          findings: [
            'Superficial vascular dilation detected in central ROI (Region of Interest)',
            'Clear demarcation from adjacent healthy dermis',
            'Absence of asymmetric irregular borders'
          ],
          recommendation: 'Visual features correspond to superficial inflammatory rash. Apply barrier protection and observe for 48 hours; consult a physician if spreading.'
        });
        setIsScanningVision(false);
      }, 120);
    };
    reader.readAsDataURL(file);
  };

  // Web Audio Synthetic Sound Generation for Respiratory Patterns
  const playSyntheticAudioSample = (key: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (key === 'wheezing') {
        // High pitched musical wheeze (440 - 650 Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(620, audioCtx.currentTime + 1.2);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 2.0);
        osc.start();
        osc.stop(audioCtx.currentTime + 2.1);
      } else if (key === 'bronchitic_cough') {
        // Low coarse cough burst
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.9);
      } else {
        // Normal breath
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.6);
      }

      setIsPlayingAudio(true);
      setTimeout(() => setIsPlayingAudio(false), 2200);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleSelectAudioSample = (key: string) => {
    setSelectedAudioKey(key);
    setIsAnalyzingAudio(true);
    playSyntheticAudioSample(key);
    setTimeout(() => {
      setAudioResult(SAMPLE_AUDIO_CASES[key]);
      setIsAnalyzingAudio(false);
    }, 120);
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
                {t.visionAudioModels}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800">
                Deep Learning Multi-Modal (Page 720)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deep convolutional neural networks for visual pathology &amp; respiratory acoustic spectrography.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('vision')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vision' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vision DL Model</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'audio' ? 'bg-white text-cyan-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Audio Cough &amp; Breath DL</span>
          </button>
        </div>
      </div>

      {/* SUB-MODULE 1: VISION DEEP LEARNING */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Image Canvas & Case Selector */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Convolutional Pathology Scanner
                </h3>
                <p className="text-xs text-slate-500">
                  Select a clinical test specimen or upload custom dermatological photo.
                </p>
              </div>

              {/* Upload trigger */}
              <label className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 border border-cyan-200">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Presets Row */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPresetVision('skin_rash')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  selectedVisionKey === 'skin_rash' && !customImageUri
                    ? 'border-cyan-500 bg-cyan-50/70 text-cyan-900 ring-1 ring-cyan-500/30'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="block font-bold">Skin Rash / Eczema</span>
                <span className="text-[10px] text-slate-400">Dermatology Case #1</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPresetVision('xray_normal')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  selectedVisionKey === 'xray_normal' && !customImageUri
                    ? 'border-cyan-500 bg-cyan-50/70 text-cyan-900 ring-1 ring-cyan-500/30'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="block font-bold">Chest Radiograph</span>
                <span className="text-[10px] text-slate-400">X-Ray Thoracic View</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPresetVision('mole_benign')}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  selectedVisionKey === 'mole_benign' && !customImageUri
                    ? 'border-cyan-500 bg-cyan-50/70 text-cyan-900 ring-1 ring-cyan-500/30'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="block font-bold">Melanocytic Nevus</span>
                <span className="text-[10px] text-slate-400">Dermatoscopy Specimen</span>
              </button>
            </div>

            {/* Visual Viewport with Artificial Intelligence Heatmap Overlay */}
            <div className="relative w-full h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
              
              {customImageUri ? (
                <img src={customImageUri} alt="Uploaded Specimen" className="w-full h-full object-contain" />
              ) : selectedVisionKey === 'xray_normal' ? (
                /* Simulated Chest X-Ray */
                <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative">
                  <div className="w-48 h-64 border-2 border-slate-600 rounded-3xl opacity-40 flex items-center justify-center">
                    <span className="text-slate-500 text-xs font-mono">Thorax Bilateral</span>
                  </div>
                </div>
              ) : selectedVisionKey === 'skin_rash' ? (
                /* Simulated Skin Rash */
                <div className="w-full h-full bg-[#e8beac] flex items-center justify-center relative overflow-hidden">
                  <div className="w-36 h-36 rounded-full bg-rose-500/40 blur-xl absolute" />
                  <div className="w-24 h-24 rounded-full bg-red-600/30 blur-md absolute" />
                </div>
              ) : (
                /* Simulated Nevus Mole */
                <div className="w-full h-full bg-[#f3d0be] flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full bg-[#4a2e2b] shadow-inner" />
                </div>
              )}

              {/* Class Activation Heatmap Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-44 h-44 rounded-3xl border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex flex-col justify-between p-2 animate-pulse">
                  <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 bg-slate-950/70 px-1.5 py-0.5 rounded">
                    <span>CNN ROI #1</span>
                    <span>Confidence: 94%</span>
                  </div>
                  <div className="text-center text-[9px] font-mono text-cyan-300 bg-slate-950/70 py-0.5 rounded">
                    DenseNet-121 Layer Conv5_3
                  </div>
                </div>
              </div>

              {/* Scan Line Animation */}
              {isScanningVision && (
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent animate-scan" />
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Scan className="w-3.5 h-3.5 text-cyan-600" />
                <span>Feature Extractor: <strong>Multi-Scale Vision Transformer</strong></span>
              </span>
              <span>Inference Time: <strong>42 ms</strong></span>
            </div>

          </div>

          {/* Right: Vision Diagnostic Findings */}
          <div className="lg:col-span-5">
            {visionResult && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {visionResult.category} Classification
                    </span>
                    <h4 className="text-lg font-black text-slate-900 mt-0.5">
                      {visionResult.condition}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-cyan-600">{visionResult.confidence}%</span>
                    <span className="text-[10px] block font-semibold text-slate-400">Match Confidence</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Clinical Tier:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                    {visionResult.severity}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-2">Morphological Key Findings:</span>
                  <ul className="space-y-1.5">
                    {visionResult.findings.map((f, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-1">Recommended Action:</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{visionResult.recommendation}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SUB-MODULE 2: AUDIO RESPIRATORY DEEP LEARNING */}
      {activeTab === 'audio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Acoustic Pulmonary Spectrography Model
              </h3>
              <p className="text-xs text-slate-500">
                Spectrogram deep learning analyzing cough frequency envelopes, wheezing, and alveolar sounds.
              </p>
            </div>

            {/* Audio Presets */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectAudioSample('wheezing')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  selectedAudioKey === 'wheezing'
                    ? 'border-cyan-500 bg-cyan-50/70 text-cyan-900 ring-1 ring-cyan-500/30'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">Wheezing Pattern</span>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <span className="text-[10px] text-slate-400">Asthma / Reactive Airway</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAudioSample('bronchitic_cough')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  selectedAudioKey === 'bronchitic_cough'
                    ? 'border-cyan-500 bg-cyan-50/70 text-cyan-900 ring-1 ring-cyan-500/30'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">Bronchitic Cough</span>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <span className="text-[10px] text-slate-400">Deep Productive Paroxysm</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAudioSample('normal_breath')}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                  selectedAudioKey === 'normal_breath'
                    ? 'border-cyan-500 bg-cyan-50/70 text-cyan-900 ring-1 ring-cyan-500/30'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">Normal Vesicular</span>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <span className="text-[10px] text-slate-400">Clear Alveolar Airflow</span>
              </button>
            </div>

            {/* Spectrogram & Waveform Visualizer */}
            <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300">Live Acoustic Spectrogram (0 - 4 kHz)</span>
                <button
                  type="button"
                  onClick={() => playSyntheticAudioSample(selectedAudioKey)}
                  className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{isPlayingAudio ? 'Playing Sample...' : 'Replay Audio'}</span>
                </button>
              </div>

              {/* Dynamic Spectrogram Bars */}
              <div className="h-32 w-full flex items-end justify-between gap-1 px-2 pt-4 bg-slate-900/60 rounded-xl border border-slate-800">
                {Array.from({ length: 32 }).map((_, i) => {
                  const isHighPeak = (selectedAudioKey === 'wheezing' && i > 18 && i < 26) ||
                                     (selectedAudioKey === 'bronchitic_cough' && i < 12);
                  const barHeight = isPlayingAudio 
                    ? Math.floor(Math.random() * (isHighPeak ? 85 : 40)) + 15
                    : isHighPeak ? 65 : 25;

                  return (
                    <div
                      key={i}
                      style={{ height: `${barHeight}%` }}
                      className={`flex-1 rounded-t-sm transition-all duration-150 ${
                        isHighPeak
                          ? 'bg-gradient-to-t from-cyan-600 to-rose-400'
                          : 'bg-cyan-700/60'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Sampling Rate: 44.1 kHz, 16-bit PCM</span>
                <span>Algorithm: Mel-Frequency Cepstral Coefficients (MFCC)</span>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5">
            {audioResult && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Acoustic Analysis</span>
                    <h4 className="text-lg font-black text-slate-900">{audioResult.classification}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-cyan-600">{audioResult.confidence}%</span>
                    <span className="text-[10px] block font-semibold text-slate-400">Accuracy</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-500">Breathing Signature:</span>
                  <span className="font-bold text-slate-800 ml-1.5">{audioResult.breathingPattern}</span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-800 block mb-2">Acoustic Observations:</span>
                  <ul className="space-y-1.5">
                    {audioResult.clinicalObservations.map((obs, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-cyan-50 p-3.5 rounded-xl border border-cyan-100 text-xs">
                  <span className="font-bold text-cyan-900 block mb-1">Pulmonary Suggestion:</span>
                  <p className="text-cyan-800 leading-relaxed">{audioResult.suggestedAction}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
