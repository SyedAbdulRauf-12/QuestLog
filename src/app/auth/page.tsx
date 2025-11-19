// File: app/auth/page.tsx

import Link from "next/link";
import AuthForm from "@/components/auth/auth-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react"; 

export default function AuthPage() {
  return (
    <div className="relative flex justify-center items-center min-h-screen bg-linear-to-br from-indigo-800 via-purple-800 to-indigo-900 p-4">
      
      <Link href="/" passHref>
        <Button 
          variant="ghost" 
          className="absolute top-6 left-6 text-white hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </Link>

      <Suspense fallback={<div className="w-[400px] h-[450px]" />}>
        <AuthForm />
      </Suspense>

    </div>
  );
}