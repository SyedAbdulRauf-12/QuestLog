"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react"; 

type Profile = { 
    id: string; 
    email: string; 
    xp: number; 
    display_name: string | null; 
    avatar_image: string | null; // Added field
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, xp, display_name, avatar_image") // Fetch image
        .order("xp", { ascending: false })
        .limit(20);
      if (data) setLeaders(data);
    };
    fetchLeaderboard();
  }, []);

  if (leaders.length === 0) return <div className="p-8 text-center">Loading champions...</div>;

  const getName = (p: Profile) => p.display_name || p.email.split("@")[0];
  const getInitials = (p: Profile) => getName(p).substring(0, 2).toUpperCase();

  const topThree = leaders.slice(0, 3);
  const runnersUp = leaders.slice(3);

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-2 md:px-0">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Global Leaderboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">Compete for glory and XP.</p>
      </div>

      {/* PODIUM SECTION */}
      <div className="flex justify-center items-end gap-2 md:gap-4 min-h-[200px] md:min-h-[250px] py-8 transform scale-95 md:scale-100 origin-bottom">
        
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center w-1/3 max-w-[100px]">
            <div className="mb-2 flex flex-col items-center">
              <Avatar className="h-12 w-12 md:h-16 md:w-16 border-4 border-gray-300">
                {/* Avatar Image */}
                {topThree[1].avatar_image && <AvatarImage src={`/avatars/${topThree[1].avatar_image}`} className="object-cover" />}
                <AvatarFallback className="text-lg md:text-xl">{getInitials(topThree[1])}</AvatarFallback>
              </Avatar>
              <span className="font-bold mt-1 text-xs md:text-base truncate w-full text-center">
                  {getName(topThree[1])}
              </span>
              <span className="text-[10px] md:text-sm text-muted-foreground">{topThree[1].xp} XP</span>
            </div>
            <div className="w-full h-24 md:h-32 bg-gray-300 rounded-t-lg flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-md">
              2
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="flex flex-col items-center w-1/3 max-w-[120px] -mt-4 z-10">
             <Crown className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 mb-2 animate-bounce" />
            <div className="mb-2 flex flex-col items-center">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-yellow-400">
                {/* Avatar Image */}
                {topThree[0].avatar_image && <AvatarImage src={`/avatars/${topThree[0].avatar_image}`} className="object-cover" />}
                <AvatarFallback className="text-xl md:text-2xl">{getInitials(topThree[0])}</AvatarFallback>
              </Avatar>
              <span className="font-bold mt-1 text-sm md:text-lg truncate w-full text-center">
                  {getName(topThree[0])}
              </span>
              <span className="text-xs md:text-sm font-bold text-yellow-600">{topThree[0].xp} XP</span>
            </div>
            <div className="w-full h-36 md:h-44 bg-yellow-400 rounded-t-lg flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-lg">
              1
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center w-1/3 max-w-[100px]">
            <div className="mb-2 flex flex-col items-center">
              <Avatar className="h-12 w-12 md:h-16 md:w-16 border-4 border-orange-400">
                {/* Avatar Image */}
                {topThree[2].avatar_image && <AvatarImage src={`/avatars/${topThree[2].avatar_image}`} className="object-cover" />}
                <AvatarFallback className="text-lg md:text-xl">{getInitials(topThree[2])}</AvatarFallback>
              </Avatar>
              <span className="font-bold mt-1 text-xs md:text-base truncate w-full text-center">
                  {getName(topThree[2])}
              </span>
              <span className="text-[10px] md:text-sm text-muted-foreground">{topThree[2].xp} XP</span>
            </div>
            <div className="w-full h-16 md:h-24 bg-orange-400 rounded-t-lg flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-md">
              3
            </div>
          </div>
        )}
      </div>

      {/* RUNNERS UP TABLE */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Challengers</CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          <div className="space-y-0 divide-y md:space-y-4 md:divide-y-0">
            {runnersUp.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 md:p-2 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3 md:gap-4">
                  <span className="w-6 text-center font-mono text-muted-foreground font-bold text-sm">
                    {index + 4}
                  </span>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Avatar className="h-6 w-6 md:h-8 md:w-8 border border-white/10">
                      {/* Avatar Image */}
                      {user.avatar_image && <AvatarImage src={`/avatars/${user.avatar_image}`} className="object-cover" />}
                      <AvatarFallback className="text-[10px] md:text-xs">{getInitials(user)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm md:text-base truncate max-w-[120px] md:max-w-none">
                        {getName(user)}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-muted-foreground text-sm md:text-base">
                  {user.xp} XP
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}