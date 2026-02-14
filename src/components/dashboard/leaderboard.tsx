"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useEffect, useState } from "react";

type Profile = { 
    id: string; 
    email: string; 
    xp: number; 
    display_name: string | null;
    avatar_image: string | null; // Added field
};

export function LeaderboardWidget() {
  const [leaders, setLeaders] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, email, xp, display_name, avatar_image") // Fetch image
        .order("xp", { ascending: false })
        .limit(5); 
      
      if (data) setLeaders(data);
    };
    
    fetchLeaders();
    
    const interval = setInterval(fetchLeaders, 30000);
    return () => clearInterval(interval);
  }, []);

  const getName = (p: Profile) => p.display_name || p.email.split("@")[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Players
        </CardTitle>
        <Link href="/dashboard/leaderboard">
            <Button variant="ghost" size="icon" title="View Full Leaderboard">
                <ArrowRight className="h-4 w-4" />
            </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaders.map((user, index) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold 
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      index === 1 ? 'bg-slate-100 text-slate-700' : 
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}`}>
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8 border border-white/10">
                   {/* FIX: Render Avatar Image */}
                  {user.avatar_image && <AvatarImage src={`/avatars/${user.avatar_image}`} className="object-cover" />}
                  <AvatarFallback className="text-xs">
                    {getName(user).substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate max-w-[100px]">
                    {getName(user)}
                </span>
              </div>
              <span className="text-sm font-bold text-muted-foreground">{user.xp} XP</span>
            </div>
          ))}
          
          {leaders.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
                Loading stats...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}