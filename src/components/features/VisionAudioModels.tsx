import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Mic,
  Square,
  Upload,
  CheckCircle2,
  Play,
  Volume2,
  Loader2,
  AlertCircle,
  Sparkles,
  FileAudio,
  RotateCcw,
} from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { FormattedChatMessage } from './FormattedChatMessage';
import photoVoiceImg from '../../assets/images/photo_voice_checkin_1795259460982.jpg';

interface VisionAudioModelsProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

interface PhotoGuideExample {
  id: 'skin_rash' | 'xray_normal' | 'mole_benign';
  title: string;
  subtitle: string;
  categoryLabel: string;
  comfortLevel: string;
  summary: string;
  whatToNotice: string[];
  nextSteps: string;
}

interface SoundGuideExample {
  id: 'normal_breath' | 'wheezing' | 'chest_cough';
  title: string;
  subtitle: string;
  patternLabel: string;
  summary: string;
  observations: string[];
  careTips: string;
}

const PHOTO_EXAMPLES: PhotoGuideExample[] = [
  {
    id: 'skin_rash',
    title: 'Mild Skin Irritation or Rash',
    subtitle: 'Redness, dryness, or itchiness guide',
    categoryLabel: 'Skin & Everyday Care',
    comfortLevel: 'Often mild & manageable at home',
    summary:
      'Mild contact irritation often appears as gentle surface redness after touching a new soap, plant, detergent, or warm sweat.',
    whatToNotice: [
      'Check if the area feels itchy, warm, or slightly dry on the surface',
      'Look at whether borders stay steady rather than spreading rapidly',
      'Think back over the last 24 hours for new creams, soaps, or fabrics',
    ],
    nextSteps:
      'Wash gently with plain cool water, apply a fragrance-free moisturizer, and keep the area uncovered. See a doctor if swelling grows, blisters form, or fever appears.',
  },
  {
    id: 'xray_normal',
    title: 'Clear Chest X-Ray Guide',
    subtitle: 'Understanding a healthy chest scan',
    categoryLabel: 'Breathing & Chest Wellness',
    comfortLevel: 'Helpful example for doctor visits',
    summary:
      'In a clear chest X-ray, both lungs appear evenly dark and open because healthy air spaces let light rays pass through cleanly.',
    whatToNotice: [
      'Even, open air space on both left and right sides of the chest',
      'Clear sharp corners along the lower edges of the lungs',
      'Balanced central heart outline without crowding',
    ],
    nextSteps:
      'Always review your official radiology report together with your doctor, who compares the image with how you are feeling day to day.',
  },
  {
    id: 'mole_benign',
    title: 'Everyday Skin Spot Check',
    subtitle: 'Simple ABCDE self-check guide',
    categoryLabel: 'Skin Awareness',
    comfortLevel: 'Routine monthly awareness',
    summary:
      'Most common skin spots stay small, round, and single-colored over time. A quick monthly glance helps you spot changes early.',
    whatToNotice: [
      'Even, smooth edges and consistent light-to-medium brown shade',
      'Smaller than a pencil eraser (about 6 mm across)',
      'Looks much the same month after month without bleeding or crusting',
    ],
    nextSteps:
      'Use broad-spectrum sunscreen daily when outdoors. Visit a dermatologist if any spot quickly changes shape, size, or color.',
  },
];

