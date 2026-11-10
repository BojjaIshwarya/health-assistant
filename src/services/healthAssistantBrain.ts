import { SupportedLanguage, UserProfile } from '../types';

interface HealthTopicResponse {
  keywords: string[];
  en: string;
  hi?: string;
  te?: string;
  ta?: string;
  kn?: string;
  ml?: string;
  mr?: string;
  bn?: string;
  gu?: string;
  pa?: string;
  or?: string;
  as?: string;
}

// Comprehensive clinical and application knowledge base
const TOPIC_RESPONSES: HealthTopicResponse[] = [
  // --- APP-SPECIFIC QUESTIONS ---
  {
    keywords: ['what is healthassist', 'about healthassist', 'what can you do', 'features', 'help me with', 'how does this app work', 'health assistant', 'हेल्थअसिस्ट क्या है', 'యాప్ గురించి', 'பயன்கள்'],
    en: "HealthAssist AI is your personal healthcare and wellness assistant. Key features include:\n• 🩺 **Symptom Checker**: Instant multi-condition clinical assessment.\n• 🏥 **Hospital Finder**: Locate nearby emergency centers and clinics.\n• 🥗 **Diet Planner**: Custom nutritional plans tailored to your BMI.\n• 📁 **Health Records**: Securely track diagnoses, medications, and labs.\n• ⌚ **Wearables & IoT**: Monitor vitals, heart rate, and daily activity.\n• 🧠 **Emotion Center**: Check mood markers and stress levels.\n• 🤖 **24/7 Health Chatbot**: Ask any health or medical question anytime!",
    hi: "हेल्थअसिस्ट एआई आपका व्यक्तिगत स्वास्थ्य और जीवनशैली सहायक है। मुख्य सुविधाएं:\n• 🩺 **लक्षण जांच**: बीमारी और स्वास्थ्य जोखिम का त्वरित मूल्यांकन।\n• 🏥 **अस्पताल खोजक**: नजदीकी क्लीनिक और आपातकालीन केंद्र खोजें।\n• 🥗 **आहार योजना**: आपके बीएमआई अनुसार संतुलित पोषण योजना।\n• 📁 **स्वास्थ्य रिकॉर्ड**: अपनी रिपोर्ट और दवाएं सुरक्षित रखें।\n• ⌚ **स्मार्टवॉच / आईओटी**: हृदय गति और दैनिक कदम ट्रैक करें।\n• 🤖 **24/7 चैटबॉट**: किसी भी स्वास्थ्य विषय पर कभी भी पूछें!",
    te: "హెల్త్ అసిస్ట్ AI మీ వ్యక్తిగత ఆరోగ్య సంరక్షణ సహాయకుడు. ముఖ్యమైన ఫీచర్లు:\n• 🩺 **లక్షణాల తనిఖీ**: ఆరోగ్య సమస్యలను అంచనా వేయడం.\n• 🏥 **ఆసుపత్రి లొకేటర్**: సమీప ఆసుపత్రులు మరియు క్లినిక్‌లను కనుగొనడం.\n• 🥗 **డైట్ ప్లానర్**: మీ ఆరోగ్యానికి తగిన ఆహార ప్రణాళిక.\n• 📁 **హెల్త్ రికార్డులు**: మీ వైద్య నివేదికలను భద్రపరచడం.\n• ⌚ **స్మార్ట్ వాచ్ ట్రాకింగ్**: గుండె స్పందన మరియు నడకను పర్యవేక్షించడం.\n• 🤖 **24/7 చాట్‌బాట్**: ఏ ఆరోగ్య ప్రశ్ననైనా అడగవచ్చు!"
  },
  {
    keywords: ['symptom checker', 'check symptoms', 'diagnose', 'predict disease', 'test condition', 'लक्षण जांच', 'లక్షణాల తనిఖీ'],
    en: "To use the **Symptom Checker**:\n1. Click on **Symptom Checker** in the navigation or dashboard.\n2. Select your observed symptoms (e.g., sore throat, headache, fever).\n3. Click **Analyze Health Conditions** for an instant clinical evaluation, recommended precautions, and specialist referrals.\n4. You can also explore specialized models for Diabetes, Cardiovascular, Parkinson's, Kidney, Stroke, Liver, and COPD screening!",
    hi: "**लक्षण जांच (Symptom Checker)** का उपयोग करने के लिए:\n1. डैशबोर्ड या मेनू में 'Symptom Checker' पर क्लिक करें।\n2. अपने लक्षणों का चयन करें (जैसे सिरदर्द, बुखार, खांसी)।\n3. 'Analyze Health Conditions' पर क्लिक करें ताकि त्वरित मूल्यांकन और सावधानियां मिल सकें।\n4. आप डायबिटीज, हृदय, किडनी और स्ट्रोक के विशेष मॉडल भी जांच सकते हैं!",
    te: "**సింప్టమ్ చెకర్** ఉపయోగించడానికి:\n1. మెనూ లేదా డాష్‌బోర్డ్‌లో 'Symptom Checker' ఎంచుకోండి.\n2. మీకున్న లక్షణాలను ఎంచుకోండి (ఉదా. జ్వరం, తలనొప్పి, దగ్గు).\n3. 'Analyze Health Conditions' క్లిక్ చేసి నివారణలు మరియు తగిన వైద్యుడి సలహాను పొందండి!"
  },
  {
    keywords: ['hospital', 'clinic', 'doctor near me', 'emergency care', 'find hospital', 'अस्पताल', 'ఆసుపత్రి', 'மருத்துவமனை'],
    en: "To find nearby medical facilities, open the **Hospital Finder** tab from the menu or dashboard. It uses real-time location to display:\n• 🏥 Verified multi-specialty hospitals and clinics.\n• 📍 Distance, address, emergency contact numbers.\n• 🚨 Quick 1-tap call to emergency ambulance services (108 / 112).\n• Direct route navigation via maps.",
    hi: "नजदीकी अस्पताल खोजने के लिए मेनू से **Hospital Finder** खोलें। यह आपकी लोकेशन से नजदीकी क्लीनिक, इमरजेंसी नंबर और नक्शा दिखाता है। आपातकाल में सीधे 108 या 112 पर कॉल करें।",
    te: "సమీప ఆసుపత్రులను కనుగొనడానికి **Hospital Finder** ని ఉపయోగించండి. ఇది సమీపంలోని మల్టీ-స్పెషాలిటీ ఆసుపత్రులు, అత్యవసర ఫోన్ నంబర్లు (108/112) మరియు మ్యాప్ దిశలను చూపుతుంది."
  },
  {
    keywords: ['diet', 'nutrition', 'weight loss', 'calorie', 'meal plan', 'food', 'आहार', 'ఆహారం', 'உணவு'],
    en: "For personalized nutrition, visit the **Diet Planner** section:\n• Tailored meal recommendations based on your BMI, age, and activity level.\n• Balanced macronutrient breakdowns (carbs, proteins, healthy fats).\n• Diabetic-friendly, heart-healthy (low sodium), and weight management options.\n• General tip: Drink 2.5–3 liters of water daily and include leafy greens, lean protein, and fiber-rich grains in every meal.",
    hi: "व्यक्तिगत पोषण योजना के लिए **Diet Planner** देखें। यह आपके बीएमआई अनुसार संतुलित भोजन, प्रोटीन और कैलोरी की जानकारी देता है। रोजाना 2.5-3 लीटर पानी पिएं और हरी सब्जियां व साबुत अनाज शामिल करें।",
    te: "మీ ఆరోగ్యానికి తగిన ఆహార వివరాల కోసం **Diet Planner** చూడండి. ఇది మీ BMI ప్రకారం ప్రొటీన్లు, విటమిన్లు మరియు కేలరీల ప్రణాళికను అందిస్తుంది. రోజూ 3 లీటర్ల నీరు త్రాగడం మంచిది."
  },
  {
    keywords: ['records', 'history', 'save report', 'medical record', 'lab results', 'रिकॉर्ड', 'రికార్డులు'],
    en: "You can manage your personal health history under **Health Records**:\n• Log symptom check assessments, doctor consultations, and diagnostic tests.\n• Track vital trends over time.\n• Easily review or export your medical timeline during doctor visits.",
    hi: "अपनी मेडिकल हिस्ट्री देखने के लिए **Health Records** पर जाएं। यहां आप अपने पिछले लक्षण परीक्षण, डॉक्टर की पर्ची और लैब टेस्ट सुरक्षित रख सकते हैं।",
    te: "మీ వైద్య వివరాలను భద్రపరచడానికి **Health Records** విభాగాన్ని చూడండి. ఇక్కడ మీరు మీ పాత పరీక్ష ఫలితాలు మరియు మందుల వివరాలను భద్రపరుచుకోవచ్చు."
  },
  {
    keywords: ['wearable', 'smartwatch', 'iot', 'heart rate', 'steps', 'pulse', 'स्मार्टवॉच', 'స్టెప్స్', 'హార్ట్ రేట్'],
    en: "The **Wearables & IoT Hub** allows real-time health monitoring:\n• Track resting heart rate (normal: 60–100 bpm), daily step count (aim for 8,000–10,000 steps), and sleep stages.\n• Monitor blood oxygen saturation (SpO2 > 95% is optimal).\n• Get proactive alerts if vital anomalies or elevated stress levels are detected.",
    hi: "**Wearables & IoT Hub** से आप हृदय गति (सामान्य: 60-100 bpm), दैनिक कदम (8,000-10,000) और नींद को ट्रैक कर सकते हैं। SpO2 95% से अधिक रहना स्वास्थ्य के लिए आवश्यक है।",
    te: "**Wearables & IoT** ద్వారా మీ గుండె వేగం (60-100 bpm), రోజువారీ నడక మరియు రక్తంలో ఆక్సిజన్ స్థాయిలను (SpO2 > 95%) ట్రాక్ చేయవచ్చు."
  },

  // --- COMMON SYMPTOMS & CLINICAL QUESTIONS ---
  {
    keywords: ['headache', 'head pain', 'migraine', 'throbbing', 'forehead pain', 'सिरदर्द', 'తలనొప్పి', 'தலைவலி'],
    en: "For headaches:\n• **Common Causes**: Tension, eye strain, dehydration, stress, lack of sleep, or migraine.\n• **Immediate Relief**: Drink 1–2 glasses of water, rest in a quiet dark room, and apply a cool or warm compress to your forehead or neck.\n• **When to Seek Urgent Care**: Sudden 'thunderclap' headache, fever with stiff neck, confusion, weakness on one side, or headache following a head injury.",
    hi: "सिरदर्द के लिए सुझाव:\n• **कारण**: तनाव, आंखों पर जोर, पानी की कमी या नींद की कमी।\n• **उपाय**: 1-2 गिलास पानी पिएं, शांत अंधेरे कमरे में आराम करें, और माथे पर ठंडी पट्टी रखें।\n• **डॉक्टर से कब मिलें**: अचानक बहुत तेज असहनीय सिरदर्द, गर्दन में अकड़न के साथ बुखार, या चक्कर आने पर तुरंत डॉक्टर को दिखाएं।",
    te: "తలనొప్పికి సూచనలు:\n• **కారణాలు**: ఒత్తిడి, సరిపడా నిద్ర లేకపోవడం, నీరు తక్కువగా త్రాగడం లేదా కంటి అలసట.\n• **ఉపశమనం**: పుష్కలంగా నీరు త్రాగండి, ప్రశాంతమైన గదిలో విశ్రాంతి తీసుకోండి, నుదిటిపై చల్లని గుడ్డతో కాపడం పెట్టండి.\n• **వైద్యుడిని ఎప్పుడు సంప్రదించాలి**: అకస్మాత్తుగా భరించలేని నొప్పి రావడం లేదా మెడ బిగుతుతో కూడిన జ్వరం ఉంటే వెంటనే వైద్యుడిని సంప్రదించండి."
  },
  {
    keywords: ['fever', 'temperature', 'chills', 'body ache', 'shivering', 'बुखार', 'జ్వరం', 'காய்ச்சல்'],
    en: "For managing fever:\n• **Temperature check**: Normal body temperature is ~98.6°F (37°C). Low-grade fever is 99.5°F–101°F.\n• **Home Care**: Rest adequately, stay well hydrated (lukewarm water, clear broths, coconut water), and wear lightweight cotton clothing.\n• **Cool Compresses**: Use a lukewarm sponge bath on forehead and arms if uncomfortable.\n• **Alert Signs**: Fever exceeding 102°F (38.9°C), lasting over 3 days, accompanied by severe headache, rash, stiff neck, or difficulty breathing requires prompt medical evaluation.",
    hi: "बुखार के लिए सुझाव:\n• **देखभाल**: भरपूर आराम करें, पर्याप्त पानी, नारियल पानी या सूप पिएं।\n• **उपाय**: माथे पर ताजे पानी की पट्टी रखें। हल्के सूती कपड़े पहनें।\n• **सावधानी**: यदि बुखार 102°F से अधिक हो, 3 दिनों से ज्यादा रहे, या सांस लेने में परेशानी हो तो तुरंत डॉक्टर से परामर्श लें।",
    te: "జ్వరం నియంత్రణకు:\n• **సంరక్షణ**: మంచి విశ్రాంతి తీసుకోండి, పుష్కలంగా గోరువెచ్చని నీరు, కొబ్బరి నీళ్ళు లేదా సూప్ త్రాగండి.\n• **ఉపశమనం**: నుదిటిపై తడి గుడ్డతో కాపడం పెట్టండి.\n• **హెచ్చరిక**: జ్వరం 102°F కంటే ఎక్కువ ఉన్నా, 3 రోజుల కంటే ఎక్కువ కొనసాగినా వెంటనే వైద్యుడిని సంప్రదించండి."
  },
  {
    keywords: ['cough', 'cold', 'sore throat', 'runny nose', 'sneezing', 'congestion', 'खांसी', 'जुकाम', 'దగ్గు', 'జలుబు', 'இருமல்'],
    en: "For cold, cough, and throat irritation:\n• **Sore Throat Relief**: Warm saline water gargles (1/2 tsp salt in warm water) 3–4 times daily.\n• **Congestion Relief**: Steam inhalation with a drop of eucalyptus oil or plain water to clear nasal passages.\n• **Soothing Fluids**: Warm ginger-tulsi tea, honey with warm water, or turmeric milk.\n• **Rest**: Sleep with head slightly elevated to ease nighttime coughing.\n• **Consult a Doctor** if you have wheezing, persistent high fever, or cough lasting >2 weeks.",
    hi: "खांसी और जुकाम के लिए सुझाव:\n• **गले की खराश**: दिन में 2-3 बार गुनगुने नमक के पानी से गरारे करें।\n• **भाप लें**: गर्म पानी की भाप लेने से बंद नाक और छाती की जकड़न में आराम मिलता है।\n• **घरेलू उपाय**: अदरक-शहद का रस या हल्दी वाला दूध लें।\n• यदि खांसी 2 सप्ताह से अधिक रहे या सांस फूलने लगे तो डॉक्टर को दिखाएं।",
    te: "దగ్గు మరియు జలుబుకు:\n• **గొంతు నొప్పికి**: గోరువెచ్చని ఉప్పు నీటితో రోజుకు 3 సార్లు పుక్కిలించండి.\n• **ఆవిరి పట్టడం**: వేడి నీటి ఆవిరి పట్టడం ద్వారా ముక్కు దిబ్బడ మరియు ఛాతీ బిగుతు తగ్గుతుంది.\n• **చిట్కాలు**: అల్లం-తేనె లేదా పసుపు పాలు త్రాగడం మంచిది. దగ్గు 2 వారాల కంటే ఎక్కువ ఉంటే వైద్యుడిని సంప్రదించండి."
  },
  {
    keywords: ['stomach', 'acidity', 'gas', 'acid reflux', 'gerd', 'indigestion', 'heartburn', 'पेट दर्द', 'गैस', 'కడుపు నొప్పి', 'ఎసిడిటీ'],
    en: "For stomach discomfort, gas, and acidity:\n• **Acidity & Heartburn**: Avoid spicy, oily, and highly acidic foods. Drink cold milk or chamomile tea. Do not lie down immediately after meals; stay upright for at least 2 hours.\n• **Indigestion Relief**: Sip warm water or chew a pinch of fennel seeds (saunf) after eating. Eat smaller, frequent meals.\n• **Gas & Bloating**: Gentle walking for 10–15 minutes aids gut motility.\n• **Seek Medical Attention** if pain is severe, accompanied by vomiting blood, dark black stools, or persistent diarrhea.",
    hi: "पेट दर्द, गैस और एसिडिटी के लिए:\n• **एसिडिटी**: मसालेदार और तला हुआ भोजन न करें। खाने के तुरंत बाद न लेटें। सौंफ या गुनगुना पानी लें।\n• **पाचन**: भोजन धीरे-धीरे चबाकर खाएं और दिन में 15 मिनट टहलें।\n• तेज असहनीय दर्द या उल्टी होने पर तुरंत डॉक्टर को दिखाएं।",
    te: "కడుపు నొప్పి, గ్యాస్ మరియు ఎసిడిటీకి:\n• **ఎసిడిటీకి**: కారంగా, నూనెతో కూడిన ఆహారాన్ని నివారించండి. తిన్న వెంటనే పడుకోవద్దు. సోంపు లేదా గోరువెచ్చని నీరు త్రాగండి.\n• **జీర్ణక్రియ**: రోజూ భోజనం తర్వాత కాసేపు నడవడం మంచిది. తీవ్రమైన నొప్పి ఉంటే వెంటనే వైద్యుడిని సంప్రదించండి."
  },
  {
    keywords: ['nausea', 'vomiting', 'diarrhea', 'loose motion', 'food poisoning', 'उल्टी', 'दस्त', 'విరేచనాలు', 'వాంతులు'],
    en: "For nausea, vomiting, or diarrhea:\n• **Hydration is Critical**: Sip Oral Rehydration Solution (ORS), coconut water, or diluted clear soups slowly to prevent dehydration.\n• **BRAT Diet**: When able to eat, stick to gentle foods: Bananas, Rice, Applesauce, and plain Toast.\n• **Avoid**: Dairy, caffeine, alcohol, greasy foods, and artificial sweeteners.\n• **Red Flags**: Inability to keep fluids down for 12+ hours, signs of dehydration (extreme thirst, dry mouth, little/no urination, dizziness), or high fever.",
    hi: "उल्टी या दस्त के लिए:\n• **ओआरएस (ORS) या नारियल पानी**: शरीर में पानी और इलेक्ट्रोलाइट्स की कमी न होने दें। घूंट-घूंट करके पिएं।\n• **हल्का भोजन**: केला, चावल का पानी, मूंग दाल की खिचड़ी खाएं।\n• यदि पेशाब कम हो रहा हो या अत्यधिक कमजोरी लगे तो तुरंत अस्पताल जाएं।",
    te: "వాంతులు లేదా విరేచనాల నియంత్రణకు:\n• **డీహైడ్రేషన్ నివారించండి**: ORS ద్రావణం లేదా కొబ్బరి నీళ్ళను కొద్దికొద్దిగా త్రాగండి.\n• **తేలికపాటి ఆహారం**: అరటిపండు, మజ్జిగ, అన్నం లేదా కిచిడీ తీసుకోండి. తీవ్రమైన బలహీనత ఉంటే వెంటనే వైద్యుడిని సంప్రదించండి."
  },
  {
    keywords: ['sleep', 'insomnia', 'cant sleep', 'tired', 'fatigue', 'exhausted', 'नींद', 'నిద్ర', 'தூக்கம்'],
    en: "For better sleep and fighting fatigue:\n• **Sleep Hygiene**: Keep a consistent sleep schedule (aim for 7–8 hours). Go to bed and wake up at the same time daily.\n• **Screen Curfew**: Avoid smartphones, laptops, and TV screens at least 45 minutes before bedtime (blue light suppresses melatonin).\n• **Evening Routine**: Keep the bedroom cool and dark. Avoid heavy meals or caffeine after 5 PM.\n• **Daytime Energy**: Ensure 20 minutes of morning sunlight exposure to set your circadian rhythm, and stay hydrated.",
    hi: "अच्छी नींद और थकान दूर करने के उपाय:\n• रोजाना एक ही समय पर 7-8 घंटे सोएं।\n• सोने से 45 मिनट पहले मोबाइल और टीवी स्क्रीन बंद कर दें।\n• शाम के समय चाय या कॉफी न पिएं। सुबह धूप में 15 मिनट टहलें।",
    te: "మంచి నిద్ర మరియు అలసట తగ్గడానికి:\n• ప్రతిరోజూ నిర్ణీత సమయానికి 7-8 గంటలు నిద్రపోండి.\n• పడుకోవడానికి 45 నిమిషాల ముందు మొబైల్ వాడటం ఆపండి.\n• సాయంత్రం వేళల్లో టీ, కాఫీలు త్రాగకండి. ఉదయం కాసేపు ఎండలో నడవండి."
  },
  {
    keywords: ['back pain', 'neck pain', 'joint pain', 'knee pain', 'arthritis', 'कमर दर्द', 'నడుము నొప్పి', 'కీళ్ల నొప్పులు'],
    en: "For back, neck, and joint pain:\n• **Posture & Ergonomics**: Ensure your computer screen is at eye level and your lower back is supported. Take a 2-minute standing break every 45 minutes.\n• **Acute Strain**: Apply an ice pack for 15 minutes during the first 48 hours, followed by warm compresses to relax muscles.\n• **Gentle Movement**: Walking and gentle hamstring/cat-cow stretches reduce spinal stiffness. Avoid prolonged bed rest.\n• **Consult a Specialist** if pain shoots down the leg, causes numbness or tingling, or follows a fall.",
    hi: "पीठ, गर्दन और जोड़ों के दर्द के लिए:\n• **सही मुद्रा**: झुककर काम न करें। हर 45 मिनट में उठकर 2 मिनट चलें।\n• **सिकाई**: मांसपेशियों के खिंचाव में गर्म सिकाई करें। हल्के खिंचाव वाले योग और टहलना फायदेमंद है।\n• यदि दर्द पैर की ओर फैले या सुन्नपन आए तो हड्डी रोग विशेषज्ञ (Orthopedic) को दिखाएं।",
    te: "నడుము, మెడ మరియు కీళ్ల నొప్పులకు:\n• పని చేసేటప్పుడు నిటారుగా కూర్చోండి. ప్రతి 45 నిమిషాలకు ఒకసారి లేచి నడవండి.\n• వేడి నీటి కాపడం పెట్టడం మరియు తేలికపాటి వ్యాయామాలు చేయడం వల్ల కండరాల బిగుతు తగ్గుతుంది.\n• నొప్పి కాళ్ళ వరకు పాకితే వెంటనే ఆర్థోపెడిక్ వైద్యుడిని సంప్రదించండి."
  },
  {
    keywords: ['dizzy', 'dizziness', 'lightheaded', 'vertigo', 'spinning', 'चक्कर', 'కళ్ళు తిరగడం'],
    en: "For dizziness and lightheadedness:\n• **Immediate Action**: Sit down or lie down immediately to prevent falling. Elevate your legs slightly.\n• **Hydrate**: Drink a glass of water slowly; mild dehydration is a frequent trigger.\n• **Sudden Standing**: If dizzy when rising, get up slowly from sitting or lying positions.\n• **When to Seek Emergency Care**: Dizziness accompanied by chest pain, speech difficulty, facial drooping, double vision, or loss of consciousness.",
    hi: "चक्कर आने पर क्या करें:\n• तुरंत बैठ जाएं या लेट जाएं ताकि गिरने से बच सकें।\n• एक गिलास पानी पिएं, कई बार पानी की कमी से चक्कर आते हैं। धीरे-धीरे उठें।\n• यदि चक्कर के साथ सीने में दर्द, बोलने में लड़खड़ाहट या हाथ-पैर में कमजोरी हो तो आपातकालीन चिकित्सा लें।",
    te: "కళ్ళు తిరుగుతున్నప్పుడు:\n• పడిపోకుండా ఉండటానికి వెంటనే కూర్చోండి లేదా పడుకోండి.\n• ఒక గ్లాసు నీరు త్రాగండి. అకస్మాత్తుగా లేచి నిలబడవద్దు.\n• కళ్ళు తిరగడంతో పాటు ఛాతీ నొప్పి లేదా మాట తడబడటం ఉంటే వెంటనే అత్యవసర చికిత్స పొందండి."
  },
  {
    keywords: ['skin', 'rash', 'itching', 'allergy', 'hives', 'खुजली', 'దద్దుర్లు', 'తుమ్ములు'],
    en: "For skin rashes and allergies:\n• **Cool Soothing**: Apply a clean, cool damp cloth or calamine lotion to relieve itching.\n• **Gentle Skin Care**: Avoid harsh fragranced soaps, very hot showers, and tight synthetic clothing.\n• **Do Not Scratch**: Scratching breaks the skin barrier and invites secondary bacterial infection.\n• **Warning Signs**: Facial swelling, lip/tongue swelling, or difficulty breathing indicates a severe allergic reaction (anaphylaxis) requiring immediate emergency care.",
    hi: "त्वचा पर खुजली और एलर्जी के लिए:\n• ठंडे पानी की पट्टी या कैलामाइन लोशन लगाएं।\n• बहुत गर्म पानी से न नहाएं और सूती कपड़े पहनें। खुजली करने से बचें।\n• यदि चेहरे या होंठ पर सूजन आए या सांस लेने में तकलीफ हो तो तुरंत अस्पताल जाएं।",
    te: "చర్మంపై దురద మరియు దద్దుర్లకు:\n• చల్లని నీటితో కాపడం లేదా క్యాలమైన్ లోషన్ రాయండి.\n• వేడి నీటి స్నానం మరియు సింథటిక్ దుస్తులను నివారించండి.\n• ముఖం లేదా పెదవులపై వాపు వచ్చి శ్వాస తీసుకోవడం కష్టమైతే వెంటనే అత్యవసర చికిత్స తీసుకోండి."
  },
  {
    keywords: ['water', 'hydration', 'how much water', 'fluid', 'पानी', 'మంచి నీరు'],
    en: "Optimal daily hydration guidelines:\n• **Recommended Intake**: Average adults need approximately 2.5 to 3.5 liters (8–10 glasses) of clean water daily, increasing with hot weather or exercise.\n• **Benefits**: Supports kidney filtration, regulates blood pressure, prevents headaches, and aids digestion.\n• **Hydration Check**: Pale straw-colored urine indicates healthy hydration, while dark yellow suggests you need to drink more.",
    hi: "पानी पीने के दिशा-निर्देश:\n• सामान्य वयस्क को रोजाना लगभग 2.5 से 3.5 लीटर (8-10 गिलास) पानी पीना चाहिए।\n• पर्याप्त पानी पीने से किडनी स्वस्थ रहती है, पाचन सुधरता है और सिरदर्द से बचाव होता है।\n• पेशाब का हल्का पीला रंग पर्याप्त पानी का संकेत है।",
    te: "నీటి వినియోగ సూచనలు:\n• ప్రతిరోజూ 2.5 నుండి 3.5 లీటర్ల (8-10 గ్లాసులు) మంచి నీరు త్రాగాలి.\n• తగినంత నీరు త్రాగడం వల్ల కిడ్నీల ఆరోగ్యం, జీర్ణక్రియ మెరుగుపడుతుంది మరియు అలసట తగ్గుతుంది."
  },
  {
    keywords: ['emergency', 'ambulance', '108', '112', 'heart attack', 'stroke signs', 'आपातकाल', 'ఎమర్జెన్సీ'],
    en: "🚨 **EMERGENCY ASSISTANCE**:\nIf you or someone around you experiences:\n• Severe, crushing chest pain or pressure radiating to arm, neck, or jaw.\n• FAST Stroke signs: **F**acial droop, **A**rm weakness, **S**peech slurring, **T**ime to call emergency.\n• Sudden severe shortness of breath or loss of consciousness.\n👉 **Immediately call 112 (All Emergencies) or 108 (Ambulance Service)** or rush to the nearest emergency room. You can also tap **Hospital Finder** in this app for immediate hospital contacts.",
    hi: "🚨 **आपातकालीन सहायता (Emergency)**:\nयदि सीने में तेज दर्द, सांस लेने में अत्यधिक कठिनाई, बेहोशी या चेहरे/हाथ में अचानक कमजोरी महसूस हो, तो तुरंत **108 (एम्बुलेंस)** या **112** पर कॉल करें या नजदीकी अस्पताल जाएं। ऐप में **Hospital Finder** खोलकर भी तुरंत अस्पताल का पता लगा सकते हैं।",
    te: "🚨 **అత్యవసర సహాయం (Emergency)**:\nఛాతీలో తీవ్రమైన నొప్పి, శ్వాస తీసుకోవడంలో ఇబ్బంది లేదా శరీరంలో ఒకవైపు బలహీనత ఉంటే వెంటనే **108 (అంబులెన్స్)** లేదా **112** కి కాల్ చేయండి లేదా దగ్గరలోని ఆసుపత్రికి వెళ్ళండి."
  },
  // --- EXPANDED COMMON CLINICAL TOPICS ---
  {
    keywords: ['knee', 'stairs', 'knee pain', 'knees', 'walking downstairs', 'patella', 'घुटने का दर्द', 'మోకాలి నొప్పి', 'మూட்டு வலி'],
    en: "### Knee Pain & Joint Strain\nWhen knee pain flares up, particularly while descending stairs, it commonly stems from **Patellofemoral Pain Syndrome (runner's knee)**, patellar tendon irritation, or cartilage strain.\n\n**Immediate Relief & Care (R.I.C.E. Strategy):**\n• **Rest & Protect**: Minimize deep knee bending, repetitive squatting, and take the elevator when possible until pain settles.\n• **Cold Compress**: Apply an ice pack wrapped in a thin towel over the knee for 15 minutes, 2–3 times a day.\n• **Gentle Quadriceps Stretch**: Tight thighs put added pressure on the kneecap. Perform gentle seated leg extensions and hamstring stretches.\n• **Supportive Footwear**: Avoid walking barefoot on hard floors; choose cushioned footwear with good arch support.\n\n⚠️ **When to Consult a Doctor:**\nIf the knee is severely swollen, cannot bear weight, feels unstable or catches/locks, see an orthopedic physician or physical therapist.",
    hi: "### घुटने का दर्द (Knee Pain)\nसीढ़ियां उतरते समय घुटने में दर्द होना अक्सर 'पटेला' (घुटने की कटोरी) के पीछे खिंचाव या कार्टिलेज पर दबाव के कारण होता है।\n\n**राहत के उपाय:**\n• घुटने को बहुत ज्यादा मोड़ने से बचें और कुछ दिन भारी वजन उठाने से परहेज करें।\n• 15 मिनट के लिए बर्फ की सिकाई करें।\n• जांघ की मांसपेशियों (Quadriceps) को हल्के से स्ट्रेच करें।\n• यदि घुटने पर सूजन हो या पैर पर वजन न रखा जाए तो तुरंत हड्डी रोग विशेषज्ञ को दिखाएं।",
    te: "### మోకాలి నొప్పి (Knee Pain)\nమెట్లు దిగేటప్పుడు మోకాలి నొప్పి రావడం సాధారణంగా కండరాల ఒత్తిడి లేదా కీళ్ల అరుగుదల వల్ల వస్తుంది.\n\n**తీసుకోవలసిన జాగ్రత్తలు:**\n• కొన్ని రోజుల పాటు మెట్లు ఎక్కడం, దిగడం మరియు ఎక్కువ బరువులు మోయడం తగ్గించండి.\n• రోజుకు రెండుసార్లు 15 నిమిషాల పాటు ఐస్ ప్యాక్ పెట్టండి.\n• తేలికపాటి స్ట్రెచింగ్ వ్యాయామాలు చేయండి.\n• వాపు ఎక్కువగా ఉంటే వెంటనే ఆర్థోపెడిక్ వైద్యుడిని సంప్రదించండి."
  },
  {
    keywords: ['blood pressure', 'high bp', 'hypertension', 'बीपी', 'రక్తపోటు'],
    en: "### Managing Blood Pressure Naturally\nNormal blood pressure is generally under **120/80 mmHg**.\n\n**Actionable Lifestyle Steps:**\n• **Reduce Sodium**: Limit table salt to less than 1 teaspoon (5 grams) per day. Avoid packaged snacks and pickles.\n• **DASH Nutrition**: Load up on potassium-rich foods (bananas, spinach, coconut water, legumes).\n• **Daily Aerobic Movement**: 30 minutes of brisk walking 5 days a week helps relax blood vessels.\n• **Stress Management**: Practice slow deep diaphragmatic breathing for 5 minutes morning and night.\n\n⚠️ **Warning**: Seek emergency care if systolic BP exceeds 180 mmHg or is accompanied by chest tightness, blurred vision, or shortness of breath.",
    hi: "### ब्लड प्रेशर (BP) नियंत्रण\nसामान्य ब्लड प्रेशर **120/80 mmHg** होता है।\n\n**जरूरी सुझाव:**\n• खाने में नमक कम करें, अचार और पैकेटबंद नमकीन से बचें।\n• रोजाना 30 मिनट तेज गति से टहलें।\n• पोटैशियम युक्त फल जैसे केला और हरी सब्जियां खाएं।\n• पर्याप्त नींद लें और तनाव कम करें।",
    te: "### రక్తపోటు (BP) నియంత్రణ\nసాధారణ రక్తపోటు **120/80 mmHg** గా ఉండాలి.\n\n**ముఖ్యమైన సూచనలు:**\n• ఉప్పు వాడకం తగ్గించండి, పచ్చళ్ళు మరియు నూనె పదార్థాలకు దూరంగా ఉండండి.\n• రోజూ 30 నిమిషాలు నడవండి.\n• అరటిపండ్లు, ఆకుకూరలు వంటి పొటాషియం అధికంగా ఉండే ఆహారాలు తీసుకోండి.\n• తగినంత నిద్ర మరియు ప్రశాంతత అవసరం."
  },
  {
    keywords: ['diabetes', 'blood sugar', 'glucose', 'insulin', 'मधुमेह', 'షుగర్'],
    en: "### Blood Sugar & Diabetes Management\nMaintaining balanced blood glucose protects your cardiovascular, kidney, and eye health.\n\n**Key Guidelines:**\n• **Low Glycemic Index Foods**: Choose whole grains, oats, brown rice, and fiber-rich lentils over refined flours and sugary drinks.\n• **Post-Meal Walks**: A gentle 10–15 minute walk right after meals helps muscles absorb glucose without insulin spikes.\n• **Routine Monitoring**: Track your Fasting (< 100 mg/dL normal) and Postprandial (< 140 mg/dL normal) levels regularly.\n• **Hydration**: Drink plenty of plain water to help your kidneys flush excess sugar.",
    hi: "### डायबिटीज और शुगर नियंत्रण\n• रिफाइंड मैदा और मीठी चीजों से बचें, ओट्स और साबुत अनाज खाएं।\n• भोजन के बाद 10-15 मिनट टहलने से शुगर लेवल अचानक नहीं बढ़ता।\n• खाली पेट (Fasting) और खाने के बाद (PP) शुगर की नियमित जांच कराएं।\n• रोज 8-10 गिलास पानी पिएं।",
    te: "### షుగర్ (డయాబెటిస్) నియంత్రణ\n• స్వీట్లు, మైదా మరియు శీతల పానీయాలను పూర్తిగా నివారించండి.\n• భోజనం తర్వాత 15 నిమిషాలు నడవడం రక్తంలో చక్కెర స్థాయిలను అదుపులో ఉంచుతుంది.\n• సమయానికి ఆహారం తీసుకోండి మరియు రెగ్యులర్‌గా షుగర్ టెస్ట్ చేయించుకోండి."
  },
  {
    keywords: ['eye', 'eye strain', 'dry eye', 'screen', 'vision', 'आंख', 'కళ్ళు', 'दृष्टि'],
    en: "### Eye Strain & Digital Fatigue\nExcessive screen use reduces blink rate from 15 times/min down to 5 times/min, causing dryness and strain.\n\n**The 20-20-20 Rule:**\n• Every **20 minutes**, look away at an object at least **20 feet away** for at least **20 seconds**.\n• Blink deliberately to recoat your cornea with natural tear film.\n• Adjust screen brightness to match room lighting and reduce glare.\n• Use preservative-free lubricating artificial tears if dryness or irritation persists.\n\n⚠️ If you experience sudden vision loss, flashes of light, or severe eye pain, see an ophthalmologist immediately.",
    hi: "### आंखों की थकान और जलन\nस्क्रीन पर लगातार काम करने से आंखें थक जाती हैं और सूखने लगती हैं।\n\n**20-20-20 का नियम:**\n• हर 20 मिनट बाद 20 फीट दूर किसी वस्तु को 20 सेकंड के लिए देखें।\n• बार-बार पलकें झपकाएं और आंखों पर ठंडे पानी के छींटे मारें।\n• कम रोशनी में मोबाइल या लैपटॉप का उपयोग न करें।",
    te: "### కంటి అలసట (Eye Strain)\n• ప్రతి 20 నిమిషాలకు ఒకసారి 20 సెకన్ల పాటు 20 అడుగుల దూరంలో ఉన్న వస్తువును చూడండి (20-20-20 రూల్).\n• కళ్ళను తరచుగా రెప్పవేయండి.\n• చల్లని నీటితో ముఖం మరియు కళ్ళు కడుక్కోవడం వల్ల ఉపశమనం లభిస్తుంది."
  },
  {
    keywords: ['tooth', 'teeth', 'toothache', 'gum', 'दांत', 'పంటి నొప్పి'],
    en: "### Toothache & Gum Sensitivity\nDental pain is often caused by enamel cavities, gum inflammation, or nerve sensitivity.\n\n**At-Home Comfort Measures:**\n• **Warm Saltwater Rinse**: Swish with 1/2 tsp salt in warm water for 30 seconds to clean the area and reduce bacterial buildup.\n• **Clove Oil**: Dab a tiny drop of clove oil (eugenol) on a cotton bud directly against the sore tooth for natural numbing.\n• **Cold Compress**: Hold an ice pack on the outside of your cheek if there is any swelling.\n• **Avoid**: Extreme hot, cold, or sugary foods.\n\n⚠️ Visit a dentist as soon as possible, especially if you have facial swelling or fever.",
    hi: "### दांत दर्द और मसूड़ों की सूजन\n• गुनगुने पानी में थोड़ा नमक डालकर कुल्ला करें।\n• दर्द वाले दांत पर लौंग का तेल या एक लौंग दबाकर रखें।\n• गाल के बाहर से बर्फ की सिकाई करें।\n• बहुत ठंडा या बहुत मीठा खाने से बचें और जल्द से जल्द डेंटिस्ट को दिखाएं।",
    te: "### పంటి నొప్పి (Toothache)\n• గోరువెచ్చని ఉప్పు నీటితో నోటిని పుక్కిలించండి.\n• నొప్పి ఉన్న పంటి దగ్గర లవంగం లేదా లవంగ నూనె పెట్టడం వల్ల ఉపశమనం లభిస్తుంది.\n• వీలైనంత త్వరగా దంత వైద్యుడిని సంప్రదించండి."
  }
];

