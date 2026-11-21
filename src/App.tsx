import React, { useState, useEffect } from 'react';
import { 
  SupportedLanguage, 
  UserProfile, 
  ActiveView,
  ThemeMode 
} from './types';
import { 
  getStoredLanguage, 
  setStoredLanguage, 
  getCurrentUser, 
  setCurrentUser as persistCurrentUser,
  getStoredTheme,
  setStoredTheme
} from './services/storageService';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './components/HomePage';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/DashboardView';

// Feature Views
import { SymptomChecker } from './components/features/SymptomChecker';
import { HealthChatbot } from './components/features/HealthChatbot';
import { HospitalFinder } from './components/features/HospitalFinder';
import { DietPlanner } from './components/features/DietPlanner';
import { HealthRecords } from './components/features/HealthRecords';
import { VisionAudioModels } from './components/features/VisionAudioModels';
import { UserProfileView } from './components/features/UserProfileView';

export default function App() {
  // Theme Lighting Mode ('light' | 'dark' | 'warm')
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  // Check stored language on launch; if null, show language selector modal first!
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return getStoredLanguage() || 'en';
  });
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(() => {
    return !getStoredLanguage();
  });

  // Active Authenticated User
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Navigation State
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Google Maps Platform Quota Banner State
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleGmpQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleGmpQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleGmpQuota);
  }, []);

  // Theme Change Handler
  const handleToggleTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setStoredTheme(newTheme);
  };

  // Language Change Handler
  const handleSelectLanguage = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setStoredLanguage(newLang);
    setIsLanguageModalOpen(false);
  };

  // Auth Handlers
  const handleOpenLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    persistCurrentUser(user);
    setIsAuthModalOpen(false);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    persistCurrentUser(null);
    setActiveView('dashboard');
  };

  // View Navigation
  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-teal-500 selection:text-white ${
      theme === 'dark' 
        ? 'theme-dark bg-[#090d16] text-slate-100' 
        : theme === 'warm' 
        ? 'theme-warm bg-[#f8f4ec] text-[#292524]' 
        : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* 1. Initial Language Selection Modal (Opens first if not set, or when user clicks language button) */}
      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* 2. Authentication Modal (Login with 'Account not found' alert, and Registration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        language={language}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Google Maps Platform Quota Notice */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 3. Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        language={language}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* 4. Sliding / Draggable Feature Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onSelectView={handleNavigate}
        language={language}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 5. Main Application Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        
        {!currentUser ? (
          /* Unauthenticated State: Beautiful Home Page with Research Architecture & Login/Register */
          <HomePage
            language={language}
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
          />
        ) : (
          /* Authenticated State: Dashboard or Specific Feature View */
          <>
            {activeView === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                language={language}
                onNavigate={handleNavigate}
                onOpenSidebar={() => setIsSidebarOpen(true)}
              />
            )}

            {activeView === 'symptom-checker' && (
              <SymptomChecker
                currentUser={currentUser}
                language={language}
                onBack={handleBackToDashboard}
              />
            )}

            {activeView === 'health-chatbot' && (
              <HealthChatbot
                currentUser={currentUser}
                language={language}
                onBack={handleBackToDashboard}
              />
            )}

            {activeView === 'hospital-finder' && (
              <HospitalFinder
                language={language}
                onBack={handleBackToDashboard}
              />
            )}

            {activeView === 'diet-planner' && (
              <DietPlanner
                currentUser={currentUser}
                language={language}
                onBack={handleBackToDashboard}
              />
            )}

            {activeView === 'health-records' && (
              <HealthRecords
                currentUser={currentUser}
                language={language}
                onBack={handleBackToDashboard}
              />
            )}

            {activeView === 'vision-audio' && (
              <VisionAudioModels
                currentUser={currentUser}
                language={language}
                onBack={handleBackToDashboard}
              />
            )}

            {activeView === 'profile' && (
              <UserProfileView
                currentUser={currentUser}
                language={language}
                onUpdateUser={(updated) => setCurrentUser(updated)}
                onBack={handleBackToDashboard}
              />
            )}
          </>
        )}

      </main>

    </div>
  );
}
