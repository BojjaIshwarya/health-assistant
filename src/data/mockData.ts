import { 
  Symptom, 
  HospitalFacility, 
  DailyDietPlan, 
  HealthRecordEntry,
  VisionModelResult,
  AudioModelResult 
} from '../types';

export const SYMPTOMS_LIST: Symptom[] = [
  // General
  { id: 'fever', name: 'High Fever (>38°C / 100.4°F)', category: 'General' },
  { id: 'fatigue', name: 'Unexplained Fatigue & Exhaustion', category: 'General' },
  { id: 'chills', name: 'Chills & Shivering', category: 'General' },
  { id: 'sweats', name: 'Night Sweats', category: 'General' },
  { id: 'weight_loss', name: 'Unintentional Rapid Weight Loss', category: 'General' },
  { id: 'loss_appetite', name: 'Loss of Appetite', category: 'General' },
  { id: 'frequent_urination', name: 'Excessive Thirst & Frequent Urination', category: 'General' },
  { id: 'edema_swelling', name: 'Swelling in Legs, Feet or Facial Puffiness', category: 'General' },

  // Respiratory
  { id: 'cough_dry', name: 'Persistent Dry Cough', category: 'Respiratory' },
  { id: 'cough_productive', name: 'Cough with Thick Phlegm/Mucus', category: 'Respiratory' },
  { id: 'shortness_breath', name: 'Shortness of Breath on Exertion', category: 'Respiratory' },
  { id: 'wheezing', name: 'Audible Wheezing & Whistling in Lungs', category: 'Respiratory' },
  { id: 'sore_throat', name: 'Sore Throat & Painful Swallowing', category: 'Respiratory' },
  { id: 'runny_nose', name: 'Runny or Congested Nasal Passages', category: 'Respiratory' },
  { id: 'chest_tightness', name: 'Chest Tightness or Airway Constriction', category: 'Respiratory' },

  // Cardiovascular
  { id: 'chest_pain', name: 'Acute Retrosternal Chest Pain (Pressure/Squeezing)', category: 'Cardiovascular' },
  { id: 'palpitations', name: 'Rapid or Irregular Heart Palpitations', category: 'Cardiovascular' },
  { id: 'ankle_swelling', name: 'Pitting Swelling in Ankles/Feet', category: 'Cardiovascular' },
  { id: 'dizziness', name: 'Dizziness, Presyncope or Lightheadedness', category: 'Cardiovascular' },
  { id: 'severe_hypertension', name: 'Throbbing Occipital Headache with High BP', category: 'Cardiovascular' },

  // Digestive & Hepatic
  { id: 'nausea', name: 'Nausea & Vomiting', category: 'Digestive' },
  { id: 'acid_reflux', name: 'Severe Heartburn & Acid Regurgitation', category: 'Digestive' },
  { id: 'abdominal_pain', name: 'Right Upper Quadrant / Abdominal Cramps', category: 'Digestive' },
  { id: 'diarrhea', name: 'Frequent Loose Watery Stools', category: 'Digestive' },
  { id: 'bloating', name: 'Severe Abdominal Distension / Bloating', category: 'Digestive' },
  { id: 'indigestion', name: 'Chronic Post-Prandial Indigestion', category: 'Digestive' },
  { id: 'jaundice', name: 'Yellowing of Skin or Whites of Eyes (Jaundice)', category: 'Digestive' },
  { id: 'dark_urine', name: 'Dark Amber / Tea-Colored Urine', category: 'Digestive' },

  // Renal & Urinary
  { id: 'frothy_urine', name: 'Persistent Foamy or Frothy Urine', category: 'General' },
  { id: 'flank_pain', name: 'Deep Dull Ache in Flank or Lower Back', category: 'General' },

  // Neurological & Cerebrovascular
  { id: 'headache_throbbing', name: 'Unilateral Throbbing Headache / Migraine', category: 'Neurological' },
  { id: 'sudden_numbness', name: 'Sudden Unilateral Numbness or Facial Droop', category: 'Neurological' },
  { id: 'slurred_speech', name: 'Difficulty Speaking or Slurred Speech', category: 'Neurological' },
  { id: 'tremor_hands', name: 'Involuntary Resting Hand Tremor (Pill-rolling)', category: 'Neurological' },
  { id: 'stiffness', name: 'Cogwheel Muscle Rigidity / Stiffness', category: 'Neurological' },
  { id: 'balance_loss', name: 'Loss of Balance / Shuffling Gait Hesitation', category: 'Neurological' },
  { id: 'blurred_vision', name: 'Transient Blurred or Amaurosis Vision Loss', category: 'Neurological' },
  { id: 'insomnia', name: 'Chronic Sleep Disruption / Daytime Somnolence', category: 'Neurological' },

  // Skin & Joints
  { id: 'skin_rash', name: 'Erythematous Pruritic Skin Rash or Plaques', category: 'Skin & Joints' },
  { id: 'joint_pain', name: 'Symmetrical Joint Pain & Tenderness', category: 'Skin & Joints' },
  { id: 'morning_stiffness', name: 'Prolonged Morning Joint Stiffness (>45 min)', category: 'Skin & Joints' },
  { id: 'slow_healing', name: 'Delayed Healing of Superficial Cuts and Sores', category: 'Skin & Joints' },
];

export interface DiseaseRule {
  id: string;
  name: string;
  symptoms: string[];
  coreSymptoms: string[];
  supportingSymptoms: string[];
  baseConfidence: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  description: string;
  specialist: string;
  differentiationNote: string;
  precautions: string[];
}