const SOUND_EXAMPLES: SoundGuideExample[] = [
  {
    id: 'normal_breath',
    title: 'Calm, Clear Breathing',
    subtitle: 'Smooth steady airflow',
    patternLabel: 'Clear & Unhurried',
    summary:
      'Healthy breathing sounds soft, smooth, and rhythmic—like gentle breeze passing easily in and out without whistling or rattling.',
    observations: [
      'Easy, comfortable pace without straining shoulders or neck',
      'Breathing out feels relaxed and slightly longer than breathing in',
      'No whistling, crackling, or sudden catches in the throat',
    ],
    careTips:
      'A few slow, deep breaths each morning help relax the chest and calm the nervous system.',
  },
  {
    id: 'wheezing',
    title: 'Mild Wheezing Sound',
    subtitle: 'Soft whistling when breathing out',
    patternLabel: 'Narrowed Airway Whistling',
    summary:
      'Wheezing is a soft, high-pitched whistling sound—most noticeable while breathing out—when airways feel slightly tight or sensitive.',
    observations: [
      'Musical whistling tone during exhaling',
      'May show up after cold air, dust, pollen, or light exercise',
      'Often eases when sitting upright in fresh, warm air',
    ],
    careTips:
      'Sit upright, sip warm water, and use your prescribed inhaler if you have one. Seek medical care right away if catching your breath feels hard.',
  },
  {
    id: 'chest_cough',
    title: 'Dry or Chest Cough',
    subtitle: 'Throat tickle or phlegm clearing',
    patternLabel: 'Airway Clearing Reflex',
    summary:
      'Coughing is your body’s natural way of clearing throat irritation, seasonal dust, or mucus from breathing passages.',
    observations: [
      'Deeper chest rumble often means mucus is loosening up',
      'Dry tickly coughs frequently worsen in dry indoor air at night',
      'Staying hydrated makes throat secretions noticeably easier to clear',
    ],
    careTips:
      'Try warm herbal tea with honey (for adults), steam inhalation, and raising your pillow slightly at night. Visit a clinic if a cough lasts over 2 weeks or comes with high fever.',
  },
];

async function compressImageForAnalysis(
  file: File
): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const originalDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1024;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: originalDataUrl,
            base64: originalDataUrl.split(',')[1] || '',
            mimeType: file.type || 'image/jpeg',
          });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        resolve({
          dataUrl: compressed,
          base64: compressed.split(',')[1] || '',
          mimeType: 'image/jpeg',
        });
      };
      img.onerror = () => reject(new Error('Could not read the selected image.'));
      img.src = originalDataUrl;
    };
    reader.onerror = () => reject(new Error('Could not load the selected image.'));
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = String(reader.result || '');
      resolve(dataUrl.split(',')[1] || '');
    };
    reader.onerror = () => reject(new Error('Could not read audio clip.'));
    reader.readAsDataURL(blob);
  });
}

