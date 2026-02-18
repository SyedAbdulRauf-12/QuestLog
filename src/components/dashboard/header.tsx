"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserNav } from "@/components/dashboard/user-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav"; 
import { cn } from "@/lib/utils"; // Utility for conditional classes

export default function Header() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/planner",
      label: "AI Planner",
      active: pathname === "/dashboard/planner",
    },
    {
      href: "/dashboard/leaderboard",
      label: "Leaderboard",
      active: pathname === "/dashboard/leaderboard",
    },
    {
      href: "/dashboard/guild",
      label: "The Guild",
      active: pathname === "/dashboard/guild",
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      active: pathname === "/dashboard/settings",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        
        {/* MOBILE: Hamburger Menu (Hidden on Desktop) */}
        <div className="md:hidden mr-2">
          <MobileNav />
        </div>

        {/* LOGO (Visible on all screens) */}
        <div className="mr-8 hidden md:flex">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Image 
              src="/QuestLog_Logo.png" 
              alt="QuestLog Logo"
              width={24} 
              height={24} 
              className="h-6 w-6"
            />
            <span className="hidden lg:inline-block">QuestLog</span>
          </Link>
        </div>

        {/* DESKTOP NAV LINKS (Hidden on Mobile) */}
        <nav className="flex items-center space-x-6 text-sm font-medium hidden md:flex">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "transition-colors hover:text-primary",
                route.active ? "text-foreground font-bold" : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE: User Menu */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}