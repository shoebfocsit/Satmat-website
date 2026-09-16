import { Suspense, lazy } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { Stats } from './components/Stats';

const Markets = lazy(() => import('./components/Markets').then((m) => ({ default: m.Markets })));
const ResultsSection = lazy(() =>
  import('./components/ResultsScreen').then((m) => ({ default: m.ResultsScreen })),
);
const ChartsSection = lazy(() =>
  import('./components/ChartsScreen').then((m) => ({ default: m.ChartsScreen })),
);
const GameTypes = lazy(() => import('./components/GameTypes').then((m) => ({ default: m.GameTypes })));
const NoticesSection = lazy(() =>
  import('./components/NoticeBoardScreen').then((m) => ({ default: m.NoticeBoardScreen })),
);
const HowToPlay = lazy(() => import('./components/HowToPlay').then((m) => ({ default: m.HowToPlay })));
const Testimonials = lazy(() =>
  import('./components/Testimonials').then((m) => ({ default: m.Testimonials })),
);
const FAQ = lazy(() => import('./components/FAQ').then((m) => ({ default: m.FAQ })));
const CTA = lazy(() => import('./components/CTA').then((m) => ({ default: m.CTA })));
const Features = lazy(() => import('./components/Features').then((m) => ({ default: m.Features })));

function SectionSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse space-y-6 px-5 py-20" style={{ minHeight: height }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-[#1a1a1a] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ title, accent, sub }: { title: string; accent: string; sub: string }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-3xl sm:text-4xl font-black text-white">
        {title} <span className="text-gradient-gold">{accent}</span>
      </h2>
      <p className="mt-3 text-[#a3a3a3] max-w-xl mx-auto">{sub}</p>
    </div>
  );
}

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-[#141414] text-white font-sans overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Suspense fallback={<SectionSkeleton />}>
          <Markets />
        </Suspense>

        <section id="results" className="py-20 px-5 bg-[#181818] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Today's"
              accent="Results"
              sub="Live declared results for every market — updated the moment they release."
            />
            <Suspense fallback={<SectionSkeleton height={400} />}>
              <div className="rounded-3xl overflow-hidden bg-[#F4F5F7] p-4 sm:p-6">
                <ResultsSection />
              </div>
            </Suspense>
          </div>
        </section>

        <section id="charts" className="py-20 px-5">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Result"
              accent="Charts"
              sub="Full date-range history for any market — open, close, jodi and panel."
            />
            <Suspense fallback={<SectionSkeleton height={400} />}>
              <div className="rounded-3xl overflow-hidden bg-[#F4F5F7] p-4 sm:p-6">
                <ChartsSection />
              </div>
            </Suspense>
          </div>
        </section>

        <Suspense fallback={<SectionSkeleton />}>
          <GameTypes />
        </Suspense>

        <section id="notices" className="py-20 px-5 bg-[#181818] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <SectionHeading
              title="Notice"
              accent="Board"
              sub="Official announcements, timing updates and offers."
            />
            <Suspense fallback={<SectionSkeleton height={200} />}>
              <NoticesSection />
            </Suspense>
          </div>
        </section>

        <Suspense fallback={<SectionSkeleton />}>
          <Features />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <HowToPlay />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <CTA />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
