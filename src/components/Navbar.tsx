import React, { useState } from 'react';
import { 
  Activity, 
  Globe, 
  Menu, 
  LogIn, 
  UserPlus, 
  LogOut, 
  AlertCircle,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { UserProfile, SupportedLanguage, ThemeMode } from '../types';
import { TRANSLATIONS, LANGUAGES } from '../translations';

interface NavbarProps {
  currentUser: UserProfile | null;
  language: SupportedLanguage;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
  onOpenLanguageModal: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  language,
  theme,
  onToggleTheme,
  onOpenLanguageModal,
  onOpenLogin,
  onOpenRegister,
  onLogout,
  onToggleSidebar,
}) => {
  const t = TRANSLATIONS[language];
  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  const cycleTheme = () => {
    if (theme === 'light') onToggleTheme('dark');
    else if (theme === 'dark') onToggleTheme('warm');
    else onToggleTheme('light');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: 3-line icon only + Brand Logo */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-slate-700 hover:text-teal-600 hover:bg-teal-50 border border-slate-200/80 transition-all cursor-pointer flex items-center justify-center"
                title="Sidebar"
                aria-label="Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  HealthAssist<span className="text-teal-600">AI</span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  {t.brandTagline}
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Lighting Mode Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="p-2 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/50 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                title="Lighting Mode (Light / Dark / Warm)"
                aria-label="Lighting Mode"
              >
                {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
                {theme === 'dark' && <Moon className="w-4 h-4 text-cyan-400" />}
                {theme === 'warm' && <Sparkles className="w-4 h-4 text-amber-600" />}
                <span className="hidden md:inline capitalize text-[11px] font-bold">
                  {theme === 'warm' ? 'Warm Eye-Care' : theme}
                </span>
              </button>

              {/* Theme Popover Menu */}
              {showThemeMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowThemeMenu(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 space-y-1 animate-fadeIn">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleTheme('light');
                        setShowThemeMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                        theme === 'light' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light (Daylight)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleTheme('dark');
                        setShowThemeMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                        theme === 'dark' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span>Dark (Night)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleTheme('warm');
                        setShowThemeMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer ${
                        theme === 'warm' ? 'bg-teal-50 text-teal-800' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Warm (Eye Care)</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Language Switcher Pill - ONLY visible when user is NOT logged in */}
            {!currentUser && (
              <button
                type="button"
                onClick={onOpenLanguageModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>{currentLangObj.nativeName}</span>
              </button>
            )}

            {/* User state - Name ONLY in right corner */}
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-sm shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.name}
                    </div>
                  </div>
                </div>

                {/* Logout button with confirmation modal */}
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-teal-600 border border-slate-200 hover:border-teal-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.login}</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t.register}</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">
                {t.logoutConfirmTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {t.logoutConfirmDesc}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                {t.confirmLogout}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
