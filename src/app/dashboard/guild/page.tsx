"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, LogIn, Crown, Copy, RefreshCw} from "lucide-react"; 
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js"; // Import User type

type Party = {
    id: string;
    name: string;
    invite_code: string;
    created_by: string;
};

type PartyMember = {
    user_id: string;
    profiles: {
        display_name: string;
        xp: number;
        avatar_image: string | null;
    }
};

export default function GuildPage() {
  // FIX: Replaced 'any' with 'User | null'
  const [user, setUser] = useState<User | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [newPartyName, setNewPartyName] = useState("");
  const [joinCode, setJoinCode] = useState("");


  // FIX: Wrapped fetchGuildData in useCallback
  const fetchGuildData = useCallback(async () => {
    // Note: Removed setLoading(true) from here to avoid "setState synchronously within an effect" warning.
    // The initial state of loading is true, so first load is covered. 
    // For manual refreshes, we set loading true in the handler.
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    }
    setUser(user);

    // 1. Check if user is in a party
    const { data: membership } = await supabase
        .from('party_members')
        .select('party_id')
        .eq('user_id', user.id)
        .single();

    if (membership) {
        // 2. Fetch Party Details
        const { data: partyData } = await supabase
            .from('parties')
            .select('*')
            .eq('id', membership.party_id)
            .single();
        setParty(partyData);

        // 3. Fetch Members
        const { data: membersData } = await supabase
            .from('party_members')
            .select(`
                user_id,
                profiles (display_name, xp, avatar_image)
            `)
            .eq('party_id', membership.party_id);
        
        // FIX: Using @ts-expect-error instead of @ts-ignore as requested
        // @ts-expect-error: Supabase join typing can be tricky
        setMembers(membersData || []);
    } else {
        setParty(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGuildData();
  }, [fetchGuildData]); 

  const handleCreateParty = async () => {
    if (!newPartyName.trim() || !user) return;
    
    // Generate simple 5-char code
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();

    // 1. Create Party
    const { data: newParty, error } = await supabase
        .from('parties')
        .insert({
            name: newPartyName,
            invite_code: code,
            created_by: user.id
        })
        .select()
        .single();

    if (error) {
        alert("Error creating party: " + error.message);
        return;
    }

    // 2. Add Creator as Member
    await supabase.from('party_members').insert({
        party_id: newParty.id,
        user_id: user.id
    });

    fetchGuildData();
  };

  const handleJoinParty = async () => {
    if (!joinCode.trim() || !user) return;

    // 1. Find Party by Code
    const { data: foundParty, error } = await supabase
        .from('parties')
        .select('id')
        .eq('invite_code', joinCode.toUpperCase())
        .single();

    if (error || !foundParty) {
        alert("Party not found! Check the code.");
        return;
    }

    // 2. Join
    const { error: joinError } = await supabase
        .from('party_members')
        .insert({
            party_id: foundParty.id,
            user_id: user.id
        });

    if (joinError) {
        alert("Could not join party (Maybe already a member?): " + joinError.message);
    } else {
        fetchGuildData();
    }
  };

  const handleLeaveParty = async () => {
      // FIX: Added null check for user
      if (!user) return;
      if (!confirm("Are you sure you want to leave the guild?")) return;
      
      await supabase
        .from('party_members')
        .delete()
        .eq('user_id', user.id)
        .eq('party_id', party?.id);
        
      fetchGuildData();
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Entering the Guild Hall...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            The Guild
        </h1>
        <p className="text-muted-foreground">Join forces with other adventurers to track progress together.</p>
      </div>

      {!party ? (
        /* --- NO PARTY STATE --- */
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-solid ">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Create a Guild</CardTitle>
                    <CardDescription>Start a new party and invite your friends.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Guild Name</label>
                        <Input placeholder="e.g. The Night's Watch" value={newPartyName} onChange={e => setNewPartyName(e.target.value)} />
                    </div>
                    <Button className="w-full" onClick={handleCreateParty} disabled={!newPartyName}>Create Guild</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LogIn className="w-5 h-5" /> Join a Guild</CardTitle>
                    <CardDescription>Enter an invite code to join an existing party.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Invite Code</label>
                        <Input placeholder="e.g. AX92" value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                    </div>
                    <Button variant="secondary" className="w-full" onClick={handleJoinParty} disabled={!joinCode}>Join Guild</Button>
                </CardContent>
            </Card>
        </div>
      ) : (
        /* --- ACTIVE PARTY STATE --- */
        <div className="space-y-6">
            {/* Party Header - Updated Visibility */}
            <Card className="bg-card border-primary/40 shadow-lg">
                <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">{party.name}</h2>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full w-fit border border-white/5">
                            <span>Invite Code:</span>
                            <span className="font-mono font-bold text-foreground tracking-widest">{party.invite_code}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(party.invite_code)}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         {/* FIX: Manually triggering loading state for refresh */}
                         <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchGuildData(); }}><RefreshCw className="h-4 w-4" /></Button>
                         <Button variant="destructive" size="sm" onClick={handleLeaveParty}>Leave Guild</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Members List - Updated Visibility */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => (
                    <Card key={member.user_id} className="flex items-center gap-4 p-4 bg-card border-white/10 shadow-sm hover:border-primary/30 transition-colors">
                        <Avatar className="h-12 w-12 border-2 border-muted">
                            {member.profiles.avatar_image && <AvatarImage src={`/avatars/${member.profiles.avatar_image}`} />}
                            <AvatarFallback>{member.profiles.display_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold flex items-center gap-2">
                                {member.profiles.display_name || "Adventurer"}
                                {party.created_by === member.user_id && <Crown className="h-3 w-3 text-yellow-500" />}
                            </p>
                            <p className="text-sm text-muted-foreground">{member.profiles.xp} XP</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      )}

    </div>
  );
}