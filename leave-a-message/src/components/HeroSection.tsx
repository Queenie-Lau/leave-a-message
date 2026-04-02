'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full flex flex-col justify-end p-10 pb-20 overflow-hidden">
      {/* Background Asset - Ensure hero-hands.jpg is in your /public folder */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center grayscale contrast-150 brightness-[0.7]"
        style={{ backgroundImage: "url('/hero-hands.jpg')" }}
      />
      
      {/* Gradient overlay to make the neon yellow pop */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-end">
        {/* Tags */}
        <div className="flex gap-4 mb-4 text-[10px] font-bold tracking-[0.3em] uppercase text-neon">
          <span className="flex items-center gap-1">❋ Weddings</span> 
          <span className="flex items-center gap-1">❋ Parties</span> 
          <span className="flex items-center gap-1">❋ Trips</span>
        </div>

        {/* Hero Title - Editorial sizing */}
        <h1 className="text-8xl md:text-[11rem] font-serif italic leading-[0.75] text-right mb-12 text-neon tracking-tighter">
          LEAVE A<br />MESSAGE
        </h1>

        {/* Bottom Bar */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between border-t border-neon/30 pt-8 gap-6">
          <p className="max-w-xs text-[10px] uppercase tracking-[0.2em] leading-relaxed text-neon/70">
            Pick up the phone and record a digital voicemail for your loved ones to keep forever
          </p>
          
          {/* Use Link for actual navigation */}
          <Link 
            href="/create"
            className="group flex items-center gap-4 border border-neon rounded-full px-10 py-4 hover:bg-neon/10 transition-all duration-500"
          >
            <span className="uppercase font-bold text-sm tracking-tighter text-neon">
              Let's Go
            </span>
            <span className="text-xl text-neon group-hover:translate-x-2 transition-transform italic duration-500">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}