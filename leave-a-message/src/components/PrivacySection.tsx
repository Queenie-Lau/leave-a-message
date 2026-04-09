export function PrivacySection() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] text-neon py-32 px-6 relative overflow-hidden" id="privacy">
      <div className="bg-grain fixed inset-0 z-0 pointer-events-none opacity-20" />
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-20">
          <p className="text-[10px] uppercase tracking-[0.5em] opacity-40 mb-4">Security Protocol</p>
          <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter">Privacy Policy</h2>
          <div className="h-px w-24 bg-neon mt-8 opacity-30"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <article className="flex flex-col gap-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">Encryption</h3>
            <p className="font-light leading-relaxed opacity-80">All messages are captured with industry-standard AES-256 encryption. Your voice remains a private fragment, accessible only through your secure link.</p>
          </article>
          <article className="flex flex-col gap-4">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">Confidentiality</h3>
            <p className="font-light leading-relaxed opacity-80">We treat voice data as sacred. Your recordings are never indexed, analyzed, or shared with third-party entities.</p>
          </article>
          <article className="flex flex-col gap-4 md:col-span-2 border-t border-neon/10 pt-16">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50">No Tracking</h3>
            <p className="font-light leading-relaxed opacity-80">We don’t believe in profiling. Your interaction with the platform is ghost-like—no persistent cookies or invasive analytics.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
