import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/store';

export function LandingScreen() {
  const advance = useStore((s) => s.advance);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-muted mb-6">
          Welcome
        </div>
        <h1 className="text-4xl sm:text-6xl font-semibold">Invisible Tracking Demo</h1>
        <p className="mt-6 text-fg/70 text-lg">
          What websites can infer about you in seconds.
        </p>

        <button
          type="button"
          onClick={advance}
          className="mt-12 inline-flex items-center gap-2 bg-cyan text-bg font-semibold px-8 py-3 rounded-md shadow-neon hover:brightness-110 transition"
        >
          Start Experience
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="mt-10 text-xs font-mono text-muted/80">
          Notice anything change down there in a moment? You didn't agree to it.
        </p>
      </motion.div>
    </div>
  );
}