export const DISEASE_RULES: DiseaseRule[] = [
  {
    id: 'common_cold',
    name: 'Common Cold (Viral Upper Respiratory Infection)',
    symptoms: ['runny_nose', 'sore_throat', 'cough_dry', 'fatigue', 'headache_throbbing'],
    coreSymptoms: ['runny_nose', 'sore_throat'],
    supportingSymptoms: ['cough_dry', 'fatigue', 'headache_throbbing'],
    baseConfidence: 95,
    riskLevel: 'Low',
    description: 'Mild, benign, and self-limiting viral infection of the upper respiratory mucosa. Typically resolves spontaneously within 5 to 7 days with adequate rest and hydration.',
    specialist: 'General Physician / Self-Care',
    differentiationNote: 'Gradual onset with clear nasal drainage and scratchy throat; lacks high persistent fever, chest tightness, or respiratory distress.',
    precautions: [
      'Rest and maintain liberal oral hydration (warm water, herbal teas, broths)',
      'Use warm salt water gargles for soothing throat irritation',
      'Steam inhalation or saline nasal sprays relieve nasal congestion',
      'No emergency intervention required; standard symptomatic home care is recommended'
    ]
  },
  {
    id: 'tension_headache',
    name: 'Tension-Type Headache & Screen Fatigue',
    symptoms: ['headache_throbbing', 'fatigue', 'insomnia'],
    coreSymptoms: ['headache_throbbing', 'fatigue'],
    supportingSymptoms: ['insomnia'],
    baseConfidence: 94,
    riskLevel: 'Low',
    description: 'Very common, benign muscle contraction headache frequently triggered by prolonged digital screen time, psychological stress, neck strain, or mild dehydration.',
    specialist: 'General Physician',
    differentiationNote: 'Dull band-like pressure or temple ache without unilateral facial droop, limb weakness, visual blackout, or vomiting.',
    precautions: [
      'Take 5-minute screen breaks every 30 minutes and practice the 20-20-20 rule',
      'Drink 500ml of water and ensure consistent 7-8 hours of sleep',
      'Apply a gentle warm or cool compress to the forehead and temples',
      'Reassuring and safe: benign condition that responds well to rest'
    ]
  },
  {
    id: 'lifestyle_fatigue',
    name: 'Physiological Fatigue & Circadian Sleep Debt',
    symptoms: ['fatigue', 'insomnia', 'loss_appetite'],
    coreSymptoms: ['fatigue', 'insomnia'],
    supportingSymptoms: ['loss_appetite'],
    baseConfidence: 93,
    riskLevel: 'Low',
    description: 'Temporary depletion of energy stores associated with accumulated sleep deficit, occupational exertion, or daily stress without organic pathology.',
    specialist: 'General Wellness / Primary Care',
    differentiationNote: 'Generalized physical tiredness without fever, acute weight loss, polydipsia, or joint swelling.',
    precautions: [
      'Establish a fixed sleep and wake schedule to restore natural melatonin rhythm',
      'Avoid caffeinated beverages and blue-light screen exposure within 3 hours of sleep',
      'Consume balanced whole-food meals with adequate complex carbohydrates and electrolytes',
      'Incorporate a 15-minute gentle evening walk or breathing meditation'
    ]
  },
  {
    id: 'dyspepsia',
    name: 'Functional Gastric Acidity & Post-Prandial Dyspepsia',
    symptoms: ['acid_reflux', 'indigestion', 'bloating'],
    coreSymptoms: ['acid_reflux', 'indigestion'],
    supportingSymptoms: ['bloating'],
    baseConfidence: 94,
    riskLevel: 'Low',
    description: 'Mild, benign gastric mucosal irritation resulting from spicy/fried foods, delayed meal timing, or excessive caffeine consumption.',
    specialist: 'General Physician',
    differentiationNote: 'Episodic post-meal burning relieved by antacids; completely unrelated to exertion and free of radiating left-arm pain.',
    precautions: [
      'Eat smaller, unhurried meals and avoid lying down within 2 hours of eating',
      'Reduce intake of excessively spicy, acidic, or carbonated items',
      'Drink a glass of lukewarm water or chamomile tea after meals',
      'Highly manageable condition with simple dietary adjustments'
    ]
  },
  {
    id: 'rhinitis',
    name: 'Seasonal Allergic Rhinitis (Hay Fever)',
    symptoms: ['runny_nose', 'sore_throat', 'headache_throbbing', 'fatigue', 'cough_dry'],
    coreSymptoms: ['runny_nose', 'sore_throat'],
    supportingSymptoms: ['headache_throbbing', 'fatigue', 'cough_dry'],
    baseConfidence: 93,
    riskLevel: 'Low',
    description: 'Allergic mucosal response to airborne pollens, dust mites, or environmental particles causing clear nasal discharge and sneezing.',
    specialist: 'Allergist / General Practitioner',
    differentiationNote: 'Clear watery nasal discharge and itchy eyes/throat without body aches, high fever, or thick discolored phlegm.',
    precautions: [
      'Rinse nasal passages with sterile isotonic saline wash',
      'Minimize exposure to known allergens and use non-drowsy antihistamines if needed',
      'Keep bedroom windows closed during high-pollen morning hours',
      'Safe, non-emergent condition managed with environmental measures'
    ]
  },
  {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    symptoms: ['acid_reflux', 'chest_tightness', 'nausea', 'bloating', 'indigestion'],
    coreSymptoms: ['acid_reflux', 'indigestion'],
    supportingSymptoms: ['chest_tightness', 'nausea', 'bloating'],
    baseConfidence: 93,
    riskLevel: 'Low',
    description: 'Pathological retrograde flow of gastric acid and pepsin into the esophagus causing mucosal irritation and burning.',
    specialist: 'Gastroenterologist',
    differentiationNote: 'Symptoms are provoked by recumbency or trigger foods and relieved by antacids, differentiating from true cardiac ischemia.',
    precautions: [
      'Elevate the head of your bed by 15–20 cm (6–8 inches)',
      'Refrain from recumbent positioning within 3 hours after meal consumption',
      'Eliminate dietary triggers including chocolate, coffee, citrus, and mint',
      'Consider short-course H2-blockers or PPIs under clinical supervision'
    ]
  },
  {
    id: 'influenza',
    name: 'Acute Viral Influenza (Flu Syndrome)',
    symptoms: ['fever', 'chills', 'fatigue', 'cough_dry', 'sore_throat', 'headache_throbbing'],
    coreSymptoms: ['fever', 'chills', 'cough_dry'],
    supportingSymptoms: ['fatigue', 'sore_throat', 'headache_throbbing'],
    baseConfidence: 94,
    riskLevel: 'Moderate',
    description: 'Infectious respiratory illness caused by influenza viruses presenting with sudden body aches, chills, and fever.',
    specialist: 'General Physician',
    differentiationNote: 'Abrupt onset of fever and generalized muscle aches distinguishes from slower-onset common cold; lacks localized focal chest pain.',
    precautions: [
      'Isolate at home during febrile episodes to minimize community exposure',
      'Maintain liberal oral fluid and electrolyte intake',
      'Take paracetamol as advised by a physician for fever and body ache relief',
      'Reassuring: standard seasonal influenza resolves in most individuals within 5 to 8 days'
    ]
  },
  {
    id: 'bronchitis',
    name: 'Acute Bronchitis & Tracheobronchial Inflammation',
    symptoms: ['cough_productive', 'chest_tightness', 'shortness_breath', 'fatigue', 'sore_throat'],
    coreSymptoms: ['cough_productive', 'chest_tightness'],
    supportingSymptoms: ['shortness_breath', 'fatigue', 'sore_throat'],
    baseConfidence: 90,
    riskLevel: 'Moderate',
    description: 'Self-limiting mucosal inflammation of the large conducting airways presenting with prominent productive cough.',
    specialist: 'Pulmonologist / Family Medicine',
    differentiationNote: 'Predominance of mucopurulent cough without localized focal pulmonary consolidations seen on chest radiographs.',
    precautions: [
      'Utilize cool-mist humidification and steam inhalation',
      'Avoid second-hand tobacco smoke and industrial airborne irritants',
      'Hydrate with warm honey-lemon teas to soothe bronchial irritation',
      'Consult a physician if hemoptysis occurs or fever exceeds 3 days'
    ]
  },
  {
    id: 'migraine',
    name: 'Migraine with Neurological Aura Tendency',
    symptoms: ['headache_throbbing', 'blurred_vision', 'nausea', 'dizziness', 'fatigue'],
    coreSymptoms: ['headache_throbbing', 'blurred_vision', 'nausea'],
    supportingSymptoms: ['dizziness', 'fatigue'],
    baseConfidence: 92,
    riskLevel: 'Moderate',
    description: 'Complex neurovascular disorder involving cortical spreading depression and trigeminovascular pain pathway activation.',
    specialist: 'Neurologist / Headache Specialist',
    differentiationNote: 'Unilateral pulsating headache with photophobia/visual scintillation, lacking focal persistent limb paralysis.',
    precautions: [
      'Rest in a darkened, silent, temperature-controlled environment during attacks',
      'Log episodes to identify personal triggers (tyramine foods, stress, sleep changes)',
      'Maintain strict circadian sleep and meal timing',
      'Discuss abortive triptans or preventive CGRP antagonists with your physician'
    ]
  },
  {
    id: 'gastroenteritis',
    name: 'Acute Viral / Bacterial Gastroenteritis',
    symptoms: ['diarrhea', 'nausea', 'abdominal_pain', 'fever', 'chills', 'loss_appetite'],
    coreSymptoms: ['diarrhea', 'nausea', 'abdominal_pain'],
    supportingSymptoms: ['fever', 'chills', 'loss_appetite'],
    baseConfidence: 93,
    riskLevel: 'Low',
    description: 'Acute gastrointestinal inflammation manifesting with frequent liquid stools, visceral cramps, and mild volume depletion.',
    specialist: 'General Physician',
    differentiationNote: 'Self-limiting loose stools responding to oral rehydration, without chronic focal mass or severe jaundice.',
    precautions: [
      'Consume World Health Organization standard Oral Rehydration Salts (ORS) solution',
      'Gradually reintroduce bland low-residue foods (bananas, rice, toast)',
      'Avoid high-fat, dairy, caffeinated, and intensely seasoned foods',
      'Most viral episodes improve substantially within 48 to 72 hours'
    ]
  },
  {
    id: 't2dm',
    name: 'Type 2 Diabetes Mellitus (Glycemic Screening)',
    symptoms: ['frequent_urination', 'fatigue', 'blurred_vision', 'slow_healing', 'weight_loss'],
    coreSymptoms: ['frequent_urination', 'fatigue', 'blurred_vision'],
    supportingSymptoms: ['slow_healing', 'weight_loss'],
    baseConfidence: 95,
    riskLevel: 'Moderate',
    description: 'Gradual metabolic tendency involving sustained blood sugar elevation and peripheral insulin resistance.',
    specialist: 'Endocrinologist / Diabetologist',
    differentiationNote: 'Early glycemic screening marker; does not indicate an emergency state unless accompanied by severe dehydration or confusion.',
    precautions: [
      'Schedule a routine fasting plasma glucose (FPG) and HbA1c screening panel',
      'Adopt a balanced low-glycemic Mediterranean or whole-food diet',
      'Incorporate 30 minutes of daily moderate walking or cycling',
      'Reassuring: highly controllable with healthy lifestyle modifications'
    ]
  },
  {
    id: 'cad',
    name: 'Coronary Artery Disease / Angina Pectoris',
    symptoms: ['chest_pain', 'shortness_breath', 'chest_tightness', 'palpitations', 'dizziness'],
    coreSymptoms: ['chest_pain', 'shortness_breath', 'chest_tightness'],
    supportingSymptoms: ['palpitations', 'dizziness'],
    baseConfidence: 96,
    riskLevel: 'High',
    description: 'Impaired myocardial perfusion caused by atherosclerotic plaque stenosis within the coronary arterial circulation.',
    specialist: 'Cardiologist / Emergency Medicine',
    differentiationNote: 'Retrosternal squeezing pain exacerbated by physical exertion, unlike positional or post-prandial heartburn.',
    precautions: [
      'Seek urgent cardiology evaluation if retrosternal pressure radiates to arm, neck, or jaw',
      'Undergo 12-lead resting electrocardiogram (ECG) and Troponin testing',
      'Refrain from unmonitored vigorous exertion until cardiologist review',
      'Follow prescribed lipid-lowering and anti-platelet therapy'
    ]
  },
  {
    id: 'parkinsons',
    name: 'Idiopathic Parkinson’s Neurodegenerative Pattern',
    symptoms: ['tremor_hands', 'stiffness', 'balance_loss', 'fatigue', 'insomnia'],
    coreSymptoms: ['tremor_hands', 'stiffness', 'balance_loss'],
    supportingSymptoms: ['fatigue', 'insomnia'],
    baseConfidence: 93,
    riskLevel: 'Moderate',
    description: 'Progressive neurodegenerative condition marked by nigrostriatal dopaminergic neuron degeneration leading to hallmark motor deficits.',
    specialist: 'Neurologist / Movement Disorder Specialist',
    differentiationNote: 'Characterized by asymmetrical 4–6 Hz resting tremor and cogwheel muscular rigidity rather than intentional cerebellar ataxia.',
    precautions: [
      'Schedule clinical Unified Parkinson’s Disease Rating Scale (UPDRS) exam',
      'Engage in targeted balance training, tai chi, and physical therapy',
      'Discuss levodopa responsiveness and DaTscan neuroimaging with your physician',
      'Maintain adequate hydration and high-fiber nutrition for gut motility'
    ]
  },
  {
    id: 'ckd',
    name: 'Chronic Kidney Disease (Glomerular Impairment)',
    symptoms: ['edema_swelling', 'frothy_urine', 'fatigue', 'severe_hypertension', 'loss_appetite', 'flank_pain'],
    coreSymptoms: ['edema_swelling', 'frothy_urine', 'severe_hypertension'],
    supportingSymptoms: ['fatigue', 'loss_appetite', 'flank_pain'],
    baseConfidence: 94,
    riskLevel: 'Moderate',
    description: 'Gradual structural or functional nephron impairment causing reduced filtration and fluid retention.',
    specialist: 'Nephrologist',
    differentiationNote: 'Foamy urine indicating albuminuria combined with peripheral bilateral edema distinguishes renal disease from isolated cardiac failure.',
    precautions: [
      'Measure serum creatinine, eGFR, and urinary albumin-to-creatinine ratio (ACR)',
      'Strictly control systolic blood pressure below 120–130 mmHg',
      'Limit dietary sodium to <2,000 mg/day and monitor potassium and phosphorus',
      'Avoid nephrotoxic NSAIDs (such as ibuprofen and naproxen)'
    ]
  },
  {
    id: 'stroke',
    name: 'Acute Cerebrovascular Event / TIA Risk',
    symptoms: ['sudden_numbness', 'slurred_speech', 'blurred_vision', 'dizziness', 'severe_hypertension'],
    coreSymptoms: ['sudden_numbness', 'slurred_speech'],
    supportingSymptoms: ['blurred_vision', 'dizziness', 'severe_hypertension'],
    baseConfidence: 96,
    riskLevel: 'Severe',
    description: 'Focal neurological deficit resulting from acute cerebral ischemia or intracranial hemorrhage requiring rapid intervention.',
    specialist: 'Stroke Neurologist / Emergency Care',
    differentiationNote: 'Sudden onset of unilateral facial, arm, or speech deficits (FAST criteria) differentiates from peripheral neuropathy or migraine.',
    precautions: [
      'IMMEDIATE EMERGENCY: Dial emergency medical services if symptoms are active within the 4.5-hour thrombolysis window',
      'Do not administer aspirin or oral food/water until CT/MRI confirms non-hemorrhagic status',
      'Keep head of bed slightly elevated and measure bilateral blood pressures',
      'Undergo urgent non-contrast head CT and CT angiography'
    ]
  },
  {
    id: 'nafld',
    name: 'Non-Alcoholic Fatty Liver Disease (NASH / Hepatic Stress)',
    symptoms: ['abdominal_pain', 'fatigue', 'jaundice', 'dark_urine', 'loss_appetite'],
    coreSymptoms: ['abdominal_pain', 'jaundice', 'dark_urine'],
    supportingSymptoms: ['fatigue', 'loss_appetite'],
    baseConfidence: 92,
    riskLevel: 'Moderate',
    description: 'Excessive intrahepatic triglyceride accumulation triggering steatohepatitis and potential progressive hepatic fibrosis.',
    specialist: 'Hepatologist / Gastroenterologist',
    differentiationNote: 'Right upper quadrant fullness accompanied by scleral icterus and elevated transaminases without severe acute left-sided chest pain.',
    precautions: [
      'Obtain complete liver function tests (LFTs) including ALT, AST, bilirubin, and alkaline phosphatase',
      'Perform abdominal ultrasound or transient elastography (FibroScan)',
      'Target 7-10% gradual body weight reduction via calorie restriction',
      'Abstain completely from alcoholic beverages and hepatotoxic supplements'
    ]
  },
  {
    id: 'copd',
    name: 'Chronic Obstructive Pulmonary Disease (COPD) & Asthma',
    symptoms: ['cough_productive', 'shortness_breath', 'wheezing', 'chest_tightness', 'fatigue'],
    coreSymptoms: ['shortness_breath', 'wheezing', 'cough_productive'],
    supportingSymptoms: ['chest_tightness', 'fatigue'],
    baseConfidence: 94,
    riskLevel: 'Moderate',
    description: 'Persistent respiratory airflow limitation caused by airway hyperreactivity, chronic bronchitis, or emphysematous parenchymal destruction.',
    specialist: 'Pulmonologist',
    differentiationNote: 'Expiratory musical wheezing and chronic sputum production distinct from acute viral fever syndromes.',
    precautions: [
      'Perform diagnostic post-bronchodilator spirometry (FEV1/FVC ratio analysis)',
      'Ensure complete cessation of smoking and avoid ambient particulate matter (PM2.5)',
      'Utilize prescribed maintenance dual-inhaler therapy (LABA/LAMA or ICS)',
      'Receive annual influenza and pneumococcal conjugative vaccinations'
    ]
  },
  {
    id: 'arthritis',
    name: 'Inflammatory Rheumatoid / Autoimmune Arthritis',
    symptoms: ['joint_pain', 'morning_stiffness', 'fatigue', 'edema_swelling', 'skin_rash'],
    coreSymptoms: ['joint_pain', 'morning_stiffness'],
    supportingSymptoms: ['fatigue', 'edema_swelling', 'skin_rash'],
    baseConfidence: 91,
    riskLevel: 'Low',
    description: 'Synovial joint inflammation presenting with morning stiffness that improves with light movement.',
    specialist: 'Rheumatologist / General Physician',
    differentiationNote: 'Prolonged morning stiffness (>45 minutes) that improves with gentle movement, unlike mechanical wear-and-tear osteoarthrosis.',
    precautions: [
      'Test for Rheumatoid Factor (RF), anti-CCP antibodies, and CRP/ESR inflammatory markers',
      'Apply warm thermal compresses during morning stiff periods',
      'Maintain low-impact aerobic mobility (swimming, stationary cycling)',
      'Consult rheumatologist regarding early DMARD disease-modifying therapy'
    ]
  },
  {
    id: 'gastroenteritis',
    name: 'Acute Viral / Bacterial Gastroenteritis',
    symptoms: ['diarrhea', 'nausea', 'abdominal_pain', 'fever', 'chills', 'loss_appetite'],
    coreSymptoms: ['diarrhea', 'nausea', 'abdominal_pain'],
    supportingSymptoms: ['fever', 'chills', 'loss_appetite'],
    baseConfidence: 93,
    riskLevel: 'Moderate',
    description: 'Acute gastrointestinal inflammation manifesting with frequent liquid stools, visceral cramps, and volume depletion.',
    specialist: 'General Physician / Infectious Disease',
    differentiationNote: 'Copious watery diarrhea and vomiting without focal right upper quadrant mass distinguishes from liver pathology.',
    precautions: [
      'Consume World Health Organization standard Oral Rehydration Salts (ORS) solution',
      'Gradually reintroduce bland low-residue foods (bananas, rice, toast)',
      'Avoid high-fat, dairy, caffeinated, and intensely seasoned foods',
      'Seek emergency IV hydration if unable to retain fluids for >18 hours'
    ]
  },
  {
    id: 'arthritis',
    name: 'Inflammatory Rheumatoid / Autoimmune Arthritis',
    symptoms: ['joint_pain', 'morning_stiffness', 'fatigue', 'edema_swelling', 'skin_rash'],
    coreSymptoms: ['joint_pain', 'morning_stiffness'],
    supportingSymptoms: ['fatigue', 'edema_swelling', 'skin_rash'],
    baseConfidence: 91,
    riskLevel: 'Moderate',
    description: 'Systemic autoimmune disease characterized by chronic synovial inflammation and joint destruction.',
    specialist: 'Rheumatologist',
    differentiationNote: 'Prolonged morning stiffness (>45 minutes) that improves with gentle movement, unlike mechanical wear-and-tear osteoarthrosis.',
    precautions: [
      'Test for Rheumatoid Factor (RF), anti-CCP antibodies, and CRP/ESR inflammatory markers',
      'Apply warm thermal compresses during morning stiff periods',
      'Maintain low-impact aerobic mobility (swimming, stationary cycling)',
      'Consult rheumatologist regarding early DMARD disease-modifying therapy'
    ]
  },
  {
    id: 'rhinitis',
    name: 'Allergic Rhinosinusitis & Upper Airway Reactivity',
    symptoms: ['runny_nose', 'sore_throat', 'headache_throbbing', 'fatigue', 'cough_dry'],
    coreSymptoms: ['runny_nose', 'sore_throat'],
    supportingSymptoms: ['headache_throbbing', 'fatigue', 'cough_dry'],
    baseConfidence: 91,
    riskLevel: 'Low',
    description: 'IgE-mediated inflammation of nasal mucosal tissues triggered by inhalant allergens like dust mites and pollen.',
    specialist: 'Allergist / ENT Specialist',
    differentiationNote: 'Prominent sneezing and clear watery rhinorrhea in the absence of high fever or purulent pulmonary sputum.',
    precautions: [
      'Perform saline nasal irrigation to clear mucosal allergens',
      'Utilize second-generation non-sedating oral antihistamines or intranasal steroids',
      'Use HEPA air purifiers in sleeping quarters and wash bedding in hot water',
      'Monitor seasonal pollen forecasts before outdoor activities'
    ]
  }
];

