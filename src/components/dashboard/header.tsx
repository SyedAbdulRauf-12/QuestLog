"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserNav } from "@/components/dashboard/user-nav";
import { MobileNav } from "@/components/dashboard/mobile-nav"; 
import { cn } from "@/lib/utils"; // Utility for conditional classes

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-8">
      <MobileNav />
      <div className="flex-1">
        {/* You can add a Search Bar here later */}
      </div>
    </header>
  );
}