// File: app/dashboard/layout.tsx

import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* 1. The Sidebar (Persistent) */}
      <Sidebar />

      {/* 2. The Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* 2a. Top Header Bar */}
        <Header />
        
        {/* 2b. The Page Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}