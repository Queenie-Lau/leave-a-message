'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Mic, Square, Send, RotateCcw, Check, Play, Pause } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

function getSupportedMimeType(): string {
  const candidates = ['audio/webm', 'audio/mp4', 'audio/ogg'];
  for (const type of candidates) {
    try { if (MediaRecorder.isTypeSupported(type)) return type; } catch (_) {}
  }
  return '';
}

function mimeToExtension(mimeType: string): string {
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'webm';
}

function formatTime(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function makeDistortionCurve(amount: number) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

type RecordingState = 'idle' | 'recording' | 'preview' | 'uploading' | 'done';

export default function RecordPage() {
  const params = useParams();
  const [eventData, setEventData]     = useState<any>(null);
  const [recState, setRecState]       = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob]     = useState<Blob | null>(null);
  const [elapsed, setElapsed]         = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying]     = useState(false);
  const [progress, setProgress]       = useState(0); 
  const [duration, setDuration]       = useState(0); 
  const [decoding, setDecoding]       = useState(false);
  const [decodeError, setDecodeError] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const mimeTypeRef      = useRef<string>('');
  const recTimerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const micStreamRef     = useRef<MediaStream | null>(null);
  const liveCtxRef       = useRef<AudioContext | null>(null);
  const liveNoiseRef     = useRef<AudioBufferSourceNode | null>(null);

  const audioCtxRef    = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef   = useRef<number>(0); 
  const offsetRef      = useRef<number>(0); 
  const rafRef         = useRef<number>(0);

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from('events').select('*').eq('slug', params.slug).single();
      if (data) setEventData(data);
    }
    fetchEvent();
  }, [params.slug]);

  const stopRecTimer = useCallback(() => {
    if (recTimerRef.current) { 
      clearInterval(recTimerRef.current); 
      recTimerRef.current = null; 
    }
  }, []);

  const killTracks = useCallback(() => {
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    try { liveNoiseRef.current?.stop(); } catch (_) {}
    if (liveCtxRef.current && liveCtxRef.current.state !== 'closed') {
      liveCtxRef.current.close().catch(() => {});
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.onended = null; 
      try { sourceRef.current.stop(); } catch (_) {}
      sourceRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    return () => {
      stopRecTimer();
      killTracks();
      stopAudio();
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => {});
      }
    };
  }, [stopRecTimer, killTracks, stopAudio]);

  useEffect(() => {
    if (recState !== 'preview' || !audioBlob) return;

    setDecoding(true);
    setDecodeError(false);
    setProgress(0);
    offsetRef.current = 0;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    audioBlob.arrayBuffer().then(buf => {
      ctx.decodeAudioData(
        buf,
        (decoded) => {
          audioBufferRef.current = decoded;
          setDuration(decoded.duration);
          setDecoding(false);
        },
        (err) => {
          setDecoding(false);
          setDecodeError(true);
        }
      );
    });

    return () => {
      stopAudio();
      if (ctx.state !== 'closed') ctx.close().catch(() => {});
    };
  }, [recState, audioBlob, stopAudio]);

  const tickProgress = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buf = audioBufferRef.current;
    if (!ctx || !buf) return;
    const currentOffset = (ctx.currentTime - startTimeRef.current) + offsetRef.current;
    const pct = Math.min(currentOffset / buf.duration, 1);
    setProgress(pct);
    if (pct < 1) rafRef.current = requestAnimationFrame(tickProgress);
  }, []);

  const play = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buf = audioBufferRef.current;
    if (!ctx || !buf) return;
    if (ctx.state === 'suspended') ctx.resume();
    stopAudio(); 
    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.connect(ctx.destination);
    startTimeRef.current = ctx.currentTime;
    source.start(0, offsetRef.current);
    sourceRef.current = source;
    source.onended = () => {
      setIsPlaying(false);
      setProgress(0);
      offsetRef.current = 0;
      sourceRef.current = null;
    };
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(tickProgress);
  }, [tickProgress, stopAudio]);

  const pause = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (ctx && sourceRef.current) offsetRef.current += (ctx.currentTime - startTimeRef.current);
    stopAudio();
    setIsPlaying(false);
  }, [stopAudio]);

  const togglePlayback = () => isPlaying ? pause() : play();

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    const buf = audioBufferRef.current;
    if (!buf) return;
    const wasPlaying = !!sourceRef.current;
    stopAudio(); 
    offsetRef.current = pct * buf.duration;
    setProgress(pct);
    if (wasPlaying) play(); 
  };

  const startRecording = async () => {
    if (recState !== 'idle') return; 
    stopRecTimer();
    killTracks();
    setUploadError(null);
    setDecodeError(false);
    setElapsed(0);
    chunksRef.current = [];
    setRecState('recording'); 

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const liveCtx = new AudioContextClass();
      liveCtxRef.current = liveCtx;

      const sourceNode = liveCtx.createMediaStreamSource(stream);
      const destinationNode = liveCtx.createMediaStreamDestination();

      const voiceHighpass = liveCtx.createBiquadFilter();
      voiceHighpass.type = 'highpass';
      voiceHighpass.frequency.value = 500; 

      const voiceLowpass = liveCtx.createBiquadFilter();
      voiceLowpass.type = 'lowpass';
      voiceLowpass.frequency.value = 3500; 

      const distortion = liveCtx.createWaveShaper();
      distortion.curve = makeDistortionCurve(15);
      distortion.oversample = '4x';

      const bufferSize = liveCtx.sampleRate * 2;
      const noiseBuffer = liveCtx.createBuffer(1, bufferSize, liveCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0, b1, b2, b3, b4, b5, b6;
      b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
      
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; 
        b6 = white * 0.115926;
      }

      const noiseSource = liveCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      liveNoiseRef.current = noiseSource;

      const noiseFilter = liveCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1800;
      noiseFilter.Q.value = 0.7;

      const noiseMixer = liveCtx.createGain();
      noiseMixer.gain.value = 0.008; 

      sourceNode.connect(voiceHighpass);
      voiceHighpass.connect(voiceLowpass);
      voiceLowpass.connect(distortion);
      distortion.connect(destinationNode);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseMixer);
      noiseMixer.connect(destinationNode);
      noiseSource.start();

      const mimeType = 'audio/webm;codecs=opus';
      const recorder = new MediaRecorder(destinationNode.stream, { 
        mimeType,
        audioBitsPerSecond: 128000 
      });
      
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstart = () => {
        stopRecTimer(); 
        mimeTypeRef.current = recorder.mimeType || mimeType; 
        setElapsed(0);
        const startTime = Date.now();
        recTimerRef.current = setInterval(() => { setElapsed(Math.floor((Date.now() - startTime) / 1000)); }, 100);
      };

      recorder.onstop = () => {
        stopRecTimer();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 1000) {
          setAudioBlob(blob);
          setRecState('preview');
        } else {
          setUploadError("Recording was too short.");
          setRecState('idle');
        }
        killTracks(); 
      };
      recorder.start(100); 
    } catch (err: any) {
      setUploadError("Microphone access failed.");
      setRecState('idle');
    }
  };

  const stopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && rec.state !== 'inactive') rec.stop(); 
  };

  const reset = () => {
    stopRecTimer(); killTracks(); stopAudio();
    audioBufferRef.current = null; offsetRef.current = 0; setAudioBlob(null);
    setIsPlaying(false); setProgress(0); setDuration(0); setDecodeError(false);
    setElapsed(0); setUploadError(null); setRecState('idle'); 
  };

