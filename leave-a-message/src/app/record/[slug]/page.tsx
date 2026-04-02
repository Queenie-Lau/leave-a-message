'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Mic, Square, Send, RotateCcw, Check, Play, Pause } from 'lucide-react';

// ─── MIME negotiation ────────────────────────────────────────────────────────
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

type RecordingState = 'idle' | 'recording' | 'preview' | 'uploading' | 'done';

export default function RecordPage() {
  const params = useParams();
  const [eventData, setEventData]     = useState<any>(null);
  const [recState, setRecState]       = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob]     = useState<Blob | null>(null);
  const [elapsed, setElapsed]         = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ── Web Audio player state ────────────────────────────────────────────────
  const [isPlaying, setIsPlaying]   = useState(false);
  const [progress, setProgress]     = useState(0);   // 0–1
  const [duration, setDuration]     = useState(0);   // seconds
  const [decoding, setDecoding]     = useState(false);
  const [decodeError, setDecodeError] = useState(false);

  // ── Recorder refs ─────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);
  const mimeTypeRef      = useRef<string>('');
  const recTimerRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Web Audio refs ────────────────────────────────────────────────────────
  const audioCtxRef    = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef   = useRef<number>(0);  // audioCtx.currentTime when play started
  const offsetRef      = useRef<number>(0);  // seconds into the buffer we paused at
  const rafRef         = useRef<number>(0);

  // ── Fetch event ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase
        .from('events').select('*').eq('slug', params.slug).single();
      if (data) setEventData(data);
    }
    fetchEvent();
  }, [params.slug]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
    useEffect(() => {
    return () => {
        stopRecTimer();
        killTracks();
        stopAudio();
        cancelAnimationFrame(rafRef.current);
        // Use a local ref to check state
        const ctx = audioCtxRef.current;
        if (ctx && ctx.state !== 'closed') {
        ctx.close().catch(() => {});
        }
    };
    }, []);
  // ── Decode blob into Web Audio buffer when we hit preview ────────────────
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
          console.log('[Audio] Decoded OK — duration:', decoded.duration.toFixed(2), 's, channels:', decoded.numberOfChannels, 'sampleRate:', decoded.sampleRate);
        },
        (err) => {
          console.error('[Audio] decodeAudioData failed:', err);
          setDecoding(false);
          setDecodeError(true);
        }
      );
    });

    // Inside the useEffect([recState, audioBlob])
    return () => {
    stopAudio();
    // Only close if it's not already closed or closing
    if (ctx.state !== 'closed') {
        ctx.close().catch(err => console.debug('Ctx already closing:', err));
    }
    };
  }, [recState, audioBlob]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const stopRecTimer = () => {
    if (recTimerRef.current) { clearInterval(recTimerRef.current); recTimerRef.current = null; }
  };
  const killTracks = () => {
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
  };
  const stopAudio = () => {
    try { sourceRef.current?.stop(); } catch (_) {}
    sourceRef.current = null;
    cancelAnimationFrame(rafRef.current);
  };

  // ── Progress animation loop ───────────────────────────────────────────────
  const tickProgress = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buf = audioBufferRef.current;
    if (!ctx || !buf) return;

    const currentOffset = ctx.currentTime - startTimeRef.current + offsetRef.current;
    const pct = Math.min(currentOffset / buf.duration, 1);
    setProgress(pct);

    if (pct < 1) {
      rafRef.current = requestAnimationFrame(tickProgress);
    } else {
      // Reached end
      setIsPlaying(false);
      setProgress(0);
      offsetRef.current = 0;
    }
  }, []);

  // ── Play ──────────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    const ctx = audioCtxRef.current;
    const buf = audioBufferRef.current;
    if (!ctx || !buf) return;

    // Resume suspended context (required after user gesture on some browsers)
    if (ctx.state === 'suspended') ctx.resume();

    stopAudio();

    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.connect(ctx.destination);
    source.start(0, offsetRef.current);
    sourceRef.current = source;
    startTimeRef.current = ctx.currentTime;

    source.onended = () => {
      // Only reset if we didn't manually pause
      if (sourceRef.current === source) {
        setIsPlaying(false);
        setProgress(0);
        offsetRef.current = 0;
        sourceRef.current = null;
      }
    };

    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(tickProgress);
  }, [tickProgress]);

  // ── Pause ─────────────────────────────────────────────────────────────────
  const pause = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    // Save position so we can resume from here
    offsetRef.current = ctx.currentTime - startTimeRef.current + offsetRef.current;
    stopAudio();
    setIsPlaying(false);
  }, []);

  const togglePlayback = () => isPlaying ? pause() : play();

  // ── Scrub ─────────────────────────────────────────────────────────────────
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    const newOffset = pct * (audioBufferRef.current?.duration ?? 0);
    offsetRef.current = newOffset;
    setProgress(pct);
    if (isPlaying) play(); // restart from new position
  };

  // ── Start recording ───────────────────────────────────────────────────────
