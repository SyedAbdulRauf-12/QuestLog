import Link from "next/link";
import AuthForm from "@/components/api/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react"; 
import Image from "next/image";

export default function AuthPage() {
  return (
    // 1. Base Background Color: Deep Navy (#09122C)
    <div className="relative flex min-h-screen w-full bg-[#09122C] overflow-hidden">
      
      {/* 2. Background Image with "Crimson Guard" Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/auth-page-bg (resized).png" 
          alt="Background"
          fill
          className="object-cover opacity-50" 
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-" />
      </div>

      {/* Decorative Glow Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E17564] rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#BE3144] rounded-full blur-[120px] opacity-20 pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" passHref>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-[#E17564]/10 hover:text-[#E17564] transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* 3. Container - Removed static header, AuthForm now handles it */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center p-4">
        <Suspense fallback={<div className="h-[500px] w-full max-w-md bg-[#09122C]/50 animate-pulse rounded-xl" />}>
            <AuthForm />
        </Suspense>
      </div>
    </div>
  );
}