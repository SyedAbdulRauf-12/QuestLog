"use client";

import { UserProfile } from "@/components/dashboard/user-profile";
import { TaskList } from "@/components/dashboard/task-list";
import { BadgesWidget } from "@/components/dashboard/BadgesWidget";
import { LeaderboardWidget } from "@/components/dashboard/leaderboard";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; 
import { ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisclaimer, setShowDisclaimer] = useState(false); 
  const [dontShowAgain, setDontShowAgain] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          router.push("/auth?tab=signin");
          return;
        }

        setUser(session.user);
        
        const hasOptedOut = localStorage.getItem("hasSeenDisclaimer");
        if (!hasOptedOut) {
          setShowDisclaimer(true);
        }

      } catch (error) {
        console.error("Auth Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          router.push("/auth?tab=signin");
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    checkUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleAcceptDisclaimer = () => {
    if (dontShowAgain) {
        localStorage.setItem("hasSeenDisclaimer", "true");
    }
    setShowDisclaimer(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading your HQ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <div className="relative min-h-full">
      
      {/* LIGHT MODE BACKGROUND (UPDATED) */}
      {/* FIX: Changed 'bg-white' to 'bg-background' to respect the new softer theme variable */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:hidden bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* DISCLAIMER MODAL */}
        <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
          <DialogContent className="sm:max-w-[500px] border-yellow-500 bg-yellow-50 dark:bg-zinc-900 dark:border-yellow-600">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500">
                <ShieldAlert className="h-6 w-6" />
                LevelUp Life: The Honor Code
              </DialogTitle>
              <DialogDescription className="pt-4 text-base text-foreground">
                <strong>Welcome, Adventurer.</strong>
                <br /><br />
                This dashboard is a tool for <em>your</em> growth. The XP and Levels are fun, but the real reward is the change in your life.
                <br /><br />
                Checking off tasks you havent done cheats only one person: <strong>You.</strong>
                <br /><br />
                Commit to honesty. Only claim XP for real work. Are you ready to change for the better?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-4 items-center sm:justify-between w-full">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dont-show" 
                  checked={dontShowAgain}
                  onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                  className="border-yellow-600 data-[state=checked]:bg-yellow-600 text-white"
                />
                <label
                  htmlFor="dont-show"
                  className="text-sm font-medium leading-none text-muted-foreground cursor-pointer"
                >
                  Dont show this again
                </label>
              </div>
              <Button onClick={handleAcceptDisclaimer} className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white">
                I Accept the Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Column 1: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <UserProfile user={user} />
          <TaskList user={user} />
        </div>

        {/* Column 2: Sidebar Content */}
        <div className="lg:col-span-1 space-y-6">
          <BadgesWidget user={user} />
          <LeaderboardWidget />
        </div>
      </div>
    </div>
  );
}