"use server";

// Trim the key to avoid copy-paste whitespace issues
const API_KEY = process.env.GEMINI_API_KEY?.trim();

// --- UPDATED SCHEMA: Now an Object with a title and tasks array ---
const HABIT_GENERATION_SCHEMA = {
    type: "OBJECT",
    properties: {
        quest_title: { 
            type: "STRING", 
            description: "A short, catchy 2-4 word title for this habit quest (e.g. 'Learn Guitar', 'Marathon Training')." 
        },
        tasks: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" }, 
                    task_type: { type: "STRING" }, 
                    xp: { type: "NUMBER" },
                },
                required: ["title", "task_type", "xp"]
            }
        }
    },
    required: ["quest_title", "tasks"]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface GeminiPart { text: string; }
interface GeminiContent { parts: GeminiPart[]; }
interface GeminiGenerationConfig { responseMimeType?: string; }
interface GeminiRequestBody { contents: GeminiContent[]; generationConfig?: GeminiGenerationConfig; }
interface GeminiModel { name: string; supportedGenerationMethods?: string[]; }
interface GeminiModelListResponse { models?: GeminiModel[]; error?: { code: number; message: string; status: string; }; }

async function debugListModels() {
  if (!API_KEY) return;
  try {
    console.log("SERVER DIAGNOSTIC: Checking available models...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = (await response.json()) as GeminiModelListResponse;
    if (data.error) {
      console.error("SERVER DIAGNOSTIC ERROR:", JSON.stringify(data.error, null, 2));
      return [];
    }
    const modelNames = (data.models || []).map((m) => m.name);
    console.log("SERVER DIAGNOSTIC SUCCESS. Available models:", modelNames);
    return modelNames;
  } catch (e) {
    console.error("SERVER DIAGNOSTIC FAILED:", e);
    return [];
  }
}

export async function generateHabitPlan(userPrompt: string) {
  if (!API_KEY) {
    console.error("SERVER ERROR: GEMINI_API_KEY is not found in process.env");
    return { error: "Server Error: API Key not configured (Check terminal logs)." };
  }

  const availableModels = await debugListModels();
  let modelCandidates = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

  if (availableModels && availableModels.length > 0) {
    const cleanAvailable = availableModels.map((m: string) => m.replace("models/", ""));
    modelCandidates = modelCandidates.filter(c => cleanAvailable.includes(c));
    if (modelCandidates.length === 0) {
        const fallback = cleanAvailable.find((m: string) => m.includes("flash") || m.includes("pro"));
        if (fallback) modelCandidates = [fallback];
    }
  }

  console.log("SERVER: Will attempt these models:", modelCandidates);

  const systemPrompt = `
    SYSTEM INSTRUCTION: You are an elite habit-building coach. 
    Create a 7-8 step progression plan to help the user build the habit: "${userPrompt}".
    
    RULES FOR GENERATION:
    1. **Title:** Generate a short, punchy "Quest Title" (2-4 words max) that summarizes the goal.
    2. **Progression:** Start with 2-3 "Daily" tasks (easy). Then "Weekly" tasks, and finally a "Milestone".
    3. **Types:** 'Daily' (XP: 10-20), 'Weekly' (XP: 50-80), 'Milestone' (XP: 150-200).
    4. **Ordering:** Order from Easiest to Hardest.
    
    Return ONLY the raw JSON object following this schema: ${JSON.stringify(HABIT_GENERATION_SCHEMA)}.
  `;

  for (const model of modelCandidates) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const isGemini15 = model.includes("1.5") || model.includes("2.0");
        
        const requestBody: GeminiRequestBody = {
            contents: [{ parts: [{ text: systemPrompt }] }]
        };
        if (isGemini15) {
            requestBody.generationConfig = { responseMimeType: "application/json" };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (response.ok) {
          const data = await response.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error("Empty response");
          
          text = text.replace(/```json/g, "").replace(/```/g, "").trim();
          return { success: true, data: text };
        }

        const errorBody = await response.text();
        console.error(`SERVER: Model ${model} failed. Details:`, errorBody);

        if (response.status === 429) {
          await delay(2000);
          attempts++;
          continue;
        }
        if (response.status === 404 || response.status === 400) break; 
        throw new Error(`API Error: ${response.status}`);
      } catch (e) {
        console.error(`SERVER: Exception on ${model}:`, e);
        attempts++;
      }
    }
  }
  
  return { error: "Failed to connect to Google AI." };
}