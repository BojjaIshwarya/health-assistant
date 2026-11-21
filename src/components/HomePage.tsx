import React from 'react';
import {
  Stethoscope,
  MessageSquareHeart,
  Building2,
  UtensilsCrossed,
  FileText,
  Camera,
  ArrowRight,
} from 'lucide-react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../translations';
import wellnessHeroImg from '../assets/images/wellness_sanctuary_hero_1795259460501.jpg';
import healthJournalImg from '../assets/images/health_journal_calm_1795259461885.jpg';
import photoVoiceImg from '../assets/images/photo_voice_checkin_1795259460982.jpg';
import hopefulCareImg from '../assets/images/hopeful_care_hero_1795259462504.jpg';

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

  const coreServicesList = [
    {
      title: t.symptomChecker,
      desc: 'Check how you feel in plain, calm steps and get helpful care ideas and specialist suggestions.',
      icon: Stethoscope,
      image: hopefulCareImg,
      imageAlt: 'Calm sunlit botanical garden pathway bringing comfort and hope',
    },
    {
      title: t.healthChatbot,
      desc: 'Chat 24/7 by typing, speaking aloud, or sharing a photo—every visit starts fresh and saves safely.',
      icon: MessageSquareHeart,
      image: '/images/chatbot-assistant.svg',
      imageAlt: '24/7 multimodal health chatbot companion',
    },
    {
      title: t.hospitalFinder,
      desc: 'Find hospitals and clinics by name or neighborhood with custom distance control and directions.',
      icon: Building2,
      image: '/images/hospital-care.svg',
      imageAlt: 'Nearby hospital and emergency care locator',
    },
    {
      title: t.dietPlanner,
      desc: 'Build custom nourishing meal plans tailored to your favorite foods, allergies, and daily energy needs.',
      icon: UtensilsCrossed,
      image: '/images/nutrition-diet.svg',
      imageAlt: 'Personalized balanced nutrition and meal plan',
    },
    {
      title: t.healthRecords,
      desc: 'Keep your blood pressure, blood sugar, weight, and personal health notes in one peaceful timeline.',
      icon: FileText,
      image: healthJournalImg,
      imageAlt: 'Sunlit wellness notebook and glass carafe of lemon water',
    },
    {
      title: t.visionAudioModels,
      desc: 'Upload a skin or report photo or record a short voice or cough clip for gentle, everyday explanations.',
      icon: Camera,
      image: photoVoiceImg,
      imageAlt: 'Peaceful home corner with chamomile flowers for calm check-ins',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 pb-12">
      {/* Split Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-14 lg:pt-14 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 text-center lg:text-left">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-950 leading-[1.15] text-balance">
                {t.homeHeroTitle}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.homeHeroSubtitle}
              </p>

              <blockquote className="mt-4 text-sm italic text-teal-800 max-w-xl mx-auto lg:mx-0">
                &ldquo;A calm mind and clear guidance are the gentle first steps toward feeling better.&rdquo;
              </blockquote>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-base shadow-lg shadow-teal-600/25 hover:from-teal-700 hover:to-cyan-700 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>{t.getStarted}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-slate-800 font-semibold text-base border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <span>{t.login}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-white p-3 border border-slate-200/80 shadow-lg">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-amber-50 aspect-video">
                  <img
                    src={wellnessHeroImg}
                    alt="Morning sunlight with herbal tea and wellness journal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
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
            <p className="text-slate-600 text-sm mt-2">{t.coreServicesSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreServicesList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-full h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-slate-50 mb-4 border border-slate-100">
                      <img
                        src={item.image}
                        alt={item.imageAlt}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
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
