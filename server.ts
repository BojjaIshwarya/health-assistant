import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize GoogleGenAI if key available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    geminiConfigured: !!apiKey,
    model: 'gemini-3.8-flash'
  });
});

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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const text = response.text?.trim() || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed, poweredBy: 'Gemini 3.8 Flash' });
  } catch (error: any) {
    console.error('Error in /api/analyze-symptoms:', error?.message || error);
    return res.status(200).json({ fallback: true, error: error?.message || 'Server error' });
  }
});

// Chat endpoint powered by Gemini 3.8 Flash
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language, userProfile } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    if (!ai) {
      return res.json({ fallback: true, message: 'Gemini API key not configured' });
    }

    const prompt = `You are a compassionate, medically accurate, and calm health assistant modeled after Gemini Health.
The user's preferred language code is: "${language}".
IMPORTANT RULE: You MUST reply in the exact language requested (e.g. Hindi if hi, Telugu if te, Tamil if ta, Kannada if kn, Malayalam if ml, Marathi if mr, Bengali if bn, Gujarati if gu, Punjabi if pa, Odia if or, Assamese if as, English if en).
User query: "${message}".
User profile: ${JSON.stringify(userProfile || {})}.

Provide a clear, accurate, calm, and reassuring medical response. If symptoms are mild or everyday, reassure the user and offer practical home care remedies. If symptoms could be serious, calmly explain the recommended outpatient steps without causing undue panic.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3
      }
    });

    return res.json({ success: true, reply: response.text?.trim() });
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
