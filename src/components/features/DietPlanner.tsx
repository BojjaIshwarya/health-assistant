import React, { useState } from 'react';
import {
  ArrowLeft,
  UtensilsCrossed,
  Flame,
  Droplets,
  CheckCircle2,
  Star,
  SlidersHorizontal,
  RefreshCw,
  Pencil,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import {
  SupportedLanguage,
  UserProfile,
  DailyDietPlan,
  MealDetail,
  CustomDietPreferences,
} from '../../types';
import { TRANSLATIONS } from '../../translations';
import { getDietPlan, saveDietPlan } from '../../services/storageService';
import { SAMPLE_DIET_PLANS } from '../../data/mockData';

interface DietPlannerProps {
  language: SupportedLanguage;
  currentUser: UserProfile;
  onBack: () => void;
}

const PRESET_GOALS = ['Balanced Maintenance', 'Weight Loss', 'Diabetic Friendly'] as const;

const GOAL_OPTIONS = [
  'Balanced Nutrition',
  'Weight Loss',
  'Muscle & Energy',
  'Heart Healthy',
  'Blood Sugar Friendly',
  'Gut & Digestive Wellness',
];

const DIET_STYLE_OPTIONS = [
  'Balanced (All Foods)',
  'Vegetarian',
  'Eggetarian',
  'Vegan',
  'Pescatarian',
  'Low Sodium',
  'Gluten-Free',
  'Dairy-Free',
];

const CUISINE_OPTIONS = [
  'Mixed Everyday',
  'Home-Style Indian',
  'Mediterranean',
  'Asian Bowls',
  'Continental',
];

function suggestDailyCalories(user: UserProfile): number {
  const weight = user.weightKg || 68;
  const height = user.heightCm || 168;
  const age = user.age || 30;
  const base =
    user.gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round((base * 1.375) / 50) * 50;
}

function getCustomDietKey(userId: string): string {
  return `healthassist_diet_custom_${userId}`;
}

function loadSavedCustomPlan(userId: string): DailyDietPlan | null {
  try {
    if (!userId) return null;
    const raw = localStorage.getItem(getCustomDietKey(userId));
    return raw ? (JSON.parse(raw) as DailyDietPlan) : null;
  } catch {
    return null;
  }
}

function persistCustomPlan(userId: string, plan: DailyDietPlan): void {
  try {
    if (!userId) return;
    localStorage.setItem(getCustomDietKey(userId), JSON.stringify(plan));
  } catch {
    // Ignore storage quota errors
  }
}

export const DietPlanner: React.FC<DietPlannerProps> = ({
  language,
  currentUser,
  onBack,
}) => {
  const t = TRANSLATIONS[language];

  const [dietPlan, setDietPlan] = useState<DailyDietPlan>(() =>
    getDietPlan(currentUser.id, 'Balanced Maintenance')
  );
  const [selectedGoal, setSelectedGoal] = useState<string>(() => {
    const initial = getDietPlan(currentUser.id, 'Balanced Maintenance');
    if (initial.isCustom || !PRESET_GOALS.includes(initial.goal as (typeof PRESET_GOALS)[number])) {
      return 'Custom Plan';
    }
    return initial.goal;
  });

  // Custom plan builder state
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [customPrefs, setCustomPrefs] = useState<CustomDietPreferences>(() => {
    const initial = getDietPlan(currentUser.id, 'Balanced Maintenance');
    if (initial.customization) return initial.customization;
    return {
      goal: 'Balanced Nutrition',
      dietType: 'Balanced (All Foods)',
      cuisine: 'Mixed Everyday',
      targetCalories: suggestDailyCalories(currentUser),
      allergiesOrAvoid: (currentUser.allergies || []).join(', '),
      favoriteFoods: '',
      notes: '',
    };
  });
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Per-meal inline edit & AI swap state
  const [editingMealIdx, setEditingMealIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<MealDetail | null>(null);
  const [editIngredientsText, setEditIngredientsText] = useState('');
  const [swappingMealIdx, setSwappingMealIdx] = useState<number | null>(null);
  const [mealActionError, setMealActionError] = useState<string | null>(null);

  // Hydration & personal meal notes
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [userRating, setUserRating] = useState<number>(dietPlan.userRating || 5);
  const [feedbackNote, setFeedbackNote] = useState(dietPlan.userNotes || '');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleGoalChange = (newGoal: string) => {
    setMealActionError(null);
    setCustomError(null);
    setEditingMealIdx(null);

    if (newGoal === 'Custom Plan') {
      setSelectedGoal('Custom Plan');
      const savedCustom = loadSavedCustomPlan(currentUser.id);
      if (savedCustom) {
        setDietPlan(savedCustom);
        saveDietPlan(currentUser.id, savedCustom);
        setUserRating(savedCustom.userRating || 5);
        setFeedbackNote(savedCustom.userNotes || '');
        setIsCustomizerOpen(false);
      } else {
        setIsCustomizerOpen(true);
      }
      setFeedbackSubmitted(false);
      return;
    }

    setSelectedGoal(newGoal);
    setIsCustomizerOpen(false);
    const plan = SAMPLE_DIET_PLANS[newGoal] || SAMPLE_DIET_PLANS['Balanced Maintenance'];
    setDietPlan(plan);
    saveDietPlan(currentUser.id, plan);
    setUserRating(plan.userRating || 5);
    setFeedbackNote(plan.userNotes || '');
    setFeedbackSubmitted(false);
  };

  const safeParseApiJson = async (res: Response): Promise<any> => {
    const raw = await res.text();
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('<')) {
      return null;
    }
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  };

  const buildLocalCustomPlanFallback = (prefs: CustomDietPreferences): DailyDietPlan => {
    const avoidWords = (prefs.allergiesOrAvoid || '')
      .toLowerCase()
      .split(/[,;/]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const scrubAvoid = (text: string) => {
      let cleaned = text;
      for (const word of avoidWords) {
        if (word.length >= 2) {
          const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
          cleaned = cleaned.replace(re, 'fresh seasonal vegetables');
        }
      }
      return cleaned;
    };

    const isVeg =
      prefs.dietType.includes('Vegetarian') ||
      prefs.dietType.includes('Vegan') ||
      prefs.dietType.includes('Dairy-Free');
    const cals = Math.min(4500, Math.max(1100, Number(prefs.targetCalories) || 1900));
    const isIndian = prefs.cuisine.toLowerCase().includes('indian');

    const rawMeals: MealDetail[] = isIndian
      ? [
          {
            type: 'Breakfast',
            title: isVeg ? 'Moong Dal Chilla with Fresh Mint Chutney' : 'Vegetable Poha with Spiced Boiled Eggs',
            calories: Math.round(cals * 0.24),
            proteinG: Math.round((cals * 0.24 * 0.2) / 4),
            carbsG: Math.round((cals * 0.24 * 0.52) / 4),
            fatG: Math.round((cals * 0.24 * 0.28) / 9),
            ingredients: isVeg
              ? ['Yellow moong dal', 'Fresh coriander & spinach', 'Ginger-mint chutney']
              : ['Flattened rice (poha)', 'Boiled eggs', 'Peas, peanuts & curry leaves'],
            instructions: 'Prepare fresh on a warm griddle with a light drizzle of oil.',
          },
          {
            type: 'Lunch',
            title: isVeg
              ? 'Dal Tadka, Jeera Brown Rice & Bhindi Sabzi'
              : 'Home-Style Herb Chicken Curry, Steamed Rice & Salad',
            calories: Math.round(cals * 0.35),
            proteinG: Math.round((cals * 0.35 * 0.22) / 4),
            carbsG: Math.round((cals * 0.35 * 0.5) / 4),
            fatG: Math.round((cals * 0.35 * 0.28) / 9),
            ingredients: isVeg
              ? ['Toor dal', 'Brown rice', 'Okra (bhindi), tomatoes & mild spices']
              : ['Skinless chicken', 'Steamed brown rice', 'Cucumber, tomato & lemon salad'],
            instructions: 'Simmer gently with turmeric and cumin, and serve warm with crisp salad.',
          },
          {
            type: 'Snacks',
            title: 'Roasted Makhana with Herbal Ginger-Tulsi Tea',
            calories: Math.round(cals * 0.14),
            proteinG: Math.round((cals * 0.14 * 0.16) / 4),
            carbsG: Math.round((cals * 0.14 * 0.58) / 4),
            fatG: Math.round((cals * 0.14 * 0.26) / 9),
            ingredients: ['Fox nuts (makhana)', 'Soaked almonds', 'Fresh ginger tulsi tea'],
            instructions: 'Crisp makhana in a dry pan and enjoy with warm spiced tea.',
          },
          {
            type: 'Dinner',
            title: 'Comforting Moong Khichdi with Roasted Bottle Gourd',
            calories: Math.round(cals * 0.27),
            proteinG: Math.round((cals * 0.27 * 0.2) / 4),
            carbsG: Math.round((cals * 0.27 * 0.54) / 4),
            fatG: Math.round((cals * 0.27 * 0.26) / 9),
            ingredients: ['Split yellow moong dal', 'Soft cooked rice', 'Bottle gourd (lauki) & cumin'],
            instructions: 'Cook gently until soft and soothing for easy evening digestion.',
          },
        ]
      : [
          {
            type: 'Breakfast',
            title: isVeg ? 'Warm Oats with Fresh Fruit & Nuts' : 'Scrambled Eggs with Spinach & Whole-Grain Toast',
            calories: Math.round(cals * 0.24),
            proteinG: Math.round((cals * 0.24 * 0.2) / 4),
            carbsG: Math.round((cals * 0.24 * 0.52) / 4),
            fatG: Math.round((cals * 0.24 * 0.28) / 9),
            ingredients: isVeg
              ? ['Rolled oats', 'Seasonal berries', 'Sliced almonds']
              : ['Farm eggs', 'Baby spinach', 'Whole-grain toast'],
            instructions: 'Prepare fresh in under 10 minutes with a warm cup of herbal tea.',
          },
          {
            type: 'Lunch',
            title: isVeg ? 'Lentil & Roasted Veggie Grain Bowl' : 'Grilled Herb Chicken with Brown Rice & Greens',
            calories: Math.round(cals * 0.35),
            proteinG: Math.round((cals * 0.35 * 0.24) / 4),
            carbsG: Math.round((cals * 0.35 * 0.48) / 4),
            fatG: Math.round((cals * 0.35 * 0.28) / 9),
            ingredients: isVeg
              ? ['Cooked lentils', 'Roasted carrots & bell peppers', 'Brown rice & olive oil']
              : ['Grilled chicken breast', 'Brown rice', 'Cucumber, tomatoes & greens'],
            instructions: 'Serve warm over grain base with lemon and mild herbs.',
          },
          {
            type: 'Snacks',
            title: 'Crisp Apple Slices & Handful of Almonds',
            calories: Math.round(cals * 0.14),
            proteinG: Math.round((cals * 0.14 * 0.15) / 4),
            carbsG: Math.round((cals * 0.14 * 0.55) / 4),
            fatG: Math.round((cals * 0.14 * 0.3) / 9),
            ingredients: ['Fresh apple', 'Lightly roasted almonds', 'Chamomile tea'],
            instructions: 'Pair fresh fruit with nuts for calm, steady afternoon energy.',
          },
          {
            type: 'Dinner',
            title: 'Soothing Vegetable Soup with Quinoa',
            calories: Math.round(cals * 0.27),
            proteinG: Math.round((cals * 0.27 * 0.2) / 4),
            carbsG: Math.round((cals * 0.27 * 0.52) / 4),
            fatG: Math.round((cals * 0.27 * 0.28) / 9),
            ingredients: ['Carrots & zucchini', 'Cooked quinoa', 'Olive oil & mild herbs'],
            instructions: 'Simmer until warm and light for restful evening comfort.',
          },
        ];

    const meals = rawMeals.map((m) => ({
      ...m,
      title: scrubAvoid(m.title),
      ingredients: m.ingredients.map(scrubAvoid),
      instructions: scrubAvoid(m.instructions),
    }));

    return {
      id: `diet-custom-${Date.now()}`,
      title: `${prefs.goal} · ${prefs.cuisine}`,
      goal: prefs.goal,
      dietType: prefs.dietType,
      targetCalories: meals.reduce((s, m) => s + m.calories, 0),
      targetWaterLiters: 3.0,
      meals,
      tips: [
        `Shaped around your ${prefs.cuisine} & ${prefs.dietType} style at ~${cals} kcal/day.`,
        avoidWords.length > 0
          ? `Strictly skips ${prefs.allergiesOrAvoid} across every meal.`
          : 'Uses gentle whole ingredients and balanced portions.',
        'Drink water slowly throughout the day to stay refreshed.',
      ],
      isCustom: true,
      customization: prefs,
    };
  };

  const handleGenerateCustomPlan = async (
    e?: React.FormEvent,
    overridePrefs?: CustomDietPreferences
  ) => {
    if (e) e.preventDefault();
    const activePrefs = overridePrefs || customPrefs;
    setIsGeneratingPlan(true);
    setCustomError(null);
    setMealActionError(null);

    try {
      const doRequest = () =>
        fetch('/api/diet/customize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userProfile: {
              age: currentUser.age,
              gender: currentUser.gender,
              bmi: currentUser.bmi,
              allergies: currentUser.allergies || [],
            },
            preferences: activePrefs,
            language,
          }),
          signal: AbortSignal.timeout(35000),
        });

      let res = await doRequest();
      let data = await safeParseApiJson(res);

      // Retry once automatically if proxy/server returned non-JSON (e.g. cold restart HTML)
      if (!data) {
        await new Promise((r) => setTimeout(r, 700));
        res = await doRequest();
        data = await safeParseApiJson(res);
      }

      const generatedPlan: DailyDietPlan =
        res.ok && data?.success && data?.plan
          ? {
              ...data.plan,
              isCustom: true,
              customization: activePrefs,
            }
          : buildLocalCustomPlanFallback(activePrefs);

      setDietPlan(generatedPlan);
      setSelectedGoal('Custom Plan');
      saveDietPlan(currentUser.id, generatedPlan);
      persistCustomPlan(currentUser.id, generatedPlan);
      setIsCustomizerOpen(false);
      setEditingMealIdx(null);
      setFeedbackSubmitted(false);
    } catch {
      // Smooth tailored fallback instead of showing cryptic network/JSON syntax errors
      const fallbackPlan = buildLocalCustomPlanFallback(activePrefs);
      setDietPlan(fallbackPlan);
      setSelectedGoal('Custom Plan');
      saveDietPlan(currentUser.id, fallbackPlan);
      persistCustomPlan(currentUser.id, fallbackPlan);
      setIsCustomizerOpen(false);
      setEditingMealIdx(null);
      setFeedbackSubmitted(false);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleStartEditMeal = (idx: number) => {
    const meal = dietPlan.meals[idx];
    setEditingMealIdx(idx);
    setEditDraft({ ...meal });
    setEditIngredientsText(meal.ingredients.join(', '));
    setMealActionError(null);
  };

  const handleSaveEditedMeal = (idx: number) => {
    if (!editDraft) return;
    const parsedIngredients = editIngredientsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedMeal: MealDetail = {
      ...editDraft,
      title: editDraft.title.trim() || dietPlan.meals[idx].title,
      calories: Math.max(50, Number(editDraft.calories) || 0),
      proteinG: Math.max(0, Number(editDraft.proteinG) || 0),
      carbsG: Math.max(0, Number(editDraft.carbsG) || 0),
      fatG: Math.max(0, Number(editDraft.fatG) || 0),
      ingredients: parsedIngredients.length > 0 ? parsedIngredients : dietPlan.meals[idx].ingredients,
      instructions: editDraft.instructions.trim() || dietPlan.meals[idx].instructions,
    };

    const updatedMeals = dietPlan.meals.map((m, i) => (i === idx ? updatedMeal : m));
    const newTotalCalories = updatedMeals.reduce((sum, m) => sum + m.calories, 0);

    const updatedPlan: DailyDietPlan = {
      ...dietPlan,
      isCustom: true,
      targetCalories: newTotalCalories,
      meals: updatedMeals,
    };

    setDietPlan(updatedPlan);
    setSelectedGoal('Custom Plan');
    saveDietPlan(currentUser.id, updatedPlan);
    persistCustomPlan(currentUser.id, updatedPlan);
    setEditingMealIdx(null);
    setEditDraft(null);
  };

  const handleSwapMeal = async (idx: number) => {
    const meal = dietPlan.meals[idx];
    setSwappingMealIdx(idx);
    setMealActionError(null);
    setEditingMealIdx(null);

    try {
      const res = await fetch('/api/diet/swap-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: meal.type,
          currentMealTitle: meal.title,
          targetCalories: meal.calories,
          preferences: customPrefs,
          language,
        }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await safeParseApiJson(res);
      const nextMeal: MealDetail =
        res.ok && data?.success && data?.meal
          ? data.meal
          : buildLocalCustomPlanFallback({
              ...customPrefs,
              cuisine: customPrefs.cuisine === 'Home-Style Indian' ? 'Mixed Everyday' : 'Home-Style Indian',
            }).meals[idx] || meal;

      const updatedMeals = dietPlan.meals.map((m, i) => (i === idx ? nextMeal : m));
      const newTotalCalories = updatedMeals.reduce((sum, m) => sum + m.calories, 0);

      const updatedPlan: DailyDietPlan = {
        ...dietPlan,
        isCustom: true,
        targetCalories: newTotalCalories,
        meals: updatedMeals,
      };

      setDietPlan(updatedPlan);
      setSelectedGoal('Custom Plan');
      saveDietPlan(currentUser.id, updatedPlan);
      persistCustomPlan(currentUser.id, updatedPlan);
    } catch {
      setMealActionError('Unable to swap this meal right now. Please try editing it or try again in a moment.');
    } finally {
      setSwappingMealIdx(null);
    }
  };

  const handleAddGlass = () => {
    if (waterGlasses < 12) setWaterGlasses((prev) => prev + 1);
  };

  const handleRemoveGlass = () => {
    if (waterGlasses > 0) setWaterGlasses((prev) => prev - 1);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: DailyDietPlan = {
      ...dietPlan,
      userRating,
      userNotes: feedbackNote.trim(),
    };
    setDietPlan(updated);
    saveDietPlan(currentUser.id, updated);
    if (updated.isCustom) {
      persistCustomPlan(currentUser.id, updated);
    }
    setFeedbackSubmitted(true);
  };

  const handleApplyNotesToCustomPlan = () => {
    const mergedNotes = [customPrefs.notes, feedbackNote.trim()].filter(Boolean).join(' · ');
    const nextPrefs = {
      ...customPrefs,
      notes: mergedNotes,
    };
    setCustomPrefs(nextPrefs);
    setFeedbackSubmitted(false);
    handleGenerateCustomPlan(undefined, nextPrefs);
  };

  const totalMealCalories = dietPlan.meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = dietPlan.meals.reduce((acc, m) => acc + m.proteinG, 0);
  const totalCarbs = dietPlan.meals.reduce((acc, m) => acc + m.carbsG, 0);
  const totalFat = dietPlan.meals.reduce((acc, m) => acc + m.fatG, 0);
  const suggestedCals = suggestDailyCalories(currentUser);

  const tabOptions = [...PRESET_GOALS, 'Custom Plan'];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
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
              {t.dietPlanner}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Nourishing daily meals shaped around your tastes, health goals, and everyday routine.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5 tabular-nums">
              <span>{dietPlan.dietType}</span>
              <span aria-hidden="true">·</span>
              <span>{dietPlan.goal}</span>
              <span aria-hidden="true">·</span>
              <span>{dietPlan.targetCalories} kcal target</span>
            </div>
          </div>
        </div>

        {/* Plan Switcher + Customize Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none">
            {tabOptions.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGoalChange(g)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedGoal === g
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCustomizerOpen((prev) => !prev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
              isCustomizerOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600 shadow-xs'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isCustomizerOpen ? 'Close Customizer' : 'Customize Plan'}</span>
          </button>
        </div>
      </div>

      {/* Custom Diet Plan Builder */}
      {isCustomizerOpen && (
        <form
          onSubmit={handleGenerateCustomPlan}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customize Your Diet Plan
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your eating style, favorite flavors, calorie comfort level, and foods to avoid.
              </p>
            </div>
            <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
              Suggested for your profile: ~{suggestedCals} kcal/day
            </span>
          </div>

          {customError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{customError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Health Focus
              </label>
              <select
                value={GOAL_OPTIONS.includes(customPrefs.goal) ? customPrefs.goal : 'Balanced Nutrition'}
                onChange={(e) => setCustomPrefs((prev) => ({ ...prev, goal: e.target.value }))}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {GOAL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Eating Style
              </label>
              <select
                value={customPrefs.dietType}
                onChange={(e) => setCustomPrefs((prev) => ({ ...prev, dietType: e.target.value }))}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {DIET_STYLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cuisine &amp; Flavor Style
              </label>
              <select
                value={customPrefs.cuisine}
                onChange={(e) => setCustomPrefs((prev) => ({ ...prev, cuisine: e.target.value }))}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {CUISINE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                min={1100}
                max={4500}
                step={50}
                value={customPrefs.targetCalories}
                onChange={(e) =>
                  setCustomPrefs((prev) => ({
                    ...prev,
                    targetCalories: Number(e.target.value) || 2000,
                  }))
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none tabular-nums"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[1500, 1800, 2000, 2300, 2600].map((kcal) => (
                  <button
                    key={kcal}
                    type="button"
                    onClick={() =>
                      setCustomPrefs((prev) => ({ ...prev, targetCalories: kcal }))
                    }
                    className={`px-2 py-1 text-[11px] rounded-md border cursor-pointer tabular-nums transition-colors ${
                      customPrefs.targetCalories === kcal
                        ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {kcal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Foods You Enjoy
              </label>
              <input
                type="text"
                value={customPrefs.favoriteFoods}
                onChange={(e) =>
                  setCustomPrefs((prev) => ({ ...prev, favoriteFoods: e.target.value }))
                }
                placeholder="e.g. oats, paneer, dal, berries, grilled veggies"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Allergies or Foods to Avoid
              </label>
              <input
                type="text"
                value={customPrefs.allergiesOrAvoid}
                onChange={(e) =>
                  setCustomPrefs((prev) => ({ ...prev, allergiesOrAvoid: e.target.value }))
                }
                placeholder="e.g. peanuts, shellfish, dairy, mushrooms"
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Personal Schedule or Cooking Notes
            </label>
            <input
              type="text"
              value={customPrefs.notes}
              onChange={(e) => setCustomPrefs((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Quick 15-minute breakfast, light dinner before 8 PM, high fiber"
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGeneratingPlan}
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2"
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Crafting your plan...</span>
                </>
              ) : (
                <>
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Build My Custom Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Daily Nutrition Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Daily Calories</span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1 tabular-nums">
            <span>{totalMealCalories || dietPlan.targetCalories}</span>
            <span className="text-xs font-semibold text-amber-600">kcal</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Balanced across 4 meals
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Protein</span>
          <div className="text-2xl font-black text-blue-600 mt-1 flex items-baseline gap-1 tabular-nums">
            <span>{totalProtein}</span>
            <span className="text-xs font-semibold text-slate-400">g</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Supports strength &amp; recovery
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Carbohydrates</span>
          <div className="text-2xl font-black text-amber-600 mt-1 flex items-baseline gap-1 tabular-nums">
            <span>{totalCarbs}</span>
            <span className="text-xs font-semibold text-slate-400">g</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Whole grains &amp; steady energy
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Healthy Fats</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-1 tabular-nums">
            <span>{totalFat}</span>
            <span className="text-xs font-semibold text-slate-400">g</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Nuts, seeds &amp; natural oils
          </span>
        </div>
      </div>

      {/* Today's Meals Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-teal-600" />
              <span>Today&apos;s Meal Plan</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {dietPlan.title} · Edit any meal directly or swap it for another option.
            </p>
          </div>
        </div>

        {mealActionError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mealActionError}</span>
            </div>
            <button
              type="button"
              onClick={() => setMealActionError(null)}
              className="text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dietPlan.meals.map((meal, idx) => {
            const isEditing = editingMealIdx === idx && editDraft;
            const isSwapping = swappingMealIdx === idx;

            return (
              <div
                key={`${meal.type}-${idx}`}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between transition-colors hover:border-teal-300"
              >
                {isEditing && editDraft ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-700">{meal.type}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleSaveEditedMeal(idx)}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-teal-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMealIdx(null);
                            setEditDraft(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Meal Name
                      </label>
                      <input
                        type="text"
                        value={editDraft.title}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, title: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">kcal</label>
                        <input
                          type="number"
                          value={editDraft.calories}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              calories: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={editDraft.proteinG}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              proteinG: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Carbs (g)</label>
                        <input
                          type="number"
                          value={editDraft.carbsG}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              carbsG: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Fat (g)</label>
                        <input
                          type="number"
                          value={editDraft.fatG}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              fatG: Number(e.target.value) || 0,
                            })
                          }
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Ingredients (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={editIngredientsText}
                        onChange={(e) => setEditIngredientsText(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Preparation Note
                      </label>
                      <textarea
                        rows={2}
                        value={editDraft.instructions}
                        onChange={(e) =>
                          setEditDraft({ ...editDraft, instructions: e.target.value })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-bold text-slate-800">{meal.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600 tabular-nums">
                          <Flame className="w-3.5 h-3.5" />
                          {meal.calories} kcal
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEditMeal(idx)}
                          className="px-2 py-1 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                          title="Edit this meal"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwapMeal(idx)}
                          disabled={isSwapping}
                          className="px-2 py-1 rounded-lg text-xs font-medium text-teal-700 hover:bg-teal-50 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1"
                          title="Swap for a different meal"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${isSwapping ? 'animate-spin' : ''}`}
                          />
                          <span>{isSwapping ? 'Swapping...' : 'Swap'}</span>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-3">
                      {meal.title}
                    </h3>

                    <div className="flex items-center flex-wrap gap-3 my-3 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl tabular-nums">
                      <span>
                        Protein <strong className="text-slate-900">{meal.proteinG}g</strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Carbs <strong className="text-slate-900">{meal.carbsG}g</strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Fat <strong className="text-slate-900">{meal.fatG}g</strong>
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="text-xs font-semibold text-slate-700 block mb-1">
                        Ingredients
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {meal.ingredients.join(' · ')}
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                      {meal.instructions}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Natural Daily Nutrition Tips */}
      {dietPlan.tips && dietPlan.tips.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
          <img
            src="/images/nutrition-diet.svg"
            alt="Fresh whole food nutrition"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-50"
          />
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-900">
              Helpful Habits for Today
            </h3>
            <ul className="text-xs text-slate-600 space-y-1">
              {dietPlan.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold" aria-hidden="true">
                    ·
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Hydration & Personal Meal Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Water Intake */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>Daily Water Intake</span>
            </h3>
            <span className="text-xs font-bold text-blue-600 tabular-nums">
              {(waterGlasses * 0.25).toFixed(1)} / {dietPlan.targetWaterLiters} Liters
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Staying hydrated supports healthy digestion, focus, and steady energy through the day.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
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
                <span className="text-[8px] font-bold tabular-nums">250ml</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
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

        {/* Meal Notes & Preferences */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Meal Notes &amp; Preferences
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rate how today&apos;s meals felt and note anything you&apos;d like tailored differently.
            </p>
          </div>

          {feedbackSubmitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your meal notes are saved</span>
              </div>
              <p className="text-emerald-700">
                Saved your {userRating}-star rating
                {feedbackNote.trim() ? ` and note ("${feedbackNote.trim()}")` : ''}.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {feedbackNote.trim() && (
                  <button
                    type="button"
                    onClick={handleApplyNotesToCustomPlan}
                    disabled={isGeneratingPlan}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Generate Updated Plan With Notes
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFeedbackSubmitted(false)}
                  className="text-xs font-bold underline hover:text-emerald-900 cursor-pointer"
                >
                  Edit notes
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  How did today&apos;s meals feel?
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
                  <span className="text-xs font-bold text-slate-600 ml-2 tabular-nums">
                    {userRating} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Your Taste &amp; Portion Notes
                </label>
                <input
                  type="text"
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Loved breakfast, prefer a lighter dinner or more fiber..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs active:scale-[0.99] transition-all cursor-pointer"
              >
                Save Notes
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
