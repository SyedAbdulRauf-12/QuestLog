"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NavLinks } from "@/components/dashboard/nav-links";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent side="left" className="pr-0 bg-background border-r border-border w-72">
        <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
        
        <div className="px-6 pb-6 border-b border-border flex items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary" onClick={() => setOpen(false)}>
            <Image 
              src="/logo.svg" 
              alt="QuestLog Logo"
              width={24} 
              height={24} 
              className="h-6 w-6"
            />
            <span className="">QuestLog</span>
          </Link>
        </div>
        
        <div className="px-4 py-6">
          <NavLinks onLinkClick={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}