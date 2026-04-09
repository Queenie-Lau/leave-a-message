'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { TermsSection } from '@/components/TermsSection';

export default function TermsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navigation />
      <div className="flex-grow">
        <TermsSection />
      </div>

      <Footer />
    </main>
  );
}