export const HOSPITALS_DATA: HospitalFacility[] = [
  {
    id: 'hosp-1',
    name: 'City Apex Multi-Specialty & Trauma Hospital',
    type: 'Hospital',
    distanceKm: 1.2,
    address: '42 Healthway Boulevard, Medical Center District',
    phone: '+1 (555) 234-5678',
    rating: 4.8,
    open24x7: true,
    icuAvailable: true,
    emergencyBeds: 18,
    specialties: ['Emergency Trauma', 'Cardiology', 'Neurology', 'Pulmonology', 'Critical Care'],
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 'hosp-2',
    name: 'St. Jude Healthcare & Cardiac Institute',
    type: 'Hospital',
    distanceKm: 2.7,
    address: '108 Metro Wellness Avenue',
    phone: '+1 (555) 345-6789',
    rating: 4.9,
    open24x7: true,
    icuAvailable: true,
    emergencyBeds: 12,
    specialties: ['Interventional Cardiology', 'Cardiothoracic Surgery', 'Cath Lab', 'Stroke Unit'],
    coordinates: { lat: 19.0820, lng: 72.8850 }
  },
  {
    id: 'hosp-3',
    name: 'Community Care Urgent Clinic',
    type: 'Clinic',
    distanceKm: 0.8,
    address: '15 Sunrise Crossroad, Suite 2B',
    phone: '+1 (555) 456-7890',
    rating: 4.6,
    open24x7: false,
    icuAvailable: false,
    emergencyBeds: 4,
    specialties: ['General Medicine', 'Pediatrics', 'Rapid Lab Testing', 'Minor Wound Dressing'],
    coordinates: { lat: 19.0710, lng: 72.8720 }
  },
  {
    id: 'hosp-4',
    name: 'MedPlus 24/7 Super Pharmacy & Dispensary',
    type: 'Pharmacy',
    distanceKm: 0.4,
    address: '7 Green Park Circle, Opp. Central Station',
    phone: '+1 (555) 567-8901',
    rating: 4.7,
    open24x7: true,
    icuAvailable: false,
    emergencyBeds: 0,
    specialties: ['Emergency Medicines', 'Insulin Supplies', 'Oxygen Cylinders', 'Nebulizers'],
    coordinates: { lat: 19.0745, lng: 72.8740 }
  },
  {
    id: 'hosp-5',
    name: 'Universal Regional Trauma & Surgical Hospital',
    type: 'Trauma Center',
    distanceKm: 3.5,
    address: '220 Expressway North Access',
    phone: '+1 (555) 678-9012',
    rating: 4.7,
    open24x7: true,
    icuAvailable: true,
    emergencyBeds: 24,
    specialties: ['Level 1 Trauma', 'Orthopedic Surgery', 'Burn Unit', 'Blood Bank'],
    coordinates: { lat: 19.0910, lng: 72.8680 }
  },
  {
    id: 'hosp-6',
    name: 'Evergreen Family Wellness & Diagnostic Center',
    type: 'Clinic',
    distanceKm: 1.9,
    address: '88 Oakwood Street',
    phone: '+1 (555) 789-0123',
    rating: 4.5,
    open24x7: false,
    icuAvailable: false,
    emergencyBeds: 2,
    specialties: ['Preventive Health Checkups', 'Ultrasound & X-Ray', 'Diabetic Consultation'],
    coordinates: { lat: 19.0680, lng: 72.8810 }
  }
];

