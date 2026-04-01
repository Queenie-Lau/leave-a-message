'use client';

import React, { useState } from 'react';

interface CreateEventProps {
  onCreated: () => void;
}

export default function CreateEventSection({ onCreated }: CreateEventProps) {
  const [eventName, setEventName] = useState('');

  return (
    <section className="flex-1 flex items-center justify-center p-10 mt-20 min-h-[80vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-7xl w-full items-center">
        
        {/* Left: Interactive Form */}
        <div className="flex flex-col gap-10 z-10">
          <h2 className="text-7xl md:text-8xl font-serif italic text-neon leading-[0.9] tracking-tighter">
            Create <br /> Event
          </h2>
          
          <div className="flex flex-col gap-10 max-w-md">
            {/* Event Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neon font-bold opacity-50">
                Event Name
              </label>
              <input 
                type="text" 
                placeholder="E.G. THE JOHNSON WEDDING"
                className="bg-transparent border-b border-neon/30 py-4 outline-none text-2xl uppercase text-neon placeholder:text-neon/10 focus:border-neon transition-colors"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neon font-bold opacity-50">
                Password (Optional)
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="bg-transparent border-b border-neon/30 py-4 outline-none text-2xl text-neon focus:border-neon transition-colors"
              />
            </div>

            {/* Submit Button - Black text on Yellow is correct here per design */}
            <button 
              onClick={onCreated}
              className="w-full bg-neon text-black py-6 rounded-full font-black uppercase tracking-widest mt-6 hover:shadow-[0_0_30px_rgba(223,255,0,0.4)] active:scale-95 transition-all duration-300"
            >
              Generate Voicemail Box
            </button>
          </div>
        </div>

        {/* Right: Asset Image (Robotic Hand) */}
        <div className="hidden md:block relative h-[700px]">
          {/* Subtle Glow behind the asset */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-neon/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div 
            className="absolute inset-0 bg-contain bg-no-repeat bg-center grayscale contrast-125 brightness-75"
            style={{ backgroundImage: "url('/robot-hand-phone.png')" }}
          />
        </div>
      </div>
    </section>
  );
}