const startRecording = async () => {
    setUploadError(null);
    setDecodeError(false);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100, // Explicitly set to standard CD quality
        },
      });

      // 1. Force the most stable codec for Chrome/Brave
      const mimeType = 'audio/webm;codecs=opus';
      const recorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128000 
      });
      
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log("Chunk received:", e.data.size);
        }
      };

      recorder.onstop = async () => {
        stopRecTimer();
        
        // 2. Combine chunks into the final Blob
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log("Final Blob Size:", blob.size);

        if (blob.size < 2000) {
          setUploadError("Recording too short or silent.");
          setRecState('idle');
          killTracks();
          return;
        }

        setAudioBlob(blob);
        setRecState('preview');
        killTracks();
      };

      // 3. Give the hardware 200ms to "prime" before starting the recorder
      await new Promise(resolve => setTimeout(resolve, 200));
      
      recorder.start(100); // Small slices to prevent data loss
      setRecState('recording');
      
      const startTime = Date.now();
      recTimerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

    } catch (err: any) {
      console.error("Mic error:", err);
      setUploadError("Could not access microphone.");
      setRecState('idle');
    }
  };

  // ── Stop recording ────────────────────────────────────────────────────────
  const stopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (!rec || rec.state === 'inactive') return;
    rec.stop(); // ondataavailable fires once more before onstop
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
    const reset = () => {
    stopAudio();
    // Let the useEffect cleanup handle the context close by changing state
    audioBufferRef.current = null;
    offsetRef.current = 0;
    setAudioBlob(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setDecodeError(false);
    setElapsed(0);
    setUploadError(null);
    setRecState('idle'); // This change triggers the useEffect return cleanup
    };
  // ── Upload ────────────────────────────────────────────────────────────────
  const saveVoicemail = async () => {
    if (!audioBlob || !eventData) return;
    setRecState('uploading');
    setUploadError(null);
    stopAudio();

    const ext      = mimeToExtension(mimeTypeRef.current);
    const fileName = `${eventData.id}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from('voicemails')
      .upload(fileName, audioBlob, { contentType: audioBlob.type, upsert: false });

    if (error) {
      setUploadError(`Upload failed: ${error.message}`);
      setRecState('preview');
    } else {
      setRecState('done');
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neon flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.4em] opacity-50 animate-pulse">Loading…</p>
      </div>
    );
  }

  const isRecording = recState === 'recording';
  const isPreview   = recState === 'preview';
  const isUploading = recState === 'uploading';
  const isDone      = recState === 'done';

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neon flex flex-col items-center justify-center px-6 py-12">
      <div className="bg-grain fixed inset-0 z-0 pointer-events-none opacity-20" />

      <div className="z-10 text-center flex flex-col gap-8 max-w-lg w-full">

        {/* Header */}
        <header>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-50 mb-2">Recording for</p>
          <h1 className="text-4xl md:text-5xl font-serif italic leading-tight">{eventData.name}</h1>
        </header>

        {/* Status Circle */}
        <div className={`
          w-48 h-48 md:w-64 md:h-64 rounded-full border-2 mx-auto flex flex-col items-center justify-center gap-3
          transition-all duration-500
          ${isRecording ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-110' : ''}
          ${isPreview   ? 'border-neon/40' : ''}
          ${isDone      ? 'border-neon shadow-[0_0_40px_rgba(var(--neon-rgb),0.4)]' : ''}
          ${recState === 'idle' ? 'border-neon/20' : ''}
        `}>
          {isRecording && (
            <>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-sm animate-pulse" />
              <span className="text-red-400 text-sm font-mono tracking-widest">{formatTime(elapsed)}</span>
            </>
          )}
          {isPreview && (
            decoding
              ? <div className="w-6 h-6 border-2 border-neon border-t-transparent rounded-full animate-spin" />
              : decodeError
              ? <span className="text-red-400 text-xs uppercase tracking-widest px-4">Decode failed</span>
              : (
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="flex flex-col items-center gap-2 touch-manipulation cursor-pointer"
                >
                  {isPlaying
                    ? <Pause size={48} className="text-neon" />
                    : <Play  size={48} className="text-neon opacity-80" />
                  }
                  <span className="text-[10px] uppercase tracking-widest opacity-50">
                    {isPlaying ? 'Pause' : 'Preview'}
                  </span>
                </button>
              )
          )}
          {isDone      && <Check size={56} className="text-neon" />}
          {recState === 'idle' && <Mic size={56} className="opacity-20" />}
          {isUploading && <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />}
        </div>

        {/* Custom audio progress bar — only shown in preview */}
        {isPreview && !decoding && !decodeError && (
          <div className="flex flex-col gap-2 px-1">
            {/* Scrubber */}
            <div className="relative h-1 bg-neon/10 rounded-full overflow-visible">
              {/* Filled track */}
              <div
                className="absolute inset-y-0 left-0 bg-neon/60 rounded-full transition-none"
                style={{ width: `${progress * 100}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neon rounded-full shadow-[0_0_8px_rgba(var(--neon-rgb),0.8)] transition-none"
                style={{ left: `calc(${progress * 100}% - 6px)` }}
              />
              {/* Invisible range input for scrubbing */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={progress}
                onChange={handleScrub}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              />
            </div>
            {/* Time labels */}
            <div className="flex justify-between text-[10px] font-mono opacity-40">
              <span>{formatTime(progress * duration)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {(uploadError || decodeError) && (
          <p className="text-red-400 text-xs uppercase tracking-widest opacity-80 px-4">
            {uploadError || 'Could not decode audio. Try recording again.'}
          </p>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-4">

          {recState === 'idle' && (
            <button
              type="button"
              onClick={startRecording}
              className="min-h-[64px] py-5 rounded-full font-black uppercase tracking-widest text-lg md:text-xl bg-neon text-black transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation cursor-pointer"
            >
              Start Message
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="min-h-[64px] py-5 rounded-full font-black uppercase tracking-widest text-lg md:text-xl bg-red-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-center gap-3"
            >
              <Square size={18} fill="white" /> Stop Recording
            </button>
          )}

          {isPreview && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={saveVoicemail}
                disabled={decoding}
                className="min-h-[64px] py-5 rounded-full font-black uppercase tracking-widest text-lg bg-neon text-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all touch-manipulation cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                <Send size={18} /> Send Voicemail
              </button>
              <button
                type="button"
                onClick={reset}
                className="min-h-[44px] text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity flex items-center justify-center gap-1 touch-manipulation cursor-pointer"
              >
                <RotateCcw size={12} /> Redo Recording
              </button>
            </div>
          )}

          {isUploading && (
            <div className="py-8 text-[10px] uppercase tracking-[0.4em] opacity-50 animate-pulse text-center">
              Sending…
            </div>
          )}

          {isDone && (
            <div className="flex flex-col gap-4 items-center">
              <p className="text-neon font-serif italic text-2xl">Message sent!</p>
              <button
                type="button"
                onClick={reset}
                className="min-h-[44px] text-[10px] uppercase tracking-widest opacity-40 hover:opacity-80 transition-opacity touch-manipulation cursor-pointer"
              >
                Leave another
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
