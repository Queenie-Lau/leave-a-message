'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { QRCodeCanvas } from 'qrcode.react'; // Import the QR component
import { Copy, Check } from 'lucide-react';

export default function EventDashboard() {
  const params = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (data) setEventData(data);
    }
    fetchEvent();
  }, [params.slug]);

  // The URL guests will visit to record their message
  const recordUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/record/${eventData?.slug}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(recordUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!eventData) return <div className="p-20 text-neon font-serif italic text-2xl">Loading Audio Vault...</div>;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neon relative overflow-hidden selection:bg-neon selection:text-black">
      <div className="bg-grain fixed inset-0 z-50 pointer-events-none opacity-20" />
      <Navigation />
      
      <section className="flex flex-col items-center justify-center pt-40 px-10 gap-16">
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] opacity-50 block mb-4">Event Dashboard</span>
          <h1 className="text-7xl md:text-9xl font-serif italic tracking-tighter leading-none">
            {eventData.name}
          </h1>
        </div>

        <div className="w-full max-w-4xl border border-neon/20 rounded-3xl p-8 md:p-12 bg-neon/5 backdrop-blur-md flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          {/* THE REAL QR CODE */}
          <div className="bg-neon p-6 rounded-2xl shadow-[0_0_50px_rgba(223,255,0,0.3)] hover:scale-105 transition-transform duration-500">
            <QRCodeCanvas 
              value={recordUrl} 
              size={200}
              bgColor={"#DFFF00"}
              fgColor={"#000000"}
              level={"H"}
            />
          </div>

          <div className="flex flex-col gap-6 flex-1 text-center md:text-left w-full">
            <div>
              <h3 className="text-3xl font-bold uppercase tracking-tighter">Guest Access</h3>
              <p className="text-sm opacity-60 mt-2 font-medium">Point a camera at the code or share the unique link below.</p>
            </div>

            <div 
              onClick={handleCopy}
              className="bg-black/60 border border-neon/20 p-5 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-neon/60 transition-all active:scale-[0.98]"
            >
              <code className="text-[11px] md:text-sm truncate mr-4 text-neon/90 font-mono tracking-tight">
                {recordUrl}
              </code>
              <div className="flex items-center gap-2 bg-neon text-black px-4 py-2 rounded-full text-[10px] font-black uppercase">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}