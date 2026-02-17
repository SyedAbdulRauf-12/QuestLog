import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 1. Updated Imports to match your actual file locations
import Header from "@/components/dashboard/header";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/components/session-provider"; // Points to your src/components/session-provider.tsx

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuestLog | Gamify Your Grind",
  description: "A medieval-themed self-improvement dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. Wrap in AuthProvider first, then ThemeProvider */}
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen w-full bg-muted/40">
              
              {/* 3. Global Header */}
              <Header />

              <main className="flex-1">
                <div className="mx-auto max-w-7xl p-4 md:p-8 lg:p-10">
                  {children}
                </div>
              </main>
              
              <footer className="py-6 border-t bg-background/50 text-center text-xs text-muted-foreground">
                © 2026 QuestLog — Gamify Your Grind
              </footer>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}