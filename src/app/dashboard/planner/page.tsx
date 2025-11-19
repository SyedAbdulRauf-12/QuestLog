"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { Send, Bot, User as UserIcon, CheckCircle2, Bug } from "lucide-react";

// --- CONFIGURATION ---
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; 

const HABIT_GENERATION_SCHEMA = {
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
};

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  isPlan?: boolean; 
};

type GeneratedTask = {
  title: string;
  task_type: string;
  xp: number;
};

// --- FIX: Define interface for Google API Model to avoid 'any' ---
interface GeminiModel {
  name: string;
  supportedGenerationMethods?: string[];
}

export default function PlannerPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "ai", content: "Hi! I'm your LevelUp Coach. What habit do you want to build today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- DYNAMIC MODEL RESOLUTION ---
  // This function asks Google: "What models can I use?" and picks the best one.
  const resolveModel = async () => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      if (!response.ok) throw new Error(`Failed to list models: ${response.status}`);
      
      const data = await response.json();
      // FIX: Type cast the response data
      const models = (data.models || []) as GeminiModel[];
      
      // Priority list: Flash (fastest) -> Pro (smartest) -> standard 1.0
      const preferredModels = [
        "models/gemini-1.5-flash",
        "models/gemini-1.5-flash-001",
        "models/gemini-1.5-pro",
        "models/gemini-pro"
      ];

      // Find the first preferred model that exists in the user's available list
      for (const pref of preferredModels) {
        // FIX: Removed (m: any), typescript now infers m is GeminiModel
        if (models.some((m) => m.name === pref)) {
          console.log(`Selected Model: ${pref}`);
          return pref.replace("models/", ""); // Remove prefix for the URL construction
        }
      }
      
      // Fallback: Just grab the first model that supports generation
      // FIX: Removed (m: any)
      const fallback = models.find((m) => m.supportedGenerationMethods?.includes("generateContent"));
      if (fallback) {
         console.log(`Fallback Model: ${fallback.name}`);
         return fallback.name.replace("models/", "");
      }

      throw new Error("No compatible Gemini models found for this API Key.");
    } catch (e) {
      console.error("Model Resolution Error:", e);
      return "gemini-pro"; // Ultimate fallback
    }
  };

  const callGemini = async (prompt: string) => {
    if (!API_KEY) {
      console.error("API Key missing.");
      return null;
    }

    // 1. Dynamically find the correct model name
    const modelName = await resolveModel();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    const fullPrompt = `
      SYSTEM INSTRUCTION: You are an expert habit coach. Break down the user's goal into 5-7 actionable tasks (daily/weekly/milestone). 
      Return ONLY the raw JSON array following this schema: ${JSON.stringify(HABIT_GENERATION_SCHEMA)}. 
      Do not include markdown formatting like \`\`\`json.
      
      USER GOAL: ${prompt}
    `;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { 
              responseMimeType: "application/json" 
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Gemini API Error Details:", errorData);
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error("Empty response from AI");

      // Sanitize: Remove markdown code blocks if present
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return text;
    } catch (e) {
      console.error("Full Error Object:", e);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const planJson = await callGemini(input);
    setIsLoading(false);

    if (planJson) {
      try {
          // Validate JSON before adding message
          JSON.parse(planJson);
          const aiMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: "ai", 
            content: planJson, 
            isPlan: true 
          };
          setMessages(prev => [...prev, aiMsg]);
      } catch (e) {
          console.error("Failed to parse JSON from AI:", planJson);
          setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "I came up with a plan, but it wasn't formatted correctly. Let's try again. (Check console for raw output)" }]);
      }
    } else {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Sorry, I couldn't connect to the AI. Please check the browser console (F12) for the specific error." }]);
    }
  };

  const handleAcceptPlan = async (planJson: string) => {
    if (!userId) return;
    try {
      const tasks: GeneratedTask[] = JSON.parse(planJson);
      
      const dbTasks = tasks.map((t) => ({
        user_id: userId,
        title: t.title,
        task_type: t.task_type,
        xp: t.xp,
        is_complete: false
      }));

      const { error } = await supabase.from('tasks').insert(dbTasks);
      
      if (!error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "Awesome! I've added those quests to your Dashboard." }]);
      }
    } catch (e) {
      console.error("Error saving plan", e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <Avatar className={msg.role === "ai" ? "bg-primary/10" : "bg-secondary"}>
              <AvatarFallback>{msg.role === "ai" ? <Bot className="text-primary" /> : <UserIcon />}</AvatarFallback>
            </Avatar>
            
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
              {msg.isPlan ? (
                <div className="space-y-3">
                  <p className="font-semibold">Here is your custom roadmap:</p>
                  <div className="space-y-2 text-sm">
                    {(JSON.parse(msg.content) as GeneratedTask[]).map((task, i) => (
                      <div key={i} className="flex items-center gap-2 bg-background/50 p-2 rounded">
                        <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary">{task.task_type}</span>
                        <span>{task.title}</span>
                        <span className="text-xs text-muted-foreground ml-auto">+{task.xp}XP</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => handleAcceptPlan(msg.content)} className="w-full mt-2" size="sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Accept & Add to Dashboard
                  </Button>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <Avatar className="bg-primary/10"><AvatarFallback><Bot className="text-primary" /></AvatarFallback></Avatar>
            <div className="bg-muted/50 rounded-2xl p-4 animate-pulse">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="e.g. I want to learn Python in 30 days..." 
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}