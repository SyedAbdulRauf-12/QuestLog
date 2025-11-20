"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Award, Lock, Star } from "lucide-react";

// Same formula as UserProfile to ensure consistency
const getLevel = (xp: number) => Math.floor(Math.pow(xp / 100, 0.5)) + 1;

export function BadgesWidget({ user }: { user: User }) {
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevel = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("xp")
        .eq("id", user.id)
        .single();

      if (data) {
        setLevel(getLevel(data.xp || 0));
      }
      setLoading(false);
    };
    
    fetchLevel();

    // Realtime listener for level updates
    const channel = supabase
      .channel(`badges_widget:${user.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` }, 
          (payload) => setLevel(getLevel((payload.new as { xp: number }).xp)))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Badge Logic
  const nextBadgeLevel = Math.ceil((level + 1) / 5) * 5;
  const levelsToGo = nextBadgeLevel - level;
  const currentBadgeCount = Math.floor(level / 5);
  
  // Calculate progress specifically towards the next badge (e.g. Level 7 is 40% of the way from 5 to 10)
  const progressToNextBadge = ((5 - levelsToGo) / 5) * 100;

  // Generate displayed badges
  const earnedBadges = Array.from({ length: currentBadgeCount }, (_, i) => (i + 1) * 5);

  if (loading) return <Card className="h-[200px] animate-pulse bg-muted" />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-orange-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Upcoming Badge Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Next Badge: <span className="font-bold text-foreground">Level {nextBadgeLevel}</span></span>
              <span className="text-xs font-medium text-primary">{levelsToGo} levels to go</span>
            </div>
            <Progress value={progressToNextBadge} className="h-2" />
          </div>

          {/* Badge Showcase */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {/* Render Earned Badges */}
            {earnedBadges.map((badgeLevel) => (
              <div key={badgeLevel} className="flex flex-col items-center gap-1" title={`Reached Level ${badgeLevel}`}>
                <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center border-2 border-yellow-500 text-yellow-600">
                    <Star className="h-5 w-5 fill-yellow-500" />
                </div>
                <span className="text-[10px] font-bold">Lvl {badgeLevel}</span>
              </div>
            ))}

            {/* Render Next Locked Badge */}
            <div className="flex flex-col items-center gap-1 opacity-50">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground">
                    <Lock className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold">Lvl {nextBadgeLevel}</span>
            </div>
          </div>

          {earnedBadges.length === 0 && (
            <p className="text-xs text-center text-muted-foreground pt-2">
              Reach Level 5 to earn your first badge!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}