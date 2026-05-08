// src/pages/Landing.tsx
import Nav        from '@/components/landing/Nav';
import Hero       from '@/components/landing/Hero';
import Problem    from '@/components/landing/Problem';
import HowItWorks from '@/components/landing/HowItWorks';
import Features   from '@/components/landing/Features';
import Personas   from '@/components/landing/Personas';
import Stats      from '@/components/landing/Stats';
import CTA        from '@/components/landing/CTA';

export default function Landing(): React.JSX.Element {
  return (
    <main className="w-full min-h-screen overflow-x-hidden">
      <Nav />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Personas />
      <Stats />
      <CTA />
    </main>
  );
}