export const SAMPLE_DIET_PLANS: Record<string, DailyDietPlan> = {
  'Balanced Maintenance': {
    id: 'diet-balanced',
    title: 'Whole-Food Mediterranean Balance',
    goal: 'Balanced Maintenance',
    dietType: 'Standard',
    targetCalories: 2050,
    targetWaterLiters: 3.0,
    meals: [
      {
        type: 'Breakfast',
        title: 'Steel-Cut Oats with Berries & Walnuts',
        calories: 420,
        proteinG: 16,
        carbsG: 62,
        fatG: 14,
        ingredients: ['1/2 cup steel-cut oats', '1 cup almond milk', '1/2 cup fresh blueberries', '1 tbsp chia seeds', '8 crushed walnuts'],
        instructions: 'Simmer oats in almond milk for 12 minutes. Top with blueberries, walnuts, and a dusting of cinnamon.'
      },
      {
        type: 'Lunch',
        title: 'Grilled Lemon Herb Chicken & Quinoa Bowl',
        calories: 580,
        proteinG: 46,
        carbsG: 55,
        fatG: 18,
        ingredients: ['180g lean chicken breast', '3/4 cup cooked tricolor quinoa', '1 cup baby spinach', 'Cucumber, cherry tomatoes', '1 tbsp extra virgin olive oil'],
        instructions: 'Grill marinated chicken for 6-8 mins per side. Serve warm over tossed quinoa, fresh greens, and olive oil vinaigrette.'
      },
      {
        type: 'Snacks',
        title: 'Greek Yogurt with Flaxseeds & Green Apple',
        calories: 230,
        proteinG: 18,
        carbsG: 26,
        fatG: 5,
        ingredients: ['1 cup plain low-fat Greek yogurt', '1 tbsp ground flaxseeds', '1 sliced crisp green apple'],
        instructions: 'Mix yogurt with flaxseeds and serve with chilled apple slices for dietary fiber.'
      },
      {
        type: 'Dinner',
        title: 'Baked Atlantic Salmon with Roasted Asparagus & Sweet Potato',
        calories: 620,
        proteinG: 42,
        carbsG: 48,
        fatG: 24,
        ingredients: ['170g wild salmon fillet', '1 bunch fresh asparagus spears', '1 medium roasted sweet potato', 'Garlic, rosemary, lemon'],
        instructions: 'Bake salmon and asparagus at 200°C (400°F) for 15 minutes. Serve with steamed sweet potato.'
      }
    ],
    tips: [
      'Drink 500ml water immediately upon waking',
      'Aim for at least 30g dietary fiber across meals',
      'Finish your last meal at least 2.5 hours prior to bedtime'
    ],
    userRating: 5
  },
  'Weight Loss': {
    id: 'diet-loss',
    title: 'High-Protein Caloric Deficit Plan',
    goal: 'Weight Loss',
    dietType: 'Standard',
    targetCalories: 1650,
    targetWaterLiters: 3.5,
    meals: [
      {
        type: 'Breakfast',
        title: 'Spinach & Egg White Scramble with Avocado Toast',
        calories: 340,
        proteinG: 28,
        carbsG: 24,
        fatG: 12,
        ingredients: ['4 egg whites + 1 whole egg', '2 cups baby spinach', '1 slice sprouted whole grain bread', '1/4 mashed avocado'],
        instructions: 'Scramble eggs with spinach until fluffy. Serve with toasted sprouted bread and mashed avocado.'
      },
      {
        type: 'Lunch',
        title: 'Zesty Tuna & White Bean Salad',
        calories: 450,
        proteinG: 44,
        carbsG: 38,
        fatG: 9,
        ingredients: ['1 can albacore tuna in spring water', '1/2 cup cannellini beans', 'Diced red onion, celery, parsley', 'Lemon juice & Dijon dressing'],
        instructions: 'Drain tuna and beans, combine with fresh vegetables, and toss with lemon-Dijon vinaigrette.'
      },
      {
        type: 'Snacks',
        title: 'Cottage Cheese with Cucumber Slices',
        calories: 160,
        proteinG: 22,
        carbsG: 8,
        fatG: 3,
        ingredients: ['3/4 cup low-fat cottage cheese', '1 cup sliced English cucumber', 'Black pepper & sea salt'],
        instructions: 'Top creamy cottage cheese with freshly cracked pepper and crunchy cucumber rounds.'
      },
      {
        type: 'Dinner',
        title: 'Herb-Roasted Turkey Breast with Garlic Cauliflower Mash',
        calories: 520,
        proteinG: 50,
        carbsG: 22,
        fatG: 16,
        ingredients: ['200g lean turkey breast', '2 cups steamed cauliflower', '1 tsp olive oil', 'Steamed green beans'],
        instructions: 'Puree steamed cauliflower with roasted garlic and oil until velvety. Serve alongside roasted turkey breast.'
      }
    ],
    tips: [
      'Keep protein high to preserve lean muscle during calorie deficit',
      'Drink 1 glass of water 15 minutes before lunch and dinner',
      'Avoid high-sugar fruit juices and sodas'
    ],
    userRating: 4
  },
  'Diabetic Friendly': {
    id: 'diet-diabetic',
    title: 'Low Glycemic Index & Glucose Stabilization Plan',
    goal: 'Diabetic Friendly',
    dietType: 'Standard',
    targetCalories: 1800,
    targetWaterLiters: 3.0,
    meals: [
      {
        type: 'Breakfast',
        title: 'Chia Seed & Cinnamon Pudding with Walnuts',
        calories: 360,
        proteinG: 14,
        carbsG: 20,
        fatG: 22,
        ingredients: ['3 tbsp chia seeds', '1 cup unsweetened almond milk', '1/2 tsp Ceylon cinnamon', 'Handful of raw crushed walnuts'],
        instructions: 'Soak chia seeds overnight in cinnamon almond milk. Top with walnuts for healthy omega-3 fats and steady morning glycemic index.'
      },
      {
        type: 'Lunch',
        title: 'Lentil & Kale Detox Stew with Tofu',
        calories: 480,
        proteinG: 32,
        carbsG: 52,
        fatG: 12,
        ingredients: ['3/4 cup cooked brown lentils', '120g firm organic tofu cubes', '2 cups shredded Tuscan kale', 'Cumin, turmeric, ginger'],
        instructions: 'Simmer lentils and vegetables in aromatic spiced broth. Protein and fiber slow carbohydrate absorption.'
      },
      {
        type: 'Snacks',
        title: 'Roasted Spiced Edamame Beans',
        calories: 180,
        proteinG: 17,
        carbsG: 12,
        fatG: 7,
        ingredients: ['1 cup steamed shelled edamame', 'Sea salt, paprika, lemon zest'],
        instructions: 'Toss warm edamame in spices for a high-protein, zero-sugar afternoon snack.'
      },
      {
        type: 'Dinner',
        title: 'Wild Cod Fillet with Sautéed Broccolini & Wild Rice',
        calories: 520,
        proteinG: 44,
        carbsG: 38,
        fatG: 14,
        ingredients: ['190g Pacific cod fillet', '1.5 cups sautéed broccolini in olive oil', '1/2 cup cooked nutty wild rice', 'Lemon slices'],
        instructions: 'Pan-sear cod for 4 minutes per side until flaky. Pair with steamed broccolini and low-GI wild rice.'
      }
    ],
    tips: [
      'Prioritize complex carbohydrates with soluble fiber',
      'Distribute carbohydrate intake evenly across 3 main meals',
      'Test pre-prandial and post-prandial blood sugar levels consistently'
    ],
    userRating: 5
  }
};

