import Header from "@/components/dashboard/header";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Removed 'bg-background' so the image shows through
    <div className="flex min-h-screen flex-col relative">
      
      {/* --- FIXED GLOBAL DASHBOARD BACKGROUND --- */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-background">
        <Image
          src="/Dashboard-bg.png" // Using the same image as landing page
          alt="Dashboard Background"
          fill
          className="object-cover blur-[2px] opacity-30" // Blured and low opacity to blend with the dark theme
          priority
        />
      </div>
      {/* --- END BACKGROUND --- */}

      {/* Top Header Navigation */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-8 lg:p-10 relative z-10">
        {children}
      </main>
      
    </div>
  );
}