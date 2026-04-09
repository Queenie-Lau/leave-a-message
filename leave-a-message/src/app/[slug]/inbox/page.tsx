'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Lock, ChevronRight, ChevronLeft, Loader2, Play, Square, Download, Files } from 'lucide-react';
import JSZip from 'jszip';
import Navigation from '@/components/Navigation';

export default function InboxAuth() {
  const params = useParams();
  const [event, setEvent] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('slug', params.slug)
        .single();
      
      if (data) {
        setEvent(data);
        // Bypass authentication if password is null or empty
        if (!data.password || data.password.trim() === '') {
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
    }
    fetchEvent();
  }, [params.slug]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === event?.password) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="text-neon animate-spin" size={20} />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-neon flex flex-col items-center justify-center px-6">
        <Navigation />
        <div className="bg-grain fixed inset-0 z-0 pointer-events-none opacity-20" />
        
        <div className="z-10 w-full max-w-sm text-center flex flex-col gap-10">
          <header className="flex flex-col gap-2">
            <Lock size={24} className="mx-auto opacity-40 mb-2" />
            <h1 className="text-3xl font-serif italic">{event?.name}</h1>
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-50">Private Archive</p>
          </header>

          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ENTER ACCESS CODE"
                className={`w-full bg-transparent border-b-2 py-3 text-center tracking-[0.3em] outline-none transition-colors placeholder:text-neon/20 placeholder:tracking-widest ${
                  error ? 'border-red-500 text-red-500' : 'border-neon/20 focus:border-neon'
                }`}
                autoFocus
              />
              {error && <p className="absolute -bottom-6 left-0 right-0 text-[10px] text-red-500 uppercase tracking-widest">Invalid Code</p>}
            </div>
            
            <button 
              type="submit"
              className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.5em] opacity-40 hover:opacity-100 transition-opacity group"
            >
              Verify Access <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </main>
    );
  }

  return <MessageList eventId={event.id} eventName={event.name} />;
}

function MessageList({ eventId, eventName }: { eventId: string; eventName: string }) {
  const params = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (data) setMessages(data);
      setLoading(false);
    }
    fetchMessages();
  }, [eventId]);

  const handleDownload = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from('voicemails').download(path);
    if (error) return console.error('Download error:', error);

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    const safeName = name.replace(/[^a-z0-9]/gi, '_');
    a.download = `Message from ${safeName}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    const zip = new JSZip();
    
    try {
      const downloadPromises = messages.map(async (msg, index) => {
        const { data, error } = await supabase.storage.from('voicemails').download(msg.audio_path);
        if (error) throw error;
        
        const safeName = msg.guest_name.replace(/[^a-z0-9]/gi, '_');
        const filename = `Message from ${safeName}_${index + 1}.webm`;
        zip.file(filename, data);
      });

      await Promise.all(downloadPromises);
      
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Messages for ${eventName.replace(/[^a-z0-9]/gi, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error creating zip:', err);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const getPublicUrl = (path: string) => {
    return supabase.storage.from('voicemails').getPublicUrl(path).data.publicUrl;
  };

  const formatDuration = (s: number) => {
    if (!s || isNaN(s)) return "00:00";
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neon px-6 py-20 max-w-3xl mx-auto">
      <Navigation />
      <div className="bg-grain fixed inset-0 z-0 pointer-events-none opacity-20" />
      
      <div className="z-10 relative">
        <header className="mb-16 border-l-2 border-neon/20 pl-6 flex justify-between items-end">
          <div>
            <Link 
              href={`/record/${params.slug}`}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-opacity mb-8 group"
            >
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Leave a recording
            </Link>

            <p className="text-[10px] uppercase tracking-[0.4em] opacity-50 mb-1">Archive for</p>
            <h1 className="text-4xl font-serif italic">{eventName}</h1>
            <p className="text-[10px] mt-4 opacity-30 font-mono">
              {messages.length} RECORDINGS FOUND
            </p>
          </div>

          {messages.length > 0 && (
            <button 
              onClick={handleDownloadAll}
              disabled={isDownloadingAll}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all border border-neon/20 px-4 py-2 hover:bg-neon/5 disabled:opacity-20"
            >
              {isDownloadingAll ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Files size={12} />
              )}
              {isDownloadingAll ? 'Zipping...' : 'Download All'}
            </button>
          )}
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin opacity-20" size={32} />
          </div>
        ) : (
          <div className="flex flex-col gap-px bg-neon/10 border border-neon/10">
            {messages.length === 0 ? (
              <div className="bg-[#0a0a0a] p-12 text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] opacity-20">Archive is empty</p>
              </div>
            ) : (
              messages.map((msg) => {
                const dateStr = new Date(msg.created_at).toLocaleString('en-US', { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                });

                return (
                  <div 
                    key={msg.id}
                    className={`group bg-[#0a0a0a] p-6 transition-colors flex items-center justify-between ${
                      activeAudio === msg.id ? 'bg-neon/[0.04]' : 'hover:bg-neon/[0.02]'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-mono uppercase tracking-widest transition-opacity ${activeAudio === msg.id ? 'opacity-100' : 'opacity-40'}`}>
                        {dateStr}
                      </span>
                      <span className="text-lg font-serif">Message from {msg.guest_name}</span>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                      <span className="text-[10px] font-mono opacity-30">
                        {formatDuration(msg.duration)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleDownload(msg.audio_path, msg.guest_name)}
                          className="w-10 h-10 rounded-full border border-neon/10 flex items-center justify-center opacity-30 hover:opacity-100 hover:bg-neon/10 transition-all"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        
                        <button 
                          onClick={() => setActiveAudio(activeAudio === msg.id ? null : msg.id)}
                          className={`w-12 h-12 rounded-full border transition-all flex items-center justify-center ${
                            activeAudio === msg.id 
                              ? 'bg-neon text-black border-neon' 
                              : 'border-neon/20 hover:border-neon/40 text-neon'
                          }`}
                        >
                          {activeAudio === msg.id ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
                        </button>
                      </div>
                    </div>

                    {activeAudio === msg.id && (
                      <audio 
                        autoPlay 
                        src={getPublicUrl(msg.audio_path)} 
                        onEnded={() => setActiveAudio(null)}
                        className="hidden"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </main>
  );
}