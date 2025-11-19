// File: app/dashboard/page.tsx

import { UserProfile } from "@/components/dashboard/user-profile";
import { TaskList } from "@/components/dashboard/task-list";
import { AIGenerator } from "@/components/dashboard/ai-generator";
import { Leaderboard } from "@/components/dashboard/leaderboard";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      {/* Column 1: Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Widget 1: User Profile / XP Bar */}
        <UserProfile />

        {/* Widget 2: Task List */}
        <TaskList />
      </div>

      {/* Column 2: Sidebar Content */}
      <div className="lg:col-span-1 space-y-6">
        {/* Widget 3: AI Task Generator */}
        <AIGenerator />
        
        {/* Widget 4: Leaderboard */}
        <Leaderboard />
      </div>
    </div>
  );
}