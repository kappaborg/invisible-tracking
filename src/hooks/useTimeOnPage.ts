import { useEffect } from 'react';
import { useStore } from '@/store';

export function useTimeOnPage(): void {
  const tickTime = useStore((s) => s.tickTime);
  useEffect(() => {
    const id = setInterval(() => {
      tickTime(Date.now());
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [tickTime]);
}
