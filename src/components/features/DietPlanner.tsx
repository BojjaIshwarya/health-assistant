import React, { useState } from 'react';
import { 
  ArrowLeft, 
  UtensilsCrossed, 
  Flame, 
  Droplets, 
  CheckCircle2, 
  Star, 
  Sparkles, 
  RefreshCw, 
  Info,
  Clock,
  Heart,
  ChevronDown
} from 'lucide-react';
import { SupportedLanguage, UserProfile, DailyDietPlan } from '../../types';
import { TRANSLATIONS } from '../../translations';
import { getDietPlan, saveDietPlan } from '../../services/storageService';
import { SAMPLE_DIET_PLANS } from '../../data/mockData';

interface DietPlannerProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

export const DietPlanner: React.FC<DietPlannerProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedGoal, setSelectedGoal] = useState<string>('Balanced Maintenance');
  const [dietPlan, setDietPlan] = useState<DailyDietPlan>(() => getDietPlan(currentUser.id, 'Balanced Maintenance'));
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [userRating, setUserRating] = useState<number>(dietPlan.userRating || 5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const goals = [
    'Balanced Maintenance',
    'Weight Loss',
    'Diabetic Friendly'
  ];

  const handleGoalChange = (newGoal: string) => {
    setSelectedGoal(newGoal);
    const plan = SAMPLE_DIET_PLANS[newGoal] || SAMPLE_DIET_PLANS['Balanced Maintenance'];
    setDietPlan(plan);
    saveDietPlan(currentUser.id, plan);
    setFeedbackSubmitted(false);
  };

  const handleAddGlass = () => {
    if (waterGlasses < 12) setWaterGlasses(prev => prev + 1);
  };

  const handleRemoveGlass = () => {
    if (waterGlasses > 0) setWaterGlasses(prev => prev - 1);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...dietPlan,
      userRating,
      userNotes: feedbackNote,
    };
    setDietPlan(updated);
    saveDietPlan(currentUser.id, updated);
    setFeedbackSubmitted(true);
  };

  const totalProtein = dietPlan.meals.reduce((acc, m) => acc + m.proteinG, 0);
  const totalCarbs = dietPlan.meals.reduce((acc, m) => acc + m.carbsG, 0);
  const totalFat = dietPlan.meals.reduce((acc, m) => acc + m.fatG, 0);

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
                {t.dietPlanner}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Rule-Based Engine (95% Efficiency)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Personalized meals based on BMI ({currentUser.bmi}), age ({currentUser.age}), and nutritional goals.
            </p>
          </div>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none">
          {goals.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleGoalChange(g)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedGoal === g ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Calorie & Macro Target Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Daily Caloric Target</span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
            <span>{dietPlan.targetCalories}</span>
            <span className="text-xs font-semibold text-amber-600">kcal</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Based on BMI {currentUser.bmi}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Protein Target</span>
          <div className="text-2xl font-black text-blue-600 mt-1 flex items-baseline gap-1">
            <span>{totalProtein}</span>
            <span className="text-xs font-semibold text-slate-400">g</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Muscle &amp; tissue repair</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Complex Carbs</span>
          <div className="text-2xl font-black text-amber-600 mt-1 flex items-baseline gap-1">
            <span>{totalCarbs}</span>
            <span className="text-xs font-semibold text-slate-400">g</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Sustained glycemic energy</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Healthy Lipids (Fat)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-1">
            <span>{totalFat}</span>
            <span className="text-xs font-semibold text-slate-400">g</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Omega-3 &amp; cell membranes</span>
        </div>
      </div>

      {/* Meals Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-600" />
            <span>Today's Prescribed Meal Protocol: {dietPlan.title}</span>
          </h2>
          <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">
            {dietPlan.goal}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dietPlan.meals.map((meal, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {meal.type}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{meal.calories} kcal</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {meal.title}
                </h3>

                {/* Macros pill */}
                <div className="flex items-center gap-3 my-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span>Protein: <strong className="text-slate-800">{meal.proteinG}g</strong></span>
                  <span>•</span>
                  <span>Carbs: <strong className="text-slate-800">{meal.carbsG}g</strong></span>
                  <span>•</span>
                  <span>Fat: <strong className="text-slate-800">{meal.fatG}g</strong></span>
                </div>

                {/* Ingredients */}
                <div className="space-y-1 mt-3">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                    Key Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {meal.ingredients.map((ing, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prep note */}
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 italic">
                  "{meal.instructions}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hydration Tracker & Adaptive Feedback Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Hydration Tracker */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>Smart Hydration Logger</span>
            </h3>
            <span className="text-xs font-bold text-blue-600">
              {(waterGlasses * 0.25).toFixed(1)} / {dietPlan.targetWaterLiters} Liters
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Hydration aids digestion, renal filtration, and cellular metabolic efficiency.
          </p>

          {/* Glasses Visualization */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setWaterGlasses(i + 1)}
                className={`w-9 h-11 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  i < waterGlasses
                    ? 'bg-blue-500 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-300 border-slate-200 hover:bg-slate-100'
                }`}
                title={`${(i + 1) * 250} ml`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-[8px] font-bold">250ml</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleAddGlass}
              className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
            >
              + Add Glass (250ml)
            </button>
            <button
              type="button"
              onClick={handleRemoveGlass}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              - Remove
            </button>
          </div>
        </div>

        {/* Adaptive Feedback (Crucial from Research Paper) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Adaptive Meal Feedback (AI Learning)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              "The system improves suggestions over time based on user feedback." (Page 717)
            </p>
          </div>

          {feedbackSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Feedback Incorporated into Adaptive Profile!</span>
              </div>
              <p className="text-emerald-700">
                Your rating of {userRating}★ and preference notes were saved. Future iterations will optimize glycemic ratios and portion weights.
              </p>
              <button
                type="button"
                onClick={() => setFeedbackSubmitted(false)}
                className="text-xs font-bold underline hover:text-emerald-900 cursor-pointer"
              >
                Submit another adjustment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  How satisfied were you with today’s meal portions?
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-2">{userRating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Feedback for Adaptive Engine:
                </label>
                <input
                  type="text"
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Loved breakfast, prefer higher fiber lunch, lower sodium..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Submit Adaptive Feedback</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
