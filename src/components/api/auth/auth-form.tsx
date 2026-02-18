'use client'; 

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, User, CheckCircle2 } from "lucide-react"; 
import Image from "next/image"; // Import Image for the logo

// List of trusted domains
const ALLOWED_DOMAINS = [
  "gmail.com", "googlemail.com",
  "yahoo.com", "ymail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com",
  "icloud.com", "me.com",
  "proton.me", "protonmail.com",
  "aol.com"
];

export default function AuthForm() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'signin';

  // Track active tab to change text dynamically
  const [activeTab, setActiveTab] = useState(defaultTab);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const domain = email.split('@')[1];
    if (!domain || !ALLOWED_DOMAINS.includes(domain.toLowerCase())) {
        return false;
    }
    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setMessage('');
    setIsSuccess(false);

    if (!validateEmail(email)) {
        setMessage("Please use a valid email provider (Gmail, Outlook, Yahoo, etc).");
        return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username, 
        }
      }
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      setIsSuccess(false);
    } else {
      setMessage('Success! Check your email to confirm your account.');
      setIsSuccess(true);
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setMessage('');
    setIsSuccess(false);
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setMessage(`Error: ${error.message}`);
      setIsSuccess(false);
    } else {
      router.push('/dashboard');
      router.refresh(); 
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center w-full px-4">
      
      {/* DYNAMIC HEADER SECTION */}
      <div className="mb-8 text-center space-y-2">
        <Image 
          src="/QuestLog_Logo.png" 
          alt="Logo" 
          width={60} 
          height={60} 
          className="mx-auto mb-4 drop-shadow-[0_0_15px_rgba(190,49,68,0.6)]" 
        />
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          {activeTab === 'signup' ? "Welcome" : "Welcome Back"}
        </h1>
        <p className="text-[#E17564] font-medium text-outline">
          {activeTab === 'signup' ? "Ready to start your adventure?" : "Ready to continue your adventure?"}
        </p>
      </div>

      <Tabs 
        defaultValue={defaultTab} 
        onValueChange={(val) => setActiveTab(val)} // Update state on tab switch
        className="w-full max-w-[400px]"
      >
        <TabsList className="grid w-full grid-cols-2 bg-[#09122C]/80 border border-[#E17564]/20 text-[#E17564]">
          <TabsTrigger value="signin" className="data-[state=active]:bg-[#BE3144] data-[state=active]:text-white">Sign In</TabsTrigger>
          <TabsTrigger value="signup" className="data-[state=active]:bg-[#BE3144] data-[state=active]:text-white">Sign Up</TabsTrigger>
        </TabsList>
        
        {/* CUSTOM AUTH CARD STYLING */}
        {/* We use specific background colors here to separate it from feature cards */}
        
        {/* Sign In Tab */}
        <TabsContent value="signin">
          <Card className="backdrop-blur-xl bg-[#09122C]/80 border border-[#E17564]/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Sign In</CardTitle>
              <CardDescription className="text-gray-400">
                Login to access your QuestLog.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in" className="text-gray-200">Email</Label>
                  <Input 
                    id="email-in" 
                    type="email" 
                    placeholder="Enter your valid Email ID"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={loading}
                    required 
                    className="bg-[#09122C]/50 border-[#872341]/50 text-white placeholder:text-gray-500 focus-visible:ring-[#BE3144]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-in" className="text-gray-200">Password</Label>
                  <Input 
                    id="password-in" 
                    type="password" 
                    placeholder="Enter your password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={loading}
                    required 
                    className="bg-[#09122C]/50 border-[#872341]/50 text-white placeholder:text-gray-500 focus-visible:ring-[#BE3144]"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button type="submit" className="w-full bg-[#BE3144] hover:bg-[#a02334] text-white" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </CardFooter>
            </form>

          </Card>
        </TabsContent>

        {/* Sign Up Tab */}
        <TabsContent value="signup">
          <Card className="backdrop-blur-xl bg-[#09122C]/80 border border-[#E17564]/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Sign Up</CardTitle>
              <CardDescription className="text-gray-400">
                Create a free account to start leveling up.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-200">Adventuring Name</Label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input 
                        id="username" 
                        type="text" 
                        placeholder="e.g. PixelWarrior"
                        className="pl-9 bg-[#09122C]/50 border-[#872341]/50 text-white placeholder:text-gray-500 focus-visible:ring-[#BE3144]"
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        disabled={loading} 
                        required
                        minLength={3}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-up" className="text-gray-200">Email</Label>
                  <Input 
                    id="email-up" 
                    type="email" 
                    placeholder="Enter your valid Email ID"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={loading} 
                    required
                    className="bg-[#09122C]/50 border-[#872341]/50 text-white placeholder:text-gray-500 focus-visible:ring-[#BE3144]"
                  />
                  <p className="text-[10px] text-gray-400">
                    Only authentic providers (Gmail, Outlook, etc.) allowed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-up" className="text-gray-200">Password</Label>
                  <Input 
                    id="password-up" 
                    type="password" 
                    placeholder="Enter your password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={loading}
                    required 
                    className="bg-[#09122C]/50 border-[#872341]/50 text-white placeholder:text-gray-500 focus-visible:ring-[#BE3144]"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button type="submit" className="w-full bg-[#BE3144] hover:bg-[#a02334] text-white" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </CardFooter>
            </form>

          </Card>
        </TabsContent>
      </Tabs>
      
      {message && (
        <div 
          className={`mt-4 w-full max-w-[400px] rounded-md border p-3 text-center text-sm flex items-center justify-center gap-2 ${
            isSuccess 
              ? "border-green-500/50 bg-green-900/30 text-green-400" 
              : "border-destructive/50 bg-destructive/10 text-destructive"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span className="wrap-break-word">{message}</span>
        </div>
      )}
    </div>
  );
}