"use client";

import Link from "next/link";
import Image from "next/image"; // 1. Import Image
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Target,
  Trophy,
  Settings,
  // Zap, <-- You can remove this import if you aren't using it anymore
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="hidden w-64 flex-col border-r bg-background md:flex">
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {/* 2. Replace the Lucide Icon with your Custom Image */}
          <Image 
            src="/faviconpng.png"       // Ensure this matches your filename in /public
            alt="LevelUp Life Logo"
            width={40}            // Adjust width (24px = h-6)
            height={40}           // Adjust height
            className="h-10 w-10"   // Tailwind class to enforce size
          />
          <span className="">LevelUp Life</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard">
              <Button 
                variant={isActive("/dashboard") ? "secondary" : "ghost"} 
                className="w-full justify-start gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/planner">
              <Button 
                variant={isActive("/dashboard/planner") ? "secondary" : "ghost"} 
                className="w-full justify-start gap-2"
              >
                <Target className="h-4 w-4" />
                AI Planner
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/leaderboard">
              <Button 
                variant={isActive("/dashboard/leaderboard") ? "secondary" : "ghost"} 
                className="w-full justify-start gap-2"
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/settings">
              <Button 
                variant={isActive("/dashboard/settings") ? "secondary" : "ghost"} 
                className="w-full justify-start gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}