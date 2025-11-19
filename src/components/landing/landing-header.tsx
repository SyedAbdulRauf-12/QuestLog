import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

export default function LandingHeader() {
  return (
    <header className="p-4 bg-background border-b ">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/faviconpng.png" // Assumes logo.svg is in /public
            alt="LevelUp Life Logo"
            width={40} // Set your logo's width
            height={40} // Set your logo's height
            className="h-10 w-12" // You can also use Tailwind for size
          />
          <span className="text-2xl font-bold text-primary">
            LevelUp Life
          </span>
        </Link>
        <nav className="flex gap-4 items-center">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="/auth?tab=signin">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/auth?tab=signup">
            <Button>Get Started</Button>
          </Link>
          <ModeToggle />
        </nav>
      </div>
    </header>
  );
}