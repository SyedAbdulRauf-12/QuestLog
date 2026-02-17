"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target, // Reverted to Target
  Trophy,
  Settings,
  Users,
} from "lucide-react";

export function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "The Void", href: "/dashboard/void", icon: Target },
    { name: "Hall of Heroes", href: "/dashboard/hall-of-heroes", icon: Trophy },
    { name: "The Guild", href: "/dashboard/guild", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <ul className="flex flex-row items-center gap-2">
      {navItems.map((item) => (
        <li key={item.href}>
          <Link href={item.href} onClick={onLinkClick}>
            <Button 
              variant={isActive(item.href) ? "secondary" : "ghost"} 
              className={`justify-start gap-2 h-9 px-3 ${
                isActive(item.href) ? "text-red-900 font-bold" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{item.name}</span>
            </Button>
          </Link>
        </li>
      ))}
    </ul>
  );
}