export const INITIAL_HEALTH_RECORDS: HealthRecordEntry[] = [
  {
    id: 'rec-1',
    date: '2026-11-08',
    category: 'Vitals Log',
    title: 'Routine Morning Vitals',
    summary: 'Blood pressure within optimal limits, fasting glucose steady.',
    metrics: {
      systolicBP: 118,
      diastolicBP: 76,
      bloodSugar: 94,
      heartRate: 68,
      weightKg: 70.2,
      bmi: 22.8
    },
    notes: 'Feeling energetic, completed morning brisk walk.'
  },
  {
    id: 'rec-2',
    date: '2026-11-04',
    category: 'Specialized ML',
    title: 'Diabetes Risk Model Assessment',
    summary: 'Assessed at Low Risk (14% probability) based on glycemic and BMI metrics.',
    metrics: {
      bloodSugar: 98,
      bmi: 23.0
    },
    notes: 'Model evaluated Fasting BS, Age, BMI, and Blood Pressure.'
  },
  {
    id: 'rec-3',
    date: '2026-10-28',
    category: 'Symptom Check',
    title: 'Mild Seasonal Rhinitis Evaluation',
    summary: 'Symptoms: Runny nose, mild fatigue. Model predicted Common Rhinitis with 92% confidence.',
    notes: 'Prescribed hydration, steam inhalation, and vitamin C.'
  }
];

