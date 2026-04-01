'use client';

import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neon relative overflow-hidden">
      <div className="bg-grain fixed inset-0 z-50 pointer-events-none opacity-20" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
  
        <Navigation />
        
        <div className="flex-1 flex flex-col animate-in fade-in duration-1000">
          <HeroSection />
        </div>
      </div>
    </main>
  );
}