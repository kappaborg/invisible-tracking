import { useCallback, useRef } from 'react';
import { useStore } from '@/store';

export function useTypingSpeed(): (e: React.ChangeEvent<HTMLInputElement>) => void {
  const setTypingWpm = useStore((s) => s.setTypingWpm);
  const startRef = useRef<number | null>(null);
  const charsRef = useRef(0);

  return useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (startRef.current === null) {
        startRef.current = Date.now();
        charsRef.current = value.length;
        setTypingWpm(0);
        return;
      }
      const elapsedMs = Date.now() - startRef.current;
      if (elapsedMs < 250 || value.length === 0) {
        setTypingWpm(0);
        return;
      }
      const minutes = elapsedMs / 60_000;
      const words = value.length / 5;
      const wpm = Math.round(words / minutes);
      setTypingWpm(Math.min(wpm, 300));
      charsRef.current = value.length;
    },
    [setTypingWpm],
  );
}
