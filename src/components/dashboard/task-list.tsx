"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  task_type: string;
  xp: number;
  is_complete: boolean;
};

export function TaskList({ user }: { user: User | null }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. Single Effect for Fetching
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("is_complete", { ascending: true })
        .order("created_at", { ascending: false });

      if (data) {
        setTasks(data);
      } else if (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
    // FIX: Added 'user' to dependency array to satisfy linter
  }, [user, refreshTrigger]); 

  // 2. Real-time Listener
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`tasks:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setRefreshTrigger((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // FIX: Added 'user' to dependency array
  }, [user]); 

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !user) return;

    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: newTaskTitle,
      task_type: "Daily",
      xp: 10,
      is_complete: false,
    });

    if (!error) {
      setNewTaskTitle("");
      setIsDialogOpen(false);
    } else {
      console.error("Error adding task:", error);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    if (task.is_complete || !user) return;

    const { error } = await supabase.rpc('complete_task_and_award_xp', {
      task_id_to_complete: task.id,
      xp_to_award: task.xp
    });

    if (error) {
      console.error("Error completing task:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Quests</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!user}>Add Quest</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add a New Quest</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Task
                </Label>
                <Input
                  id="name"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Meditate for 5 minutes"
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleAddTask}>Create Quest</Button>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active quests. Create one to start gaining XP!
          </p>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-4">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.is_complete}
                  onCheckedChange={() => handleCompleteTask(task)}
                  disabled={task.is_complete}
                />
                <div className="flex-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`font-medium cursor-pointer ${
                      task.is_complete
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.title}
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        task.task_type === "Daily"
                          ? "default"
                          : task.task_type === "Weekly"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {task.task_type}
                    </Badge>
                    <span className="text-xs font-semibold text-primary">
                      +{task.xp} XP
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}