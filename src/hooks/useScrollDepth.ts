import { useEffect } from 'react';
import { useStore } from '@/store';

export function useScrollDepth(): void {
  const setScrollDepth = useStore((s) => s.setScrollDepth);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max <= 0 ? 0 : Math.min(100, (doc.scrollTop / max) * 100);
      setScrollDepth(pct);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [setScrollDepth]);
}