/**
 * Intelligent Multi-Dimensional Response Synthesizer
 * Interprets any question and crafts a structured, context-rich clinical or app guidance reply.
 */
export function generateComprehensiveHealthReply(
  userInput: string,
  language: SupportedLanguage,
  userProfile?: Partial<UserProfile>
): string {
  const query = userInput.trim().toLowerCase();

  // 1. Check for greeting / conversational openers
  const isGreeting = /^(hi|hello|hey|namaste|good morning|good evening|good afternoon|howdy|hola|నమస్తే|నమస్కారం|नमस्ते|வணக்கம்|নমস্কার)/i.test(query);
  if (isGreeting && query.split(/\s+/).length <= 3) {
    const greetings: Record<SupportedLanguage, string> = {
      en: `Hello ${userProfile?.name ? userProfile.name : ''}! I am your HealthAssist AI Assistant. How can I help you today? You can ask me about symptoms, conditions, nutrition, medications, or any health feature.`,
      hi: `नमस्ते ${userProfile?.name ? userProfile.name : ''}! मैं आपका हेल्थअसिस्ट एआई सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ? आप किसी भी लक्षण, आहार, व्यायाम या इस ऐप की सुविधाओं के बारे में पूछ सकते हैं।`,
      te: `నమస్కారం ${userProfile?.name ? userProfile.name : ''}! నేను మీ హెల్త్ అసిస్ట్ AI సహాయకుడిని. మీకు ఎలాంటి ఆరోగ్య సలహా కావాలి? మీరు లక్షణాలు, ఆహారం లేదా ఈ యాప్ ఫీచర్ల గురించి అడగవచ్చు.`,
      ta: `வணக்கம்! நான் உங்கள் HealthAssist AI உதவியாளர். உங்களுக்கு நான் எவ்வாறு உதవ முடியும்? அறிகுறிகள் அல்லது உணவு பற்றி நீங்கள் கேட்கலாம்.`,
      kn: `ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ HealthAssist AI ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?`,
      ml: `നമസ്കാരം! ഞാൻ നിങ്ങളുടെ HealthAssist AI സഹായിയാണ്. എന്ത് സഹായമാണ് വേണ്ടത്?`,
      mr: `नमस्कार! मी तुमचा HealthAssist AI सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकतो?`,
      bn: `নমস্কার! আমি আপনার HealthAssist AI সহায়क। আমি কীভাবে সাহায্য করতে পারি?`,
      gu: `નમસ્તે! હું તમારો HealthAssist AI સહાયક છું. હું તમને કેવી રીતે મદદ કરી શકું?`,
      pa: `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ HealthAssist AI ਸਹਾਇਕ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?`,
      or: `ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର HealthAssist AI ସହାୟକ। ଆପଣ କିପରି ସାହାଯ୍ୟ ଚାହାଁନ୍ତି?`,
      as: `নমস্কাৰ! মই আপোনাৰ HealthAssist AI সহায়ক। আপুনি কি জানিব বিচাৰে?`
    };
    return greetings[language] || greetings.en;
  }

  // 2. Scan knowledge base for best keyword match
  for (const topic of TOPIC_RESPONSES) {
    const matches = topic.keywords.some(kw => query.includes(kw));
    if (matches) {
      const localized = topic[language] || topic.en;
      return localized;
    }
  }

  // 3. Dynamic Clinical Fallback Synthesizer for arbitrary unmapped health queries
  // Rather than giving a generic rigid template, construct an empathetic, targeted reply
  const hasPain = /pain|ache|hurt|sore|discomfort|दर्द|నొప్పి|வலி/.test(query);
  const hasFood = /food|eat|diet|nutrition|drink|fruit|vegetable|sugar|खाना|ఆహారం/.test(query);
  const hasFitness = /exercise|workout|gym|walk|run|yoga|fitness|वॉक|వ్యాయామం/.test(query);

  if (language === 'hi') {
    if (hasPain) {
      return `### दर्द और असुविधा के लिए सलाह\nआपके द्वारा पूछे गए दर्द के संबंध में कुछ जरूरी सुझाव:\n\n• **आराम**: दर्द वाले हिस्से पर ज्यादा दबाव या खिंचाव न आने दें।\n• **सिकाई**: सूजन होने पर बर्फ की सिकाई करें, जबकि जकड़न में हल्की गर्म सिकाई लाभकारी होती है।\n• **पानी और पोषण**: शरीर को हाइड्रेटेड रखें।\n• ⚠️ यदि दर्द अचानक बहुत तेज हो जाए या सहन न हो, तो तुरंत डॉक्टर को दिखाएं या ऐप में **Hospital Finder** देखें।`;
    }
    if (hasFood) {
      return `### पोषण और खान-पान संबंधी सुझाव\n• ताजे फल, हरी सब्जियां और साबुत अनाज को प्राथमिकता दें।\n• अत्यधिक तला-भुना, मैदा और चीनी का सेवन सीमित करें।\n• दिनभर में 2.5 से 3 लीटर पानी अवश्य पिएं।\n• व्यक्तिगत डाइट चार्ट के लिए ऐप के **Diet Planner** का उपयोग करें।`;
    }
    return `### स्वास्थ्य मार्गदर्शन\nआपके सवाल के लिए मुख्य सुझाव:\n\n• पर्याप्त आराम (7–8 घंटे की नींद) और दिन में 2.5–3 लीटर पानी पिएं।\n• ताजे, पौष्टिक भोजन का सेवन करें।\n• विस्तृत जांच के लिए ऐप का **Symptom Checker** इस्तेमाल कर सकते हैं।\n• यदि कोई भी परेशानी लंबे समय तक बनी रहे, तो डॉक्टर से सलाह अवश्य लें।`;
  }

  if (language === 'te') {
    if (hasPain) {
      return `### నొప్పి నివారణ జాగ్రత్తలు\nమీరు అడిగిన నొప్పికి సంబంధించిన ముఖ్యమైన సూచనలు:\n\n• **విశ్రాంతి**: నొప్పి ఉన్న భాగానికి పూర్తి విశ్రాంతి ఇవ్వండి.\n• **కాపడం**: వాపు ఉంటే ఐస్ ప్యాక్, కండరాల బిగుతు ఉంటే గోరువెచ్చని నీటి కాపడం పెట్టండి.\n• **మంచి నీరు**: తగినంత నీరు త్రాగండి.\n• ⚠️ నొప్పి తీవ్రంగా ఉంటే వెంటనే వైద్యుడిని సంప్రదించండి లేదా **Hospital Finder** ద్వారా సమీప ఆసుపత్రికి వెళ్ళండి.`;
    }
    return `### ఆరోగ్య సూచనలు\n• ప్రతిరోజూ తగినంత విశ్రాంతి మరియు 2.5-3 లీటర్ల నీరు త్రాగండి.\n• పౌష్టికాహారం తీసుకోండి.\n• మరింత సమాచారం కోసం **Symptom Checker** లేదా **Diet Planner** చూడవచ్చు.`;
  }

  // English responsive clinical synthesis
  if (hasPain) {
    return `### Care & Guidance for Pain or Discomfort\nWhen dealing with pain or body aches, targeted rest and safe at-home steps can provide meaningful relief:\n\n**Immediate Relief Steps:**\n• **Rest the Affected Area**: Avoid repetitive strain or sudden heavy loading until the soreness eases.\n• **Cold or Warm Therapy**: Use a cold pack for fresh inflammation/swelling, or gentle heat for muscular tightness.\n• **Hydration**: Drink sufficient fluids to prevent muscle cramping and assist tissue recovery.\n• **Gentle Mobility**: Avoid staying completely stiff—gentle light stretches keep circulation moving.\n\n⚠️ **When to Seek Immediate Care:**\nIf pain is severe, accompanied by swelling, numbness, fever, or difficulty bearing weight, please consult a physician promptly.`;
  }

  if (hasFood) {
    return `### Evidence-Based Nutritional Guidance\nHealthy nutritional choices play an immediate role in energy, digestion, and systemic recovery:\n\n**Core Recommendations:**\n• **Whole, Unprocessed Foods**: Emphasize colorful vegetables, whole grains, and lean proteins.\n• **Hydration**: Aim for 2.5 to 3 liters of water daily to support kidney filtration and cellular function.\n• **Gut-Friendly Foods**: Include fiber-rich foods, oats, lentils, and probiotics like yogurt.\n• **Minimize**: Heavily processed snacks, refined sugars, and excessive sodium.\n\n💡 *Tip: Check out our in-app **Diet Planner** for meals customized specifically to your BMI and metabolic profile.*`;
  }

  if (hasFitness) {
    return `### Physical Activity & Fitness Guidance\nSafe, regular movement is vital for cardiovascular health, joint mobility, and mental well-being:\n\n**Practical Principles:**\n• **Consistency Over Intensity**: 30 minutes of moderate walking or movement 5 days a week delivers proven health benefits.\n• **Warm-Up & Cool Down**: Dedicate 5 minutes to dynamic stretching to protect tendons and muscles.\n• **Listen to Your Body**: Never push through sharp joint or back pain.\n• **Track Your Activity**: Check the **Wearables & IoT Hub** to monitor daily step counts and resting heart rate.`;
  }

  return `### Health & Wellness Guidance\nThank you for reaching out with your health question. Here are key insights to keep in mind:\n\n**Practical Self-Care Principles:**\n• **Adequate Recovery**: Quality rest (7–8 hours) is the cornerstone of cellular repair and immune defense.\n• **Optimal Hydration**: Drink 2.5–3 liters of water daily to support circulation and vitality.\n• **Track Changes**: Notice whether your symptoms correlate with specific foods, activities, or sleep patterns.\n\n**Helpful Tools in HealthAssist:**\n• **Symptom Checker**: Evaluate multi-symptom conditions and specialist recommendations.\n• **Diet Planner**: Get a balanced nutrition chart tailored to your body metrics.\n• **Hospital Finder**: Quickly locate emergency centers and clinics in your area.\n\n⚠️ *If you have severe, worsening, or persistent symptoms, please consult a qualified healthcare provider for an individualized evaluation.*`;
}
