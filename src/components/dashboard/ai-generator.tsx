// File: components/dashboard/ai-generator.tsx

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export function AIGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          AI Quest Planner
        </CardTitle>
        <CardDescription>
          Tell the AI your new goal.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="e.g. 'Learn to cook healthy meals'" />
        <Button className="w-full">Generate Plan</Button>
      </CardContent>
    </Card>
  );
}