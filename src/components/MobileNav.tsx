import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';

export function MobileNav() {
  const section = useStore((s) => s.section);
  const consented = useStore((s) => s.consented);
  const advance = useStore((s) => s.advance);
  const retreat = useStore((s) => s.retreat);

  if (!consented) return null;
  if (section === 0) return null;

  const isLast = section === 7;
  const isFirst = section === 1;

  return (
    <div
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 flex items-center gap-2 pointer-events-none"
      aria-label="Section navigation"
    >
      <button
        type="button"
        disabled={isFirst}
        onClick={retreat}
        className="pointer-events-auto inline-flex items-center justify-center gap-1 flex-1 border border-border bg-panel/90 backdrop-blur text-fg/90 px-3 py-3 rounded-lg font-mono text-sm disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={advance}
        className="pointer-events-auto inline-flex items-center justify-center gap-1 flex-[2] bg-cyan text-bg font-semibold px-3 py-3 rounded-lg shadow-neon disabled:opacity-30 disabled:pointer-events-none"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
