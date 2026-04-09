'use client';

import Link from 'next/link';
import './css/Footer.css';

export default function Footer() {
  return (
    <footer className="w-full border-t border-neon/10 py-12 px-6 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-2xl font-serif italic tracking-tighter text-neon">
          Leave a Message
        </div>
        
        <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] font-mono">
          <Link href="/how-it-works" className="opacity-40 hover:opacity-100 transition-opacity">
            [ How it Works ]
          </Link>
          <Link href="/privacy" className="opacity-40 hover:opacity-100 transition-opacity">
            [ Privacy Policy ]
          </Link>
          <Link href="/terms" className="opacity-40 hover:opacity-100 transition-opacity">
            [ Terms ]
          </Link>
        </div>

        <div className="text-[10px] opacity-20 font-mono">
          © 2026
        </div>
      </div>
    </footer>
  );
}