const saveVoicemail = async () => {
  if (!audioBlob || !eventData) return;
  setRecState('uploading');
  stopAudio();

  const ext = mimeToExtension(mimeTypeRef.current);
  const fileName = `${eventData.id}/${Date.now()}.${ext}`;

  const { error: storageError } = await supabase.storage
    .from('voicemails')
    .upload(fileName, audioBlob, { contentType: audioBlob.type });

  if (storageError) {
    setUploadError(`Upload failed: ${storageError.message}`);
    setRecState('preview');
    return;
  }

  const { error: dbError } = await supabase
    .from('messages')
    .insert({
      event_id: eventData.id,
      audio_path: fileName,
      duration: Math.floor(duration),
      guest_name: 'Guest'
    });

  if (dbError) {
    setUploadError(`Database error: ${dbError.message}`);
    setRecState('preview');
  } else {
    setRecState('done');
  }
};

  if (!eventData) return <div className="min-h-screen bg-[#0a0a0a] text-neon flex items-center justify-center"><p className="text-[10px] uppercase tracking-[0.4em] opacity-50 animate-pulse">Loading…</p></div>;

  const isRecording = recState === 'recording';
  const isPreview   = recState === 'preview';
  const isUploading = recState === 'uploading';
  const isDone      = recState === 'done';

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neon flex flex-col items-center justify-center px-6 py-12">
      <Navigation />
      <div className="bg-grain fixed inset-0 z-0 pointer-events-none opacity-20" />
      <div className="z-10 text-center flex flex-col gap-8 max-w-lg w-full">
        <header>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-50 mb-2">Recording for</p>
          <h1 className="text-4xl md:text-5xl font-serif italic leading-tight">{eventData.name}</h1>
        </header>

        <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full border-2 mx-auto flex flex-col items-center justify-center gap-3 transition-all duration-500 ${isRecording ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110' : ''} ${isPreview ? 'border-neon/40' : ''} ${isDone ? 'border-neon shadow-[0_0_40px_rgba(var(--neon-rgb),0.4)]' : ''} ${recState === 'idle' ? 'border-neon/20' : ''}`}>
          {isRecording && <><div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-sm animate-pulse" /><span className="text-red-400 text-sm font-mono tracking-widest">{formatTime(elapsed)}</span></>}
          {isPreview && (decoding ? <div className="w-6 h-6 border-2 border-neon border-t-transparent rounded-full animate-spin" /> : decodeError ? <span className="text-red-400 text-xs uppercase tracking-widest px-4">Decode failed</span> : <button type="button" onClick={togglePlayback} className="flex flex-col items-center gap-2 touch-manipulation cursor-pointer">{isPlaying ? <Pause size={48} className="text-neon" /> : <Play size={48} className="text-neon opacity-80" />}<span className="text-[10px] uppercase tracking-widest opacity-50">{isPlaying ? 'Pause' : 'Preview'}</span></button>)}
          {isDone && <Check size={56} className="text-neon" />}
          {recState === 'idle' && <Mic size={56} className="opacity-20" />}
          {isUploading && <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />}
        </div>

        {isPreview && !decoding && !decodeError && (
          <div className="flex flex-col gap-2 px-1">
            <div className="relative h-1 bg-neon/10 rounded-full overflow-visible">
              <div className="absolute inset-y-0 left-0 bg-neon/60 rounded-full transition-none" style={{ width: `${progress * 100}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neon rounded-full shadow-[0_0_8px_rgba(var(--neon-rgb),0.8)] transition-none" style={{ left: `calc(${progress * 100}% - 6px)` }} />
              <input type="range" min={0} max={1} step={0.001} value={progress} onChange={handleScrub} className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
            </div>
            <div className="flex justify-between text-[10px] font-mono opacity-40"><span>{formatTime(progress * duration)}</span><span>{formatTime(duration)}</span></div>
          </div>
        )}

        {(uploadError || decodeError) && <p className="text-red-400 text-xs uppercase tracking-widest opacity-80 px-4">{uploadError || 'Could not decode audio. Try recording again.'}</p>}

        <div className="flex flex-col gap-4">
          {recState === 'idle' && <button type="button" onClick={startRecording} className="min-h-[64px] py-5 rounded-full font-black uppercase tracking-widest text-lg md:text-xl bg-neon text-black transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation cursor-pointer">Start Message</button>}
          {isRecording && <button type="button" onClick={stopRecording} className="min-h-[64px] py-5 rounded-full font-black uppercase tracking-widest text-lg md:text-xl bg-red-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-center gap-3"><Square size={18} fill="white" /> Stop Recording</button>}
          {isPreview && <div className="flex flex-col gap-3"><button type="button" onClick={saveVoicemail} disabled={decoding} className="min-h-[64px] py-5 rounded-full font-black uppercase tracking-widest text-lg bg-neon text-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation cursor-pointer disabled:opacity-40 disabled:pointer-events-none"><Send size={18} /> Send Voicemail</button><button type="button" onClick={reset} className="min-h-[44px] text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity flex items-center justify-center gap-1 touch-manipulation cursor-pointer"><RotateCcw size={12} /> Redo Recording</button></div>}
          {isUploading && <div className="py-8 text-[10px] uppercase tracking-[0.4em] opacity-50 animate-pulse text-center">Sending…</div>}
          {isDone && <div className="flex flex-col gap-4 items-center"><p className="text-neon font-serif italic text-2xl">Message sent!</p><button type="button" onClick={reset} className="min-h-[44px] text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity touch-manipulation cursor-pointer">Leave another</button></div>}
        </div>

        {(recState === 'idle' || recState === 'done') && (
          <footer className="mt-12 animate-in fade-in slide-in-from-bottom-2 duration-1000">
            <Link 
              href={`/${params.slug}/inbox`}
              className="group flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.4em] opacity-30 hover:opacity-100 transition-all duration-500"
            >
              View Recordings 
            </Link>
          </footer>
        )}
        <Footer />
      </div>
    </main>
  );
}