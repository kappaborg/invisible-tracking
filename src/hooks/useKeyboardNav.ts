import { useEffect } from 'react';
import { useStore } from '@/store';

export function useKeyboardNav(): void {
  const advance = useStore((s) => s.advance);
  const retreat = useStore((s) => s.retreat);
  const togglePresenter = useStore((s) => s.togglePresenter);
  const toggleSound = useStore((s) => s.toggleSound);
  const toggleHeatmap = useStore((s) => s.toggleHeatmap);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isEditable) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          advance();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          retreat();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          location.reload();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          togglePresenter();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          if (document.fullscreenElement) {
            void document.exitFullscreen();
          } else {
            void document.documentElement.requestFullscreen();
          }
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          toggleHeatmap();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleSound();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [advance, retreat, togglePresenter, toggleSound, toggleHeatmap]);
}
