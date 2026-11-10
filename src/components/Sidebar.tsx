import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  MessageSquareHeart, 
  Building2, 
  UtensilsCrossed, 
  FileText, 
  Watch, 
  Eye, 
  Smile, 
  UserCheck, 
  ChevronRight, 
  X, 
  Heart
} from 'lucide-react';
import { ActiveView, SupportedLanguage, UserProfile, ThemeMode } from '../types';
import { TRANSLATIONS } from '../translations';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  language: SupportedLanguage;
  currentUser: UserProfile | null;
  theme: ThemeMode;
  onToggleTheme: (theme: ThemeMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeView,
  onSelectView,
  language,
  currentUser,
  theme,
  onToggleTheme,
}) => {
  const t = TRANSLATIONS[language];
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // All features with NO accuracy mentions
  const menuItems = [
    {
      id: 'dashboard' as ActiveView,
      label: t.dashboard,
      icon: LayoutDashboard,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      id: 'symptom-checker' as ActiveView,
      label: t.symptomChecker,
      icon: Stethoscope,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'health-chatbot' as ActiveView,
      label: t.healthChatbot,
      icon: MessageSquareHeart,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'hospital-finder' as ActiveView,
      label: t.hospitalFinder,
      icon: Building2,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'diet-planner' as ActiveView,
      label: t.dietPlanner,
      icon: UtensilsCrossed,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'health-records' as ActiveView,
      label: t.healthRecords,
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'wearables-iot' as ActiveView,
      label: t.wearablesIoT,
      icon: Watch,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'vision-audio' as ActiveView,
      label: t.visionAudioModels,
      icon: Eye,
      color: 'text-cyan-600 bg-cyan-50',
    },
    {
      id: 'emotion-sentiment' as ActiveView,
      label: t.emotionSentiment,
      icon: Smile,
      color: 'text-pink-600 bg-pink-50',
    },
    {
      id: 'profile' as ActiveView,
      label: t.myProfile,
      icon: UserCheck,
      color: 'text-slate-600 bg-slate-100',
    },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      const currentX = e.touches[0].clientX;
      if (touchStartX - currentX > 75) {
        onClose();
        setTouchStartX(null);
      }
    }
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header: Renamed from Healthcare suite / all modules active */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              {t.portalTitle}
            </h2>
            <span className="text-[11px] text-teal-700 font-medium">
              {t.portalTagline}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>


        {/* Navigation Items List - NO "Core Modules" header and NO accuracies mentioned */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full group text-left px-3.5 py-3 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                  isActive
                    ? 'bg-teal-600 text-white font-medium shadow-sm shadow-teal-600/30'
                    : 'text-slate-700 hover:bg-slate-100/90 hover:text-teal-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-white/20 text-white' : item.color
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs sm:text-sm font-semibold truncate">
                    {item.label}
                  </span>
                </div>

                <ChevronRight className={`w-3.5 h-3.5 opacity-60 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Footer with Lighting Mode Switcher */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Lighting Mode:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === 'light' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                title="Light Mode (Daylight)"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === 'dark' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                title="Dark Mode (Night)"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onToggleTheme('warm')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === 'warm' ? 'bg-teal-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                title="Warm Mode (Eye Care)"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 text-xs font-medium pt-1">
            <Heart className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{t.personalHealthAssistant}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
