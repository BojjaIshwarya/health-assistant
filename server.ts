import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI if key available with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    geminiConfigured: !!apiKey,
    model: 'gemini-4-hydrogen'
  });
});

// Timeout wrapper with proper timer cleanup
async function generateWithTimeout(params: any, timeoutMs = 15000): Promise<any> {
  if (!ai) throw new Error('Gemini not configured');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      ai.models.generateContent(params),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('AI response timed out')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// Symptom Analysis Endpoint powered by Gemini
app.post('/api/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms, userProfile, language } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Symptoms array required' });
    }

    if (!ai) {
      return res.json({ fallback: true, message: 'Gemini API key not configured on server' });
    }

    const prompt = `You are an expert clinical diagnostic AI assistant.
Observed Symptoms: ${symptoms.join(', ')}.
Patient: Age ${userProfile?.age || '30'}, Gender ${userProfile?.gender || 'Unknown'}. Language: ${language || 'en'}.

Assess clinical risk accurately:
- "Low": mild/common self-limiting symptoms (cold, headache, reflux, mild fatigue) with NO emergency red flags.
- "Moderate": stable conditions needing routine clinic visit.
- "High" or "Severe": ONLY genuine emergencies (chest pain, stroke signs).

Respond ONLY with concise valid JSON:
{
  "disease": "string",
  "confidence": 94,
  "riskLevel": "Low",
  "description": "1-2 concise sentences",
  "calmReassurance": "1 calm reassuring sentence",
  "recommendedSpecialist": "string",
  "precautions": ["string", "string", "string"],
  "differentials": [
    {
      "disease": "string",
      "confidence": 86,
      "riskLevel": "Low",
      "matchedSymptoms": ["symptom"],
      "differentiationNote": "1 short sentence",
      "specialist": "string"
    }
  ]
}`;

    let response: any;
    try {
      response = await generateWithTimeout({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json'
        }
      }, 10000);
    } catch {
      // Fallback seamlessly to flash-lite if primary hits quota/demand/timeout
      response = await generateWithTimeout({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      }, 10000);
    }

    const rawText = response?.text?.trim() || '{}';
    const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanJson || '{}');
    return res.json({ success: true, data: parsed, poweredBy: 'Gemini AI' });
  } catch (error: any) {
    console.error('Error in /api/analyze-symptoms:', error?.message || error);
    return res.status(200).json({ fallback: true, error: error?.message || 'Server timeout' });
  }
});

// Multimodal Chat endpoint powered by Gemini (supports text, image, and voice/audio)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language, userProfile, attachment, history } = req.body;
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';

    if (!trimmedMessage && !attachment?.base64) {
      return res.status(400).json({ error: 'Message or attachment required' });
    }

    if (!ai) {
      return res.json({ fallback: true, message: 'Gemini API key not configured' });
    }

    const recentHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${String(h.text || '').slice(0, 400)}`)
          .join('\n')
      : '';

    let audioTranscript = '';
    let shouldSendInlineAttachment = Boolean(attachment?.base64 && attachment?.mimeType);
    const modelErrors: string[] = [];

    // Step 1 for Voice/Audio: use dedicated transcription model gemini-3.5-transcribe
    if (attachment?.type === 'audio' && attachment?.base64 && attachment?.mimeType) {
      try {
        const transcribeResp = await generateWithTimeout(
          {
            model: 'gemini-3.5-transcribe',
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: attachment.mimeType,
                    data: attachment.base64,
                  },
                },
                {
                  text: 'Transcribe any spoken words in this audio verbatim. If there is no speech, concisely describe the audible sound (e.g., dry cough, wheezing, breathing, tone, or silence).',
                },
              ],
            },
          },
          trimmedMessage ? 6000 : 12000
        );
        audioTranscript = transcribeResp?.text?.trim() || '';
        if (audioTranscript || trimmedMessage) {
          shouldSendInlineAttachment = false;
        }
      } catch (transcribeErr: any) {
        modelErrors.push(`gemini-3.5-transcribe: ${transcribeErr?.message || transcribeErr}`);
        if (trimmedMessage) {
          shouldSendInlineAttachment = false;
        }
      }
    }

    let modalityInstruction = '';
    if (attachment?.type === 'image') {
      modalityInstruction = `
IMAGE ANALYSIS TASK:
Examine the attached image and:
1. Identify what is shown (e.g., skin condition, medication/prescription, lab report, meal/nutrition, medical device reading, injury, or non-medical item).
2. Explain key observations in plain, patient-friendly language.
3. Provide practical health guidance, precautions, and when to consult a doctor.`;
    } else if (attachment?.type === 'audio') {
      const heardText = audioTranscript || trimmedMessage;
      modalityInstruction = `