export const SAMPLE_VISION_CASES: Record<string, VisionModelResult> = {
  'skin_rash': {
    condition: 'Acute Contact Dermatitis / Eczema Patch',
    confidence: 94.2,
    category: 'Dermatological',
    severity: 'Mild',
    findings: [
      'Localized erythema with characteristic micro-vesicular pattern',
      'Epidermal barrier disruption consistent with allergen or irritant trigger',
      'No signs of bacterial cellulitis or deep ulceration'
    ],
    recommendation: 'Apply gentle hypoallergenic emollient cream twice daily. Avoid scented soaps and harsh chemicals. If pruritus worsens, consult a dermatologist.'
  },
  'xray_normal': {
    condition: 'Clear Pulmonary Fields (Chest Radiograph)',
    confidence: 96.8,
    category: 'Radiological',
    severity: 'Mild',
    findings: [
      'Bilateral lung parenchyma clear of focal consolidations or infiltrates',
      'Cardiothoracic ratio within normal physiological limits (<50%)',
      'Costophrenic angles sharp; no pleural effusion detected'
    ],
    recommendation: 'Radiological screening shows healthy thoracic cavity. Continue routine annual health reviews.'
  },
  'mole_benign': {
    condition: 'Benign Melanocytic Nevus',
    confidence: 91.5,
    category: 'Dermatological',
    severity: 'Mild',
    findings: [
      'Symmetric architectural border with homogenous pigment distribution',
      'Diameter < 5mm, complying with ABCDE dermatoscopic guidelines',
      'Absence of atypical pigment network or irregular vascularization'
    ],
    recommendation: 'Lesion exhibits benign dermatoscopic characteristics. Perform self-skin checks monthly and apply broad-spectrum SPF 50+.'
  }
};

