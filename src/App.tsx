import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store';
import { useKeyboardNav } from '@/hooks/useKeyboardNav';
import { useMouseTracker } from '@/hooks/useMouseTracker';
import { useScrollDepth } from '@/hooks/useScrollDepth';
import { useTimeOnPage } from '@/hooks/useTimeOnPage';
import { useAudienceBroadcast } from '@/hooks/useBroadcast';
import { ConsentScreen } from '@/sections/ConsentScreen';
import { LandingScreen } from '@/sections/LandingScreen';
import { LiveCollection } from '@/sections/LiveCollection';
import { BehavioralTracking } from '@/sections/BehavioralTracking';
import { FingerprintLab } from '@/sections/FingerprintLab';
import { ProfileReveal } from '@/sections/ProfileReveal';
import { EducationalPanel } from '@/sections/EducationalPanel';
import { WrapUp } from '@/sections/WrapUp';
import { CookieBanner } from '@/components/CookieBanner';
import { PresenterOverlay } from '@/components/PresenterOverlay';
import { NotDoingPanel } from '@/components/NotDoingPanel';
import { WipeSessionButton } from '@/components/WipeSessionButton';
import { HeatmapCanvas } from '@/components/HeatmapCanvas';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MobileNav } from '@/components/MobileNav';
import { SECTION_TITLES } from '@/types';
import type { SectionId } from '@/types';

function SectionFor({ id }: { id: SectionId }) {
  switch (id) {
    case 0:
      return <ConsentScreen />;
    case 1:
      return <LandingScreen />;
    case 2:
      return <LiveCollection />;
    case 3:
      return <BehavioralTracking />;
    case 4:
      return <FingerprintLab />;
    case 5:
      return <ProfileReveal />;
    case 6:
      return <EducationalPanel />;
    case 7:
      return <WrapUp />;
  }
}

function Chrome() {
  const section = useStore((s) => s.section);
  const consented = useStore((s) => s.consented);
  if (!consented) return null;
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 backdrop-blur bg-bg/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <span className="hidden sm:inline text-cyan uppercase tracking-widest shrink-0">
            Invisible Tracking
          </span>
          <span className="text-muted hidden sm:inline">/</span>
          <span className="text-fg/80 hidden sm:inline truncate">
            Section {section} · {SECTION_TITLES[section]}
          </span>
          <span className="text-cyan sm:hidden font-mono uppercase tracking-widest shrink-0">
            §{section}
          </span>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <NotDoingPanel />
            <WipeSessionButton compact />
          </div>
        </div>
      </header>
      <div aria-hidden="true" style={{ height: 44 }} />
    </>
  );
}

export default function App() {
  const section = useStore((s) => s.section);

  useKeyboardNav();
  useMouseTracker();
  useScrollDepth();
  useTimeOnPage();
  useAudienceBroadcast();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <HeatmapCanvas />
      <Chrome />
      <AnimatePresence mode="wait">
        <motion.main
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 pb-24 md:pb-0"
        >
          <ErrorBoundary label={SECTION_TITLES[section]}>
            <SectionFor id={section} />
          </ErrorBoundary>
        </motion.main>
      </AnimatePresence>
      <CookieBanner />
      <PresenterOverlay />
      <MobileNav />
    </div>
  );
}
