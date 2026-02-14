"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Use AvatarImage
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BadgesWidget } from "@/components/dashboard/BadgesWidget";
import { CheckCircle2, Zap, Edit2, Save, Camera } from "lucide-react";
import Image from "next/image";

interface ProfileData {
    id: string;
    display_name: string | null;
    xp: number;
    avatar_image: string | null; // New field
}

// 1. Define your available avatars here (filenames in public/avatars/)
const AVAILABLE_AVATARS = [
  "avatar (1).png", "avatar (2).png", "avatar (3).png", "avatar (4).png",
  "avatar (5).png"
];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0 });
  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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
        setProfileData(prev => prev ? { ...prev, display_name: newName } : null);
        setIsEditing(false);
    } else {
        alert("Failed to update name");
    }
  };

  const handleUpdateAvatar = async (filename: string) => {
    if (!user) return;
    const { error } = await supabase
        .from("profiles")
        .update({ avatar_image: filename })
        .eq("id", user.id);

    if (!error) {
        setProfileData(prev => prev ? { ...prev, avatar_image: filename } : null);
        setIsAvatarModalOpen(false);
    } else {
        alert("Failed to update avatar");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* HEADER CARD */}
      <Card className="border-l-4 border-l-primary relative overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        
        <CardContent className="pt-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                
                {/* 2. Avatar Selection Trigger */}
                <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
                  <DialogTrigger asChild>
                    <div className="relative group cursor-pointer">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg transition-transform group-hover:scale-105">
                            {/* Load custom avatar or fallback */}
                            <AvatarImage src={`/avatars/${profileData?.avatar_image || 'avatar-1.png'}`} className="object-cover" />
                            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                {newName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {/* Overlay icon on hover */}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white h-8 w-8" />
                        </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Choose Your Avatar</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4 py-4">
                        {AVAILABLE_AVATARS.map((avatarFile) => (
                            <button 
                                key={avatarFile}
                                onClick={() => handleUpdateAvatar(avatarFile)}
                                className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary ${profileData?.avatar_image === avatarFile ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-primary/50'}`}
                            >
                                <Image 
                                    src={`/avatars/${avatarFile}`} 
                                    alt="Avatar" 
                                    fill 
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                  </DialogContent>
                </Dialog>
                
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

                <div className="text-right hidden md:block">
                    <div className="text-3xl font-black text-primary drop-shadow-sm">{profileData?.xp || 0} XP</div>
                    <div className="text-sm font-medium text-muted-foreground">Total Experience</div>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
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

        <div className="md:col-span-1">
            <BadgesWidget user={user} />
        </div>

      </div>
    </div>
  );
}