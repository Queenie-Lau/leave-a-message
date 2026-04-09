'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { PrivacySection } from '@/components/PrivacySection';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Navigation />
      <div className="flex-grow">
        <PrivacySection />
      </div>

      <Footer />
    </main>
  );
}