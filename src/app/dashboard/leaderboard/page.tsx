"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown } from "lucide-react"; // Removed Trophy and Medal

type Profile = { id: string; email: string; xp: number; };

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, xp")
        .order("xp", { ascending: false })
        .limit(20);
      if (data) setLeaders(data);
    };
    fetchLeaderboard();
  }, []);

  if (leaders.length === 0) return <div className="p-8 text-center">Loading champions...</div>;

  const topThree = leaders.slice(0, 3);
  const runnersUp = leaders.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Global Leaderboard</h1>
        <p className="text-muted-foreground">Compete for glory and XP.</p>
      </div>

      {/* PODIUM SECTION */}
      <div className="flex justify-center items-end gap-4 min-h-[250px] py-8">
        {/* 2nd Place (Left) */}
        {topThree[1] && (
          <div className="flex flex-col items-center">
            <div className="mb-2 flex flex-col items-center">
              <Avatar className="h-16 w-16 border-4 border-gray-300">
                <AvatarFallback className="text-xl">🥈</AvatarFallback>
              </Avatar>
              <span className="font-bold mt-1">{topThree[1].email.split("@")[0]}</span>
              <span className="text-sm text-muted-foreground">{topThree[1].xp} XP</span>
            </div>
            <div className="w-24 h-32 bg-gray-300 rounded-t-lg flex items-center justify-center text-2xl font-bold text-white shadow-md">
              2
            </div>
          </div>
        )}

        {/* 1st Place (Center - Tallest) */}
        {topThree[0] && (
          <div className="flex flex-col items-center -mt-4">
             <Crown className="h-8 w-8 text-yellow-500 mb-2 animate-bounce" />
            <div className="mb-2 flex flex-col items-center">
              <Avatar className="h-20 w-20 border-4 border-yellow-400">
                <AvatarFallback className="text-2xl">🥇</AvatarFallback>
              </Avatar>
              <span className="font-bold mt-1 text-lg">{topThree[0].email.split("@")[0]}</span>
              <span className="text-sm font-bold text-yellow-600">{topThree[0].xp} XP</span>
            </div>
            <div className="w-28 h-44 bg-yellow-400 rounded-t-lg flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              1
            </div>
          </div>
        )}

        {/* 3rd Place (Right) */}
        {topThree[2] && (
          <div className="flex flex-col items-center">
            <div className="mb-2 flex flex-col items-center">
              <Avatar className="h-16 w-16 border-4 border-orange-400">
                <AvatarFallback className="text-xl">🥉</AvatarFallback>
              </Avatar>
              <span className="font-bold mt-1">{topThree[2].email.split("@")[0]}</span>
              <span className="text-sm text-muted-foreground">{topThree[2].xp} XP</span>
            </div>
            <div className="w-24 h-24 bg-orange-400 rounded-t-lg flex items-center justify-center text-2xl font-bold text-white shadow-md">
              3
            </div>
          </div>
        )}
      </div>

      {/* RUNNERS UP TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Challengers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {runnersUp.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-6 text-center font-mono text-muted-foreground font-bold">
                    {index + 4}
                  </span>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.email.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.email.split("@")[0]}</span>
                  </div>
                </div>
                <div className="font-bold text-muted-foreground">
                  {user.xp} XP
                </div>
              </div>
            ))}
            {runnersUp.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No other challengers yet!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}