VOICE / AUDIO ANALYSIS TASK:
The user sent a voice/audio recording.${heardText ? ` Captured audio content: "${heardText}".` : ''}
1. Start with a brief line "**Heard:** ${heardText ? heardText.replace(/"/g, "'") : '<describe the speech or sound heard in the audio>'}"
2. Directly answer any health question or symptom described with targeted, calm medical guidance.
3. If respiratory sounds (cough, wheezing, breathing) are detected, explain possible causes and practical care steps.
4. Reply naturally in the user's preferred language (${language || 'en'}) or match the spoken language if clearer.`;
    }

    const effectiveQuery =
      trimmedMessage && audioTranscript && trimmedMessage !== audioTranscript
        ? `${trimmedMessage} (Audio transcription: ${audioTranscript})`
        : trimmedMessage ||
          audioTranscript ||
          (attachment?.type === 'image'
            ? 'Please examine this image, determine what it is, and provide relevant health guidance.'
            : 'Please listen to this voice or audio recording, determine what it is, and respond helpfully.');

    const systemInstruction = `You are HealthAssist AI, a compassionate, medically accurate, and friendly personal health assistant.
Reply naturally and fluently in the user's preferred language code: "${language || 'en'}".
Keep your response focused, practical, and concise (around 120-240 words unless a detailed breakdown is explicitly asked for).
Format cleanly with Markdown: short paragraphs, bold headings (### or **), bullet points for actionable steps, and a ⚠️ callout if urgent medical attention is warranted.`;

    const userContentText = `User profile: ${JSON.stringify(userProfile || {})}.
${recentHistory ? `\nRecent conversation context:\n${recentHistory}\n` : ''}${modalityInstruction ? `${modalityInstruction}\n` : ''}
User Query: "${effectiveQuery}"`;

    const parts: any[] = [];
    if (shouldSendInlineAttachment && attachment?.base64 && attachment?.mimeType) {
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64,
        },
      });
    }
    parts.push({ text: userContentText });

    let response: any;
    const candidateModels = shouldSendInlineAttachment && attachment?.type === 'audio'
      ? ['gemini-4-hydrogen']
      : ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];

    for (const model of candidateModels) {
      try {
        const config =
          model === 'gemini-4-hydrogen'
            ? {
                systemInstruction,
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              }
            : { systemInstruction };
        const timeoutMs = model === 'gemini-4-hydrogen' ? 15000 : 15000;
        response = await generateWithTimeout(
          {
            model,
            contents: { parts },
            config,
          },
          timeoutMs
        );
        if (response?.text) break;
      } catch (err: any) {
        modelErrors.push(`${model}: ${err?.message || err}`);
      }
    }

    if (!response?.text) {
      throw new Error(modelErrors.join(' | ') || 'All candidate models failed');
    }

    return res.json({
      success: true,
      reply: response.text.trim(),
      ...(audioTranscript ? { transcript: audioTranscript } : {}),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    return res.status(200).json({ fallback: true, error: error?.message || 'Server error' });
  }
});

function formatFriendlyAiError(err: any): string {
  const raw = String(err?.message || err || '');
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return 'The meal planner service is experiencing high demand right now. Please try again in a moment.';
  }
  if (raw.includes('timed out')) {
    return 'Creating your meal plan took a bit longer than expected. Please try again.';
  }
  return 'Unable to generate a custom meal plan right now. Please try again.';
}

async function generateDietJsonWithFallback(prompt: string, timeoutMs = 12000): Promise<any> {
  const attempts: Array<{ model: string; config: any; timeout: number }> = [
    {
      model: 'gemini-3.1-flash-lite',
      config: {
        responseMimeType: 'application/json',
      },
      timeout: timeoutMs,
    },
    {
      model: 'gemini-4-hydrogen',
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
      },
      timeout: timeoutMs,
    },
  ];

  let lastErr: any;
  for (let i = 0; i < attempts.length; i++) {
    try {
      const resp = await generateWithTimeout(
        {
          model: attempts[i].model,
          contents: prompt,
          config: attempts[i].config,
        },
        attempts[i].timeout
      );
      const rawText = resp?.text?.trim() || '{}';
      const cleanJson = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      return JSON.parse(cleanJson || '{}');
    } catch (err: any) {
      lastErr = err;
      if (i < attempts.length - 1) {
        await new Promise((r) => setTimeout(r, 250));
      }
    }
  }
  throw lastErr || new Error('Diet generation failed');
}

