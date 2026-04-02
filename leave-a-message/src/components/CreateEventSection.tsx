'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreateEventSection() {
  const [eventName, setEventName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    console.log("🚀 handleCreate triggered");
    if (!eventName) return alert("Please enter an event name");
    
    setIsSubmitting(true);

    const slug = eventName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      console.log("☁️ Inserting to Supabase:", { eventName, slug });
      const { data, error } = await supabase
        .from('events')
        .insert([{ name: eventName, slug: slug, password: password }])
        .select();

      if (error) {
        console.error("❌ Supabase Error:", error);
        alert(`Error: ${error.message}`);
      } else if (data) {
        console.log("✅ Success! Redirecting...");
        router.push(`/dashboard/${data[0].slug}`);
      }
    } catch (err) {
      console.error("💥 Crash:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex-1 flex items-center justify-center p-10 mt-20 min-h-[80vh] relative">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-w-7xl w-full items-center relative">
        
        {/* Left Column - Higher Z-Index */}
        <div className="flex flex-col gap-10 relative z-[100]">
          <h2 className="text-7xl md:text-8xl font-serif italic text-neon leading-[0.9] tracking-tighter">
            Create <br /> Event
          </h2>
          
          <div className="flex flex-col gap-10 max-w-md">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neon font-bold opacity-50">Event Name</label>
              <input 
                type="text" 
                placeholder="E.G. THE JOHNSON WEDDING"
                className="bg-transparent border-b border-neon/30 py-4 outline-none text-2xl uppercase text-neon focus:border-neon transition-colors"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-neon font-bold opacity-50">Password (Optional)</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="bg-transparent border-b border-neon/30 py-4 outline-none text-2xl text-neon focus:border-neon transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button  
              type='button'
              onClick={() => {
                console.log("🖱️ Button Clicked");
                handleCreate();
              }}
              disabled={isSubmitting}
              className="w-full bg-neon text-black py-6 rounded-full font-black uppercase tracking-widest mt-6 cursor-pointer relative z-[110] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>

        {/* Right Column - Lower Z-Index */}
<div className="hidden md:block relative h-[700px] z-0 pointer-events-none select-none">
  <div className="pointer-events-none absolute top-1/2 left-1/2 ..." />
  <div className="pointer-events-none absolute inset-0 ..." />
</div>
      </div>
    </section>
  );
}