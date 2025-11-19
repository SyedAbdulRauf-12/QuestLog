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
import { useEffect, useState } from "react";

const getLevel = (xp: number) => Math.floor(Math.pow(xp / 100, 0.5)) + 1;
const getNextLevelXP = (level: number) => 100 * Math.pow(level, 2);

// 1. Update prop type to allow null
export function UserProfile({ user }: { user: User | null }) {
  const [xp, setXp] = useState(0);

  // 2. Use optional chaining (user?.email) to prevent the crash
  const displayName = user?.email 
    ? user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
    : "Adventurer";

  const level = getLevel(xp);
  const nextLevelXP = getNextLevelXP(level);
  const progress = (xp / nextLevelXP) * 100;

  useEffect(() => {
    // 3. Add safety check inside effect
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .single();

      if (data) {
        setXp(data.xp || 0);
      }
    };
    fetchProfile();

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setXp((payload.new as { xp: number }).xp);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // 4. Safe dependency

  return (
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
  );
}