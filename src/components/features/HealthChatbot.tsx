import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  MessageSquareHeart,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Plus,
  ImagePlus,
  Mic,
  Square,
  X,
  Clock,
  Trash2,
  PanelLeft,
  PanelLeftClose,
  FileAudio,
  Image as ImageIcon,
  AlertCircle,
  Upload,
} from 'lucide-react';
import {
  SupportedLanguage,
  ChatMessage,
  ChatSession,
  ChatAttachment,
  UserProfile,
} from '../../types';
import { TRANSLATIONS } from '../../translations';
import {
  getChatSessions,
  upsertChatSession,
  deleteChatSession,
} from '../../services/storageService';
import { generateComprehensiveHealthReply } from '../../services/healthAssistantBrain';
import { FormattedChatMessage } from './FormattedChatMessage';

interface HealthChatbotProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

interface LocalizedBotContent {
  welcome: string;
  prompts: string[];
  resetMsg: string;
  processing: string;
  askPlaceholder: string;
  send: string;
  suggestedLabel: string;
  voiceToggle: string;
}

const BOT_LOCALES: Record<SupportedLanguage, LocalizedBotContent> = {
  en: {
    welcome:
      'Hello! I am your HealthAssist AI Assistant. Ask me any question, upload an image (skin rash, medication, lab report, food), or record your voice/cough for instant analysis.',
    prompts: [
      'What should I do if I have a headache and fatigue?',
      'How does the Symptom Checker work in this app?',
      'What are the best home remedies for acidity and indigestion?',
      'How do I find a nearby hospital or emergency clinic?',
      'How can I reduce blood pressure naturally?',
    ],
    resetMsg: 'Started a fresh conversation. How can I help you today?',
    processing: 'Analyzing and preparing response...',
    askPlaceholder: 'Type a health question, upload an image, or tap Mic to speak...',
    send: 'Send',
    suggestedLabel: 'Suggested:',
    voiceToggle: 'Voice',
  },
  hi: {
    welcome:
      'नमस्ते! मैं आपका हेल्थअसिस्ट एआई सहायक हूँ। आप कोई भी स्वास्थ्य प्रश्न पूछ सकते हैं, फोटो (दवा, रिपोर्ट, त्वचा) अपलोड कर सकते हैं या अपनी आवाज़ रिकॉर्ड कर सकते हैं।',
    prompts: [
      'मधुमेह (डायबिटीज) के शुरुआती लक्षण क्या हैं?',
      'रक्तचाप (BP) को प्राकृतिक रूप से कैसे नियंत्रित करें?',
      'उच्च कोलेस्ट्रॉल में क्या नहीं खाना चाहिए?',
      'मुझे हाल ही में तनाव और चिंता महसूस हो रही है',
    ],
    resetMsg: 'नई बातचीत शुरू की गई है। मैं आपकी क्या सहायता कर सकता हूँ?',
    processing: 'उत्तर तैयार हो रहा है...',
    askPlaceholder: 'लक्षण लिखें, फोटो जोड़ें या माइक से बोलें...',
    send: 'भेजें',
    suggestedLabel: 'सुझाव:',
    voiceToggle: 'आवाज़',
  },
  te: {
    welcome:
      'నమస్కారం! నేను మీ హెల్త్ అసిస్ట్ AI సహాయకుడిని. మీరు ఆరోగ్య ప్రశ్నలు అడగవచ్చు, ఫోటో (మందులు, రిపోర్ట్, చర్మ సమస్య) అప్‌లోడ్ చేయవచ్చు లేదా వాయిస్ రికార్డ్ చేయవచ్చు.',
    prompts: [
      'డయాబెటిస్ ప్రారంభ లక్షణాలు ఏమిటి?',
      'రక్తపోటును (BP) సహజంగా ఎలా తగ్గించుకోవాలి?',
      'కొలెస్ట్రాల్ ఎక్కువగా ఉన్నప్పుడు ఏ ఆహారం తినకూడదు?',
      'నాకు ఇటీవల ఆందోళన మరియు ఒత్తిడిగా అనిపిస్తోంది',
    ],
    resetMsg: 'కొత్త సంభాషణ ప్రారంభించబడింది. నేను మీకు ఎలా సహాయపడగలను?',
    processing: 'సమాధానం సిద్ధమవుతోంది...',
    askPlaceholder: 'ప్రశ్న రాయండి, ఫోటో లేదా మైక్‌తో మాట్లాడండి...',
    send: 'పంపు',
    suggestedLabel: 'సూచనలు:',
    voiceToggle: 'వాయిస్',
  },
  ta: {
    welcome:
      'வணக்கம்! நான் உங்கள் HealthAssist AI உதவியாளர். நீங்கள் கேள்விகள் கேட்கலாம், படம் பதிவேற்றலாம் அல்லது குரல் பதிவு செய்யலாம்.',
    prompts: [
      'நீரிழிவு நோயின் ஆரம்ப அறிகுறிகள் என்ன?',
      'இரத்த அழுத்தத்தை எவ்வாறு கட்டுப்படுத்துவது?',
      'கொலஸ்ட்ரால் அதிகம் இருந்தால் என்ன சாப்பிடக்கூடாது?',
      'எனக்கு மன அழுத்தமாக இருக்கிறது',
    ],
    resetMsg: 'புதிய உரையாடல் தொடங்கப்பட்டது. நான் எவ்வாறு உதவ முடியும்?',
    processing: 'பதில் தயாராகிறது...',
    askPlaceholder: 'ஆரோக்கியம் பற்றி கேட்கவும், படம் அல்லது குரல் சேர்க்கவும்...',
    send: 'அனுப்பு',
    suggestedLabel: 'பரிந்துரைகள்:',
    voiceToggle: 'குரல்',
  },
  kn: {
    welcome:
      'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ HealthAssist AI ಸಹಾಯಕ. ನೀವು ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೇಳಬಹುದು, ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು ಅಥವಾ ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಬಹುದು.',
    prompts: [
      'ಮಧುಮೇಹದ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು ಯಾವುವು?',
      'ರಕ್ತದೊತ್ತಡವನ್ನು (BP) ನೈಸರ್ಗಿಕವಾಗಿ ಹೇಗೆ ನಿಯಂತ್ರಿಸುವುದು?',
      'ಕೊಲೆಸ್ಟ್ರಾಲ್ ಹೆಚ್ಚಿದ್ದಾಗ ಏನು ತಿನ್ನಬಾರದು?',
      'ನನಗೆ ಇತ್ತೀಚೆಗೆ ಆತಂಕ ಮತ್ತು ಒತ್ತಡವಾಗುತ್ತಿದೆ',
    ],
    resetMsg: 'ಹೊಸ ಸಂಭಾಷಣೆ ಪ್ರಾರಂಭವಾಗಿದೆ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    processing: 'ಉತ್ತರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...',
    askPlaceholder: 'ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೇಳಿ, ಚಿತ್ರ ಅಥವಾ ಧ್ವನಿ ಸೇರಿಸಿ...',
    send: 'ಕಳುಹಿಸಿ',
    suggestedLabel: 'ಸಲಹೆಗಳು:',
    voiceToggle: 'ಧ್ವನಿ',
  },
  ml: {
    welcome:
      'നമസ്കാരം! ഞാൻ നിങ്ങളുടെ HealthAssist AI സഹായിയാണ്. ചോദ്യങ്ങൾ ചോദിക്കാം, ചിത്രം അപ്‌ലോഡ് ചെയ്യാം അല്ലെങ്കിൽ ശബ്ദം റെക്കോർഡ് ചെയ്യാം.',
    prompts: [
      'പ്രമേഹത്തിന്റെ പ്രാരംഭ ലക്ഷണങ്ങൾ എന്തൊക്കെയാണ്?',
      'രക്തസമ്മർദ്ദം എങ്ങനെ നിയന്ത്രിക്കാം?',
      'കൊളസ്ട്രോൾ ഉള്ളപ്പോൾ എന്തൊക്കെ ഒഴിവാക്കണം?',
      'എനിക്ക് കടുത്ത മാനസിക സമ്മർദ്ദം അനുഭവപ്പെടുന്നു',
    ],
    resetMsg: 'പുതിയ സംഭാഷണം ആരംഭിച്ചു. ഞാൻ എങ്ങനെ സഹായിക്കണം?',
    processing: 'മറുപടി തയ്യാറാകുന്നു...',
    askPlaceholder: 'ചോദ്യം ചോദിക്കുക, ചിത്രം അല്ലെങ്കിൽ ശബ്ദം നൽകുക...',
    send: 'അയക്കുക',
    suggestedLabel: 'നിർദ്ദേശങ്ങൾ:',
    voiceToggle: 'ശബ്ദം',
  },
  mr: {
    welcome:
      'नमस्कार! मी तुमचा HealthAssist AI सहाय्यक आहे. तुम्ही प्रश्न विचारू शकता, फोटो अपलोड करू शकता किंवा आवाज रेकॉर्ड करू शकता.',
    prompts: [
      'मधुमेहाची सुरुवातीची लक्षणे कोणती आहेत?',
      'रक्तदाब (BP) नैसर्गिकरित्या कसा नियंत्रित करावा?',
      'कोलेस्टेरॉल जास्त असताना काय खाऊ नये?',
      'मला खूप ताण आणि अस्वस्थता जाणवत आहे',
    ],
    resetMsg: 'नवीन संभाषण सुरू केले आहे. मी कशी मदत करू?',
    processing: 'उत्तर तयार होत आहे...',
    askPlaceholder: 'आरोग्याबद्दल विचारा, फोटो किंवा आवाज जोडा...',
    send: 'पाठवा',
    suggestedLabel: 'सूचना:',
    voiceToggle: 'आवाज',
  },
  bn: {
    welcome:
      'নমস্কার! আমি আপনার HealthAssist AI সহায়ক। আপনি স্বাস্থ্য প্রশ্ন করতে পারেন, ছবি আপলোড করতে পারেন বা ভয়েস রেকর্ড করতে পারেন।',
    prompts: [
      'ডায়াবেটিসের প্রাথমিক লক্ষণগুলি কী কী?',
      'রক্তচাপ কীভাবে নিয়ন্ত্রণে রাখা যায়?',
      'কোলেস্টেরল বেশি হলে কী খাওয়া উচিত নয়?',
      'আমি বেশ মানসিক চাপে আছি',
    ],
    resetMsg: 'নতুন কথোপকথন শুরু হয়েছে। আমি কীভাবে সাহায্য করব?',
    processing: 'উত্তর তৈরি হচ্ছে...',
    askPlaceholder: 'স্বাস্থ্য সম্পর্কে জিজ্ঞাসা করুন, ছবি বা ভয়েস দিন...',
    send: 'পাঠান',
    suggestedLabel: 'পরামর্শ:',
    voiceToggle: 'কণ্ঠস্বর',
  },
  gu: {
    welcome:
      'નમસ્તે! હું તમારો HealthAssist AI સહાયક છું. તમે પ્રશ્નો પૂછી શકો છો, ફોટો અપલોડ કરી શકો છો અથવા અવાજ રેકોર્ડ કરી શકો છો.',
    prompts: [
      'ડાયાબિટીસના શરૂઆતના લક્ષણો શું છે?',
      'બ્લડ પ્રેશરને કેવી રીતે નિયંત્રિત કરવું?',
      'કોલેસ્ટ્રોલ વધારે હોય ત્યારે શું ન ખાવું?',
      'મને તાણ અને ચિંતા જેવું લાગે છે',
    ],
    resetMsg: 'નવી વાતચીત શરૂ થઈ છે. હું શું મદદ કરું?',
    processing: 'જવાબ તૈયાર થઈ રહ્યો છે...',
    askPlaceholder: 'આરોગ્ય વિશે પૂછો, ફોટો અથવા અવાજ ઉમેરો...',
    send: 'મોકલો',
    suggestedLabel: 'સૂચનો:',
    voiceToggle: 'અવાજ',
  },
  pa: {
    welcome:
      'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ HealthAssist AI ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ, ਫੋਟੋ ਅਪਲੋਡ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ ਆਵਾਜ਼ ਰਿਕਾਰਡ ਕਰ ਸਕਦੇ ਹੋ।',
    prompts: [
      'ਸ਼ੂਗਰ (ਡਾਇਬਟੀਜ਼) ਦੇ ਸ਼ੁਰੂਆਤੀ ਲੱਛਣ ਕੀ ਹਨ?',
      'ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਨੂੰ ਕਿਵੇਂ ਕੰਟਰੋਲ ਕੀਤਾ ਜਾਵੇ?',
      'ਕੋਲੇਸਟ੍ਰੋਲ ਵੱਧ ਹੋਣ ’ਤੇ ਕੀ ਨਹੀਂ ਖਾਣਾ ਚਾਹੀਦਾ?',
      'ਮੈਨੂੰ ਅੱਜਕੱਲ੍ਹ ਤਣਾਅ ਮਹਿਸੂਸ ਹੋ ਰਿਹਾ ਹੈ',
    ],
    resetMsg: 'ਨਵੀਂ ਗੱਲਬਾਤ ਸ਼ੁਰੂ ਕੀਤੀ ਗਈ ਹੈ। ਮੈਂ ਕੀ ਮਦਦ ਕਰਾਂ?',
    processing: 'ਜਵਾਬ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ...',
    askPlaceholder: 'ਸਿਹਤ ਬਾਰੇ ਪੁੱਛੋ, ਫੋਟੋ ਜਾਂ ਆਵਾਜ਼ ਸ਼ਾਮਲ ਕਰੋ...',
    send: 'ਭੇਜੋ',
    suggestedLabel: 'ਸੁਝਾਅ:',
    voiceToggle: 'ਆਵਾਜ਼',
  },
  or: {
    welcome:
      'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର HealthAssist AI ସହାୟକ। ଆପଣ ପ୍ରଶ୍ନ ପଚାରିପାରିବେ, ଫଟୋ ଅପଲୋଡ୍ କରିପାରିବେ କିମ୍ବା ଭଏସ୍ ରେକର୍ଡ କରିପାରିବେ।',
    prompts: [
      'ମଧୁମେହର ପ୍ରାଥମିକ ଲକ୍ଷଣ କ’ଣ?',
      'ରକ୍ତଚାପ କିପରି ନିୟନ୍ତ୍ରଣ କରିବେ?',
      'କୋଲେଷ୍ଟ୍ରଲ୍ ଅଧିକ ଥିଲେ କ’ଣ ଖାଇବା ଅନୁଚିତ?',
      'ମୋତେ ମାନସିକ ଚାପ ଲାଗୁଛି',
    ],
    resetMsg: 'ନୂତନ କଥାବାର୍ତ୍ତା ଆରମ୍ଭ ହୋଇଛି। କିପରି ସାହାଯ୍ୟ କରିବି?',
    processing: 'ଉତ୍ତର ପ୍ରସ୍ତୁତ ହେଉଛି...',
    askPlaceholder: 'ସ୍ୱାସ୍ଥ୍ୟ ବିଷୟରେ ପଚାରନ୍ତୁ, ଫଟୋ କିମ୍ବା ଭଏସ୍ ଯୋଡ଼ନ୍ତୁ...',
    send: 'ପଠାନ୍ତୁ',
    suggestedLabel: 'ପରାମର୍ଶ:',
    voiceToggle: 'ଭଏସ୍',
  },
  as: {
    welcome:
      'নমস্কাৰ! মই আপোনাৰ HealthAssist AI সহায়ক। আপুনি প্ৰশ্ন সুধিব পাৰে, ফটো আপলোড কৰিব পাৰে বা ভয়েচ ৰেকৰ্ড কৰিব পাৰে।',
    prompts: [
      'মধুমেহৰ প্ৰাথমিক লক্ষণসমূহ কি কি?',
      'ৰক্তচাপ কেনেকৈ নিয়ন্ত্ৰণ কৰিব?',
      'কলেষ্টেৰল বেছি থাকিলে কি নাখাব?',
      'মোৰ মানসিক চাপ অনুভৱ হৈছে',
    ],
    resetMsg: 'নতুন বাৰ্তালাপ আৰম্ভ হৈছে। কেনেকৈ সহায় কৰিব পাৰো?',
    processing: 'উত্তৰ প্ৰস্তুত হৈ আছে...',
    askPlaceholder: 'স্বাস্থ্য সম্পৰ্কে সোধক, ফটো বা ভয়েচ যোগ কৰক...',
    send: 'পঠিয়াওক',
    suggestedLabel: 'পৰামৰ্শ:',
    voiceToggle: 'কণ্ঠ',
  },
};

