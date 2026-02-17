"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { MobileNav } from "./mobile-nav";
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Users, 
  Settings, 
  User 
} from "lucide-react";

const navOptions = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "The Void", href: "/dashboard/planner", icon: Target },
  { name: "Hall of Heroes", href: "/dashboard/leaderboard", icon: Trophy },
  { name: "The Guild", href: "/dashboard/guild", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Safety first: extract variables with defaults
  const userName = session?.user?.name || "Adventurer";
  
  // These properties now exist thanks to our next-auth.d.ts file
  const userLevel = session?.user?.level ?? "1";
  const userClass = session?.user?.class ?? "Novice";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        
        {/* Left Side: Mobile Menu + Brand Logo */}
        <div className="flex items-center gap-2 md:gap-6">
          <MobileNav />

          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-red-900">
            <Image 
               src="/QuestLog_Logo.png"      
               alt="QuestLog Logo"
               width={32}           
               height={32}           
               className="h-8 w-8" 
            />
            <span className="hidden sm:inline">QUESTLOG</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 ml-4">
            {navOptions.map((option) => (
              <Link
                key={option.href}
                href={option.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-red-700 ${
                  pathname === option.href 
                    ? "text-red-900 underline underline-offset-4" 
                    : "text-muted-foreground"
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side: Profile and Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-none">{userName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Level {userLevel} {userClass}
            </p>
          </div>
          
          <div className="h-9 w-9 rounded-full border-2 border-yellow-600 bg-red-950 flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform overflow-hidden relative">
            {session?.user?.image ? (
              <Image 
                src={session.user.image} 
                alt={userName} 
                fill 
                className="object-cover" 
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
        </div> 
      </div>
    </header>
  );
}