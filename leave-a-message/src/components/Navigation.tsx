'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="w-full flex justify-between items-center p-8 absolute top-0 left-0 z-50">
      <Link 
        href="/"
        className="text-2xl font-black cursor-pointer tracking-tighter text-neon group"
      >
        QL<span className="text-white group-hover:text-neon transition-colors">.</span>
      </Link>

      <div className="flex gap-8 text-[10px] font-bold tracking-[0.3em] uppercase text-neon/80">
        <Link 
          href="/how-it-works" 
          className="hover:line-through transition-all hover:text-neon"
        >
          How It Works
        </Link>
      </div>
    </nav>
  );
}