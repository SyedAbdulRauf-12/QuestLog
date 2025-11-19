import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative isolate py-20 md:py-32 text-center overflow-hidden">
      
      {/* Background Gradient & Image */}
      <div className="absolute inset-0 -z-10">
        {/* The Gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-indigo-300 via-white to-purple-100" />
        
        {/* The SVG Image (Optional, but looks great) */}
        <Image
          src="/hero-bg.svg"
          alt="Abstract background"
          fill
          className="object-cover opacity-500"
        />
        
      </div>

      <div className="container mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-indigo-500 max-w-3xl mx-auto">
          Turn Your Habits into a Real-Life RPG
        </h1>
        <p className="mt-6 text-lg text-white max-w-xl mx-auto">
          The AI-powered task tracker that gamifies your goals. Earn XP, level up, and conquer your milestones.
        </p>
        <div className="mt-10">
          <Link href="/auth?tab=signup">
            <Button size="lg" className="text-lg">
              Start Your Quest (It is Free)
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}