export const SAMPLE_AUDIO_CASES: Record<string, AudioModelResult> = {
  'normal_breath': {
    classification: 'Normal Vesicular Breath Sound Profile',
    confidence: 95.4,
    breathingPattern: 'Normal Vesicular',
    riskScore: 8,
    clinicalObservations: [
      'Acoustic spectral density matches standard alveolar airflow dynamics',
      'Inspiratory to expiratory sound ratio normal (3:1)',
      'Absence of adventitious adventitious acoustic spikes'
    ],
    suggestedAction: 'Respiratory acoustics indicate clear airways. No clinical interventions necessary.'
  },
  'wheezing': {
    classification: 'Expiratory Wheeze Sound Pattern (Reactive Airway)',
    confidence: 91.8,
    breathingPattern: 'Wheezing Detected',
    riskScore: 68,
    clinicalObservations: [
      'Continuous high-pitched musical sounds during terminal expiration (300-800 Hz)',
      'Narrowed bronchial airway lumen signature detected',
      'Acoustic energy concentrated in expiratory phase'
    ],
    suggestedAction: 'Indicates bronchial bronchospasm or asthmatic airway reactivity. Use prescribed bronchodilator inhaler if previously diagnosed, or consult a pulmonologist.'
  },
  'bronchitic_cough': {
    classification: 'Deep Productive Cough with Bronchial Resonance',
    confidence: 88.6,
    breathingPattern: 'Dry Cough Paroxysm',
    riskScore: 54,
    clinicalObservations: [
      'Low-frequency coarse explosive cough acoustic envelope (150-350 Hz)',
      'Elevated mucosal vibration frequency in trachea-bronchial tree',
      'Repetitive coughing burst cycles noted'
    ],
    suggestedAction: 'Suggestive of acute tracheobronchitis. Maintain warm oral hydration, avoid air pollutants, and monitor temperature.'
  }
};
