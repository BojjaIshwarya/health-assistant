import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  User, 
  Calendar, 
  Activity 
} from 'lucide-react';
import { UserProfile, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import { findUserByEmail, saveUser, calculateBMI } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  language: SupportedLanguage;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  language,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state - reset when opened so it always shows light default placeholders
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAge, setRegAge] = useState<number | ''>(28);
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('female');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');
  const [regHeight, setRegHeight] = useState<number | ''>(168);
  const [regWeight, setRegWeight] = useState<number | ''>(62);

  // Reset inputs on modal open so previous login credentials are NOT remembered!
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
      setLoginEmail('');
      setLoginPassword('');
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrimmed = loginEmail.trim();
    if (!emailTrimmed) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    const existingUser = findUserByEmail(emailTrimmed);

    // Requirement:
    // "if the user not registered previously then it should say account not found please register like message then we will register after that again login"
    if (!existingUser) {
      setErrorMsg(t.accountNotFound);
      return;
    }

    if (existingUser.password && existingUser.password !== loginPassword) {
      setErrorMsg(t.invalidCredentials);
      return;
    }

    // Success: clear inputs and notify parent
    setLoginEmail('');
    setLoginPassword('');
    onLoginSuccess(existingUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailTrimmed = regEmail.trim();
    if (!regName.trim() || !emailTrimmed || !regPassword) {
      setErrorMsg('Please fill in all required credentials.');
      return;
    }

    const existingUser = findUserByEmail(emailTrimmed);
    if (existingUser) {
      setErrorMsg('An account with this email is already registered. Please log in.');
      return;
    }

    const height = typeof regHeight === 'number' ? regHeight : 170;
    const weight = typeof regWeight === 'number' ? regWeight : 65;
    const bmi = calculateBMI(height, weight);

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: regName.trim(),
      email: emailTrimmed,
      password: regPassword,
      age: typeof regAge === 'number' ? regAge : 25,
      gender: regGender,
      bloodGroup: regBloodGroup,
      heightCm: height,
      weightKg: weight,
      bmi: bmi,
      registeredAt: new Date().toISOString().split('T')[0],
      medicalHistory: [],
      allergies: [],
    };

    saveUser(newUser);

    // Show success message and transition back to login so user can log in
    setSuccessMsg(t.registrationSuccess);
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-fadeIn">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-2xl font-bold">
            {mode === 'login' ? t.loginTitle : t.registerTitle}
          </h3>
          <p className="text-teal-100 text-xs mt-1">
            {mode === 'login' ? t.loginSubtitle : t.registerSubtitle}
          </p>

          {/* Toggle Tabs */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-teal-950/30 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-teal-100 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.login}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-teal-100 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.register}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1">
                <p className="font-semibold">{errorMsg}</p>
                {mode === 'login' && errorMsg.includes(t.accountNotFound.slice(0, 10)) && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setRegEmail(loginEmail);
                      setErrorMsg(null);
                    }}
                    className="mt-2 text-xs font-bold text-teal-700 underline hover:text-teal-900 cursor-pointer block"
                  >
                    👉 Click here to register your account
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <p className="font-semibold">{successMsg}</p>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 placeholder:text-slate-300 focus:placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-slate-200 placeholder:text-slate-300 focus:placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                  {/* Unlock toggle button: clicking reveals password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                    title={showPassword ? "Lock password" : "Unlock / Show password"}
                  >
                    {showPassword ? <Unlock className="w-4 h-4 text-teal-600" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.login}</span>
              </button>

              <div className="text-center pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">{t.dontHaveAccount} </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                >
                  {t.register}
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t.fullName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 placeholder:text-slate-300 focus:placeholder-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.email} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-200 placeholder:text-slate-300 focus:placeholder-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.password} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="w-full pl-10 pr-10 py-2 text-sm rounded-xl border border-slate-200 placeholder:text-slate-300 focus:placeholder-transparent focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-2 p-1 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                      title={showRegPassword ? "Lock password" : "Unlock / Show password"}
                    >
                      {showRegPassword ? <Unlock className="w-3.5 h-3.5 text-teal-600" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.age} *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={regAge}
                      onChange={(e) => setRegAge(Number(e.target.value))}
                      className="w-full pl-9 pr-2 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.gender}
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.bloodGroup}
                  </label>
                  <select
                    value={regBloodGroup}
                    onChange={(e) => setRegBloodGroup(e.target.value)}
                    className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.height}
                  </label>
                  <input
                    type="number"
                    min={60}
                    max={250}
                    value={regHeight}
                    onChange={(e) => setRegHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    {t.weight}
                  </label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={regWeight}
                    onChange={(e) => setRegWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-md shadow-teal-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t.register} &amp; Proceed to Login</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">{t.alreadyHaveAccount} </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-xs font-bold text-teal-600 hover:underline cursor-pointer"
                >
                  {t.login}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
