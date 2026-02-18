"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UserNav() {
  const router = useRouter();
  const [email, setEmail] = useState("user@example.com");
  const [name, setName] = useState("User"); 
  const [initials, setInitials] = useState("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user && data.user.email) {
        const userEmail = data.user.email;
        setEmail(userEmail);
        
        // Fetch display name AND avatar from profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_image")
            .eq("id", data.user.id)
            .single();

        const displayName = profile?.display_name || userEmail.split("@")[0];
        
        setName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
        setInitials(displayName.substring(0, 2).toUpperCase());
        
        // Set avatar URL if it exists
        if (profile?.avatar_image) {
            setAvatarUrl(`/avatars/${profile.avatar_image}`);
        }
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Updated Button to be flexible width and contain text */}
        <Button variant="ghost" className="relative h-10 w-auto rounded-full px-2 flex items-center gap-2 hover:bg-muted/50">
          <span className="hidden md:inline-block text-sm font-medium text-foreground">{name}</span>
          <Avatar className="h-8 w-8 border border-white/10">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={name} className="object-cover" />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}