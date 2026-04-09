'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mic, Lock, Download, ChevronLeft } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Mic size={32} className="text-neon" />,
      title: "Capture the Moment",
      description: "Hosts create a unique event link. Guests visit the link to record a voice message directly from their browser—no app install required."
    },
    {
      icon: <Lock size={32} className="text-neon" />,
      title: "Private Archives",
      description: "Every event is protected by an optional custom access code. Only you and those you trust can listen to the stored fragments of audio."
    },
    {
      icon: <Download size={32} className="text-neon" />,
      title: "Keep the Memories",
      description: "Download individual messages or export the entire archive as a ZIP file. Perfect for weddings, birthdays, or digital time capsules."
    }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neon flex flex-col items-center px-6 py-24">
      <Navigation />
      <div className="bg-grain fixed inset-0 z-0 pointer-events-none opacity-20" />
      
      <div className="z-10 w-full max-w-4xl flex flex-col gap-16 md:gap-24">
        <header className="text-center flex flex-col gap-4">
          <p className="text-[10px] uppercase tracking-[0.5em] opacity-40">Documentation</p>
          <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight">How it Works</h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col gap-6 p-8 border border-neon/10 bg-neon/[0.02] hover:bg-neon/[0.04] transition-colors group">
              <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                {step.icon}
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-serif italic text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed opacity-60 font-light">
                  {step.description}
                </p>
              </div>
              <span className="mt-auto text-[10px] font-mono opacity-20">0{index + 1}</span>
            </div>
          ))}
        </section>

        <section className="border-y border-neon/10 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-2xl font-serif italic mb-4">Ready to start?</h2>
            <p className="text-sm opacity-50">Create your first event and start collecting voices from the people who matter most.</p>
          </div>
          <Link 
            href="/create"
            className="px-10 py-4 rounded-full bg-neon text-black font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            Create Event
          </Link>
        </section>

        <footer className="flex justify-center">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={12} /> Back to Home
          </Link>
        </footer>
        <Footer />
      </div>
    </main>
  );
}