function buildTailoredDietFallback(opts: {
  goal: string;
  dietType: string;
  cuisine: string;
  targetCalories: number;
  allergiesOrAvoid: string;
  favoriteFoods: string;
  notes: string;
}) {
  const avoidTokens = opts.allergiesOrAvoid
    .toLowerCase()
    .split(/[,;/]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const isVegan = opts.dietType.toLowerCase().includes('vegan');
  const isVeg = isVegan || opts.dietType.toLowerCase().includes('vegetarian');
  const isDairyFree = isVegan || opts.dietType.toLowerCase().includes('dairy-free');
  const isGlutenFree = opts.dietType.toLowerCase().includes('gluten-free');

  const safeText = (text: string, replacement = 'seasonal greens') => {
    let out = text;
    for (const token of avoidTokens) {
      if (token.length >= 2) {
        const re = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        out = out.replace(re, replacement);
      }
    }
    return out;
  };

  const c = opts.cuisine.toLowerCase();
  const baseMeals = c.includes('indian')
    ? [
        {
          type: 'Breakfast' as const,
          title: isVeg ? 'Moong Dal Chilla with Mint Chutney' : 'Vegetable Poha with Boiled Eggs',
          caloriesRatio: 0.25,
          ingredients: isVeg
            ? ['Yellow moong dal', 'Fresh spinach', 'Mint coriander chutney']
            : ['Flattened rice (poha)', 'Boiled eggs', 'Curry leaves & peas'],
          instructions: 'Cook gently on a lightly oiled pan and serve warm.',
        },
        {
          type: 'Lunch' as const,
          title: isDairyFree || isVegan
            ? 'Toor Dal Tadka, Brown Rice & Stir-Fried Bhindi'
            : isVeg
            ? 'Palak Paneer, Phulka & Cucumber Raita'
            : 'Home-Style Chicken Curry, Brown Rice & Kachumber Salad',
          caloriesRatio: 0.35,
          ingredients: isDairyFree || isVegan
            ? ['Toor dal', 'Brown rice', 'Okra, tomatoes & cumin']
            : isVeg
            ? ['Fresh spinach', 'Paneer', isGlutenFree ? 'Steamed rice' : 'Whole wheat phulka']
            : ['Chicken breast', 'Steamed brown rice', 'Cucumber tomato salad'],
          instructions: 'Simmer with mild home spices and serve fresh with salad.',
        },
        {
          type: 'Snacks' as const,
          title: 'Roasted Makhana & Herbal Ginger Tea',
          caloriesRatio: 0.14,
          ingredients: ['Fox nuts (makhana)', 'Almonds', 'Ginger tulsi tea'],
          instructions: 'Dry-roast makhana until crisp and enjoy with warm tea.',
        },
        {
          type: 'Dinner' as const,
          title: 'Warm Vegetable Khichdi with Roasted Bottle Gourd',
          caloriesRatio: 0.26,
          ingredients: ['Moong dal & rice', 'Bottle gourd (lauki)', 'Mild turmeric & cumin'],
          instructions: 'Pressure-cook soft until soothing and easy to digest.',
        },
      ]
    : c.includes('mediterranean')
    ? [
        {
          type: 'Breakfast' as const,
          title: isVegan ? 'Oatmeal with Berries & Walnuts' : 'Greek Yogurt Bowl with Berries & Seeds',
          caloriesRatio: 0.25,
          ingredients: isVegan
            ? ['Rolled oats', 'Fresh berries', 'Walnuts & chia']
            : ['Plain Greek yogurt', 'Mixed berries', 'Toasted walnuts'],
          instructions: 'Combine chilled berries over base and top with nuts.',
        },
        {
          type: 'Lunch' as const,
          title: isVeg
            ? 'Chickpea Quinoa Bowl with Olive Oil & Lemon'
            : 'Herb-Grilled Fish with Quinoa & Cucumber Salad',
          caloriesRatio: 0.35,
          ingredients: isVeg
            ? ['Chickpeas', 'Cooked quinoa', 'Cherry tomatoes, olives & lemon']
            : ['Grilled salmon or white fish', 'Quinoa', 'Cucumber, parsley & olive oil'],
          instructions: 'Toss crisp greens with lemon-olive oil dressing.',
        },
        {
          type: 'Snacks' as const,
          title: 'Hummus with Carrot & Cucumber Sticks',
          caloriesRatio: 0.14,
          ingredients: ['Smooth hummus', 'Fresh carrots', 'Crisp cucumber slices'],
          instructions: 'Slice cool vegetables and serve with classic hummus.',
        },
        {
          type: 'Dinner' as const,
          title: 'Roasted Zucchini, Lentil & Tomato Soup',
          caloriesRatio: 0.26,
          ingredients: ['Red lentils', 'Zucchini & bell pepper', 'Garlic & oregano'],
          instructions: 'Simmer vegetables and lentils gently until fragrant and comforting.',
        },
      ]
    : [
        {
          type: 'Breakfast' as const,
          title: isVegan
            ? 'Warm Cinnamon Oats with Banana & Chia'
            : 'Vegetable Omelette with Whole-Grain Toast',
          caloriesRatio: 0.25,
          ingredients: isVegan
            ? ['Rolled oats', 'Sliced banana', 'Chia seeds']
            : ['Eggs or tofu scramble', 'Spinach & tomatoes', isGlutenFree ? 'Millet flatbread' : 'Whole-grain toast'],
          instructions: 'Prepare fresh in 10 minutes with a warm cup of herbal tea.',
        },
        {
          type: 'Lunch' as const,
          title: isVeg
            ? 'Lentil & Roasted Vegetable Harvest Bowl'
            : 'Herb Chicken & Brown Rice Wellness Bowl',
          caloriesRatio: 0.35,
          ingredients: isVeg
            ? ['Cooked lentils', 'Roasted carrots & bell peppers', 'Brown rice & olive oil']
            : ['Grilled lean chicken', 'Steamed brown rice', 'Roasted carrots & greens'],
          instructions: 'Combine warm grain base with roasted veggies and herbs.',
        },
        {
          type: 'Snacks' as const,
          title: 'Fresh Seasonal Fruit & Handful of Almonds',
          caloriesRatio: 0.14,
          ingredients: ['Sliced apple or pear', 'Raw almonds', 'Mint water'],
          instructions: 'Pair crisp fresh fruit with lightly roasted nuts.',
        },
        {
          type: 'Dinner' as const,
          title: 'Soothing Vegetable Soup & Quinoa Side',
          caloriesRatio: 0.26,
          ingredients: ['Carrot, celery & spinach', 'Steamed quinoa', 'Mild herbs & black pepper'],
          instructions: 'Keep dinner warm, light, and easy to digest before rest.',
        },
      ];

  const meals = baseMeals.map((m) => {
    const calories = Math.max(150, Math.round((opts.targetCalories * m.caloriesRatio) / 10) * 10);
    return {
      type: m.type,
      title: safeText(m.title),
      calories,
      proteinG: Math.max(8, Math.round((calories * 0.2) / 4)),
      carbsG: Math.max(15, Math.round((calories * 0.5) / 4)),
      fatG: Math.max(5, Math.round((calories * 0.3) / 9)),
      ingredients: m.ingredients.map((item) => safeText(item)),
      instructions: safeText(m.instructions),
    };
  });

  const tips = [
    `Meals follow your ${opts.cuisine} & ${opts.dietType} preferences near ${opts.targetCalories} kcal/day.`,
    avoidTokens.length > 0
      ? `Avoids ${opts.allergiesOrAvoid} throughout every meal suggestion.`
      : 'Focuses on gentle, whole seasonal ingredients and steady hydration.',
    'Sip 2.5 to 3 liters of water across the day for easy digestion and steady energy.',
  ];

  return {
    title: `${opts.goal} · ${opts.cuisine} Plan`,
    targetWaterLiters: 3.0,
    meals,
    tips,
  };
}

// Customized Diet Plan Generator Endpoint powered by Gemini (with resilient server fallback)
app.post('/api/diet/customize', async (req, res) => {
  try {
    const { userProfile, preferences, language } = req.body || {};
    const goal = String(preferences?.goal || 'Balanced Nutrition').trim();
    const dietType = String(preferences?.dietType || 'Balanced').trim();
    const cuisine = String(preferences?.cuisine || 'Home-style & Fresh').trim();
    const targetCalories = Math.min(4500, Math.max(1100, Number(preferences?.targetCalories) || 2000));
    const allergiesOrAvoid = String(preferences?.allergiesOrAvoid || '').trim();
    const favoriteFoods = String(preferences?.favoriteFoods || '').trim();
    const notes = String(preferences?.notes || '').trim();

    let parsed: any = null;
    if (ai) {
      const prompt = `Create a natural, appetizing 1-day meal plan (4 meals, keep text crisp and brief).
Profile: Age ${userProfile?.age || 30}, Gender ${userProfile?.gender || 'unspecified'}, BMI ${userProfile?.bmi || 'normal'}, Allergies: ${Array.isArray(userProfile?.allergies) && userProfile.allergies.length > 0 ? userProfile.allergies.join(', ') : 'None'}, Language: ${language || 'en'}.
Preferences: Goal=${goal}, Style=${dietType} (strictly adhere), Cuisine=${cuisine}, TotalCalories=~${targetCalories} kcal, Avoid=${allergiesOrAvoid || 'None'}, Enjoy=${favoriteFoods || 'Seasonal whole foods'}, Notes=${notes || 'Simple home meals'}.

Return compact JSON only (3 ingredients per meal, brief 8-word instruction, 2-3 short tips):
{
  "title": "Plan title",
  "targetWaterLiters": 3.0,
  "meals": [
    { "type": "Breakfast", "title": "Meal", "calories": 420, "proteinG": 18, "carbsG": 52, "fatG": 14, "ingredients": ["item1", "item2", "item3"], "instructions": "Brief prep step." },
    { "type": "Lunch", "title": "Meal", "calories": 580, "proteinG": 30, "carbsG": 60, "fatG": 18, "ingredients": ["item1", "item2", "item3"], "instructions": "Brief prep step." },
    { "type": "Snacks", "title": "Meal", "calories": 220, "proteinG": 10, "carbsG": 24, "fatG": 8, "ingredients": ["item1", "item2", "item3"], "instructions": "Brief prep step." },
    { "type": "Dinner", "title": "Meal", "calories": 520, "proteinG": 28, "carbsG": 50, "fatG": 16, "ingredients": ["item1", "item2", "item3"], "instructions": "Brief prep step." }
  ],
  "tips": ["Short tip 1", "Short tip 2", "Short tip 3"]
}`;

      try {
        parsed = await generateDietJsonWithFallback(prompt, 12000);
      } catch (aiErr: any) {
        console.warn('Gemini diet customize fallback triggered:', aiErr?.message || aiErr);
      }
    }

    if (!parsed || !Array.isArray(parsed.meals) || parsed.meals.length === 0) {
      parsed = buildTailoredDietFallback({
        goal,
        dietType,
        cuisine,
        targetCalories,
        allergiesOrAvoid,
        favoriteFoods,
        notes,
      });
    }

    const mealOrder: Array<'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'> = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];
    const normalizedMeals = parsed.meals.slice(0, 4).map((m: any, idx: number) => ({
      type: mealOrder[idx] || 'Snacks',
      title: String(m.title || `${mealOrder[idx] || 'Meal'} Selection`),
      calories: Math.max(50, Number(m.calories) || Math.round(targetCalories / 4)),
      proteinG: Math.max(1, Number(m.proteinG) || 20),
      carbsG: Math.max(1, Number(m.carbsG) || 35),
      fatG: Math.max(1, Number(m.fatG) || 10),
      ingredients: Array.isArray(m.ingredients) ? m.ingredients.map(String).slice(0, 8) : [],
      instructions: String(m.instructions || ''),
    }));

    const totalCalories = normalizedMeals.reduce((acc: number, m: any) => acc + m.calories, 0);

    return res.json({
      success: true,
      plan: {
        id: `diet-custom-${Date.now()}`,
        title: String(parsed.title || `${goal} · ${dietType}`),
        goal,
        dietType,
        targetCalories: totalCalories || targetCalories,
        targetWaterLiters: Number(parsed.targetWaterLiters) || 3.0,
        meals: normalizedMeals,
        tips: Array.isArray(parsed.tips) ? parsed.tips.map(String).slice(0, 4) : [],
        isCustom: true,
        customization: {
          goal,
          dietType,
          cuisine,
          targetCalories,
          allergiesOrAvoid,
          favoriteFoods,
          notes,
        },
      },
    });
  } catch (error: any) {
    return res.status(502).json({
      error: formatFriendlyAiError(error),
    });
  }
});

