export function TermsSection() {
  return (
    <section className="min-h-screen bg-[#0a0a0a] text-neon py-32 px-6 relative border-t border-neon/10" id="terms">
      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-20">
          <p className="text-[10px] uppercase tracking-[0.5em] opacity-40 mb-4">Service Agreement</p>
          <h2 className="text-5xl md:text-7xl font-serif italic tracking-tighter">Terms of Service</h2>
          <div className="h-px w-24 bg-neon mt-8 opacity-30"></div>
        </header>

        <div className="flex flex-col gap-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <article className="p-8 border border-neon/10 bg-neon/[0.02]">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 mb-4">Account Access</h4>
              <p className="text-sm font-light opacity-70 leading-relaxed">You are the sole guardian of your access codes. We cannot recover messages if an access code is lost due to our zero-knowledge architecture.</p>
            </article>
            <article className="p-8 border border-neon/10 bg-neon/[0.02]">
              <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 mb-4">Storage</h4>
              <p className="text-sm font-light opacity-70 leading-relaxed">Messages are stored with 99.9% durability. You maintain the right to purge your archive at any moment, permanently deleting all fragments.</p>
            </article>
          </div>

          <article className="max-w-2xl">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-50 mb-4">Acceptable Use</h3>
            <p className="font-light leading-relaxed opacity-80 text-lg italic serif">This platform is built for memory and connection. Any use for harassment, illegal distribution, or digital abuse will result in immediate termination of the archive.</p>
          </article>
        </div>
      </div>
    </section>
  );
}