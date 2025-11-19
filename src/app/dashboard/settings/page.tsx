"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, HelpCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings & Support</h1>
        <p className="text-muted-foreground">Manage your account and get help.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* SUPPORT SECTION */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>We are here to support your journey.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="mailto:support@leveluplife.com">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Mail className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
            <Link href="/docs">
              <Button className="w-full justify-start gap-2" variant="outline">
                <FileText className="h-4 w-4" />
                Read Documentation
              </Button>
            </Link>
             <Button className="w-full justify-start gap-2" variant="ghost">
                <HelpCircle className="h-4 w-4" />
                Help Center
              </Button>
          </CardContent>
        </Card>

        {/* ACCOUNT SECTION (Placeholder for now) */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your profile settings.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">Logged in as User.</p>
             <Button variant="destructive" className="w-full">Delete Account</Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How is XP calculated?</AccordionTrigger>
              <AccordionContent>
                XP (Experience Points) are awarded based on the difficulty of the task. Daily tasks typically award 10-20 XP, while major milestones can award 100-200 XP.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I edit a task after creating it?</AccordionTrigger>
              <AccordionContent>
                Currently, tasks cannot be edited to preserve the integrity of the gamification system. You can delete a task and create a new one if needed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is the AI plan personalized?</AccordionTrigger>
              <AccordionContent>
                Yes! The AI analyzes your specific prompt to build a custom roadmap tailored to your goal, breaking it down into manageable steps.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}