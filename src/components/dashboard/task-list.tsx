"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { ScrollArea } from "@/components/ui/scroll-area"; 
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { RefreshCw, Plus, Lock, Sun, Trash2, FolderX, Award, Map, CheckCircle2, PlayCircle, PauseCircle } from "lucide-react"; 

type Task = {
  id: string; 
  title: string;
  task_type: string;
  xp: number;
  is_complete: boolean;
  quest_id: string | null;
};

type Quest = {
  id: string;
  title: string;
  created_at: string; 
  is_active: boolean; 
};

export function TaskList({ user }: { user: User | null }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false); 
  const [showDailyComplete, setShowDailyComplete] = useState(false);
  
  const [activeTab, setActiveTab] = useState("general");

  const currentActiveQuest = quests.find(q => q.is_active);

  // --- FETCHING LOGIC ---
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch Quests
      const { data: questsData } = await supabase
        .from("quests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (questsData) {
        setQuests(questsData);
        const active = questsData.find((q: Quest) => q.is_active);
        if (active) setActiveTab(active.id);
      }

      // Fetch Tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("xp", { ascending: true }) // Sort by Type (XP)
        .order("created_at", { ascending: true }); // Then by Date

      if (tasksData) setTasks(tasksData as Task[]);
    };

    fetchData();
    
    // Realtime
    const channel = supabase
      .channel(`dashboard_updates:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "quests", filter: `user_id=eq.${user.id}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);


  // --- ACTIONS ---
  
  const handleEquipQuest = async (questId: string) => {
    if (!user) return;
    
    setQuests(prev => prev.map(q => ({
        ...q,
        is_active: q.id === questId 
    })));
    setActiveTab(questId);
    setIsQuestLogOpen(false);

    const { error } = await supabase.rpc('equip_quest', { quest_id_to_equip: questId });
    
    if (error) {
        alert("Error equipping quest: " + error.message);
    }
  };

  const handleUnequipQuest = async (questId: string) => {
    if (!user) return;

    setQuests(prev => prev.map(q => q.id === questId ? { ...q, is_active: false } : q));
    
    if (activeTab === questId) {
        setActiveTab("general");
    }

    const { error } = await supabase
        .from('quests')
        .update({ is_active: false })
        .eq('id', questId);

    if (error) alert("Error unequipping: " + error.message);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !user) return;
    const currentQuestId = activeTab === "general" ? null : activeTab;

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTaskTitle,
      task_type: "Daily",
      xp: 10,
      is_complete: false,
      quest_id: currentQuestId
    });

    if (!error) {
      setNewTaskTitle("");
      setIsDialogOpen(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    if (task.is_complete || !user) return;
    
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_complete: true } : t));

    // FIX: Scope the check to the current quest ID
    if (task.task_type === 'Daily') {
        const remainingDailies = tasks.filter(t => 
            t.task_type === 'Daily' && 
            !t.is_complete && 
            t.id !== task.id &&
            t.quest_id === task.quest_id // Check ONLY within this quest context
        );
        
        if (remainingDailies.length === 0) {
            setShowDailyComplete(true);
        }
    }

    const { error } = await supabase.rpc('complete_task_and_award_xp', {
      task_id_to_complete: task.id,
      xp_to_award: task.xp
    });

    if (error) alert(`Error: ${error.message}`);
  };

  const handleStartNewDay = async () => {
    if (!user) return;
    if (!confirm("Ready to reset all Daily tasks?")) return;

    setTasks(prev => prev.map(t => t.task_type === 'Daily' ? { ...t, is_complete: false } : t));

    await supabase.from('tasks').update({ is_complete: false }).eq('user_id', user.id).eq('task_type', 'Daily');
  };

  const handleDeleteTask = async (taskId: string) => {
      if(!confirm("Delete this task?")) return;
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await supabase.from('tasks').delete().eq('id', taskId);
  };

  const handleDeleteQuest = async (questId: string) => {
      if(!confirm("Are you sure? This will delete the Quest and ALL its tasks.")) return;
      
      setQuests(prev => prev.filter(q => q.id !== questId));
      if (activeTab === questId) setActiveTab("general");
      
      await supabase.from('quests').delete().eq('id', questId);
  };

  const handleClearGeneral = async () => {
      if(!confirm("Clear all tasks in the General tab?")) return;
      setTasks(prev => prev.filter(t => t.quest_id !== null)); 
      await supabase.from('tasks').delete().eq('user_id', user!.id).is('quest_id', null);
  };

  // --- HELPERS ---
  const isTaskLocked = (task: Task, questCreatedAt?: string) => {
    if (!questCreatedAt) return false; 
    const createdDate = new Date(questCreatedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const daysSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (task.task_type === 'Weekly' && daysSinceStart < 6) return true;
    if (task.task_type === 'Milestone' && daysSinceStart < 10) return true;
    return false;
  };

  const renderTaskList = (questId: string | null) => {
    let filteredTasks = tasks.filter(t => t.quest_id === questId);
    if (questId === null) filteredTasks = filteredTasks.filter(t => !t.is_complete);
    const currentQuest = quests.find(q => q.id === questId);

    if (filteredTasks.length === 0) {
      return <div className="text-center py-12 text-muted-foreground"><p>No active tasks available.</p></div>;
    }

    return (
      <ul className="space-y-3 mt-4">
        {filteredTasks.map((task) => {
            const locked = isTaskLocked(task, currentQuest?.created_at);
            return (
              <li key={task.id} className={`group flex items-center gap-4 p-3 rounded-lg border ${locked ? 'bg-muted/50 border-dashed' : 'bg-card hover:border-primary/50 transition-colors'}`}>
                {locked ? (
                    <div className="h-5 w-5 flex items-center justify-center text-muted-foreground"><Lock className="h-4 w-4" /></div>
                ) : (
                    <Checkbox id={`task-${task.id}`} checked={task.is_complete} onCheckedChange={() => handleCompleteTask(task)} disabled={task.is_complete} className="h-5 w-5" />
                )}
                <div className="flex-1">
                  <label htmlFor={`task-${task.id}`} className={`font-medium ${task.is_complete ? "line-through text-muted-foreground" : ""} ${locked ? "text-muted-foreground" : ""}`}>
                      {task.title}
                  </label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant={task.task_type === 'Milestone' ? "destructive" : "secondary"} className="text-[10px] h-5 px-2">{task.task_type}</Badge>
                    <span className="text-xs font-bold text-yellow-600">+{task.xp} XP</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
        })}
      </ul>
    );
  };

  return (
    <Card className="min-h-[500px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
            <CardTitle>Active Quests</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsQuestLogOpen(true)} className="text-muted-foreground hover:text-primary">
                <Map className="w-4 h-4 mr-1" /> Quest Log
            </Button>
        </div>
        
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleStartNewDay} title="Reset Daily Tasks">
                <Sun className="w-4 h-4 mr-2 text-orange-500" /> New Day
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button size="sm" disabled={!user}><Plus className="w-4 h-4 mr-1" /> Add Task</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4"><Label>Task Title</Label><Input value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Do the thing..." /></div>
                <Button onClick={handleAddTask}>Create</Button>
              </DialogContent>
            </Dialog>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 mb-4">
            <TabsTrigger value="general" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">General</TabsTrigger>
            {/* Only show the currently active quest tab */}
            {currentActiveQuest && (
                <TabsTrigger value={currentActiveQuest.id} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-primary font-bold">
                    {currentActiveQuest.title}
                </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="flex justify-between items-center mb-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Ad-hoc tasks.</p>
                <Button variant="ghost" size="sm" onClick={handleClearGeneral} className="text-destructive h-6 px-2"><FolderX className="w-3 h-3 mr-1" /> Clear</Button>
            </div>
            {renderTaskList(null)}
          </TabsContent>

          {currentActiveQuest && (
            <TabsContent value={currentActiveQuest.id} className="space-y-4">
                <div className="flex justify-between items-center mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div>
                        <h3 className="font-semibold text-primary">{currentActiveQuest.title}</h3>
                        <p className="text-xs text-muted-foreground">Started: {new Date(currentActiveQuest.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteQuest(currentActiveQuest.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" /> Abandon
                    </Button>
                </div>
                {renderTaskList(currentActiveQuest.id)}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      
      {/* QUEST LOG MODAL (Management) */}
      <Dialog open={isQuestLogOpen} onOpenChange={setIsQuestLogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Map className="w-5 h-5 text-primary" /> Quest Log</DialogTitle>
                <DialogDescription>Manage your habit roadmaps. You can only track one active quest at a time.</DialogDescription>
            </DialogHeader>
            {/* Scrollable list */}
            <div className="flex-1 pr-4 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3 py-2">
                    {quests.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No quests found. Visit the AI Planner to create one!</p>
                    ) : (
                        quests.map(quest => (
                            <div key={quest.id} className={`flex items-center justify-between p-3 rounded-lg border ${quest.is_active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                                <div>
                                    <h4 className={`font-semibold ${quest.is_active ? 'text-primary' : 'text-foreground'}`}>{quest.title}</h4>
                                    <p className="text-xs text-muted-foreground">{new Date(quest.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2">
                                    {quest.is_active ? (
                                        <Button size="sm" variant="secondary" onClick={() => handleUnequipQuest(quest.id)} className="bg-primary/20 text-primary hover:bg-primary/30">
                                            <PauseCircle className="w-4 h-4 mr-1" /> Pause
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="outline" onClick={() => handleEquipQuest(quest.id)}>
                                            <PlayCircle className="w-4 h-4 mr-1" /> Equip
                                        </Button>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteQuest(quest.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* DAILY COMPLETE MODAL */}
      <Dialog open={showDailyComplete} onOpenChange={setShowDailyComplete}>
        <DialogContent className="sm:max-w-md text-center border-green-500 bg-green-50 dark:bg-zinc-900">
          <DialogHeader>
            <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4"><Award className="h-8 w-8 text-green-600" /></div>
            <DialogTitle className="text-2xl text-center text-green-700 dark:text-green-400">Day Conquered!</DialogTitle>
            <DialogDescription className="text-center">You have finished all your daily tasks.</DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowDailyComplete(false)} className="w-full bg-green-600 text-white">Huzzah!</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}