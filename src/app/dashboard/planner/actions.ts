"use server";

const API_KEY = process.env.GEMINI_API_KEY?.trim();

// --- NEW FLEXIBLE SCHEMA ---
const INTERACTION_SCHEMA = {
  type: "OBJECT",
  properties: {
    response_type: {
      type: "STRING",
      enum: ["clarification", "plan", "refusal"],
      description: "Set to 'clarification' if details are missing. 'plan' if actionable. 'refusal' if impossible/unrealistic."
    },
    chat_message: {
      type: "STRING",
      description: "The text response to show the user. Be helpful and encouraging."
    },
    suggested_replies: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "2-4 short, likely user responses (e.g. '30 Days', 'High Intensity', 'Just starting')."
    },
    plan_data: {
      type: "OBJECT",
      description: "Required ONLY if response_type is 'plan'.",
      properties: {
        quest_title: { type: "STRING" },
        tasks: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING", description: "Specific, actionable task instruction." },
              task_type: { type: "STRING", enum: ["Daily", "Weekly", "Milestone"] },
              xp: { type: "NUMBER" },
            },
            required: ["title", "task_type", "xp"]
          }
        }
      },
      required: ["quest_title", "tasks"]
    }
  },
  required: ["response_type", "chat_message"]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface GeminiGenerationConfig {
  responseMimeType?: string;
}

interface GeminiRequestBody {
  contents: { parts: { text: string }[] }[];
  generationConfig?: GeminiGenerationConfig;
}

interface GeminiModel {
  name: string;
  supportedGenerationMethods?: string[];
}

interface GeminiModelListResponse {
  models?: GeminiModel[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

// --- DIAGNOSTIC FUNCTION ---
async function debugListModels() {
  if (!API_KEY) return [];
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = (await response.json()) as GeminiModelListResponse;
    return (data.models || []).map((m) => m.name);
  } catch (e) {
    return [];
  }
}

// --- MAIN ACTION ---
export async function generateAIResponse(history: { role: string, content: string }[]) {
  if (!API_KEY) {
    return { error: "Server Error: API Key not configured." };
  }

  // 1. Model Resolution
  const availableModels = await debugListModels();
  let modelCandidates = [
    "gemini-2.0-flash",       
    "gemini-2.0-flash-lite", 
    "gemini-1.5-flash",      
    "gemini-1.5-pro",
    "gemini-flash-latest"
  ];

  if (availableModels.length > 0) {
    const cleanAvailable = availableModels.map((m) => m.replace("models/", ""));
    modelCandidates = modelCandidates.filter(c => cleanAvailable.includes(c));
    if (modelCandidates.length === 0) {
        const fallback = cleanAvailable.find((m) => m.includes("flash"));
        if (fallback) modelCandidates = [fallback];
    }
  }

  // 2. System Prompt
  const systemPrompt = `
    SYSTEM INSTRUCTION: You are an expert Habit Building Coach. Your goal is to help users break down their ambitions into realistic, actionable plans.
    
    PROTOCOL:
    1. **Analyze Request:** Look at the user's goal in the conversation history.
    2. **Feasibility Check:** - If the goal is physically impossible (e.g., "Fly to the moon by myself", "Build a rocket in 2 days"), fantasy-based, or illegal/harmful, set response_type to "refusal".
       - In the chat_message, politely say: "Sorry, I can't tell you that as it seems unrealistic or impossible. Do you have a different goal?"
    3. **Ambiguity Check:** - If the goal is vague (e.g., "Get fit") or missing a timeframe/intensity, set response_type to "clarification".
       - Ask a specific follow-up question. Provide "suggested_replies" (e.g., "Lose Weight", "Build Muscle").
       - **Auto-Assumption:** If the user gives a general skill (e.g., "Learn Python") without a timeframe, assume a standard beginner timeframe (e.g., 30 Days) and PROCEED to plan instead of asking endlessly, unless the scope is wildly unclear.
    4. **Generate Plan:** - If the goal is clear and realistic (or can be reasonably assumed), set response_type to "plan".
       - Create the tasks.
    
    TONE: Professional, encouraging, concise, and structured. No eldritch/void personas.

    PLANNING RULES (When generating plan):
    - Create exactly 7-8 Tasks total.
    - **Step-by-Step:** Start with easy pre-requisites (Daily), then build up (Weekly), end with a Milestone.
    - **Clarity:** Tasks must be explicit. "Read 10 pages" is better than "Read".
    - **XP:** Daily (10-20), Weekly (50-80), Milestone (150-200).
    - **Ordering:** The JSON array must be ordered from Easiest (Daily) to Hardest (Milestone).
    
    OUTPUT SCHEMA: ${JSON.stringify(INTERACTION_SCHEMA)}
  `;

  // 3. Serialize History
  const conversationText = history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n");
  const fullPrompt = `${systemPrompt}\n\nCURRENT CONVERSATION:\n${conversationText}\n\nCOACH RESPONSE (JSON):`;

  // 4. Call API
  for (const model of modelCandidates) {
    let attempts = 0;
    while (attempts < 2) {
      try {
        console.log(`SERVER: Attempting model ${model}...`);
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const supportsJsonMode = model.includes("1.5") || model.includes("2.0") || model.includes("flash");
        
        const requestBody: GeminiRequestBody = {
            contents: [{ parts: [{ text: fullPrompt }] }]
        };
        
        if (supportsJsonMode) {
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
  
  return { error: "Connection to AI failed. Please try again." };
}