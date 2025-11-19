import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/dashboard/user-nav"; 

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-8">
      <div className="flex-1">
        {/* You can add a Search Bar here later */}
      </div>
      <ModeToggle />
      <UserNav />
    </header>
  );
}