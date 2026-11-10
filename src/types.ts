export type SupportedLanguage = 
  | 'en' // English
  | 'hi' // Hindi (हिन्दी)
  | 'te' // Telugu (తెలుగు)
  | 'ta' // Tamil (தமிழ்)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'mr' // Marathi (मराठी)
  | 'bn' // Bengali (বাংলা)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'as'; // Assamese (অসমীয়া)

export type ThemeMode = 'light' | 'dark' | 'warm';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  medicalHistory?: string[];
  allergies?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  registeredAt: string;
}

export interface Symptom {
  id: string;
  name: string;
  category: 'General' | 'Respiratory' | 'Cardiovascular' | 'Digestive' | 'Neurological' | 'Skin & Joints';
  description?: string;
}

export interface DifferentialDiagnosis {
  disease: string;
  confidence: number; // e.g. 88%
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  matchedSymptoms: string[];
  differentiationNote: string;
  specialist: string;
}

export interface DiseasePrediction {
  disease: string;
  confidence: number; // e.g. 92%
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  matchedSymptoms: string[];
  description: string;
  precautions: string[];
  recommendedSpecialist: string;
  timestamp: string;
  differentials?: DifferentialDiagnosis[];
  calmReassurance?: string;
  poweredBy?: string;
}

export interface DiabetesAssessmentInput {
  glucose: number; // mg/dL
  bloodPressure: number; // mmHg
  insulin: number; // mu U/ml
  bmi: number;
  age: number;
  skinThickness: number;
  familyHistory: boolean;
  activityLevel: 'low' | 'moderate' | 'high';
}

export interface HeartDiseaseInput {
  age: number;
  sex: 'male' | 'female';
  chestPainType: 'Typical Angina' | 'Atypical Angina' | 'Non-anginal Pain' | 'Asymptomatic';
  restingBP: number; // mmHg
  cholesterol: number; // mg/dL
  fastingBS: boolean;
  maxHR: number; // bpm
  exerciseAngina: boolean;
  oldpeak: number; // ST depression
}

export interface ParkinsonInput {
  age: number;
  handTremorFrequency: number; // Hz (0 - 10)
  vocalJitterScore: number; // % (0 - 5)
  motorSpeedScore: number; // tap speed (0 - 100)
  posturalInstability: 'None' | 'Mild' | 'Moderate' | 'Severe';
  gaitDifficulty: boolean;
}

export interface KidneyDiseaseInput {
  creatinine: number; // mg/dL (normal 0.7 - 1.2)
  egfr: number; // mL/min/1.73m² (normal > 90)
  albuminuria: 'Normal (<30 mg/g)' | 'Microalbuminuria (30-300 mg/g)' | 'Macroalbuminuria (>300 mg/g)';
  systolicBP: number;
  hasDiabetes: boolean;
  age: number;
  edema: boolean;
}

export interface StrokeRiskInput {
  systolicBP: number;
  diastolicBP: number;
  age: number;
  atrialFibrillation: boolean;
  historyTIA: boolean;
  smoking: boolean;
  carotidBruit: boolean;
  unilateralWeakness: boolean;
}

export interface LiverDiseaseInput {
  alt: number; // U/L (normal 7-56)
  ast: number; // U/L (normal 10-40)
  bilirubin: number; // mg/dL (normal 0.2-1.2)
  albumin: number; // g/dL (normal 3.5-5.0)
  platelets: number; // 10^9/L (normal 150-450)
  bmi: number;
  fatigueJaundice: boolean;
}

export interface COPDInput {
  fev1FvcRatio: number; // % (normal > 70%)
  mMRCDyspnea: 'Grade 0: Strenuous only' | 'Grade 1: Hurrying on level' | 'Grade 2: Walks slower than peers' | 'Grade 3: Stops for breath after 100m' | 'Grade 4: Too breathless to leave house';
  smokingPackYears: number;
  chronicCoughMonths: number;
  sputumProduction: boolean;
  nocturnalAwakening: boolean;
}

export interface ModelPredictionResult {
  condition: string;
  probability: number;
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  clinicalSummary: string;
  lifestyleAdvice: string[];
  testedDate: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  detectedEmotion?: {
    emotion: string;
    sentiment: 'Positive' | 'Neutral' | 'Anxious' | 'Distressed';
    intensity: number;
  };
}

export interface HospitalFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy' | 'Trauma Center';
  distanceKm: number;
  address: string;
  phone: string;
  rating: number;
  open24x7: boolean;
  icuAvailable: boolean;
  emergencyBeds: number;
  specialties: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface MealDetail {
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: string[];
  instructions: string;
}

export interface DailyDietPlan {
  id: string;
  title: string;
  goal: 'Weight Loss' | 'Balanced Maintenance' | 'Muscle Gain' | 'Diabetic Friendly' | 'Heart Healthy' | 'Keto/Low Carb';
  dietType: 'Standard' | 'Vegetarian' | 'Vegan' | 'Low Sodium';
  targetCalories: number;
  targetWaterLiters: number;
  meals: MealDetail[];
  tips: string[];
  userRating?: number; // 1-5 feedback
  userNotes?: string;
}

export interface HealthRecordEntry {
  id: string;
  date: string;
  category: 'Symptom Check' | 'Specialized ML' | 'Vitals Log' | 'Diet Goal';
  title: string;
  summary: string;
  metrics?: {
    systolicBP?: number;
    diastolicBP?: number;
    bloodSugar?: number;
    heartRate?: number;
    weightKg?: number;
    bmi?: number;
  };
  notes?: string;
}

export interface WearableDeviceState {
  connected: boolean;
  deviceName: string;
  batteryPercent: number;
  heartRateBpm: number;
  spo2Percent: number;
  stepCount: number;
  caloriesBurned: number;
  bodyTempCelsius: number;
  sleepHours: number;
  sleepQuality: 'Deep & Restful' | 'Moderate' | 'Disturbed';
  isAlert: boolean;
  alertMessage?: string;
  historyRates: number[];
}

export interface VisionModelResult {
  condition: string;
  confidence: number;
  category: 'Dermatological' | 'Radiological' | 'General Pathology';
  severity: 'Mild' | 'Moderate' | 'Requires Attention';
  findings: string[];
  recommendation: string;
}

export interface AudioModelResult {
  classification: string;
  confidence: number;
  breathingPattern: 'Normal Vesicular' | 'Wheezing Detected' | 'Dry Cough Paroxysm' | 'Bronchial Crackles';
  riskScore: number;
  clinicalObservations: string[];
  suggestedAction: string;
}

export interface EmotionSentimentCheck {
  id: string;
  date: string;
  primaryEmotion: 'Calm & Happy' | 'Mild Stress' | 'Anxious' | 'Fatigued / Overwhelmed' | 'Depressed Mood';
  stressScore: number; // 0-100
  positivityScore: number; // 0-100
  journalText: string;
  recommendedTechnique: string;
}

export type ActiveView = 
  | 'dashboard'
  | 'symptom-checker'
  | 'health-chatbot'
  | 'hospital-finder'
  | 'diet-planner'
  | 'health-records'
  | 'wearables-iot'
  | 'vision-audio'
  | 'emotion-sentiment'
  | 'profile';
