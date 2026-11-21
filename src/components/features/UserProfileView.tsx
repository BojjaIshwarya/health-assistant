import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  ShieldCheck,
  Phone,
  HeartHandshake,
  UserCheck,
} from 'lucide-react';
import { SupportedLanguage, UserProfile } from '../../types';
import { TRANSLATIONS } from '../../translations';
import {
  saveUser,
  calculateBMI,
  setCurrentUser,
  getBMICategory,
} from '../../services/storageService';
import profileCalmImg from '../../assets/images/profile_wellness_calm_1795259462150.jpg';

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
  const [allergiesText, setAllergiesText] = useState(
    (currentUser.allergies || []).join(', ')
  );
  const [healthNotesText, setHealthNotesText] = useState(
    (currentUser.medicalHistory || []).join(', ')
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    currentUser.emergencyContactName || ''
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    currentUser.emergencyContactPhone || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const bmi = calculateBMI(heightCm, weightKg);
  const bmiInfo = getBMICategory(bmi);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const medicalHistory = healthNotesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updated: UserProfile = {
      ...currentUser,
      name: name.trim(),
      age,
      gender,
      bloodGroup,
      heightCm,
      weightKg,
      bmi,
      allergies,
      medicalHistory,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
    };

    saveUser(updated);
    setCurrentUser(updated);
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
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
              {t.myProfile}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Keep your everyday details, allergies, and trusted contact up to date so guidance feels personal.
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Personal Profile Editor */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your health profile has been saved and updated everywhere.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Section 1: About You */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-600" />
                  <span>About You</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used to tailor daily calorie, water, and wellness suggestions.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white font-bold text-teal-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      required
                      min={60}
                      max={250}
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      required
                      min={20}
                      max={300}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Food Allergies & Health Notes */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-teal-600" />
                  <span>Allergies &amp; Health Notes</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Optional notes so your meal planner and chatbot remember what matters to you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Food or Medicine Allergies
                  </label>
                  <input
                    type="text"
                    value={allergiesText}
                    onChange={(e) => setAllergiesText(e.target.value)}
                    placeholder="e.g. Peanuts, Dairy, Penicillin"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ongoing Conditions or Care Notes
                  </label>
                  <input
                    type="text"
                    value={healthNotesText}
                    onChange={(e) => setHealthNotesText(e.target.value)}
                    placeholder="e.g. Mild asthma, Low sodium preference"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Trusted Emergency Contact */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>Trusted Emergency Contact</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  A family member or close friend you can reach quickly when needed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Family Member or Friend"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-7 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Peaceful Reflection Image & Personal Snapshot */}
        <div className="lg:col-span-4 space-y-5">
          {/* Peaceful Botanical Card with Quote */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
            <div className="h-44 w-full bg-gradient-to-br from-teal-50 to-amber-50">
              <img
                src={profileCalmImg}
                alt="Sunlit eucalyptus and linen table symbolizing calm daily self-care"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5 space-y-2">
              <p className="text-xs font-semibold text-teal-700">Daily Mindful Note</p>
              <blockquote className="text-sm font-semibold text-slate-900 leading-relaxed">
                &ldquo;Take care of your body; it is the gentle home you live in every single day.&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Clean Summary Snapshot */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
                {(name || currentUser.name).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {name || currentUser.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Body Balance (BMI)</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {bmi} · {bmiInfo.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Blood Group</span>
                <span className="font-bold text-rose-600">{bloodGroup}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Height / Weight</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  {heightCm} cm / {weightKg} kg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Member Since</span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  {currentUser.registeredAt}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>
                Your personal details stay private on your account and are never shared with anyone else.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
