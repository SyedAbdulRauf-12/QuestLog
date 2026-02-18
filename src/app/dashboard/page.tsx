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
import { Input } from "@/components/ui/input";
import { ShieldAlert, UserPlus } from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showDisclaimer, setShowDisclaimer] = useState(false); 
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false); 
  
  const [newUsername, setNewUsername] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

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
        
        const hasOptedOut = localStorage.getItem("hasSeenDisclaimer_v2");
        if (!hasOptedOut) {
          setShowDisclaimer(true);
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', session.user.id)
            .single();
        
        if (error || !profile || !profile.display_name) {
            setShowUsernameModal(true);
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
        localStorage.setItem("hasSeenDisclaimer_v2", "true");
    }
    setShowDisclaimer(false);
  };

  const handleSaveUsername = async () => {
      if (!user || !newUsername.trim()) return;
      setIsUpdatingName(true);

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', user.id)
        .single();
      
      const currentXp = existingProfile?.xp || 0;

      const { error } = await supabase
        .from('profiles')
        .upsert({ 
            id: user.id, 
            email: user.email,
            display_name: newUsername,
            xp: currentXp 
        }, { onConflict: 'id' });

      if (!error) {
          setShowUsernameModal(false);
          window.location.reload(); 
      } else {
          alert("Error saving name: " + error.message);
      }
      setIsUpdatingName(false);
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* MODAL 1: DISCLAIMER */}
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
                Checking off tasks you have not done cheats only one person: <strong>You.</strong>
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
                  Do not show this again
                </label>
              </div>
              <Button onClick={handleAcceptDisclaimer} className="w-full sm:w-auto bg-yellow-600 hover:bg-yellow-700 text-white">
                I Accept the Challenge
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL 2: SET USERNAME */}
        <Dialog open={showUsernameModal} onOpenChange={() => { }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-primary">
                <UserPlus className="h-6 w-6" />
                New Feature: Identity
              </DialogTitle>
              <DialogDescription className="pt-2">
                We have rolled out a new feature! You can now have a unique <strong>Adventuring Name</strong> instead of just an email.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <label htmlFor="new-username" className="text-sm font-medium mb-2 block">Choose your name:</label>
                <Input 
                    id="new-username" 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. DragonSlayer99" 
                />
            </div>
            <DialogFooter>
                <Button onClick={handleSaveUsername} disabled={!newUsername.trim() || isUpdatingName}>
                    {isUpdatingName ? "Saving..." : "Set Adventuring Name"}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="lg:col-span-2 space-y-6">
          <UserProfile user={user} />
          <TaskList user={user} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <BadgesWidget user={user} />
          <LeaderboardWidget />
        </div>
      </div>
    </div>
  );
}