"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { Send, Bot, User as UserIcon, CheckCircle2 } from "lucide-react";
import { generateAIResponse } from "./actions"; // Updated import

// Updated types to match new schema
type GeneratedTask = {
  title: string;
  task_type: string;
  xp: number;
};

type AIResponseData = {
    response_type: "clarification" | "plan";
    chat_message: string;
    suggested_replies?: string[];
    plan_data?: {
        quest_title: string;
        tasks: GeneratedTask[];
    };
};

type Message = {
  id: string;
  role: "user" | "ai";
  content: string; // Display text
  isPlan?: boolean; 
  planData?: AIResponseData["plan_data"];
  suggestions?: string[]; // Buttons for user
};

export default function PlannerPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
        id: "1", 
        role: "ai", 
        content: "I am the Voice of the Void. Tell me, what ambition do you seek to manifest?",
        suggestions: ["Help Implement a Habit", "Plan my Goals", "Motivate me"]
    }
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

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: textToSend };
    // Optimistically update UI
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    // Convert UI history to API history (strip extra fields)
    const apiHistory = newHistory.map(m => ({
        role: m.role,
        content: m.content
    }));

    const result = await generateAIResponse(apiHistory);
    setIsLoading(false);

    if (result.success && result.data) {
      try {
          const parsed: AIResponseData = JSON.parse(result.data);
          
          const aiMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: "ai", 
            content: parsed.chat_message,
            suggestions: parsed.suggested_replies
          };

          if (parsed.response_type === "plan" && parsed.plan_data) {
              aiMsg.isPlan = true;
              aiMsg.planData = parsed.plan_data;
          }

          setMessages(prev => [...prev, aiMsg]);
      } catch (e) {
          console.error("Failed to parse JSON:", e);
          setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "The prophecy was garbled. Please try again." }]);
      }
    } else {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: result.error || "The Void is silent." }]);
    }
  };

  const handleAcceptPlan = async (planData: NonNullable<AIResponseData["plan_data"]>) => {
    if (!userId) return;
    
    try {
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .insert({
            user_id: userId,
            title: planData.quest_title || "New Quest",
            is_active: true
        })
        .select()
        .single();

      if (questError) throw questError;
      const questId = questData.id;

      const tasksToInsert = (planData.tasks || []).map((t) => ({
        user_id: userId,
        title: t.title,
        task_type: t.task_type,
        xp: t.xp,
        is_complete: false,
        quest_id: questId
      }));

      if (tasksToInsert.length > 0) {
          const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert);
          if (!tasksError) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: `It is done. The quest "${planData.quest_title}" has been etched into your destiny (Dashboard).` }]);
          } else {
            throw tasksError;
          }
      }
    } catch (e) {
      console.error("Error saving quest:", e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            
            <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar className={msg.role === "ai" ? "bg-primary/10" : "bg-secondary"}>
                <AvatarFallback>{msg.role === "ai" ? <Bot className="text-primary" /> : <UserIcon />}</AvatarFallback>
                </Avatar>
                
                <div className={`rounded-2xl p-4 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                {msg.isPlan && msg.planData ? (
                    <div className="space-y-3">
                        <div className="border-b pb-2 mb-2 border-white/10">
                            <p className="text-xs text-muted-foreground uppercase font-bold">The Prophecy</p>
                            <h3 className="text-lg font-bold text-primary">{msg.planData.quest_title}</h3>
                        </div>
                        <p className="text-sm italic">{msg.content}</p>
                        
                        <div className="space-y-2 text-sm">
                            {(msg.planData.tasks || []).map((task, i) => (
                            <div key={i} className="flex items-center gap-2 bg-background/50 p-2 rounded">
                                <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary whitespace-nowrap">
                                    {task.task_type}
                                </span>
                                <span>{task.title}</span>
                                <span className="text-xs text-muted-foreground ml-auto">+{task.xp}</span>
                            </div>
                            ))}
                        </div>
                        <Button 
                            onClick={() => msg.planData && handleAcceptPlan(msg.planData)} 
                            className="w-full mt-2" 
                            size="sm"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Accept Quest
                        </Button>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                </div>
            </div>

            {/* SUGGESTION CHIPS (Only for latest AI message) */}
            {msg.role === "ai" && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 ml-14">
                    {msg.suggestions.map((sugg, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(sugg)}
                            className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1.5 rounded-full border border-border transition-colors"
                        >
                            {sugg}
                        </button>
                    ))}
                </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <Avatar className="bg-primary/10"><AvatarFallback><Bot className="text-primary" /></AvatarFallback></Avatar>
            <div className="bg-muted/50 rounded-2xl p-4 animate-pulse">Consulting the Void...</div>
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
            placeholder="Speak your ambition..." 
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}