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

app.use(express.json());

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
    model: 'gemini-3.8-flash'
  });
});

// Fast timeout wrapper to prevent latency spikes or slow AI calls
async function generateWithTimeout(params: any, timeoutMs = 2800): Promise<any> {
  if (!ai) throw new Error('Gemini not configured');
  
  return Promise.race([
    ai.models.generateContent(params),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI response timed out')), timeoutMs)
    )
  ]);
}

// Symptom Analysis Endpoint powered by Gemini 3.8 Flash
app.post('/api/analyze-symptoms', async (req, res) => {
  try {
    const { symptoms, userProfile, language } = req.body;
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ error: 'Symptoms array required' });
    }

    if (!ai) {
      return res.json({ fallback: true, message: 'Gemini API key not configured on server' });
    }

    const prompt = `You are an expert clinical diagnostic medical AI assistant modeled after state-of-the-art systems (like Gemini and ChatGPT Health).
Observed Symptoms: ${symptoms.join(', ')}.
Patient profile: Age: ${userProfile?.age || '30'}, Gender: ${userProfile?.gender || 'Unknown'}.
Language: ${language || 'en'}.

Evaluate these symptoms with utmost medical accuracy:
1. Identify the most probable primary medical condition.
2. Compute an accurate, calibrated confidence percentage (typically 90% - 96% for recognizable clinical syndromes).
3. Determine accurate risk severity:
   - "Low": for common self-limiting, non-emergency conditions (common cold, tension headache, functional dyspepsia/acid reflux, mild viral rhinitis, lifestyle fatigue, mild aches). If no red-flag emergency symptoms (such as acute chest pain radiating to arm, sudden unilateral facial droop, slurred speech) are present, it MUST be "Low" or at most "Moderate". DO NOT falsely alarm the patient with "High" or "Severe" for common mild complaints!
   - "Moderate": for stable conditions needing routine outpatient visit (e.g. seasonal flu with fever, acute bronchitis, migraine).
   - "High" or "Severe": strictly reserved for genuine medical emergencies (acute coronary syndrome, acute stroke, etc.).
4. Identify 2 to 3 Differential Diagnoses (alternative probable conditions sharing these symptoms), each with exact confidence %, risk level, and a clinical distinction note explaining how doctors distinguish them.
5. Provide a calm, reassuring clinical summary and evidence-based home care precautions and specialist recommendation.

Respond ONLY with valid JSON conforming strictly to this JSON format (no markdown code blocks, just raw JSON):
{
  "disease": "string",
  "confidence": 94,
  "riskLevel": "Low",
  "description": "string",
  "calmReassurance": "string",
  "recommendedSpecialist": "string",
  "precautions": ["precaution 1", "precaution 2", "precaution 3"],
  "differentials": [
    {
      "disease": "string",
      "confidence": 88,
      "riskLevel": "Low",
      "matchedSymptoms": ["symptom"],
      "differentiationNote": "string",
      "specialist": "string"
    }
  ]
}`;

    let response: any;
    try {
      response = await generateWithTimeout({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json'
        }
      }, 2500);
    } catch (primaryErr: any) {
      // If primary is slow or experiences high demand (503), immediately try flash-lite
      console.warn('Primary model slow or unavailable, trying flash-lite:', primaryErr?.message);
      response = await generateWithTimeout({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      }, 2000);
    }

    const text = response?.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed, poweredBy: 'Gemini AI' });
  } catch (error: any) {
    console.error('Fast fallback active for /api/analyze-symptoms:', error?.message || error);
    return res.status(200).json({ fallback: true, error: error?.message || 'Server timeout' });
  }
});

// Chat endpoint powered by Gemini (Fast Low-Latency Response)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language, userProfile } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    if (!ai) {
      return res.json({ fallback: true, message: 'Gemini API key not configured' });
    }

    const prompt = `You are HealthAssist AI, a compassionate, medically accurate, and friendly personal health assistant.
The user's preferred language code is: "${language}".
IMPORTANT LANGUAGE INSTRUCTION: Reply naturally and fluently in the user's requested language (${language}).

User Query: "${message}".
User profile: ${JSON.stringify(userProfile || {})}.

Instructions for your response:
1. DIRECTLY and specifically address the user's inquiry with targeted medical insight, practical remedies, and clear explanations.
2. Format your response cleanly and engagingly using Markdown:
   - Use clean, concise paragraphs.
   - Use bold headings (### or **) for clear sectioning (e.g., Potential Causes, Practical Self-Care, When to See a Doctor).
   - Use bullet points for actionable steps, foods, or exercises.
   - If urgent medical attention is needed, highlight it with a clear warning callout.
3. Keep the tone empathetic, reassuring, and conversational. Avoid repetitive robotic filler.`;

    let response: any;
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const config: any = {};
        if (model === 'gemini-3.8-flash') {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }
        response = await generateWithTimeout({
          model,
          contents: prompt,
          ...(Object.keys(config).length > 0 ? { config } : {})
        }, 10000);
        if (response?.text) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed in /api/chat:`, err?.message || err);
      }
    }

    if (!response?.text) {
      throw lastError || new Error('All candidate models failed');
    }

    return res.json({ success: true, reply: response.text.trim() });
  } catch (error: any) {
    console.error('Error in /api/chat:', error?.message || error);
    return res.status(200).json({ fallback: true, error: error?.message || 'Server error' });
  }
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
