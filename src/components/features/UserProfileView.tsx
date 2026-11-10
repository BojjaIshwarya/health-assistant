import React, { useState } from 'react';
import { 
  ArrowLeft, 
  UserCheck, 
  ShieldCheck, 
  Heart, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Lock,
  Phone,
  FileCheck
} from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { saveUser, calculateBMI, setCurrentUser, getBMICategory } from '../../services/storageService';

interface UserProfileViewProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onBack: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  language,
  currentUser,
  onUpdateUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [name, setName] = useState(currentUser.name);
  const [age, setAge] = useState(currentUser.age);
  const [gender, setGender] = useState(currentUser.gender);
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup);
  const [heightCm, setHeightCm] = useState(currentUser.heightCm);
  const [weightKg, setWeightKg] = useState(currentUser.weightKg);
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser.emergencyContactName || 'David Morgan');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(currentUser.emergencyContactPhone || '+1 (555) 987-6543');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const bmi = calculateBMI(heightCm, weightKg);
  const bmiInfo = getBMICategory(bmi);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name: name.trim(),
      age,
      gender,
      bloodGroup,
      heightCm,
      weightKg,
      bmi,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
    };

    saveUser(updated);
    setCurrentUser(updated);
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
                {t.myProfile}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                Health ID #{currentUser.id.slice(-6)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal physiological baseline, emergency contact, and security parameters.
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted Profile Isolation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Edit Form */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          
          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile metrics updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              1. Personal Demographic Baseline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address (Login ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-teal-800"
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  required
                  min={60}
                  max={250}
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  required
                  min={20}
                  max={300}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 pt-4">
              2. Emergency Medical Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Emergency Phone Number
                </label>
                <input
                  type="text"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-7 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>

        </div>

        {/* Right: Summary Card */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-teal-500/20">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Calculated BMI:</span>
                <span className="font-bold text-slate-900">{bmi}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Classification:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${bmiInfo.color}`}>
                  {bmiInfo.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Type:</span>
                <span className="font-bold text-rose-600">{currentUser.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered:</span>
                <span className="font-bold text-slate-700">{currentUser.registeredAt}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
              <h4 className="text-sm font-bold">Secure Health Vault</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your patient health data, symptoms evaluations, and biometric telemetry are cryptographically secured using AES-256 protocols.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
