import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { distance } from '@/lib/tracker';

export function useMouseTracker(): void {
  const addMouseMove = useStore((s) => s.addMouseMove);
  const pruneTrail = useStore((s) => s.pruneTrail);
  const bumpClick = useStore((s) => s.bumpClick);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const prev = last.current;
      const d = prev ? distance(prev.x, prev.y, x, y) : 0;
      addMouseMove(x, y, d);
      last.current = { x, y };
    };
    const onClick = () => {
      bumpClick();
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });

    const pruneId = setInterval(() => {
      pruneTrail(Date.now(), 60_000);
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      clearInterval(pruneId);
    };
  }, [addMouseMove, pruneTrail, bumpClick]);
}
