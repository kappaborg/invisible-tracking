import { useEffect, useRef } from 'react';
import { useStore } from '@/store';

export function HeatmapCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const trail = useStore((s) => s.telemetry.mouseTrail);
  const visible = useStore((s) => s.heatmapVisible);
  const reducedMotion = useStore((s) => s.reducedMotion);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();
      for (const p of trail) {
        const age = (now - p.t) / 60_000;
        const alpha = reducedMotion ? 0.35 : Math.max(0, 1 - age);
        const radius = 18 + (1 - alpha) * 24;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        gradient.addColorStop(0, `rgba(0, 240, 255, ${String(alpha * 0.45)})`);
        gradient.addColorStop(0.6, `rgba(255, 43, 214, ${String(alpha * 0.2)})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, [trail, reducedMotion]);

  if (!visible) return null;

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
}