// Swap a single meal in the current diet plan
app.post('/api/diet/swap-meal', async (req, res) => {
  try {
    const { mealType, currentMealTitle, targetCalories, preferences, language } = req.body || {};
    const validType = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'].includes(mealType) ? mealType : 'Lunch';
    const mealCalories = Math.min(1800, Math.max(100, Number(targetCalories) || 450));

    let m: any = null;
    if (ai) {
      const prompt = `Suggest 1 fresh, appetizing alternative ${validType} meal different from "${currentMealTitle || ''}".
Preferences: Goal=${preferences?.goal || 'Balanced Nutrition'}, Eating Style=${preferences?.dietType || 'Balanced'}, Cuisine=${preferences?.cuisine || 'Fresh & Home-style'}, Target Calories=~${mealCalories} kcal, Avoid=${preferences?.allergiesOrAvoid || 'None'}, Foods Enjoyed=${preferences?.favoriteFoods || 'Wholesome whole foods'}, Language=${language || 'en'}.

Respond ONLY with valid JSON:
{
  "title": "Meal name",
  "calories": ${mealCalories},
  "proteinG": 22,
  "carbsG": 42,
  "fatG": 14,
  "ingredients": ["item 1", "item 2", "item 3", "item 4"],
  "instructions": "1 short natural preparation sentence."
}`;
      try {
        m = await generateDietJsonWithFallback(prompt, 12000);
      } catch (aiErr: any) {
        console.warn('Gemini swap-meal fallback triggered:', aiErr?.message || aiErr);
      }
    }

    if (!m || !m.title) {
      const fallbackPlan = buildTailoredDietFallback({
        goal: String(preferences?.goal || 'Balanced Nutrition'),
        dietType: String(preferences?.dietType || 'Balanced'),
        cuisine: String(preferences?.cuisine || 'Home-style & Fresh'),
        targetCalories: mealCalories * 4,
        allergiesOrAvoid: String(preferences?.allergiesOrAvoid || ''),
        favoriteFoods: String(preferences?.favoriteFoods || ''),
        notes: '',
      });
      const matched = fallbackPlan.meals.find((item) => item.type === validType) || fallbackPlan.meals[0];
      m = matched;
    }

    return res.json({
      success: true,
      meal: {
        type: validType,
        title: String(m.title || `Fresh ${validType}`),
        calories: Math.max(50, Number(m.calories) || mealCalories),
        proteinG: Math.max(1, Number(m.proteinG) || 20),
        carbsG: Math.max(1, Number(m.carbsG) || 35),
        fatG: Math.max(1, Number(m.fatG) || 10),
        ingredients: Array.isArray(m.ingredients) ? m.ingredients.map(String).slice(0, 8) : [],
        instructions: String(m.instructions || ''),
      },
    });
  } catch (error: any) {
    return res.status(502).json({
      error: formatFriendlyAiError(error),
    });
  }
});

