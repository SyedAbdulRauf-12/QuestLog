"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Removed unused Label import
import { BadgesWidget } from "@/components/dashboard/BadgesWidget";
import { CheckCircle2, Zap, Edit2, Save } from "lucide-react"; // Removed Trophy

// Define proper type to replace 'any'
interface ProfileData {
    id: string;
    display_name: string | null;
    xp: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0 });
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // FIX: Changed getSession() to getUser() to fix type error
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setProfileData(profile);
        setNewName(profile.display_name || user.email?.split("@")[0] || "Adventurer");
      }

      const { data: tasks } = await supabase
        .from("tasks")
        .select("is_complete")
        .eq("user_id", user.id);

      if (tasks) {
        setStats({
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.is_complete).length
        });
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleUpdateName = async () => {
    if (!user || !newName.trim()) return;
    
    const { error } = await supabase
        .from("profiles")
        .update({ display_name: newName })
        .eq("id", user.id);

    if (!error) {
        // Update local state safely
        setProfileData(prev => prev ? { ...prev, display_name: newName } : null);
        setIsEditing(false);
    } else {
        alert("Failed to update name");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* HEADER CARD */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {newName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                    {isEditing ? (
                        <div className="flex items-center gap-2 max-w-sm">
                            <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
                            <Button size="sm" onClick={handleUpdateName}><Save className="w-4 h-4 mr-2" /> Save</Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">{profileData?.display_name || "Adventurer"}</h1>
                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                        </div>
                    )}
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{profileData?.xp || 0} XP</div>
                    <div className="text-sm text-muted-foreground">Total Experience</div>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* STATS COLUMN */}
        <div className="space-y-6 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            {stats.totalTasks}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            {stats.totalTasks > 0 
                                ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
                                : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* QUEST HISTORY */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest conquests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {stats.completedTasks} tasks completed across all quests.
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* SIDEBAR: BADGES */}
        <div className="md:col-span-1">
            <BadgesWidget user={user} />
        </div>

      </div>
    </div>
  );
}