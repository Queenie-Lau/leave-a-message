'use client';

import React, { useState } from 'react';

export default function RecordingSection() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <section className="flex-1 flex flex-col items-center justify-center p-10 relative">
      {/* Background Phone Asset - Centered behind the UI */}
      <div 
        className="absolute inset-0 z-0 bg-contain bg-no-repeat bg-center opacity-20 grayscale"
        style={{ backgroundImage: "url('/phone-large.png')" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-12">
        <h2 className="text-sm font-bold tracking-[0.3em] uppercase opacity-60">
          {isRecording ? 'Recording Message...' : 'Ready to Record'}
        </h2>

        {/* The Circular Recorder UI */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          {/* Progress Ring (SVG) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              className="text-neon/20"
            />
            <circle
              cx="50%"
              cy="50%"
              r="48%"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray="1000"
              strokeDashoffset={isRecording ? "400" : "1000"}
              className="text-neon transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Timer Display */}
          <div className="text-6xl md:text-8xl font-light tracking-tighter">
            00:34
          </div>
        </div>

        {/* Control Button */}
        <button 
          onClick={() => setIsRecording(!isRecording)}
          className={`group relative flex items-center justify-center w-20 h-20 rounded-full border-2 transition-all duration-300 ${
            isRecording ? 'border-red-500 bg-red-500/10' : 'border-neon'
          }`}
        >
          {isRecording ? (
            <div className="w-6 h-6 bg-red-500 rounded-sm" />
          ) : (
            <div className="w-6 h-6 bg-neon rounded-full group-hover:scale-125 transition-transform" />
          )}
        </button>

        <p className="text-[10px] uppercase tracking-widest max-w-[200px] text-center opacity-40">
          Press to stop recording. Your message will be saved automatically.
        </p>
      </div>
    </section>
  );
}