export const VisionAudioModels: React.FC<VisionAudioModelsProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'photo' | 'voice'>('photo');

  // Photo check state
  const [selectedExampleId, setSelectedExampleId] = useState<string>('skin_rash');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [customPhotoBase64, setCustomPhotoBase64] = useState<string | null>(null);
  const [customPhotoMime, setCustomPhotoMime] = useState<string>('image/jpeg');
  const [photoQuestion, setPhotoQuestion] = useState('');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoAiReply, setPhotoAiReply] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Voice & Breathing check state
  const [selectedSoundId, setSelectedSoundId] = useState<string>('normal_breath');
  const [isPlayingExample, setIsPlayingExample] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState<string | null>(null);
  const [recordedAudioMime, setRecordedAudioMime] = useState<string>('audio/webm');
  const [voiceQuestion, setVoiceQuestion] = useState('');
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [audioAiReply, setAudioAiReply] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  const activePhotoExample =
    PHOTO_EXAMPLES.find((e) => e.id === selectedExampleId) || PHOTO_EXAMPLES[0];
  const activeSoundExample =
    SOUND_EXAMPLES.find((e) => e.id === selectedSoundId) || SOUND_EXAMPLES[0];

  const handleSelectPhotoExample = (id: string) => {
    setSelectedExampleId(id);
    setCustomPhotoUrl(null);
    setCustomPhotoBase64(null);
    setPhotoAiReply(null);
    setPhotoError(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setPhotoAiReply(null);

    try {
      const compressed = await compressImageForAnalysis(file);
      setCustomPhotoUrl(compressed.dataUrl);
      setCustomPhotoBase64(compressed.base64);
      setCustomPhotoMime(compressed.mimeType);
      await analyzeUploadedPhoto(compressed.base64, compressed.mimeType, photoQuestion);
    } catch (err: any) {
      setPhotoError(err?.message || 'Unable to load your photo. Please try a JPG or PNG image.');
    } finally {
      e.target.value = '';
    }
  };

  const analyzeUploadedPhoto = async (
    base64Data: string,
    mimeType: string,
    note: string
  ) => {
    setIsAnalyzingPhoto(true);
    setPhotoError(null);

    try {
      const prompt =
        note.trim() ||
        'Please look at this health-related photo and explain in simple, gentle, easy-to-understand language what it shows, simple home care steps if helpful, and when someone should see a doctor.';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          language,
          userProfile: {
            age: currentUser.age,
            gender: currentUser.gender,
            bloodGroup: currentUser.bloodGroup,
          },
          attachment: {
            type: 'image',
            mimeType,
            base64: base64Data,
          },
        }),
        signal: AbortSignal.timeout(45000),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.reply) {
        setPhotoAiReply(data.reply);
      } else {
        setPhotoError(
          data.error ||
            'Could not review this photo right now. Please try a clearer close-up photo or ask in the Health Chatbot.'
        );
      }
    } catch {
      setPhotoError(
        'The photo check took a bit too long. Please try again with a slightly smaller image.'
      );
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const playExampleSound = (id: string) => {
    try {
      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (id === 'wheezing') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(590, audioCtx.currentTime + 1.1);
        gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.85);
      } else if (id === 'chest_cough') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(190, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, audioCtx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.85);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 1.55);
      }

      setIsPlayingExample(true);
      window.setTimeout(() => setIsPlayingExample(false), 1900);
    } catch {
      setIsPlayingExample(false);
    }
  };

  const startVoiceRecording = async () => {
    setAudioError(null);
    setAudioAiReply(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setAudioError('Your browser does not support microphone recording. You can upload an audio clip instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach((tr) => tr.stop());
        mediaStreamRef.current = null;

        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }

        const localUrl = URL.createObjectURL(blob);
        const base64 = await blobToBase64(blob);
        const cleanMime = mimeType.split(';')[0] || 'audio/webm';
        setRecordedAudioUrl(localUrl);
        setRecordedAudioBase64(base64);
        setRecordedAudioMime(cleanMime);
        await analyzeRecordedAudio(base64, cleanMime, voiceQuestion);
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSec(0);
      timerRef.current = window.setInterval(() => {
        setRecordingSec((s) => s + 1);
      }, 1000);
    } catch {
      setAudioError(
        'Microphone permission was not granted. Please allow microphone access or upload a short voice recording.'
      );
    }
  };

  const stopVoiceRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioError(null);
    setAudioAiReply(null);

    try {
      const base64 = await blobToBase64(file);
      const localUrl = URL.createObjectURL(file);
      const mime = file.type || 'audio/mpeg';
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(localUrl);
      setRecordedAudioBase64(base64);
      setRecordedAudioMime(mime);
      await analyzeRecordedAudio(base64, mime, voiceQuestion);
    } catch (err: any) {
      setAudioError(err?.message || 'Unable to load audio file.');
    } finally {
      e.target.value = '';
    }
  };

  const analyzeRecordedAudio = async (
    base64Data: string,
    mimeType: string,
    note: string
  ) => {
    setIsAnalyzingAudio(true);
    setAudioError(null);

    try {
      const prompt =
        note.trim() ||
        'Please listen to this patient voice, breathing, or cough recording and respond with kind, easy-to-understand wellness guidance, calming care tips, and clear advice on when to visit a doctor.';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          language,
          userProfile: {
            age: currentUser.age,
            gender: currentUser.gender,
            bloodGroup: currentUser.bloodGroup,
          },
          attachment: {
            type: 'audio',
            mimeType,
            base64: base64Data,
          },
        }),
        signal: AbortSignal.timeout(45000),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.reply) {
        setAudioAiReply(data.reply);
      } else {
        setAudioError(
          data.error ||
            'Could not analyze the audio right now. Try a clearer 5–15 second recording or type how you feel.'
        );
      }
    } catch {
      setAudioError(
        'Audio check timed out. Please try a shorter recording or share how you are feeling in Health Chatbot.'
      );
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  const resetCustomAudio = () => {
    if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    setRecordedAudioUrl(null);
    setRecordedAudioBase64(null);
    setAudioAiReply(null);
    setAudioError(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Friendly Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
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
              {t.visionAudioModels}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Share a clear photo or record a short voice or cough clip for gentle, easy-to-follow guidance.
            </p>
          </div>
        </div>

        {/* Clean 2-Tab Control */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'photo'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Health Check</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'voice'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice &amp; Breathing Check</span>
          </button>
        </div>
      </div>

      {/* Serene Welcome & Reassurance Strip */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          <div className="md:col-span-4 relative min-h-[160px] bg-gradient-to-br from-teal-50 to-emerald-50">
            <img
              src={photoVoiceImg}
              alt="Calm sunlit home wellness sanctuary with morning chamomile flowers"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-8 p-5 sm:p-6 flex flex-col justify-center space-y-2">
            <p className="text-xs font-semibold text-teal-700">
              Calm Guided Self-Check
            </p>
            <blockquote className="text-base sm:text-lg font-bold text-slate-900 leading-snug text-balance">
              &ldquo;Peace of mind begins with clear, gentle answers—never complicated words.&rdquo;
            </blockquote>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload your own photo, record how your voice or breathing sounds, or browse our easy visual and audio guides below. Always consult a healthcare professional for urgent concerns.
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: PHOTO HEALTH CHECK */}
      {activeTab === 'photo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Upload / Visual Selection */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Check a Photo or Browse Guided Examples
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a skin spot, medicine label, meal, or lab report—or pick a guide below.
                </p>
              </div>

              <label className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0 self-start sm:self-auto">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Your Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Optional Note for Custom Upload */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={photoQuestion}
                onChange={(e) => setPhotoQuestion(e.target.value)}
                placeholder="Optional note: e.g. Itchy patch on my forearm since yesterday..."
                className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              {customPhotoBase64 && (
                <button
                  type="button"
                  disabled={isAnalyzingPhoto}
                  onClick={() =>
                    analyzeUploadedPhoto(customPhotoBase64, customPhotoMime, photoQuestion)
                  }
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {isAnalyzingPhoto ? 'Checking...' : 'Re-check Photo'}
                </button>
              )}
            </div>

            {/* Visual Display Frame */}
            <div className="w-full h-72 rounded-2xl border border-slate-200/80 bg-slate-50 overflow-hidden flex items-center justify-center relative">
              {customPhotoUrl ? (
                <>
                  <img
                    src={customPhotoUrl}
                    alt="Uploaded health photo preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain bg-slate-900/5"
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectPhotoExample(selectedExampleId)}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 text-xs font-bold shadow-sm border border-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear Photo</span>
                  </button>
                </>
              ) : (
                <div className="p-6 text-center max-w-md space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-teal-100/80 text-teal-700 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-teal-700 block">
                      Guided Visual Reference · {activePhotoExample.categoryLabel}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {activePhotoExample.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {activePhotoExample.summary}
                    </p>
                  </div>
                </div>
              )}

              {isAnalyzingPhoto && (
                <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-800">
                    Reviewing your photo gently...
                  </span>
                </div>
              )}
            </div>

            {/* Guided Example Switcher */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Or explore everyday photo guides:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PHOTO_EXAMPLES.map((ex) => {
                  const active = !customPhotoUrl && selectedExampleId === ex.id;
                  return (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleSelectPhotoExample(ex.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-teal-500 bg-teal-50/70 text-teal-900'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-bold">{ex.title}</span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        {ex.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Clear Plain-English Guidance */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            {photoError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{photoError}</span>
              </div>
            )}

            {customPhotoUrl ? (
              <div className="space-y-3">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-teal-700">
                    Your Photo Feedback
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Personal Photo Guidance
                  </h3>
                </div>

                {isAnalyzingPhoto ? (
                  <div className="space-y-2.5 py-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                  </div>
                ) : photoAiReply ? (
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <FormattedChatMessage content={photoAiReply} isUser={false} />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Tap &ldquo;Re-check Photo&rdquo; anytime if you add a note above.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-teal-700">
                    {activePhotoExample.categoryLabel} · {activePhotoExample.comfortLevel}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {activePhotoExample.title}
                  </h3>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2">
                    What to Gently Notice
                  </h4>
                  <ul className="space-y-2">
                    {activePhotoExample.whatToNotice.map((item, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Simple Comfort &amp; Care Steps</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activePhotoExample.nextSteps}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VOICE & BREATHING CHECK */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Live Recorder + Sound Guides */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Record Your Voice or Breathing
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Speak naturally about how you feel, or record a 5–10 second breath or cough clip.
                </p>
              </div>

              <label className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-auto">
                <FileAudio className="w-3.5 h-3.5 text-teal-600" />
                <span>Upload Audio Clip</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Optional Note */}
            <input
              type="text"
              value={voiceQuestion}
              onChange={(e) => setVoiceQuestion(e.target.value)}
              placeholder="Optional note: e.g. Cough started 3 days ago, mostly at night..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />

            {/* Recorder Box */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      disabled={isAnalyzingAudio}
                      className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 whitespace-nowrap shrink-0"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Start Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop &amp; Check ({recordingSec}s)</span>
                    </button>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <button
                      type="button"
                      onClick={resetCustomAudio}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 text-xs font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {isAnalyzingAudio && (
                  <span className="text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Listening and preparing guidance...</span>
                  </span>
                )}
              </div>

              {recordedAudioUrl && (
                <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <audio controls src={recordedAudioUrl} className="w-full sm:max-w-xs h-9" />
                  {recordedAudioBase64 && !isAnalyzingAudio && (
                    <button
                      type="button"
                      onClick={() =>
                        analyzeRecordedAudio(
                          recordedAudioBase64,
                          recordedAudioMime,
                          voiceQuestion
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Re-check Recording
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Educational Sound Guides */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">
                  Or listen to calming breathing &amp; cough sound guides:
                </p>
                <button
                  type="button"
                  onClick={() => playExampleSound(selectedSoundId)}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-teal-700" />
                  <span>{isPlayingExample ? 'Playing Sound...' : 'Play Selected Sound'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SOUND_EXAMPLES.map((snd) => {
                  const active = !recordedAudioUrl && selectedSoundId === snd.id;
                  return (
                    <button
                      key={snd.id}
                      type="button"
                      onClick={() => {
                        resetCustomAudio();
                        setSelectedSoundId(snd.id);
                        playExampleSound(snd.id);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-teal-500 bg-teal-50/70 text-teal-900'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold">{snd.title}</span>
                        <Volume2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      </div>
                      <span className="block text-[11px] text-slate-500">{snd.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Voice / Breathing Guidance */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            {audioError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{audioError}</span>
              </div>
            )}

            {recordedAudioUrl ? (
              <div className="space-y-3">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-teal-700">
                    Your Voice &amp; Breathing Feedback
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">
                    Personal Audio Guidance
                  </h3>
                </div>

                {isAnalyzingAudio ? (
                  <div className="space-y-2.5 py-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                    <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse" />
                  </div>
                ) : audioAiReply ? (
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <FormattedChatMessage content={audioAiReply} isUser={false} />
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Record or upload an audio clip to receive gentle guidance.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-semibold text-teal-700">
                    Sound Guide · {activeSoundExample.patternLabel}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {activeSoundExample.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {activeSoundExample.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2">
                    What to Listen For
                  </h4>
                  <ul className="space-y-2">
                    {activeSoundExample.observations.map((obs, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Gentle Care Tips</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeSoundExample.careTips}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
