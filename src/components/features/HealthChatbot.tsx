import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  MessageSquareHeart, 
  Send, 
  Bot, 
  User, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Smile
} from 'lucide-react';
import { SupportedLanguage, ChatMessage, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { getChatHistory, saveChatHistory } from '../../services/storageService';
import { generateComprehensiveHealthReply } from '../../services/healthAssistantBrain';
import { FormattedChatMessage } from './FormattedChatMessage';

interface HealthChatbotProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

// Localized chatbot responses for all Indian languages + English
interface LocalizedBotContent {
  welcome: string;
  prompts: string[];
  diabetesReply: string;
  bpReply: string;
  chestPainReply: string;
  dietReply: string;
  stressReply: string;
  generalReply: string;
  resetMsg: string;
  processing: string;
  askPlaceholder: string;
  send: string;
  suggestedLabel: string;
  voiceToggle: string;
}

const BOT_LOCALES: Record<SupportedLanguage, LocalizedBotContent> = {
  en: {
    welcome: "Hello! I am your HealthAssist AI Assistant. Ask me any question about your health, symptoms, nutrition, medications, or any feature in HealthAssist AI.",
    prompts: [
      "What should I do if I have a headache and fatigue?",
      "How does the Symptom Checker work in this app?",
      "What are the best home remedies for acidity and indigestion?",
      "How do I find a nearby hospital or emergency clinic?",
      "How can I reduce blood pressure naturally?"
    ],
    diabetesReply: "Early signs of diabetes include frequent urination, excessive thirst, persistent fatigue, and blurred vision. It is recommended to check your Fasting Blood Sugar (<100 mg/dL normal) and HbA1c (<5.7% normal).",
    bpReply: "To maintain optimal blood pressure: limit daily sodium intake (<2,300 mg), engage in 30 minutes of daily brisk walking, reduce stress, and prioritize 7-8 hours of sound sleep.",
    chestPainReply: "⚠️ Urgent Attention: Severe chest pain radiating to the left arm or accompanied by shortness of breath requires immediate emergency care. Please dial 112 / 108 or visit the nearest hospital emergency room.",
    dietReply: "A healthy diet focuses on whole grains, fresh vegetables, lean proteins, legumes, and adequate hydration. Avoid processed sugars and deep-fried foods.",
    stressReply: "Stress affects physical and mental wellness. Try diaphragmatic breathing: breathe in slowly for 4 seconds, hold for 7 seconds, and exhale smoothly for 8 seconds. Taking short screen breaks also helps.",
    generalReply: "Thank you for sharing. For accurate health guidance, please monitor your symptoms and check with a qualified medical professional. Is there anything specific you would like to know?",
    resetMsg: "Conversation history has been cleared. How can I help you today?",
    processing: "Processing response...",
    askPlaceholder: "Ask about symptoms, health, diet, or medications...",
    send: "Send",
    suggestedLabel: "Suggested:",
    voiceToggle: "Voice",
  },
  hi: {
    welcome: "नमस्ते! मैं आपका हेल्थअसिस्ट एआई सहायक हूँ। मैं आपकी क्या मदद कर सकता हूँ? आप लक्षणों, आहार या सामान्य स्वास्थ्य के बारे में पूछ सकते हैं।",
    prompts: [
      "मधुमेह (डायबिटीज) के शुरुआती लक्षण क्या हैं?",
      "रक्तचाप (BP) को प्राकृतिक रूप से कैसे नियंत्रित करें?",
      "उच्च कोलेस्ट्रॉल में क्या नहीं खाना चाहिए?",
      "मुझे हाल ही में तनाव और चिंता महसूस हो रही है"
    ],
    diabetesReply: "मधुमेह के शुरुआती लक्षणों में बार-बार पेशाब आना, अत्यधिक प्यास लगना, थकान और धुंधला दिखना शामिल हैं। खाली पेट ब्लड शुगर (70-99 mg/dL) और HbA1c जांच कराने की सलाह दी जाती है।",
    bpReply: "रक्तचाप सामान्य रखने के लिए: नमक का सेवन कम करें, रोजाना 30 मिनट टहलें, तनाव कम करें और पर्याप्त 7-8 घंटे की नींद लें।",
    chestPainReply: "⚠️ आपातकालीन सूचना: सीने में तेज दर्द, सांस लेने में तकलीफ या पसीना आना आपातकाल का संकेत हो सकता है। कृपया तुरंत 108 या 112 पर कॉल करें या नजदीकी अस्पताल जाएं।",
    dietReply: "संतुलित आहार में हरी सब्जियां, दालें, साबुत अनाज, फल और पर्याप्त पानी शामिल होना चाहिए। तली-भुनी चीजें और अधिक मीठे से बचें।",
    stressReply: "तनाव शरीर और मन दोनों को प्रभावित करता है। गहरी सांस लेने का अभ्यास करें: 4 सेकंड सांस अंदर लें, 7 सेकंड रोकें और 8 सेकंड में धीरे-धीरे छोड़ें।",
    generalReply: "आपके प्रश्न के लिए धन्यवाद। बेहतर स्वास्थ्य के लिए संतुलित दिनचर्या अपनाएं और आवश्यकता पड़ने पर डॉक्टर से परामर्श अवश्य लें। क्या आप कुछ और जानना चाहते हैं?",
    resetMsg: "बातचीत का इतिहास साफ़ कर दिया गया है। मैं आज आपकी क्या सहायता कर सकता हूँ?",
    processing: "उत्तर तैयार हो रहा है...",
    askPlaceholder: "लक्षणों, स्वास्थ्य या आहार के बारे में पूछें...",
    send: "भेजें",
    suggestedLabel: "सुझाव:",
    voiceToggle: "आवाज़",
  },
  te: {
    welcome: "నమస్కారం! నేను మీ హెల్త్ అసిస్ట్ AI సహాయకుడిని. మీకు ఎలాంటి ఆరోగ్య సలహా కావాలి? మీరు లక్షణాలు, ఆహారం లేదా ఆరోగ్యం గురించి అడగవచ్చు.",
    prompts: [
      "డయాబెటిస్ ప్రారంభ లక్షణాలు ఏమిటి?",
      "రక్తపోటును (BP) సహజంగా ఎలా తగ్గించుకోవాలి?",
      "కొలెస్ట్రాల్ ఎక్కువగా ఉన్నప్పుడు ఏ ఆహారం తినకూడదు?",
      "నాకు ఇటీవల ఆందోళన మరియు ఒత్తిడిగా అనిపిస్తోంది"
    ],
    diabetesReply: "డయాబెటిస్ ప్రారంభ లక్షణాలలో తరచుగా మూత్రవిసర్జన, విపరీతమైన దాహం, అలసట మరియు చూపు మసకబారడం ఉంటాయి. ఫాస్టింగ్ బ్లడ్ షుగర్ (<100 mg/dL సాధారణం) మరియు HbA1c పరీక్ష చేయించుకోవడం మంచిది.",
    bpReply: "రక్తపోటును నియంత్రించడానికి: ఉప్పు వాడకం తగ్గించండి, రోజూ 30 నిమిషాలు నడవండి, తగినంత నిద్రపోండి మరియు మానసిక ఒత్తిడిని తగ్గించుకోండి.",
    chestPainReply: "⚠️ అత్యవసర హెచ్చరిక: ఛాతీలో తీవ్రమైన నొప్పి, ఎడమ చేయి నొప్పి లేదా శ్వాస తీసుకోవడంలో ఇబ్బంది ఉంటే వెంటనే 108 లేదా 112 కి కాల్ చేయండి లేదా సమీప ఆసుపత్రికి వెళ్లండి.",
    dietReply: "ఆరోగ్యకరమైన ఆహారంలో తాజా కూరగాయలు, ఆకుకూరలు, పప్పుధాన్యాలు, తృణధాన్యాలు మరియు సరిపడా నీరు ఉండాలి. వేపుళ్ళు, చక్కెర పదార్థాలు తగ్గించండి.",
    stressReply: "ఒత్తిడిని తగ్గించడానికి దీర్ఘ శ్వాస తీసుకోండి: 4 సెకన్లు శ్వాస పీల్చి, 7 సెకన్లు ఆపి, 8 సెకన్లలో నెమ్మదిగా వదలండి. ఇది మనస్సును ప్రశాంతపరుస్తుంది.",
    generalReply: "మీ ప్రశ్నకు ధన్యవాదాలు. సరైన ఆరోగ్య సంరక్షణ కోసం వైద్యుడిని సంప్రదించడం ఎల్లప్పుడూ మంచిది. మీరు మరింకేమైనా తెలుసుకోవాలనుకుంటున్నారా?",
    resetMsg: "సంభాషణ వివరాలు తొలగించబడ్డాయి. నేను మీకు ఎలా సహాయపడగలను?",
    processing: "సమాధానం సిద్ధమవుతోంది...",
    askPlaceholder: "లక్షణాలు, ఆరోగ్యం లేదా ఆహారం గురించి అడగండి...",
    send: "పంపు",
    suggestedLabel: "సూచనలు:",
    voiceToggle: "వాయిస్",
  },
  ta: {
    welcome: "வணக்கம்! நான் உங்கள் HealthAssist AI உதவியாளர். உங்களுக்கு நான் எவ்வாறு உதவ முடியும்? அறிகுறிகள் அல்லது உணவு பற்றி நீங்கள் கேட்கலாம்.",
    prompts: [
      "நீரிழிவு நோயின் ஆரம்ப அறிகுறிகள் என்ன?",
      "இரத்த அழுத்தத்தை எவ்வாறு கட்டுப்படுத்துவது?",
      "கொலஸ்ட்ரால் அதிகம் இருந்தால் என்ன சாப்பிடக்கூடாது?",
      "எனக்கு மன அழுத்தமாக இருக்கிறது"
    ],
    diabetesReply: "நீரிழிவு நோயின் ஆரம்ப அறிகுறிகள்: அடிக்கடி சிறுநீர் கழித்தல், அதிக தாகம், சோர்வு மற்றும் பார்வை மங்கலாதல். இரத்த சர்க்கரை அளவை பரிசோதிப்பது நல்லது.",
    bpReply: "இரத்த அழுத்தத்தைக் கட்டுப்படுத்த: உப்பைக் குறைக்கவும், தினமும் 30 நிமிடங்கள் நடைபயிற்சி செய்யவும், போதுமான தூக்கம் பெறவும்.",
    chestPainReply: "⚠️ அவசர அறிவிப்பு: நெஞ்சு வலி அல்லது மூச்சுத்திணறல் இருந்தால் உடனடியாக 108 அல்லது 112 என்ற எண்ணை அழைக்கவும் அல்லது மருத்துவமனைக்குச் செல்லவும்.",
    dietReply: "ஆரோக்கியமான உணவில் கீரைகள், காய்கறிகள், பயறு வகைகள் மற்றும் போதுமான தண்ணீர் இருக்க வேண்டும். அதிக எண்ணெய் மற்றும் இனிப்பைத் தவிர்க்கவும்.",
    stressReply: "மன அழுத்தத்தைக் குறைக்க ஆழமாக மூச்சு விடுங்கள்: 4 வினாடிகள் மூச்சை உள்ளிழுத்து, 7 வினாடிகள் நிறுத்தி, 8 வினாடிகளில் மெதுவாக வெளிவிடவும்.",
    generalReply: "உங்கள் கேள்விக்கு நன்றி. சரியான மருத்துவ ஆலோசனைக்கு மருத்துவரை அணுகவும். வேறு ஏதேனும் தகவல் வேண்டுமா?",
    resetMsg: "உரையாடல் அழிக்கப்பட்டது. நான் எவ்வாறு உதவ முடியும்?",
    processing: "பதில் தயாராகிறது...",
    askPlaceholder: "ஆரோக்கியம் அல்லது உணவு பற்றி கேட்கவும்...",
    send: "அனுப்பு",
    suggestedLabel: "பரிந்துரைகள்:",
    voiceToggle: "குரல்",
  },
  kn: {
    welcome: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ HealthAssist AI ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ನೀವು ರೋಗಲಕ್ಷಣಗಳು ಅಥವಾ ಆಹಾರದ ಬಗ್ಗೆ ಕೇಳಬಹುದು.",
    prompts: [
      "ಮಧುಮೇಹದ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು ಯಾವುವು?",
      "ರಕ್ತದೊತ್ತಡವನ್ನು (BP) ನೈಸರ್ಗಿಕವಾಗಿ ಹೇಗೆ ನಿಯಂತ್ರಿಸುವುದು?",
      "ಕೊಲೆಸ್ಟ್ರಾಲ್ ಹೆಚ್ಚಿದ್ದಾಗ ಏನು ತಿನ್ನಬಾರದು?",
      "ನನಗೆ ಇತ್ತೀಚೆಗೆ ಆತಂಕ ಮತ್ತು ಒತ್ತಡವಾಗುತ್ತಿದೆ"
    ],
    diabetesReply: "ಮಧುಮೇಹದ ಆರಂಭಿಕ ಲಕ್ಷಣಗಳು: ಪದೇ ಪದೇ ಮೂತ್ರ ವಿಸರ್ಜನೆ, ಅತಿಯಾದ ಬಾಯಾರಿಕೆ, ಆಯಾಸ ಮತ್ತು ಮಸುಕಾದ ದೃಷ್ಟಿ. ರಕ್ತ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿಕೊಳ್ಳುವುದು ಉತ್ತಮ.",
    bpReply: "ರಕ್ತದೊತ್ತಡ ನಿಯಂತ್ರಿಸಲು: ಉಪ್ಪಿನ ಬಳಕೆ ಕಡಿಮೆ ಮಾಡಿ, ನಿತ್ಯ 30 ನಿಮಿಷ ವಾಕಿಂಗ್ ಮಾಡಿ, ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡಿ ಮತ್ತು ಚೆನ್ನಾಗಿ ನಿದ್ರೆ ಮಾಡಿ.",
    chestPainReply: "⚠️ ತುರ್ತು ಎಚ್ಚರಿಕೆ: ಎದೆ ನೋವು ಅಥವಾ ಉಸಿರಾಟದ ತೊಂದರೆ ಇದ್ದರೆ ತಕ್ಷಣ 108 ಅಥವಾ 112 ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.",
    dietReply: "ಆರೋಗ್ಯಕರ ಆಹಾರದಲ್ಲಿ ಹಸಿರು ತರಕಾರಿಗಳು, ಕಾಳುಗಳು, ಹಣ್ಣುಗಳು ಮತ್ತು ಸಾಕಷ್ಟು ನೀರು ಇರಬೇಕು. ಎಣ್ಣೆ ಪದಾರ್ಥಗಳನ್ನು ಕಡಿಮೆ ಮಾಡಿ.",
    stressReply: "ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡಲು ದೀರ್ಘ ಶ್ವಾಸ ತೆಗೆದುಕೊಳ್ಳಿ: 4 ಸೆಕೆಂಡು ಉಸಿರು ತೆಗೆದುಕೊಂಡು, 7 ಸೆಕೆಂಡು ಹಿಡಿದಿಟ್ಟು, 8 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ನಿಧಾನವಾಗಿ ಬಿಡಿ.",
    generalReply: "ಧನ್ಯವಾದಗಳು. ನಿಖರವಾದ ಆರೋಗ್ಯ ಮಾಹಿತಿಗಾಗಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ. ನಿಮಗೆ ಬೇರೆ ಏನಾದರೂ ಮಾಹಿತಿ ಬೇಕೇ?",
    resetMsg: "ಹಿಂದಿನ ಸಂಭಾಷಣೆ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    processing: "ಉತ್ತರ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",
    askPlaceholder: "ಆರೋಗ್ಯ ಅಥವಾ ಆಹಾರದ ಬಗ್ಗೆ ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ",
    suggestedLabel: "ಸಲಹೆಗಳು:",
    voiceToggle: "ಧ್ವನಿ",
  },
  ml: {
    welcome: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ HealthAssist AI സഹായിയാണ്. ലക്ഷണങ്ങളെക്കുറിച്ചോ ഭക്ഷണത്തെക്കുറിച്ചോ നിങ്ങൾക്ക് ചോദിക്കാം.",
    prompts: [
      "പ്രമേഹത്തിന്റെ പ്രാരംഭ ലക്ഷണങ്ങൾ എന്തൊക്കെയാണ്?",
      "രക്തസമ്മർദ്ദം എങ്ങനെ നിയന്ത്രിക്കാം?",
      "കൊളസ്ട്രോൾ ഉള്ളപ്പോൾ എന്തൊക്കെ ഒഴിവാക്കണം?",
      "എനിക്ക് കടുത്ത മാനസിക സമ്മർദ്ദം അനുഭവപ്പെടുന്നു"
    ],
    diabetesReply: "പ്രമേഹ ലക്ഷണങ്ങൾ: അടിക്കടിയുള്ള മൂത്രമൊഴിക്കൽ, അമിത ദാഹം, ക്ഷീണം, കാഴ്ച മങ്ങൽ എന്നിവയാണ്. രക്തപരിശോധന നടത്തുന്നത് നല്ലതാണ്.",
    bpReply: "രക്തസമ്മർദ്ദം നിയന്ത്രിക്കാൻ: ഉപ്പ് കുറയ്ക്കുക, ദിവസവും വ്യായാമം ചെയ്യുക, ആവശ്യത്തിന് ഉറങ്ങുക, സമാധാനമായിരിക്കുക.",
    chestPainReply: "⚠️ അടിയന്തര മുന്നറിയിപ്പ്: കഠിനമായ നെഞ്ചുവേദനയോ ശ്വാസതടസ്സമോ ഉണ്ടായാൽ ഉടൻ 108 അല്ലെങ്കിൽ 112 എന്ന നമ്പറിൽ വിളിക്കുക.",
    dietReply: "പച്ചക്കറികൾ, പയറുവർഗ്ഗങ്ങൾ, ഇലക്കറികൾ എന്നിവ ഭക്ഷണത്തിൽ ഉൾപ്പെടുത്തുക. എണ്ണയും മധുരവും കുറയ്ക്കുക.",
    stressReply: "സമ്മർദ്ദം കുറയ്ക്കാൻ ദീർഘമായി ശ്വാസമെടുക്കുക: 4 സെക്കൻഡ് ശ്വാസമെടുത്ത്, 7 സെക്കൻഡ് പിടിച്ച്, 8 സെക്കൻഡിൽ പതുക്കെ വിടുക.",
    generalReply: "ചോദ്യത്തിന് നന്ദി. കൃത്യമായ ആരോഗ്യ വിവരങ്ങൾക്ക് ഡോക്ടറെ സമീപിക്കുക. കൂടുതൽ എന്തെങ്കിലും അറിയണമെന്നുണ്ടോ?",
    resetMsg: "ചരിത്രം മായ്‌ച്ചു. ഞാൻ എങ്ങനെ സഹായിക്കണം?",
    processing: "മറുപടി തയ്യാറാകുന്നു...",
    askPlaceholder: "ആരോഗ്യത്തെക്കുറിച്ചോ ഭക്ഷണത്തെക്കുറിച്ചോ ചോദിക്കുക...",
    send: "അയക്കുക",
    suggestedLabel: "നിർദ്ദേശങ്ങൾ:",
    voiceToggle: "ശബ്ദം",
  },
  mr: {
    welcome: "नमस्कार! मी तुमचा HealthAssist AI सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकतो? तुम्ही लक्षणे किंवा आहाराबद्दल विचारू शकता.",
    prompts: [
      "मधुमेहाची सुरुवातीची लक्षणे कोणती आहेत?",
      "रक्तदाब (BP) नैसर्गिकरित्या कसा नियंत्रित करावा?",
      "कोलेस्टेरॉल जास्त असताना काय खाऊ नये?",
      "मला खूप ताण आणि अस्वस्थता जाणवत आहे"
    ],
    diabetesReply: "मधुमेहाच्या लक्षणांमध्ये वारंवार लघवी होणे, जास्त तहान लागणे, थकवा आणि अंधुक दृष्टी यांचा समावेश होतो. रक्तातील साखर तपासून घेणे फायद्याचे ठरेल.",
    bpReply: "रक्तदाब नियंत्रणात ठेवण्यासाठी: मीठाचे प्रमाण कमी करा, दररोज ३० मिनिटे चाला, पुरेशी झोप घ्या आणि तणावमुक्त राहा.",
    chestPainReply: "⚠️ तातडीची सूचना: छातीत तीव्र वेदना किंवा श्वास घेण्यास त्रास होत असल्यास त्वरित १०८ किंवा ११२ वर कॉल करा आणि जवळच्या रुग्णालयात जा.",
    dietReply: "संतुलित आहारात हिरव्या भाज्या, डाळी, धान्ये आणि भरपूर पाणी असावे. तळलेले आणि गोड पदार्थ खाणे टाळा.",
    stressReply: "तणाव कमी करण्यासाठी दीर्घ श्वास घ्या: ४ सेकंद श्वास घ्या, ७ सेकंद रोखा आणि ८ सेकंदात हळूहळू सोडा.",
    generalReply: "तुमच्या प्रश्नासाठी धन्यवाद. योग्य उपचारासाठी डॉक्टरांचा सल्ला घ्या. आणखी काही विचारायचे आहे का?",
    resetMsg: "इतिहास साफ केला आहे. मी कशी मदत करू?",
    processing: "उत्तर तयार होत आहे...",
    askPlaceholder: "आरोग्य किंवा आहाराबद्दल विचारा...",
    send: "पाठवा",
    suggestedLabel: "सूचना:",
    voiceToggle: "आवाज",
  },
  bn: {
    welcome: "নমস্কার! আমি আপনার HealthAssist AI সহায়ক। আমি কীভাবে সাহায্য করতে পারি? আপনি উপসর্গ বা খাদ্যাভ্যাস সম্পর্কে জানতে পারেন।",
    prompts: [
      "ডায়াবেটিসের প্রাথমিক লক্ষণগুলি কী কী?",
      "রক্তচাপ কীভাবে নিয়ন্ত্রণে রাখা যায়?",
      "কোলেস্টেরল বেশি হলে কী খাওয়া উচিত নয়?",
      "আমি বেশ মানসিক চাপে আছি"
    ],
    diabetesReply: "ডায়াবেটিসের লক্ষণ: ঘন ঘন প্রস্রাব, অতিরিক্ত তৃষ্ণা, ক্লান্তি এবং দৃষ্টি ঝাপসা হওয়া। রক্তে শর্করার মাত্রা পরীক্ষা করানো দরকার।",
    bpReply: "রক্তচাপ নিয়ন্ত্রণে রাখতে: নুন কম খান, প্রতিদিন হাঁটাহাঁটি করুন, পর্যাপ্ত ঘুমান এবং মানসিক চাপ কমান।",
    chestPainReply: "⚠️ জরুরি সতর্কতা: বুকে তীব্র ব্যথা বা শ্বাসকষ্ট হলে অবিলম্বে ১০৮ বা ১১২ নম্বরে যোগাযোগ করুন বা হাসপাতালে যান।",
    dietReply: "সুষম খাদ্যে শাকসবজি, ডাল, ফল এবং প্রচুর জল থাকা উচিত। অতিরিক্ত তেল-মশলা ও মিষ্টি এড়িয়ে চলুন।",
    stressReply: "মানসিক চাপ কমাতে গভীর শ্বাস নিন: ৪ সেকেন্ড শ্বাস নিন, ৭ সেকেন্ড ধরে রাখুন ಮತ್ತು ৮ সেকেন্ডে ধীরে ধীরে ছাড়ুন।",
    generalReply: "আপনার প্রশ্নের জন্য ধন্যবাদ। সঠিক চিকিৎসার জন্য চিকিৎসকের পরামর্শ নিন। আর কিছু জানার আছে?",
    resetMsg: "কথোপকথন মুছে ফেলা হয়েছে। আমি কীভাবে সাহায্য করব?",
    processing: "উত্তর তৈরি হচ্ছে...",
    askPlaceholder: "স্বাস্থ্য বা খাদ্য সম্পর্কে জিজ্ঞাসা করুন...",
    send: "পাঠান",
    suggestedLabel: "পরামর্শ:",
    voiceToggle: "কণ্ঠস্বর",
  },
  gu: {
    welcome: "નમસ્તે! હું તમારો HealthAssist AI સહાયક છું. હું તમને કેવી રીતે મદદ કરી શકું? તમે લક્ષણો અથવા આહાર વિશે પૂછી શકો છો.",
    prompts: [
      "ડાયાબિટીસના શરૂઆતના લક્ષણો શું છે?",
      "બ્લડ પ્રેશરને કેવી રીતે નિયંત્રિત કરવું?",
      "કોલેસ્ટ્રોલ વધારે હોય ત્યારે શું ન ખાવું?",
      "મને તાણ અને ચિંતા જેવું લાગે છે"
    ],
    diabetesReply: "ડાયાબિટીસના લક્ષણો: વારંવાર પેશાબ થવો, વધુ તરસ લાગવી, થાક લાગવો અને ઝાંખું દેખાવું. બ્લડ શુગર તપાસ કરાવવી જરૂરી છે.",
    bpReply: "બ્લડ પ્રેશર નિયંત્રણમાં રાખવા: મીઠું ઓછું ખાવ, રોજ ૩૦ મિનિટ ચાલો, પૂરતી ઊંઘ લો અને તણાવ મુક્ત રહો.",
    chestPainReply: "⚠️ ઇમરજન્સી ચેતવણી: છાતીમાં દુખાવો અથવા શ્વાસ લેવામાં તકલીફ હોય તો તરત જ ૧૦૮ અથવા ૧૧૨ પર સંપર્ક કરો.",
    dietReply: "સંતુલિત આહારમાં લીલા શાકભાજી, કઠોળ, ફળો અને પૂરતું પાણી હોવું જોઈએ. તળેલું અને મીઠાઈઓ ઓછી ખાઓ.",
    stressReply: "તણાવ ઘટાડવા માટે ઊંડા શ્વાસ લો: ૪ સેકન્ડ શ્વાસ અંદર લો, ૭ સેકન્ડ રોકો અને ૮ સેકન્ડમાં ધીમેથી બહાર કાઢો.",
    generalReply: "તમારા પ્રશ્ન માટે આભાર. ચોક્કસ સલાહ માટે ડૉક્ટરનો સંપર્ક કરો. બીજું કંઈ જાણવું છે?",
    resetMsg: "વાતચીત ભૂંસી નાખવામાં આવી છે. હું શું મદદ કરું?",
    processing: "જવાબ તૈયાર થઈ રહ્યો છે...",
    askPlaceholder: "આરોગ્ય અથવા ખોરાક વિશે પૂછો...",
    send: "મોકલો",
    suggestedLabel: "સૂચનો:",
    voiceToggle: "અવાજ",
  },
  pa: {
    welcome: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ HealthAssist AI ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਤੁਸੀਂ ਲੱਛਣਾਂ ਜਾਂ ਖੁਰਾਕ ਬਾਰੇ ਪੁੱਛ ਸਕਦੇ ਹੋ।",
    prompts: [
      "ਸ਼ੂਗਰ (ਡਾਇਬਟੀਜ਼) ਦੇ ਸ਼ੁਰੂਆਤੀ ਲੱਛਣ ਕੀ ਹਨ?",
      "ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਨੂੰ ਕਿਵੇਂ ਕੰਟਰੋਲ ਕੀਤਾ ਜਾਵੇ?",
      "ਕੋਲੇਸਟ੍ਰੋਲ ਵੱਧ ਹੋਣ ’ਤੇ ਕੀ ਨਹੀਂ ਖਾਣਾ ਚਾਹੀਦਾ?",
      "ਮੈਨੂੰ ਅੱਜਕੱਲ੍ਹ ਤਣਾਅ ਮਹਿਸੂਸ ਹੋ ਰਿਹਾ ਹੈ"
    ],
    diabetesReply: "ਸ਼ੂਗਰ ਦੇ ਲੱਛਣ: ਵਾਰ-ਵਾਰ ਪੇਸ਼ਾਬ ਆਉਣਾ, ਬਹੁਤ ਪਿਆਸ ਲੱਗਣਾ, ਥਕਾਵਟ ਅਤੇ ਧੁੰਦਲਾ ਦਿਸਣਾ। ਬਲੱਡ ਸ਼ੂਗਰ ਟੈਸਟ ਕਰਵਾਉਣਾ ਜ਼ਰੂਰੀ ਹੈ।",
    bpReply: "ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ ਕੰਟਰੋਲ ਰੱਖਣ ਲਈ: ਲੂਣ ਘੱਟ ਖਾਓ, ਰੋਜ਼ਾਨਾ 30 ਮਿੰਟ ਸੈਰ ਕਰੋ ਅਤੇ ਪੂਰੀ ਨੀਂਦ ਲਓ।",
    chestPainReply: "⚠️ ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ: ਛਾਤੀ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ ਜਾਂ ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼ ਹੋਵੇ ਤਾਂ ਤੁਰੰਤ 108 ਜਾਂ 112 ’ਤੇ ਕਾਲ ਕਰੋ।",
    dietReply: "ਸੰਤੁਲਿਤ ਖੁਰਾਕ ਵਿੱਚ ਹਰੀਆਂ ਸਬਜ਼ੀਆਂ, ਦਾਲਾਂ, ਫਲ ਅਤੇ ਕਾਫ਼ੀ ਪਾਣੀ ਸ਼ਾਮਲ ਕਰੋ। ਤਲੀਆਂ ਚੀਜ਼ਾਂ ਤੋਂ ਪਰਹੇਜ਼ ਕਰੋ।",
    stressReply: "ਤਣਾਅ ਘਟਾਉਣ ਲਈ ਡੂੰਘੇ ਸਾਹ ਲਓ: 4 ਸਕਿੰਟ ਸਾਹ ਅੰਦਰ ਲਵੋ, 7 ਸਕਿੰਟ ਰੋਕੋ ਅਤੇ 8 ਸਕਿੰਟਾਂ ਵਿੱਚ ਹੌਲੀ-ਹੌਲੀ ਛੱਡੋ।",
    generalReply: "ਧੰਨਵਾਦ। ਸਹੀ ਇਲਾਜ ਲਈ ਡਾਕਟਰ ਦੀ ਸਲਾਹ ਜ਼ਰੂਰ ਲਵੋ। ਕੀ ਤੁਸੀਂ ਕੁਝ ਹੋਰ ਪੁੱਛਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
    resetMsg: "ਗੱਲਬਾਤ ਸਾਫ਼ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ। ਮੈਂ ਕੀ ਮਦਦ ਕਰਾਂ?",
    processing: "ਜਵਾਬ ਤਿਆਰ ਹੋ ਰਿਹਾ ਹੈ...",
    askPlaceholder: "ਸਿਹਤ ਜਾਂ ਖੁਰਾਕ ਬਾਰੇ ਪੁੱਛੋ...",
    send: "ਭੇਜੋ",
    suggestedLabel: "ਸੁਝਾਅ:",
    voiceToggle: "ਆਵਾਜ਼",
  },
  or: {
    welcome: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର HealthAssist AI ସହାୟକ। ଆପଣ ଲକ୍ଷଣ ବା ଖାଦ୍ୟ ବିଷୟରେ ପଚାରିପାରିବେ।",
    prompts: [
      "ମଧୁମେହର ପ୍ରାଥମିକ ଲକ୍ଷଣ କ’ଣ?",
      "ରକ୍ତଚାପ କିପରି ନିୟନ୍ତ୍ରଣ କରିବେ?",
      "କୋଲେଷ୍ଟ୍ରଲ୍ ଅଧିକ ଥିଲେ କ’ଣ ଖାଇବା ଅନୁଚିତ?",
      "ମୋତେ ମାନସିକ ଚାପ ଲାଗୁଛି"
    ],
    diabetesReply: "ମଧୁମେହ ଲକ୍ଷଣ: ବାରମ୍ବାର ପରିସ୍ରା ଲାଗିବା, ଅଧିକ ଶୋଷ ହେବା, କ୍ଳାନ୍ତି ଲାଗିବା। ରକ୍ତ ପରୀକ୍ଷା କରାଇବା ଉଚିତ।",
    bpReply: "ରକ୍ତଚାପ ନିୟନ୍ତ୍ରଣ ପାଇଁ: ଲୁଣ କମ୍ ଖାଆନ୍ତୁ, ପ୍ରତିଦିନ ବ୍ୟାୟାମ କରନ୍ତୁ ଏବଂ ପର୍ଯ୍ୟାପ୍ତ ଶୁଅନ୍ତୁ।",
    chestPainReply: "⚠️ ଜରୁରୀକାଳୀନ ସୂଚନା: ଛାତିରେ ଯନ୍ତ୍ରଣା ବା ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ହେଲେ ତୁରନ୍ତ ୧୦୮ କିମ୍ବା ୧୧୨ ରେ ଯୋଗାଯୋଗ କରନ୍ତୁ।",
    dietReply: "ସନ୍ତୁଳିତ ଖାଦ୍ୟରେ ପନିପରିବା, ଡାଲି ଏବଂ ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ। ତେଲ ଓ ମିଠା କମ୍ କରନ୍ତୁ।",
    stressReply: "ଚାପ କମାଇବା ପାଇଁ ଗଭୀର ନିଶ୍ୱାସ ନିଅନ୍ତୁ: ୪ ସେକେଣ୍ଡ ନିଶ୍ୱାସ ନିଅନ୍ତୁ, ୭ ସେକେଣ୍ଡ ରଖନ୍ତୁ ଏବଂ ୮ ସେକେଣ୍ଡରେ ଛାଡନ୍ତୁ।",
    generalReply: "ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପାଇଁ ଧନ୍ୟବାଦ। ଉପଯୁକ୍ତ ଚିକିତ୍ସା ପାଇଁ ଡାକ୍ତରଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ। ଆଉ କିଛି ଜାଣିବାକୁ ଚାହାଁନ୍ତି କି?",
    resetMsg: "ପୂର୍ବ କଥାବାର୍ତ୍ତା ସଫା କରାଗଲା। କିପରି ସାହାଯ୍ୟ କରିବି?",
    processing: "ଉତ୍ତର ପ୍ରସ୍ତୁତ ହେଉଛି...",
    askPlaceholder: "ସ୍ୱାସ୍ଥ୍ୟ ବା ଖାଦ୍ୟ ବିଷୟରେ ପଚାରନ୍ତୁ...",
    send: "ପଠାନ୍ତୁ",
    suggestedLabel: "ପରାମର୍ଶ:",
    voiceToggle: "ଭଏସ୍",
  },
  as: {
    welcome: "নমস্কাৰ! মই আপোনাৰ HealthAssist AI সহায়ক। আপুনি স্বাস্থ্য বা খাদ্য সম্পৰ্কে সুধিব পাৰে।",
    prompts: [
      "মধুমেহৰ প্ৰাথমিক লক্ষণসমূহ কি কি?",
      "ৰক্তচাপ কেনেকৈ নিয়ন্ত্ৰণ কৰিব?",
      "কলেষ্টেৰল বেছি থাকিলে কি নাখাব?",
      "মোৰ মানসিক চাপ অনুভৱ হৈছে"
    ],
    diabetesReply: "মধুমেহৰ লক্ষণ: সঘনাই প্ৰস্ৰাৱ লগা, বেছিকৈ পিয়াহ লগা, দুৰ্বলতা অনুভৱ কৰা। তেজ পৰীক্ষা কৰোৱা উচিত।",
    bpReply: "ৰক্তচাপ নিয়ন্ত্ৰণৰ বাবে: নিমখ কমকৈ খাওক, দৈনিক খোজ কাঢ়ক আৰু ভালদৰে টোপনি যাওক।",
    chestPainReply: "⚠️ জৰুৰীকালীন সতৰ্কবাণী: বুকুত বিষ বা উশাহ লোৱাত কষ্ট হ’লে তৎক্ষণাত ১০৮ বা ১১২ নম্বৰত যোগাযোগ কৰক।",
    dietReply: "স্বাস্থ্যকৰ খাদ্যত সেউজীয়া শাক-পাচলি, দাইল আৰু প্ৰচুৰ পানী খাব। মিঠা আৰু তেলীয়া খাদ্য কম কৰক।",
    stressReply: "চাপ কমাবলৈ দীঘলকৈ উশাহ লওক: ৪ ছেকেণ্ড উশাহ লওক, ৭ ছেকেণ্ড ধৰি ৰাখক আৰু ৮ ছেকেণ্ডত এৰি দিয়ক।",
    generalReply: "ধন্যবাদ। সঠিক চিকিৎসাৰ বাবে চিকিৎসকৰ পৰামৰ্শ লওক। আৰু কিবা জানিব বিচাৰে নেকি?",
    resetMsg: "বাৰ্তালাপ মচি দিয়া হ’ল। কেনেকৈ সহায় কৰিব পাৰো?",
    processing: "উত্তৰ প্ৰস্তুত হৈ আছে...",
    askPlaceholder: "স্বাস্থ্য বা খাদ্য সম্পৰ্কে সোধক...",
    send: "পঠিয়াওক",
    suggestedLabel: "পৰামৰ্শ:",
    voiceToggle: "কণ্ঠ",
  },
};

export const HealthChatbot: React.FC<HealthChatbotProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const botLocale = BOT_LOCALES[language] || BOT_LOCALES.en;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const history = getChatHistory(currentUser.id, currentUser.name);
    // If only default English welcome, replace with current language welcome!
    if (history.length === 1 && history[0].id === 'welcome-msg') {
      return [{
        id: 'welcome-msg',
        sender: 'bot',
        text: botLocale.welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }];
    }
    return history;
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    saveChatHistory(currentUser.id, messages);
  }, [messages, currentUser.id]);

  // When language changes, if chat is fresh, update welcome message to the selected language!
  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === 'bot') {
      setMessages([{
        id: 'welcome-msg',
        sender: 'bot',
        text: botLocale.welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [language]);

  // Analyze simple sentiment
  const analyzeSentiment = (text: string): { emotion: string; sentiment: 'Positive' | 'Neutral' | 'Anxious' | 'Distressed'; intensity: number } => {
    const lower = text.toLowerCase();
    if (lower.includes('pain') || lower.includes('chest') || lower.includes('दर्द') || lower.includes('నొప్పి') || lower.includes('வலி')) {
      return { emotion: 'Distress', sentiment: 'Distressed', intensity: 88 };
    }
    if (lower.includes('stress') || lower.includes('anxious') || lower.includes('तनाव') || lower.includes('ఒత్తిడి') || lower.includes('பயம்')) {
      return { emotion: 'Anxiety', sentiment: 'Anxious', intensity: 75 };
    }
    return { emotion: 'General', sentiment: 'Neutral', intensity: 50 };
  };

  // Generate intelligent clinical reply for any health or application question
  const generateLocalizedReply = (userInput: string): string => {
    return generateComprehensiveHealthReply(userInput, language, currentUser);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Set appropriate BCP-47 language tag
    const langTags: Record<SupportedLanguage, string> = {
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
    utterance.lang = langTags[language] || 'en-IN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;

    const detectedEmotion = analyzeSentiment(trimmed);

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detectedEmotion
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsTyping(true);

    const sendChatQuery = async () => {
      let replyText = '';

      // Query server-side Gemini endpoint with 15s timeout
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
              bloodGroup: currentUser.bloodGroup
            }
          }),
          signal: AbortSignal.timeout(15000)
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.reply) {
            replyText = json.reply;
          }
        }
      } catch (err) {
        console.log('Using localized offline health engine fallback:', err);
      }

      if (!replyText) {
        replyText = generateLocalizedReply(trimmed);
      }

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages([...newHistory, botMessage]);
      setIsTyping(false);

      if (ttsEnabled) {
        speakText(replyText);
      }
    };

    sendChatQuery();
  };

  const handleClearHistory = () => {
    const freshWelcome: ChatMessage = {
      id: `fresh_${Date.now()}`,
      sender: 'bot',
      text: botLocale.resetMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([freshWelcome]);
    saveChatHistory(currentUser.id, [freshWelcome]);
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      
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
                {t.healthChatbot}
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1 shadow-xs">
                <MessageSquareHeart className="w-3 h-3 text-teal-600" />
                24/7 Health Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ask any question about symptoms, health conditions, nutrition, or HealthAssist features.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              ttsEnabled ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'
            }`}
            title="Read responses aloud"
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{botLocale.voiceToggle} {ttsEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={handleClearHistory}
            className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-xs ${
                  isUser ? 'bg-teal-600' : 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1 max-w-[85%] sm:max-w-[78%]">
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-teal-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-xs'
                  }`}>
                    <FormattedChatMessage content={msg.text} isUser={isUser} />
                  </div>

                  <div className={`text-[10px] text-slate-400 ${isUser ? 'text-right' : 'text-left pl-1'}`}>
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
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-slate-600">{botLocale.processing}</span>
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
              onClick={() => {
                setInputText(prompt);
              }}
              className="px-3 py-1 rounded-xl bg-white border border-slate-200 hover:border-teal-400 text-slate-700 text-xs whitespace-nowrap hover:bg-teal-50 transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200/80 flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={botLocale.askPlaceholder}
            className="flex-1 px-4 py-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all placeholder:text-slate-300 focus:placeholder-transparent"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">{botLocale.send}</span>
          </button>
        </form>

      </div>

    </div>
  );
};
