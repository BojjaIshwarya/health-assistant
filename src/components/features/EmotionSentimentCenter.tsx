import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Smile, 
  Sparkles, 
  Heart, 
  Brain, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Send,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { SupportedLanguage, UserProfile, EmotionSentimentCheck } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { getEmotionHistory, saveEmotionCheck } from '../../services/storageService';

interface EmotionSentimentCenterProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

export const EmotionSentimentCenter: React.FC<EmotionSentimentCenterProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [history, setHistory] = useState<EmotionSentimentCheck[]>(() => getEmotionHistory(currentUser.id));
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeCheck, setActiveCheck] = useState<EmotionSentimentCheck | null>(history[0] || null);

  // Guided Breathing Animation State
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Inhale (4s)');
  const [breathTimer, setBreathTimer] = useState(4);

  // Breathing Cycle Hook
  useEffect(() => {
    if (!breathingActive) return;

    const interval = setInterval(() => {
      setBreathTimer(prev => {
        if (prev <= 1) {
          if (breathPhase === 'Inhale (4s)') {
            setBreathPhase('Hold (7s)');
            return 7;
          } else if (breathPhase === 'Hold (7s)') {
            setBreathPhase('Exhale (8s)');
            return 8;
          } else {
            setBreathPhase('Inhale (4s)');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive, breathPhase]);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const lower = inputText.toLowerCase();
      let primaryEmotion: EmotionSentimentCheck['primaryEmotion'] = 'Calm & Happy';
      let stressScore = 20;
      let positivityScore = 80;
      let technique = 'Maintain regular circadian sleep rhythm and 20-minute morning outdoor walk.';

      if (lower.includes('stress') || lower.includes('busy') || lower.includes('tired') || lower.includes('exhausted')) {
        primaryEmotion = 'Mild Stress';
        stressScore = 58;
        positivityScore = 45;
        technique = 'Take a 10-minute digital timeout and perform box breathing.';
      } else if (lower.includes('anxious') || lower.includes('panic') || lower.includes('worry') || lower.includes('scared') || lower.includes('nervous')) {
        primaryEmotion = 'Anxious';
        stressScore = 82;
        positivityScore = 25;
        technique = 'Engage 4-7-8 diaphragmatic breathing to stimulate parasympathetic vagal response.';
      } else if (lower.includes('sad') || lower.includes('depress') || lower.includes('hopeless') || lower.includes('lonely')) {
        primaryEmotion = 'Depressed Mood';
        stressScore = 74;
        positivityScore = 18;
        technique = 'Reach out to a supportive contact or counselor; consider scheduling an empathetic consultation.';
      }

      const newCheck: EmotionSentimentCheck = {
        id: `emo_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        primaryEmotion,
        stressScore,
        positivityScore,
        journalText: inputText.trim(),
        recommendedTechnique: technique
      };

      saveEmotionCheck(currentUser.id, newCheck);
      setHistory(getEmotionHistory(currentUser.id));
      setActiveCheck(newCheck);
      setInputText('');
      setIsAnalyzing(false);
    }, 600);
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
                {t.emotionSentiment}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800">
                Emotion AI (Page 720)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Empathetic sentiment classification, anxiety index, and parasympathetic calming exercises.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Sentiment Input Analyzer & Interactive Breathing Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Check-In */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-pink-600" />
                <span>Daily Emotional Wellbeing Check-In</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Express your feelings in natural text; the NLP engine evaluates mood markers.
              </p>
            </div>
          </div>

          <form onSubmit={handleRunAnalysis} className="space-y-3">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I had a hectic work day and feel a bit tight in my shoulders, but relieved to be home..."
              className="w-full p-4 text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Private &amp; encrypted sentiment analysis.
              </span>
              <button
                type="submit"
                disabled={!inputText.trim() || isAnalyzing}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-pink-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'Analyzing Sentiment...' : 'Analyze Emotional Tone'}</span>
              </button>
            </div>
          </form>

          {/* Active Result Card */}
          {activeCheck && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/60 to-purple-50/40 border border-pink-100 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-pink-700 uppercase tracking-wider">
                    Primary Detected State
                  </span>
                  <h4 className="text-lg font-black text-slate-900 mt-0.5">
                    {activeCheck.primaryEmotion}
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-medium">Logged on {activeCheck.date}</span>
              </div>

              {/* Stress & Positivity Dual Gauges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Stress Level</span>
                  <div className="text-xl font-black text-rose-600 mt-0.5">{activeCheck.stressScore}%</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div style={{ width: `${activeCheck.stressScore}%` }} className="bg-rose-500 h-full rounded-full" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-100">
                  <span className="text-[11px] text-slate-500 font-medium block">Positivity Index</span>
                  <div className="text-xl font-black text-emerald-600 mt-0.5">{activeCheck.positivityScore}%</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div style={{ width: `${activeCheck.positivityScore}%` }} className="bg-emerald-500 h-full rounded-full" />
                  </div>
                </div>
              </div>

              {/* Recommended Calm Protocol */}
              <div className="pt-1">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  Empathetic Recommendation:
                </span>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-pink-100">
                  {activeCheck.recommendedTechnique}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Right: Guided 4-7-8 Breathing Calmer */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-teal-600" />
                <span>4-7-8 Vagal Breathing Calmer</span>
              </h3>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Nervous System Reset
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Synchronize inhalation and exhalation to downregulate sympathetic fight-or-flight stress hormones.
            </p>
          </div>

          {/* Interactive Expanding Breathing Orb */}
          <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
            
            <div className={`rounded-full flex flex-col items-center justify-center transition-all duration-1000 ${
              breathingActive && breathPhase.startsWith('Inhale')
                ? 'w-48 h-48 bg-teal-500/20 border-4 border-teal-400 shadow-[0_0_40px_rgba(20,184,166,0.4)]'
                : breathingActive && breathPhase.startsWith('Hold')
                ? 'w-48 h-48 bg-cyan-500/20 border-4 border-cyan-400 shadow-[0_0_50px_rgba(6,182,212,0.5)]'
                : breathingActive && breathPhase.startsWith('Exhale')
                ? 'w-28 h-28 bg-blue-500/15 border-2 border-blue-400'
                : 'w-36 h-36 bg-slate-800/60 border border-slate-700'
            }`}>
              <span className="text-xs uppercase tracking-wider text-teal-200 font-bold">
                {breathingActive ? breathPhase : 'Ready'}
              </span>
              <span className="text-3xl font-black text-white mt-1">
                {breathingActive ? `${breathTimer}s` : 'Start'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-4 max-w-xs">
              {breathingActive
                ? breathPhase.startsWith('Inhale') ? 'Breathe in slowly through the nose...' : breathPhase.startsWith('Hold') ? 'Hold breath gently...' : 'Exhale smoothly through parted lips...'
                : 'Click button below to initiate guided 4-7-8 cycle.'}
            </p>
          </div>

          {/* Controls */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setBreathingActive(!breathingActive);
                setBreathPhase('Inhale (4s)');
                setBreathTimer(4);
              }}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                breathingActive
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
              }`}
            >
              {breathingActive ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{breathingActive ? 'Stop Calming Session' : 'Begin 4-7-8 Breathing Cycle'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
