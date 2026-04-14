import Hero from '@/components/Hero';
import WhoIAm from '@/components/WhoIAm';
import WhatIDo from '@/components/WhatIDo';
import Vision from '@/components/Vision';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0A192F] to-black">
      <Hero />
      <WhoIAm />
      <WhatIDo />
      <Vision />
      <Contact />
    </main>
  );
}