const LANG_TAGS: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  as: 'as-IN',
};

interface PendingImage {
  dataUrl: string;
  base64: string;
  mimeType: string;
  name: string;
}

interface PendingAudio {
  dataUrl: string;
  base64: string;
  mimeType: string;
  durationSec: number;
}

function formatSessionTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(sec: number): string {
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${mins}:${rem.toString().padStart(2, '0')}`;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Downsample AudioBuffer to 16kHz Mono 16-bit PCM WAV for universal Gemini audio compatibility
function encodeAudioBufferToWavBlob(audioBuffer: AudioBuffer): Blob {
  const targetSampleRate = 16000;
  const numChannels = audioBuffer.numberOfChannels;
  const srcRate = audioBuffer.sampleRate;

  // Mix down to mono
  const monoLength = audioBuffer.length;
  const monoData = new Float32Array(monoLength);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < monoLength; i++) {
      monoData[i] += channelData[i] / numChannels;
    }
  }

  // Resample to 16kHz
  const outputLength = Math.max(1, Math.round((monoLength * targetSampleRate) / srcRate));
  const resampled = new Float32Array(outputLength);
  const ratio = monoLength / outputLength;
  for (let i = 0; i < outputLength; i++) {
    const srcIdx = Math.min(monoLength - 1, Math.floor(i * ratio));
    resampled[i] = monoData[srcIdx];
  }

  const buffer = new ArrayBuffer(44 + outputLength * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + outputLength * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetSampleRate, true);
  view.setUint32(28, targetSampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, outputLength * 2, true);

  let offset = 44;
  for (let i = 0; i < outputLength; i++) {
    const sample = Math.max(-1, Math.min(1, resampled[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read audio'));
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(blob);
  });
}

// Convert any browser-recorded audio Blob to clean 16kHz PCM WAV (with fallback to original mime)
async function prepareReliableAudio(
  rawBlob: Blob,
  fallbackMime: string
): Promise<{ dataUrl: string; base64: string; mimeType: string }> {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      try {
        const arrayBuf = await rawBlob.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        const wavBlob = encodeAudioBufferToWavBlob(decoded);
        const dataUrl = await blobToDataUrl(wavBlob);
        const base64 = dataUrl.split(',')[1] || '';
        if (base64) {
          return { dataUrl, base64, mimeType: 'audio/wav' };
        }
      } finally {
        await ctx.close().catch(() => undefined);
      }
    }
  } catch {
    // Fallback to raw recorded blob if decodeAudioData fails
  }

  const dataUrl = await blobToDataUrl(rawBlob);
  return {
    dataUrl,
    base64: dataUrl.split(',')[1] || '',
    mimeType: fallbackMime,
  };
}

// Compress uploaded images cleanly for fast multimodal transfer & storage
async function compressImageFile(file: File): Promise<PendingImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const originalDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const maxDim = 1024;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
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
          const base64 = originalDataUrl.split(',')[1] || '';
          resolve({
            dataUrl: originalDataUrl,
            base64,
            mimeType: file.type || 'image/jpeg',
            name: file.name,
          });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outMime = 'image/jpeg';
        const compressedUrl = canvas.toDataURL(outMime, 0.85);
        resolve({
          dataUrl: compressedUrl,
          base64: compressedUrl.split(',')[1] || '',
          mimeType: outMime,
          name: file.name,
        });
      };
      img.src = originalDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const HealthChatbot: React.FC<HealthChatbotProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const botLocale = BOT_LOCALES[language] || BOT_LOCALES.en;

  const createWelcomeMessage = (text: string): ChatMessage => ({
    id: `welcome_${Date.now()}`,
    sender: 'bot',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  // Always start with a brand-new active chat session whenever HealthChatbot opens
  const [activeSessionId, setActiveSessionId] = useState<string>(() => `chat_${Date.now()}`);
  const [activeCreatedAt, setActiveCreatedAt] = useState<string>(() => new Date().toISOString());
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createWelcomeMessage(botLocale.welcome),
  ]);

  // All stored previous chat sessions for the chatbot's internal sidebar
  const [sessions, setSessions] = useState<ChatSession[]>(() =>
    getChatSessions(currentUser.id)
  );
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(true);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState<boolean>(false);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Multimodal attachment state
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [pendingAudio, setPendingAudio] = useState<PendingAudio | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micBars, setMicBars] = useState<number[]>([20, 35, 25, 40, 22]);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);
  const shouldAutoSendRef = useRef<boolean>(true);
  const liveTranscriptRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);
  const analyserCtxRef = useRef<AudioContext | null>(null);
  const analyserRafRef = useRef<number | null>(null);
  const isRecordingRef = useRef<boolean>(false);
  const inputTextRef = useRef<string>('');

  useEffect(() => {
    inputTextRef.current = inputText;
  }, [inputText]);

  // Reload sessions if user changes
  useEffect(() => {
    setSessions(getChatSessions(currentUser.id));
    startNewChat();
  }, [currentUser.id]);

  // Keep welcome message synchronized with language when chat hasn't started yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'bot') {
      setMessages([createWelcomeMessage(botLocale.welcome)]);
    }
  }, [language]);

  // Smooth auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const cleanupRecordingResources = () => {
    if (recordTimerRef.current) {
      window.clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (analyserRafRef.current) {
      cancelAnimationFrame(analyserRafRef.current);
      analyserRafRef.current = null;
    }
    if (analyserCtxRef.current) {
      analyserCtxRef.current.close().catch(() => undefined);
      analyserCtxRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      recognitionRef.current = null;
    }
  };

  // Cleanup active media stream/timer on unmount
  useEffect(() => {
    return () => {
      cleanupRecordingResources();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream.getTracks().forEach((tr) => tr.stop());
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startNewChat = () => {
    setActiveSessionId(`chat_${Date.now()}`);
    setActiveCreatedAt(new Date().toISOString());
    setMessages([createWelcomeMessage(botLocale.welcome)]);
    setPendingImage(null);
    setPendingAudio(null);
    setInputText('');
    setMediaError(null);
    setIsMobileHistoryOpen(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    setActiveSessionId(session.id);
    setActiveCreatedAt(session.createdAt);
    setMessages(session.messages);
    setPendingImage(null);
    setPendingAudio(null);
    setInputText('');
    setMediaError(null);
    setIsMobileHistoryOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const updated = deleteChatSession(currentUser.id, sessionId);
    setSessions(updated);
    if (activeSessionId === sessionId) {
      startNewChat();
    }
  };

  const analyzeSentiment = (
    text: string
  ): {
    emotion: string;
    sentiment: 'Positive' | 'Neutral' | 'Anxious' | 'Distressed';
    intensity: number;
  } => {
    const lower = text.toLowerCase();
    if (
      lower.includes('pain') ||
      lower.includes('chest') ||
      lower.includes('दर्द') ||
      lower.includes('నొప్పి') ||
      lower.includes('வலி')
    ) {
      return { emotion: 'Distress', sentiment: 'Distressed', intensity: 88 };
    }
    if (
      lower.includes('stress') ||
      lower.includes('anxious') ||
      lower.includes('तनाव') ||
      lower.includes('ఒత్తిడి') ||
      lower.includes('பயம்')
    ) {
      return { emotion: 'Anxiety', sentiment: 'Anxious', intensity: 75 };
    }
    return { emotion: 'General', sentiment: 'Neutral', intensity: 50 };
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const plain = text.replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(plain);
    utterance.lang = LANG_TAGS[language] || 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Image file selection handler
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaError(null);
    if (!file.type.startsWith('image/')) {
      setMediaError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    try {
      const compressed = await compressImageFile(file);
      setPendingImage(compressed);
      setPendingAudio(null);
    } catch {
      setMediaError('Could not process this image. Please try another file.');
    }
    e.target.value = '';
  };

  // Audio file upload handler (works even if microphone hardware is absent)
  const handleAudioFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaError(null);
    if (!file.type.startsWith('audio/')) {
      setMediaError('Please select a valid audio file (WAV, MP3, WebM, M4A, OGG).');
      return;
    }
    try {
      const cleanMime = (file.type || 'audio/mpeg').split(';')[0];
      const prepared = await prepareReliableAudio(file, cleanMime);
      setPendingAudio({
        ...prepared,
        durationSec: 5,
      });
      setPendingImage(null);
    } catch {
      setMediaError('Could not read the selected audio file.');
    }
    e.target.value = '';
  };

  // Paste image directly into chat input
  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            const compressed = await compressImageFile(file);
            setPendingImage(compressed);
            setPendingAudio(null);
            setMediaError(null);
          } catch {
            setMediaError('Could not process pasted image.');
          }
          break;
        }
      }
    }
  };

  const persistSession = (updatedMessages: ChatMessage[], fallbackTitle: string) => {
    const firstUserMsg = updatedMessages.find((m) => m.sender === 'user');
    const existing = sessions.find((s) => s.id === activeSessionId);

    let derivedTitle = existing?.title || fallbackTitle;
    if (!existing && firstUserMsg) {
      if (firstUserMsg.text.trim()) {
        derivedTitle =
          firstUserMsg.text.trim().slice(0, 44) +
          (firstUserMsg.text.trim().length > 44 ? '...' : '');
      } else if (firstUserMsg.attachment?.type === 'image') {
        derivedTitle = 'Image Health Analysis';
      } else if (firstUserMsg.attachment?.type === 'audio') {
        derivedTitle = 'Voice Health Query';
      }
    }

    const sessionToSave: ChatSession = {
      id: activeSessionId,
      title: derivedTitle,
      createdAt: existing?.createdAt || activeCreatedAt,
      updatedAt: new Date().toISOString(),
      messages: updatedMessages,
    };

    const nextSessions = upsertChatSession(currentUser.id, sessionToSave);
    setSessions(nextSessions);
  };

  // Core message submission pipeline (shared by typed messages, image uploads, and instant voice send)
  const submitChatMessage = async (
    rawText: string,
    imageToSend: PendingImage | null,
    audioToSend: PendingAudio | null
  ) => {
    const trimmed = rawText.trim();
    if ((!trimmed && !imageToSend && !audioToSend) || isTyping) return;

    let attachmentObj: ChatAttachment | undefined;
    if (imageToSend) {
      attachmentObj = {
        type: 'image',
        mimeType: imageToSend.mimeType,
        dataUrl: imageToSend.dataUrl,
        name: imageToSend.name,
      };
    } else if (audioToSend) {
      attachmentObj = {
        type: 'audio',
        mimeType: audioToSend.mimeType,
        dataUrl: audioToSend.dataUrl,
        durationSec: audioToSend.durationSec,
      };
    }

    const detectedEmotion = trimmed ? analyzeSentiment(trimmed) : undefined;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...(attachmentObj ? { attachment: attachmentObj } : {}),
      ...(detectedEmotion ? { detectedEmotion } : {}),
    };

    const historySnapshot = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));
    const newHistory = [...messages, userMessage];

    setMessages(newHistory);
    setInputText('');
    setPendingImage(null);
    setPendingAudio(null);
    setMediaError(null);
    setIsTyping(true);

    persistSession(
      newHistory,
      trimmed || (imageToSend ? 'Image Analysis' : 'Voice Query')
    );

    let replyText = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language,
          userProfile: {
            age: currentUser.age,
            gender: currentUser.gender,
            bloodGroup: currentUser.bloodGroup,
          },
          history: historySnapshot,
          ...(imageToSend
            ? {
                attachment: {
                  type: 'image',
                  mimeType: imageToSend.mimeType,
                  base64: imageToSend.base64,
                },
              }
            : audioToSend
            ? {
                attachment: {
                  type: 'audio',
                  mimeType: audioToSend.mimeType,
                  base64: audioToSend.base64,
                },
              }
            : {}),
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.reply) {
          replyText = json.reply;
        }
      }
    } catch (err) {
      console.log('Chat request fallback triggered:', err);
    }

    if (!replyText) {
      if (trimmed && audioToSend) {
        replyText = generateComprehensiveHealthReply(trimmed, language, currentUser);
      } else if (imageToSend) {
        replyText =
          '### Image Analysis Unavailable\nI received your image, but the vision service could not be reached right now. Please try again in a moment or describe what is shown in the image.';
      } else if (audioToSend) {
        replyText =
          '### Voice Analysis Unavailable\nI received your voice recording, but the audio service timed out. Please try a shorter recording or type your health question.';
      } else {
        replyText = generateComprehensiveHealthReply(trimmed, language, currentUser);
      }
    }

    const botMessage: ChatMessage = {
      id: `bot_${Date.now()}`,
      sender: 'bot',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const finalMessages = [...newHistory, botMessage];
    setMessages(finalMessages);
    setIsTyping(false);

    persistSession(
      finalMessages,
      trimmed || (imageToSend ? 'Image Analysis' : 'Voice Query')
    );

    if (ttsEnabled) {
      speakText(replyText);
    }
  };

  // Start voice recording with MediaRecorder + Web Speech Recognition + Live Level Meter
  const handleStartRecording = async () => {
    setMediaError(null);
    liveTranscriptRef.current = '';
    setLiveTranscript('');
    shouldAutoSendRef.current = true;
    isRecordingRef.current = true;

    // Start live Web Speech Recognition in parallel if browser supports it
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    const startSpeechRecognitionOnly = () => {
      if (!SpeechRec) return false;
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = LANG_TAGS[language] || 'en-IN';
        let committedPrefix = '';
        rec.onresult = (event: any) => {
          let sessionText = '';
          for (let i = 0; i < event.results.length; i++) {
            sessionText += event.results[i][0].transcript + ' ';
          }
          const combined = `${committedPrefix} ${sessionText}`.trim();
          liveTranscriptRef.current = combined;
          setLiveTranscript(combined);
        };
        rec.onerror = () => {
          // Silently rely on MediaRecorder audio if speech service fails
        };
        rec.onend = () => {
          if (isRecordingRef.current && recognitionRef.current === rec) {
            committedPrefix = liveTranscriptRef.current;
            try {
              rec.start();
            } catch {
              // Ignore restart failures if browser blocks
            }
          }
        };
        rec.start();
        recognitionRef.current = rec;
        return true;
      } catch {
        return false;
      }
    };

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      // Fallback: speech recognition only mode
      if (startSpeechRecognitionOnly()) {
        recordingStartRef.current = Date.now();
        setRecordingSec(0);
        setIsRecording(true);
        recordTimerRef.current = window.setInterval(() => {
          setRecordingSec(Math.round((Date.now() - recordingStartRef.current) / 1000));
        }, 250);
        return;
      }
      setMediaError(
        'Live microphone recording is unavailable here. You can upload an audio clip instead.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recordingStartRef.current = Date.now();
      setRecordingSec(0);
      setPendingImage(null);
      setPendingAudio(null);

      // Start parallel speech-to-text preview
      startSpeechRecognitionOnly();

      // Start real-time volume meter using AnalyserNode
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 32;
          source.connect(analyser);
          analyserCtxRef.current = ctx;
          const dataArr = new Uint8Array(analyser.frequencyBinCount);

          const updateLevels = () => {
            analyser.getByteFrequencyData(dataArr);
            const bars = [0, 1, 2, 3, 4].map((idx) => {
              const val = dataArr[idx * 2] || 0;
              return Math.max(16, Math.min(100, Math.round((val / 255) * 100)));
            });
            setMicBars(bars);
            analyserRafRef.current = requestAnimationFrame(updateLevels);
          };
          updateLevels();
        }
      } catch {
        // Level animation is optional
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        isRecordingRef.current = false;
        cleanupRecordingResources();
        stream.getTracks().forEach((track) => track.stop());
        // Brief flush delay so final SpeechRecognition result can arrive
        await new Promise((r) => setTimeout(r, 120));

        const durationSec = Math.max(
          1,
          Math.round((Date.now() - recordingStartRef.current) / 1000)
        );
        const rawMime = recorder.mimeType || 'audio/webm';
        const cleanMime = rawMime.split(';')[0] || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: cleanMime });
        const spokenText = liveTranscriptRef.current.trim();
        const existingInput = inputTextRef.current.trim();
        const combinedText = existingInput
          ? spokenText
            ? `${existingInput} ${spokenText}`
            : existingInput
          : spokenText;

        setIsRecording(false);

        if (blob.size === 0 && !spokenText) {
          setMediaError('No audio was captured. Please speak clearly for at least 1 second.');
          return;
        }

        let audioAttachment: PendingAudio | null = null;
        if (blob.size > 0) {
          const prepared = await prepareReliableAudio(blob, cleanMime);
          if (prepared.base64) {
            audioAttachment = {
              ...prepared,
              durationSec,
            };
          }
        }

        if (shouldAutoSendRef.current) {
          if (audioAttachment || combinedText) {
            await submitChatMessage(combinedText, null, audioAttachment);
          }
        } else {
          if (audioAttachment) setPendingAudio(audioAttachment);
          if (spokenText) setInputText(combinedText);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setIsRecording(true);

      recordTimerRef.current = window.setInterval(() => {
        const elapsed = Math.round((Date.now() - recordingStartRef.current) / 1000);
        setRecordingSec(elapsed);
        if (elapsed >= 60 && mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 250);
    } catch {
      // Fallback: try SpeechRecognition-only if getUserMedia was blocked
      if (startSpeechRecognitionOnly()) {
        recordingStartRef.current = Date.now();
        setRecordingSec(0);
        setIsRecording(true);
        recordTimerRef.current = window.setInterval(() => {
          setRecordingSec(Math.round((Date.now() - recordingStartRef.current) / 1000));
        }, 250);
        return;
      }

      setMediaError(
        'Microphone access was denied or unavailable. Allow microphone permission or upload an audio clip.'
      );
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  const handleStopRecording = (autoSend: boolean) => {
    shouldAutoSendRef.current = autoSend;
    isRecordingRef.current = false;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      return;
    }

    // SpeechRecognition-only fallback stop path
    cleanupRecordingResources();
    setIsRecording(false);
    const spokenText = liveTranscriptRef.current.trim();
    if (!spokenText) {
      setMediaError('No speech detected. Please speak closer to your microphone or upload audio.');
      return;
    }

    const existingInput = inputTextRef.current.trim();
    const combined = existingInput ? `${existingInput} ${spokenText}` : spokenText;
    if (autoSend) {
      submitChatMessage(combined, null, null);
    } else {
      setInputText(combined);
    }
  };

  const handleCancelRecording = () => {
    shouldAutoSendRef.current = false;
    isRecordingRef.current = false;
    cleanupRecordingResources();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        mediaRecorderRef.current?.stream.getTracks().forEach((tr) => tr.stop());
      };
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    liveTranscriptRef.current = '';
    setLiveTranscript('');
    setIsRecording(false);
    setRecordingSec(0);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isRecording) return;
    submitChatMessage(inputText, pendingImage, pendingAudio);
  };

  const renderHistoryList = () => (
    <div className="flex flex-col h-full">
      <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between gap-2 bg-white">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
            Previous Chats
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            · {sessions.length}
          </span>
        </div>
        <button
          type="button"
          onClick={startNewChat}
          className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          title="Start a brand new conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 scrollbar-thin bg-slate-50/60">
        {sessions.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Clock className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">No previous chats yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Every conversation you start is automatically saved here with its timestamp.
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const isSelected = session.id === activeSessionId;
            const hasImage = session.messages.some((m) => m.attachment?.type === 'image');
            const hasAudio = session.messages.some((m) => m.attachment?.type === 'audio');
            const userCount = session.messages.filter((m) => m.sender === 'user').length;

            return (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                  isSelected
                    ? 'bg-teal-50/90 border-teal-300 shadow-xs'
                    : 'bg-white border-slate-200/70 hover:border-teal-200 hover:bg-teal-50/30'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {hasImage && (
                      <ImageIcon className="w-3 h-3 text-teal-600 shrink-0" />
                    )}
                    {hasAudio && (
                      <FileAudio className="w-3 h-3 text-emerald-600 shrink-0" />
                    )}
                    <p
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-teal-900' : 'text-slate-800'
                      }`}
                    >
                      {session.title}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-[10px] font-medium text-slate-500 truncate">
                      {formatSessionTimestamp(session.updatedAt)}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {userCount} {userCount === 1 ? 'msg' : 'msgs'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-70 group-hover:opacity-100 transition-all cursor-pointer shrink-0"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Lightbox Modal for viewing attached images larger */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-slate-800 shadow-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged health attachment"
              referrerPolicy="no-referrer"
              className="max-h-[82vh] max-w-full rounded-2xl shadow-2xl object-contain bg-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

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
            <h1 className="text-2xl font-black text-slate-900">{t.healthChatbot}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ask any question in your own words, record your voice, or share a photo — every chat starts fresh and saves with timestamps.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startNewChat}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              ttsEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
            title="Read responses aloud"
          >
            {ttsEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>
              {botLocale.voiceToggle} {ttsEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Split Chat Container (Internal Chat History Sidebar + Active Chat Area) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex h-[670px] overflow-hidden relative">
        {/* Desktop Internal Chat History Sidebar */}
        {isHistoryOpen && (
          <aside className="hidden lg:flex lg:w-72 shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/40">
            {renderHistoryList()}
          </aside>
        )}

        {/* Mobile / Tablet Internal Drawer Sidebar (Strictly inside HealthChatbot) */}
        {isMobileHistoryOpen && (
          <div className="lg:hidden absolute inset-0 z-30 flex">
            <aside className="w-72 max-w-[85%] bg-white h-full border-r border-slate-200 shadow-xl flex flex-col">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-bold text-slate-600">Chat History</span>
                <button
                  type="button"
                  onClick={() => setIsMobileHistoryOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">{renderHistoryList()}</div>
            </aside>
            <div
              className="flex-1 bg-slate-900/30 backdrop-blur-[1px]"
              onClick={() => setIsMobileHistoryOpen(false)}
            />
          </div>
        )}

        {/* Active Chat Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sub-header for toggling Health Chatbot sidebar & viewing session timestamp */}
          <div className="px-4 py-2.5 border-b border-slate-200/70 bg-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-teal-300 text-slate-600 hover:text-teal-700 text-xs font-bold transition-colors cursor-pointer"
                title={isHistoryOpen ? 'Hide chat history' : 'Show chat history'}
              >
                {isHistoryOpen ? (
                  <PanelLeftClose className="w-3.5 h-3.5" />
                ) : (
                  <PanelLeft className="w-3.5 h-3.5" />
                )}
                <span>History ({sessions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMobileHistoryOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-teal-300 text-slate-600 text-xs font-bold cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>History ({sessions.length})</span>
              </button>

              <span className="text-xs font-semibold text-slate-500 truncate">
                {activeSession
                  ? `Saved · ${formatSessionTimestamp(activeSession.updatedAt)}`
                  : `New Session · ${formatSessionTimestamp(activeCreatedAt)}`}
              </span>
            </div>

            {activeSession && (
              <button
                type="button"
                onClick={startNewChat}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer shrink-0"
              >
                + Fresh Chat
              </button>
            )}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin bg-slate-50/50">
            {/* Fresh Chat Visual Welcome Card when conversation hasn't started */}
            {messages.length === 1 && !activeSession && (
              <div className="max-w-2xl bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
                <img
                  src="/images/chatbot-assistant.svg"
                  alt="HealthAssist AI Multimodal Companion"
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 bg-teal-50"
                />
                <div className="space-y-1.5 text-center sm:text-left">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Multimodal Personal Health Assistant
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Type a question, tap the microphone to speak or record a cough/symptom sound, or upload a photo of a skin concern, medicine, or lab report.
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 pt-1 text-[11px] font-medium text-teal-700">
                    <span>Voice Recognition &amp; Cough Audio</span>
                    <span aria-hidden="true">·</span>
                    <span>Photo &amp; Report Analysis</span>
                    <span aria-hidden="true">·</span>
                    <span>Timestamped History</span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-2xl ${
                    isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-xs ${
                      isUser
                        ? 'bg-teal-600'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 max-w-[85%] sm:max-w-[78%]">
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-teal-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                      }`}
                    >
                      {/* Render Image Attachment if present */}
                      {msg.attachment?.type === 'image' && (
                        <div className="mb-2.5">
                          {msg.attachment.dataUrl ? (
                            <img
                              src={msg.attachment.dataUrl}
                              alt={msg.attachment.name || 'Uploaded image'}
                              referrerPolicy="no-referrer"
                              onClick={() => setLightboxImage(msg.attachment!.dataUrl)}
                              className="max-h-56 w-auto rounded-xl border border-white/25 object-cover cursor-zoom-in shadow-xs"
                            />
                          ) : (
                            <div className="px-3 py-2 rounded-xl bg-teal-700/50 text-xs flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              <span>[Image analyzed]</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Render Audio Attachment if present */}
                      {msg.attachment?.type === 'audio' && (
                        <div className="mb-2.5">
                          {msg.attachment.dataUrl ? (
                            <div className="p-2 rounded-xl bg-teal-700/40 border border-white/20 space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-50">
                                <Mic className="w-3.5 h-3.5" />
                                <span>
                                  Voice Recording (
                                  {formatDuration(msg.attachment.durationSec || 0)})
                                </span>
                              </div>
                              <audio
                                controls
                                src={msg.attachment.dataUrl}
                                className="h-8 max-w-[240px] sm:max-w-[280px]"
                              />
                            </div>
                          ) : (
                            <div className="px-3 py-2 rounded-xl bg-teal-700/50 text-xs flex items-center gap-2">
                              <FileAudio className="w-4 h-4" />
                              <span>[Voice recording analyzed]</span>
                            </div>
                          )}
                        </div>
                      )}

                      {(msg.text || !msg.attachment) && (
                        <FormattedChatMessage content={msg.text} isUser={isUser} />
                      )}
                    </div>

                    <div
                      className={`text-[10px] text-slate-400 ${
                        isUser ? 'text-right' : 'text-left pl-1'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-3 mr-auto max-w-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium text-slate-600">
                    {botLocale.processing}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts in Selected Language */}
          <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
              {botLocale.suggestedLabel}
            </span>
            {botLocale.prompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(prompt)}
                className="px-3 py-1 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-slate-700 text-xs whitespace-nowrap hover:bg-teal-50 transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Media / Recording Status & Attachment Preview Strip */}
          {(mediaError || isRecording || pendingImage || pendingAudio) && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 space-y-2">
              {mediaError && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{mediaError}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 font-bold text-[11px] hover:bg-rose-100 cursor-pointer flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Audio</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaError(null)}
                      className="p-0.5 hover:bg-rose-100 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {isRecording && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Live Audio Level Bars */}
                    <div className="flex items-end gap-0.5 h-5 shrink-0" aria-hidden="true">
                      {micBars.map((pct, idx) => (
                        <span
                          key={idx}
                          style={{ height: `${pct}%` }}
                          className="w-1 rounded-full bg-rose-600 transition-all duration-75"
                        />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-rose-900">
                        Listening... {formatDuration(recordingSec)}
                      </div>
                      {liveTranscript ? (
                        <p className="text-[11px] text-rose-700 truncate">
                          &ldquo;{liveTranscript}&rdquo;
                        </p>
                      ) : (
                        <p className="text-[11px] text-rose-600">
                          Speak your question or record a cough/breathing sound
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCancelRecording}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStopRecording(false)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-700 text-xs font-bold hover:bg-emerald-50 cursor-pointer"
                    >
                      Attach Clip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStopRecording(true)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Voice</span>
                    </button>
                  </div>
                </div>
              )}

              {pendingImage && (
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-teal-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={pendingImage.dataUrl}
                      alt="Selected preview"
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {pendingImage.name}
                      </p>
                      <p className="text-[11px] text-teal-700">
                        Image ready — press Send to identify and analyze it
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingImage(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {pendingAudio && (
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white border border-emerald-200 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <FileAudio className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800">
                        Voice Clip ({formatDuration(pendingAudio.durationSec)})
                      </p>
                      <audio
                        controls
                        src={pendingAudio.dataUrl}
                        className="h-7 mt-1 max-w-full"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingAudio(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Remove voice recording"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Multimodal Message Input Box */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2 sm:gap-2.5"
          >
            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileSelect}
              className="hidden"
            />

            {/* Upload Image Button */}
            <button
              type="button"
              disabled={isTyping || isRecording}
              onClick={() => imageInputRef.current?.click()}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shrink-0 disabled:opacity-50 ${
                pendingImage
                  ? 'bg-teal-50 border-teal-400 text-teal-700'
                  : 'bg-slate-50 border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-600 hover:text-teal-700'
              }`}
              title="Upload image (skin condition, medicine, lab report, food)"
            >
              <ImagePlus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Upload Audio File Button */}
            <button
              type="button"
              disabled={isTyping || isRecording}
              onClick={() => audioInputRef.current?.click()}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shrink-0 disabled:opacity-50 ${
                pendingAudio
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
              }`}
              title="Upload voice or audio clip (WAV, MP3, M4A, WebM)"
            >
              <FileAudio className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Voice Record / Send Button */}
            <button
              type="button"
              disabled={isTyping}
              onClick={
                isRecording
                  ? () => handleStopRecording(true)
                  : handleStartRecording
              }
              className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer shrink-0 disabled:opacity-50 ${
                isRecording
                  ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
                  : pendingAudio
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
              }`}
              title={
                isRecording
                  ? 'Stop and send voice query'
                  : 'Record voice or symptom sound'
              }
            >
              {isRecording ? (
                <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPaste={handlePaste}
              placeholder={botLocale.askPlaceholder}
              className="flex-1 min-w-0 px-3.5 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-400 focus:placeholder-transparent"
            />

            <button
              type="submit"
              disabled={
                (!inputText.trim() && !pendingImage && !pendingAudio) ||
                isTyping ||
                isRecording
              }
              className="px-4 sm:px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{botLocale.send}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