// ============================================================================
// Google Maps Platform Proxy Endpoints (Geocoding v4 & Places API New)
// ============================================================================
const GMP_ATTRIBUTION_ID = 'gmp_mcp_codeassist_v1_aistudio';
const PLACE_GEOCODE_CACHE = new Map<
  string,
  { lat: number; lng: number; formattedAddress: string; expiresAt: number }
>();

function getMapsApiKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.MAPS_API_KEY ||
    ''
  );
}

function haversineDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  return km < 1 ? Math.round(km * 100) / 100 : Math.round(km * 10) / 10;
}

function isQuotaErrorPayload(status: number, json: any): boolean {
  if (status === 429) return true;
  const errStatus = json?.error?.status || json?.status || '';
  return errStatus === 'RESOURCE_EXHAUSTED' || errStatus === 'OVER_QUERY_LIMIT';
}

function mapFacilityCategory(
  types: string[] = [],
  primaryType?: string,
  name?: string
): 'Hospital' | 'Clinic' | 'Pharmacy' | 'Trauma Center' {
  const lowerName = (name || '').toLowerCase();
  if (
    lowerName.includes('trauma') ||
    lowerName.includes('emergency center') ||
    lowerName.includes('casualty')
  ) {
    return 'Trauma Center';
  }
  if (
    primaryType === 'pharmacy' ||
    primaryType === 'drugstore' ||
    types.includes('pharmacy') ||
    types.includes('drugstore')
  ) {
    if (!types.includes('hospital') && !types.includes('general_hospital')) {
      return 'Pharmacy';
    }
  }
  if (
    primaryType === 'medical_clinic' ||
    primaryType === 'doctor' ||
    primaryType === 'dental_clinic' ||
    primaryType === 'dentist' ||
    primaryType === 'physiotherapist' ||
    primaryType === 'chiropractor' ||
    primaryType === 'skin_care_clinic' ||
    types.includes('medical_clinic') ||
    types.includes('doctor') ||
    types.includes('dental_clinic')
  ) {
    if (!types.includes('hospital') && !types.includes('general_hospital')) {
      return 'Clinic';
    }
  }
  return 'Hospital';
}

