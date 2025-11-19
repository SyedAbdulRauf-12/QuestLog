import Image from "next/image";
import LandingHeader from "@/components/landing/landing-header";
import HeroSection from "@/components/landing/hero-section";
import FeaturesSection from "@/components/landing/features-section";
import Footer from "@/components/landing/footer";


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative isolate">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}