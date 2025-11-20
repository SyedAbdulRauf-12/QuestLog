"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";

const getLevel = (xp: number) => Math.floor(Math.pow(xp / 100, 0.5)) + 1;
const getNextLevelXP = (level: number) => 100 * Math.pow(level, 2);

export function UserProfile({ user }: { user: User | null }) {
  const [xp, setXp] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(1);
  
  const displayName = user?.email 
    ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
    : "Adventurer";

  const level = getLevel(xp);
  const nextLevelXP = getNextLevelXP(level);
  const progress = (xp / nextLevelXP) * 100;

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .single();

      if (data) {
        const newXp = data.xp || 0;
        const currentLevel = getLevel(newXp);
        setXp(newXp);
        prevLevelRef.current = currentLevel;
      }
    };
    fetchProfile();

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        (payload) => {
          const newXp = (payload.new as { xp: number }).xp;
          const newLevel = getLevel(newXp);
          
          if (newLevel > prevLevelRef.current) {
             setShowLevelUp(true);
             prevLevelRef.current = newLevel;
          }
          
          setXp(newXp);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Welcome back, {displayName}!</CardTitle>
          <CardDescription>You are Level {level}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Next Level: {xp} / {nextLevelXP} XP
            </p>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* LEVEL UP MODAL */}
      <Dialog open={showLevelUp} onOpenChange={setShowLevelUp}>
        {/* FIX: Changed bg-primary/5 (transparent) to bg-indigo-50 (solid light) and dark:bg-zinc-900 (solid dark) */}
        <DialogContent className="sm:max-w-md text-center border-primary bg-indigo-50 dark:bg-zinc-900">
          <DialogHeader>
            <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-4">
                <PartyPopper className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center">Level Up!</DialogTitle>
            <DialogDescription className="text-center text-lg font-medium text-foreground pt-2">
              Congratulations! You have reached Level {level}.
            </DialogDescription>
            <p className="text-muted-foreground py-2">
                Keep pushing. Your potential is limitless.
            </p>
          </DialogHeader>
          <Button onClick={() => setShowLevelUp(false)} className="w-full">
            Continue Journey
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}