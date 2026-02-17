import Header from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 1. Change 'flex' to 'flex-col' so the Header stays on top
    <div className="flex flex-col min-h-screen w-full bg-muted/40">
      
      {/* 2. REMOVED <Sidebar /> from here completely */}

      {/* 3. The Header now sits at the top of the vertical stack */}
      <Header />
      
      {/* 4. The Page Content fills the rest of the space */}
      <main className="flex-1 p-4 md:p-8 lg:p-10">
        {/* Optional: Add a container to keep content centered on wide screens */}
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}