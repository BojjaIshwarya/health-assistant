import React from 'react';
import { 
  Stethoscope, 
  MessageSquareHeart, 
  Building2, 
  UtensilsCrossed, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  HeartPulse
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';

interface HomePageProps {
  language: SupportedLanguage;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  language,
  onOpenLogin,
  onOpenRegister,
}) => {
  const t = TRANSLATIONS[language];

  // Core services without any accuracy percentages or tech labels
  const coreServicesList = [
    {
      title: t.symptomChecker,
      desc: 'Analyze symptoms and evaluate health conditions with guided precautions and specialist recommendations.',
      icon: Stethoscope,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: t.healthChatbot,
      desc: 'Interactive 24/7 medical assistant for health queries, medication questions, and personalized wellness tips.',
      icon: MessageSquareHeart,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: t.hospitalFinder,
      desc: 'Find nearby medical facilities, clinics, and pharmacies with distance calculation and emergency direct contact.',
      icon: Building2,
      color: 'from-rose-500 to-red-600',
    },
    {
      title: t.dietPlanner,
      desc: 'Personalized meal suggestions and nutritional schedules tailored to your individual health profile and dietary goals.',
      icon: UtensilsCrossed,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: t.healthRecords,
      desc: 'Keep track of your complete health history, symptoms checks, and vitals securely in one accessible place.',
      icon: FileText,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: t.securePrivate,
      desc: 'Your private health information and medical records remain protected with secure user authentication.',
      icon: ShieldCheck,
      color: 'from-teal-500 to-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.2]">
              {t.homeHeroTitle}
            </h1>
            
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              {t.homeHeroSubtitle}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={onOpenRegister}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-base shadow-lg shadow-teal-600/25 hover:from-teal-700 hover:to-cyan-700 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t.getStarted}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-slate-800 font-semibold text-base border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t.login}</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Core Services Grid */}
      <section className="py-10 bg-slate-50/70 border-t border-slate-100 rounded-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.coreServices}
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              {t.coreServicesSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreServicesList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr mb-4 shadow-xs" style={{ background: 'linear-gradient(to top right, #0d9488, #06b6d4)' }}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t.explore}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
};
