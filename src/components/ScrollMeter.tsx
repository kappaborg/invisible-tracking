import { useStore } from '@/store';

export function ScrollMeter() {
  const pct = useStore((s) => s.telemetry.scrollDepthPct);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-mono text-muted">
        <span>Scroll depth</span>
        <span className="text-cyan">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan to-magenta transition-all duration-200"
          style={{ width: `${String(pct)}%` }}
        />
      </div>
    </div>
  );
}
