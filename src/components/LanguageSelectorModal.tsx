import React, { useState } from 'react';
import { Globe, Check, Sparkles } from 'lucide-react';
import { LANGUAGES, TRANSLATIONS } from '../translations';
import { SupportedLanguage } from '../types';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  currentLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  isInitialSelection?: boolean;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  currentLanguage,
  onSelectLanguage,
  isInitialSelection = false,
}) => {
  const [selected, setSelected] = useState<SupportedLanguage>(currentLanguage);

  if (!isOpen) return null;

  const t = TRANSLATIONS[selected];

  const handleConfirm = () => {
    onSelectLanguage(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 transition-all animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="h-2.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600" />

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
              <Globe className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-teal-100/70 text-teal-800">
                  Multilingual Health System
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 12 Indian Languages
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {t.selectLanguage}
              </h2>
            </div>
          </div>

          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            {t.selectLanguageDesc}
          </p>

          {/* Languages Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1 pr-2 scrollbar-thin">
            {LANGUAGES.map((lang) => {
              const isCurrent = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelected(lang.code)}
                  className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'border-teal-500 bg-teal-50/60 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between w-full mb-1">
                    <span className="text-2xl">{lang.flag}</span>
                    {isCurrent && (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-base font-bold text-slate-900 block group-hover:text-teal-700 transition-colors">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {lang.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Confirm Button */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Selected: <strong className="text-slate-800">{LANGUAGES.find(l => l.code === selected)?.name}</strong> ({LANGUAGES.find(l => l.code === selected)?.nativeName})
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium shadow-md shadow-teal-600/20 hover:from-teal-700 hover:to-cyan-700 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t.continueBtn}</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
