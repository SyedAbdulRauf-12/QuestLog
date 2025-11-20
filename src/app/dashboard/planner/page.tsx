"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { Send, Bot, User as UserIcon, CheckCircle2 } from "lucide-react";
import { generateHabitPlan } from "./actions";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  isPlan?: boolean; 
  // We store the parsed data in the message state so we don't have to re-parse it
  planData?: {
      quest_title: string;
      tasks: GeneratedTask[];
  };
};

type GeneratedTask = {
  title: string;
  task_type: string;
  xp: number;
};

// Response structure from Server Action
type AIResponse = {
    quest_title: string;
    tasks: GeneratedTask[];
};

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

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const result = await generateHabitPlan(input);
    setIsLoading(false);

    if (result.success && result.data) {
      try {
          const parsedData: AIResponse = JSON.parse(result.data);
          
          const aiMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: "ai", 
            content: "Plan generated.", // Fallback text
            isPlan: true,
            planData: parsedData // Store the full object
          };
          setMessages(prev => [...prev, aiMsg]);
      } catch (e) {
          console.error("Failed to parse JSON:", e);
          setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "I created a plan, but it wasn't formatted correctly. Please try again." }]);
      }
    } else {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: result.error || "Sorry, something went wrong." }]);
    }
  };

  const handleAcceptPlan = async (planData: AIResponse) => {
    if (!userId) return;
    
    try {
      // 1. Create the Quest with the AI-generated title
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .insert({
            user_id: userId,
            title: planData.quest_title, // Use the short title
            is_active: true
        })
        .select()
        .single();

      if (questError) throw questError;
      const questId = questData.id;

      // 2. Prepare Tasks
      const dbTasks = planData.tasks.map((t) => ({
        user_id: userId,
        title: t.title,
        task_type: t.task_type,
        xp: t.xp,
        is_complete: false,
        quest_id: questId
      }));

      // 3. Insert Tasks
      const { error: tasksError } = await supabase.from('tasks').insert(dbTasks);
      
      if (!tasksError) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: `Awesome! I've added the "${planData.quest_title}" quest to your Dashboard.` }]);
      } else {
        throw tasksError;
      }
    } catch (e) {
      console.error("Error saving quest:", e);
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
              {msg.isPlan && msg.planData ? (
                <div className="space-y-3">
                  {/* Display the AI-generated Title */}
                  <div className="border-b pb-2 mb-2">
                      <p className="text-xs text-muted-foreground uppercase font-bold">Quest Proposal</p>
                      <h3 className="text-lg font-bold text-primary">{msg.planData.quest_title}</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {msg.planData.tasks.map((task, i) => (
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