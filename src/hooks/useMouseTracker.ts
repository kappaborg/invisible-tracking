import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { distance } from '@/lib/tracker';

export function useMouseTracker(): void {
  const addMouseMove = useStore((s) => s.addMouseMove);
  const pruneTrail = useStore((s) => s.pruneTrail);
  const bumpClick = useStore((s) => s.bumpClick);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const recordPoint = (x: number, y: number) => {
      const prev = last.current;
      const d = prev ? distance(prev.x, prev.y, x, y) : 0;
      addMouseMove(x, y, d);
      last.current = { x, y };
    };
    const onMove = (e: MouseEvent) => {
      recordPoint(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) recordPoint(t.clientX, t.clientY);
    };
    const onClick = () => {
      bumpClick();
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });

    const pruneId = setInterval(() => {
      pruneTrail(Date.now(), 60_000);
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('click', onClick);
      clearInterval(pruneId);
    };
  }, [addMouseMove, pruneTrail, bumpClick]);
}
