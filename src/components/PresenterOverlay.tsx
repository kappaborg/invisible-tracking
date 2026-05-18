import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { SECTION_TITLES } from '@/types';
import type { SectionId } from '@/types';

const NOTES: Record<SectionId, string> = {
  0: 'Tell the audience: nothing leaves their browser except one IP lookup. Click Start.',
  1: 'Watch the cookie banner auto-accept. Point out: they did not click consent.',
  2: 'Read the IP and city aloud. Ask: did anyone type their address?',
  3: 'Move the mouse. Click. Watch the heatmap. Mention session-replay tools (Hotjar, FullStory).',
  4: 'Show canvas + audio + WebGL hashes. Mention this works in incognito.',
  5: 'Pause on the reveal for a beat. Then read the engagement score.',
  6: 'Walk through each technique. Cite the references.',
  7: 'Close with the defenses column. Final line: "Privacy isn\'t a default."',
};

export function PresenterOverlay() {
  const presenterMode = useStore((s) => s.presenterMode);
  const section = useStore((s) => s.section);
  const startedAt = useStore((s) => s.startedAt);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!presenterMode) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);
    return () => {
      clearInterval(id);
    };
  }, [presenterMode, startedAt]);

  if (!presenterMode) return null;

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');
  const over8 = elapsed > 8 * 60;

  return (
    <div
      className="fixed bottom-4 right-4 z-30 max-w-sm font-mono text-xs bg-black/90 border border-cyan/40 text-fg/90 rounded-lg p-3 shadow-neon"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="uppercase text-cyan tracking-widest">Presenter</span>
        <span className={over8 ? 'text-amber' : 'text-fg/80'}>{mm}:{ss}</span>
      </div>
      <div className="text-fg/60 mb-1">
        Section {section} · {SECTION_TITLES[section]}
      </div>
      <div className="text-fg/90 leading-snug">{NOTES[section]}</div>
      <div className="mt-2 pt-2 border-t border-border text-fg/40">
        →/Space next · ← back · R reset · F fullscreen · H heatmap · M sound
      </div>
    </div>
  );
}
