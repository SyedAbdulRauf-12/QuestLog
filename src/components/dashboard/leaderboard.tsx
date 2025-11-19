// File: components/dashboard/leaderboard.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

// Dummy Leaderboard Data
const leaderboard = [
  { id: 1, name: "CodeWizard", xp: 1250, rank: 1 },
  { id: 2, name: "PixelQueen", xp: 1100, rank: 2 },
  { id: 3, name: "Dummy User", xp: 650, rank: 3 }, // This is you!
  { id: 4, name: "ReactRookie", xp: 300, rank: 4 },
];

export function Leaderboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {leaderboard.map((user) => (
            <li key={user.id} className="flex items-center gap-4">
              <span className="text-lg font-bold w-6">#{user.rank}</span>
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p 
                  className={`font-medium ${user.name === 'Dummy User' ? 'text-primary' : ''}`}
                >
                  {user.name}
                </p>
              </div>
              <span className="font-bold">{user.xp} XP</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}