function formatPlaceToFacility(place: any, refLat?: number, refLng?: number) {
  const lat = Number(place?.location?.latitude ?? 0);
  const lng = Number(place?.location?.longitude ?? 0);
  const displayName = place?.displayName?.text || 'Medical Facility';
  const types: string[] = Array.isArray(place?.types) ? place.types : [];
  const primaryType: string | undefined = place?.primaryType;
  const facilityType = mapFacilityCategory(types, primaryType, displayName);
  const weekdayDescriptions: string[] = Array.isArray(place?.currentOpeningHours?.weekdayDescriptions)
    ? place.currentOpeningHours.weekdayDescriptions
    : [];
  const open24x7 = weekdayDescriptions.some((line) => line.toLowerCase().includes('24 hours'));

  const distanceKm =
    typeof refLat === 'number' && typeof refLng === 'number' && lat && lng
      ? haversineDistanceKm(refLat, refLng, lat, lng)
      : 0;

  const friendlyTypes = types
    .filter(
      (tp) =>
        !['point_of_interest', 'establishment', 'health', 'food', 'store'].includes(tp)
    )
    .slice(0, 4)
    .map((tp) =>
      tp
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    );

  const directionsUri =
    place?.googleMapsLinks?.directionsUri ||
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(place?.id || '')}`;

  return {
    id: place?.id || `${lat}_${lng}_${displayName}`,
    placeId: place?.id,
    name: displayName,
    type: facilityType,
    primaryTypeDisplay: place?.primaryTypeDisplayName?.text || facilityType,
    distanceKm,
    address: place?.formattedAddress || place?.shortFormattedAddress || 'Address unavailable',
    phone: place?.nationalPhoneNumber || place?.internationalPhoneNumber || '',
    rating: typeof place?.rating === 'number' ? place.rating : 0,
    userRatingCount:
      typeof place?.userRatingCount === 'number' ? place.userRatingCount : undefined,
    open24x7,
    openNow:
      typeof place?.currentOpeningHours?.openNow === 'boolean'
        ? place.currentOpeningHours.openNow
        : undefined,
    openingHoursText: weekdayDescriptions,
    icuAvailable: facilityType === 'Hospital' || facilityType === 'Trauma Center',
    emergencyBeds: 0,
    specialties: friendlyTypes.length > 0 ? friendlyTypes : [facilityType],
    businessStatus: place?.businessStatus,
    websiteUri: place?.websiteUri,
    googleMapsUri: place?.googleMapsUri,
    directionsUri,
    coordinates: { lat, lng },
  };
}

async function geocodePlaceName(
  placeName: string,
  mapsKey: string,
  languageCode: string
): Promise<{ lat: number; lng: number; formattedAddress: string; quotaExceeded?: boolean } | null> {
  const cacheKey = `${placeName.trim().toLowerCase()}|${languageCode}`;
  const cached = PLACE_GEOCODE_CACHE.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { lat: cached.lat, lng: cached.lng, formattedAddress: cached.formattedAddress };
  }

  // Primary: Geocoding API v4
  try {
    const geocodeUrl = `https://geocode.googleapis.com/v4/geocode/address/${encodeURIComponent(
      placeName.trim()
    )}?languageCode=${encodeURIComponent(languageCode || 'en')}`;
    const geoRes = await fetch(geocodeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask': 'results.placeId,results.location,results.formattedAddress',
        'X-Goog-Maps-Solution-ID': GMP_ATTRIBUTION_ID,
      },
    });
    const geoData = await geoRes.json().catch(() => ({}));
    if (isQuotaErrorPayload(geoRes.status, geoData)) {
      return { lat: 0, lng: 0, formattedAddress: '', quotaExceeded: true };
    }
    const first = geoData?.results?.[0];
    if (geoRes.ok && first?.location) {
      const resolved = {
        lat: Number(first.location.latitude),
        lng: Number(first.location.longitude),
        formattedAddress: first.formattedAddress || placeName,
      };
      if (PLACE_GEOCODE_CACHE.size > 50) PLACE_GEOCODE_CACHE.clear();
      PLACE_GEOCODE_CACHE.set(cacheKey, {
        ...resolved,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return resolved;
    }
  } catch (err) {
    console.warn('Geocoding v4 lookup failed, trying Places Text Search fallback:', err);
  }

  // Fallback: Places Text Search (New) to resolve a landmark or neighborhood
  try {
    const fallbackRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
        'X-Goog-Maps-Solution-ID': GMP_ATTRIBUTION_ID,
      },
      body: JSON.stringify({
        textQuery: placeName.trim(),
        pageSize: 1,
        languageCode: languageCode || 'en',
      }),
    });
    const fallbackData = await fallbackRes.json().catch(() => ({}));
    if (isQuotaErrorPayload(fallbackRes.status, fallbackData)) {
      return { lat: 0, lng: 0, formattedAddress: '', quotaExceeded: true };
    }
    const place = fallbackData?.places?.[0];
    if (fallbackRes.ok && place?.location) {
      const resolved = {
        lat: Number(place.location.latitude),
        lng: Number(place.location.longitude),
        formattedAddress: place.formattedAddress || place.displayName?.text || placeName,
      };
      if (PLACE_GEOCODE_CACHE.size > 50) PLACE_GEOCODE_CACHE.clear();
      PLACE_GEOCODE_CACHE.set(cacheKey, {
        ...resolved,
        expiresAt: Date.now() + 10 * 60 * 1000,
      });
      return resolved;
    }
  } catch (err) {
    console.warn('Places geocode fallback failed:', err);
  }

  return null;
}

app.get('/api/maps/config', (req, res) => {
  const mapsKey = getMapsApiKey();
  res.json({
    configured: Boolean(mapsKey),
    apiKey: mapsKey,
  });
});

app.post('/api/hospitals/search', async (req, res) => {
  try {
    const mapsKey = getMapsApiKey();
    if (!mapsKey) {
      return res.status(503).json({
        error: 'Google Maps API key is not configured on the server.',
      });
    }

    const {
      query = '',
      place = '',
      lat,
      lng,
      radiusKm = 10,
      facilityType = 'All',
      openNow = false,
      strictRadius = true,
      pageToken,
      language = 'en',
    } = req.body || {};

    const trimmedQuery = typeof query === 'string' ? query.trim() : '';
    const trimmedPlace = typeof place === 'string' ? place.trim() : '';
    const validRadiusKm = Math.min(50, Math.max(0.5, Number(radiusKm) || 10));
    const radiusMeters = Math.min(50000.0, Math.max(500.0, validRadiusKm * 1000));
    const langCode = typeof language === 'string' && language.length <= 5 ? language : 'en';

    // Step 1: Resolve center coordinates if a place name is given, or use GPS lat/lng
    let centerLat: number | undefined =
      typeof lat === 'number' && Number.isFinite(lat) ? lat : undefined;
    let centerLng: number | undefined =
      typeof lng === 'number' && Number.isFinite(lng) ? lng : undefined;
    let centerLabel = 'Current GPS Location';

    if (trimmedPlace) {
      const geocoded = await geocodePlaceName(trimmedPlace, mapsKey, langCode);
      if (geocoded?.quotaExceeded) {
        return res.status(429).json({
          quotaExceeded: true,
          error: 'Google Maps Platform quota exceeded during location lookup.',
        });
      }
      if (!geocoded) {
        return res.status(404).json({
          error: `Could not find location "${trimmedPlace}". Try a nearby city, area, or postal code.`,
        });
      }
      centerLat = geocoded.lat;
      centerLng = geocoded.lng;
      centerLabel = geocoded.formattedAddress;
    }

    const hasCenter =
      typeof centerLat === 'number' &&
      typeof centerLng === 'number' &&
      Number.isFinite(centerLat) &&
      Number.isFinite(centerLng);

    // If neither a place/GPS center nor a hospital name query is provided, return clear prompt
    if (!hasCenter && !trimmedQuery) {
      return res.status(400).json({
        error: 'Please allow GPS location or enter a city/place or hospital name.',
      });
    }

    const BASE_FIELDS = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.shortFormattedAddress',
      'places.location',
      'places.types',
      'places.primaryType',
      'places.primaryTypeDisplayName',
      'places.businessStatus',
      'places.googleMapsUri',
      'places.googleMapsLinks',
      'places.rating',
      'places.userRatingCount',
      'places.nationalPhoneNumber',
      'places.internationalPhoneNumber',
      'places.currentOpeningHours',
      'places.websiteUri',
    ];

    const shouldUseTextSearch = Boolean(trimmedQuery || pageToken || openNow);

    if (!shouldUseTextSearch && hasCenter) {
      // Nearby Search (New): strictly within circular radius, using includedPrimaryTypes + POPULARITY so major facilities across the chosen radius are surfaced, then sorted nearest-first
      const includedPrimaryTypesMap: Record<string, string[]> = {
        All: ['hospital', 'general_hospital', 'medical_center', 'medical_clinic', 'pharmacy'],
        Hospital: ['hospital', 'general_hospital', 'medical_center'],
        'Trauma Center': ['hospital', 'general_hospital'],
        Clinic: ['medical_clinic', 'doctor', 'dental_clinic', 'physiotherapist'],
        Pharmacy: ['pharmacy', 'drugstore'],
      };
      const includedPrimaryTypes =
        includedPrimaryTypesMap[facilityType] || includedPrimaryTypesMap.All;

      const nearbyRes = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': mapsKey,
          'X-Goog-FieldMask': BASE_FIELDS.join(','),
          'X-Goog-Maps-Solution-ID': GMP_ATTRIBUTION_ID,
        },
        body: JSON.stringify({
          includedPrimaryTypes,
          maxResultCount: 20,
          rankPreference: 'POPULARITY',
          languageCode: langCode,
          locationRestriction: {
            circle: {
              center: { latitude: centerLat, longitude: centerLng },
              radius: radiusMeters,
            },
          },
        }),
      });

      const nearbyData = await nearbyRes.json().catch(() => ({}));
      if (isQuotaErrorPayload(nearbyRes.status, nearbyData)) {
        return res.status(429).json({
          quotaExceeded: true,
          error: 'Google Maps Platform quota exceeded.',
        });
      }
      if (!nearbyRes.ok) {
        return res.status(nearbyRes.status).json({
          error: nearbyData?.error?.message || 'Nearby hospital lookup failed.',
        });
      }

      const rawPlaces: any[] = Array.isArray(nearbyData?.places) ? nearbyData.places : [];
      let facilities = rawPlaces
        .map((p) => formatPlaceToFacility(p, centerLat, centerLng))
        .filter((f) => f.businessStatus !== 'CLOSED_PERMANENTLY')
        .sort((a, b) => a.distanceKm - b.distanceKm);

      if (facilityType === 'Trauma Center') {
        const emergencyOnly = facilities.filter(
          (f) => f.open24x7 || f.type === 'Trauma Center' || f.type === 'Hospital'
        );
        facilities = emergencyOnly;
      }

      return res.json({
        success: true,
        mode: 'nearby',
        center: { lat: centerLat, lng: centerLng, label: centerLabel },
        radiusKm: validRadiusKm,
        facilities,
        nextPageToken: null,
      });
    }

    // Text Search (New): supports hospital name search, specialty search, openNow, and nextPageToken pagination
    const typeQuerySuffixMap: Record<string, string> = {
      All: 'hospital',
      Hospital: 'hospital',
      'Trauma Center': 'emergency hospital trauma center',
      Clinic: 'medical clinic',
      Pharmacy: 'pharmacy',
    };
    const includedTypeSingleMap: Record<string, string | undefined> = {
      All: undefined,
      Hospital: 'hospital',
      'Trauma Center': 'hospital',
      Clinic: 'medical_clinic',
      Pharmacy: 'pharmacy',
    };

    let constructedTextQuery = trimmedQuery;
    if (!constructedTextQuery) {
      const baseTerm = typeQuerySuffixMap[facilityType] || 'hospital';
      constructedTextQuery = trimmedPlace ? `${baseTerm} in ${trimmedPlace}` : baseTerm;
    } else if (trimmedPlace) {
      constructedTextQuery = `${trimmedQuery} in ${trimmedPlace}`;
    }

    const textSearchBody: Record<string, any> = {
      textQuery: constructedTextQuery,
      pageSize: 20,
      languageCode: langCode,
    };

    const singleType = includedTypeSingleMap[facilityType];
    if (singleType) {
      textSearchBody.includedType = singleType;
      textSearchBody.strictTypeFiltering = facilityType !== 'All';
    } else if (trimmedQuery) {
      // Softly bias uncategorized name searches (e.g. "Apollo") toward hospitals without excluding clinics/pharmacies
      textSearchBody.includedType = 'hospital';
      textSearchBody.strictTypeFiltering = false;
    }

    if (openNow) {
      textSearchBody.openNow = true;
    }

    if (hasCenter && !trimmedPlace) {
      textSearchBody.locationBias = {
        circle: {
          center: { latitude: centerLat, longitude: centerLng },
          radius: radiusMeters,
        },
      };
    } else if (hasCenter && trimmedPlace) {
      textSearchBody.locationBias = {
        circle: {
          center: { latitude: centerLat, longitude: centerLng },
          radius: radiusMeters,
        },
      };
    }

    if (pageToken) {
      textSearchBody.pageToken = pageToken;
    }

    const textRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': mapsKey,
        'X-Goog-FieldMask': [...BASE_FIELDS, 'nextPageToken'].join(','),
        'X-Goog-Maps-Solution-ID': GMP_ATTRIBUTION_ID,
      },
      body: JSON.stringify(textSearchBody),
    });

    const textData = await textRes.json().catch(() => ({}));
    if (isQuotaErrorPayload(textRes.status, textData)) {
      return res.status(429).json({
        quotaExceeded: true,
        error: 'Google Maps Platform quota exceeded.',
      });
    }
    if (!textRes.ok) {
      return res.status(textRes.status).json({
        error: textData?.error?.message || 'Hospital text search failed.',
      });
    }

    const rawPlaces: any[] = Array.isArray(textData?.places) ? textData.places : [];
    const effectiveRefLat = hasCenter ? centerLat : rawPlaces[0]?.location?.latitude;
    const effectiveRefLng = hasCenter ? centerLng : rawPlaces[0]?.location?.longitude;

    let allMapped = rawPlaces
      .map((p) => formatPlaceToFacility(p, effectiveRefLat, effectiveRefLng))
      .filter((f) => f.businessStatus !== 'CLOSED_PERMANENTLY');

    if (hasCenter) {
      allMapped.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    let expandedOutsideRadius = false;
    let facilities = allMapped;

    // When strictRadius is active & center is set: filter within radiusKm.
    // Exception: if user searched a specific hospital name and 0 matches fell inside radiusKm,
    // surface the matching hospitals outside radiusKm with a clear flag so named hospital lookups succeed.
    if (hasCenter && strictRadius) {
      const withinRadius = allMapped.filter((f) => f.distanceKm <= validRadiusKm);
      if (withinRadius.length > 0 || !trimmedQuery) {
        facilities = withinRadius;
      } else if (trimmedQuery && allMapped.length > 0) {
        expandedOutsideRadius = true;
        facilities = allMapped;
      }
    }

    return res.json({
      success: true,
      mode: 'text',
      center:
        typeof effectiveRefLat === 'number' && typeof effectiveRefLng === 'number'
          ? {
              lat: effectiveRefLat,
              lng: effectiveRefLng,
              label: hasCenter
                ? centerLabel
                : facilities[0]?.name || trimmedQuery,
            }
          : null,
      radiusKm: validRadiusKm,
      expandedOutsideRadius,
      facilities,
      nextPageToken: textData?.nextPageToken || null,
    });
  } catch (error: any) {
    console.error('Error in /api/hospitals/search:', error?.message || error);
    return res.status(500).json({
      error: error?.message || 'Failed to search hospitals.',
    });
  }
});

// Ensure unmatched /api/* routes and Express errors always return JSON instead of HTML
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api/')) {
    return res.status(err?.status || 500).json({
      error: err?.message || 'Unexpected server error.',
    });
  }
  return next(err);
});

// Setup Vite in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
