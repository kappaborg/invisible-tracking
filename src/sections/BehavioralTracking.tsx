import { useStore } from '@/store';
import { useTypingSpeed } from '@/hooks/useTypingSpeed';
import { ScrollMeter } from '@/components/ScrollMeter';
import { MousePointer2, Keyboard, Clock, Hand } from 'lucide-react';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function BehavioralTracking() {
  const telemetry = useStore((s) => s.telemetry);
  const onChange = useTypingSpeed();

  const mins = pad2(Math.floor(telemetry.timeOnPageSec / 60));
  const secs = pad2(telemetry.timeOnPageSec % 60);

  return (
    <section className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-cyan">
            Section 3 · Behavioral Tracking
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-1">
            Your movement is data, too.
          </h2>
          <p className="mt-3 text-fg/60 text-sm">
            None of this is being sent anywhere. It's just being seen.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan font-mono text-xs uppercase tracking-widest">
              <Hand className="w-4 h-4" />
              Clicks
            </div>
            <div className="font-mono text-4xl mt-3">{telemetry.clickCount}</div>
          </div>
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan font-mono text-xs uppercase tracking-widest">
              <MousePointer2 className="w-4 h-4" />
              Mouse distance
            </div>
            <div className="font-mono text-4xl mt-3">
              {Math.round(telemetry.mouseDistancePx).toLocaleString()}
              <span className="text-base text-muted ml-1">px</span>
            </div>
          </div>
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan font-mono text-xs uppercase tracking-widest">
              <Clock className="w-4 h-4" />
              Time on page
            </div>
            <div className="font-mono text-4xl mt-3">
              {mins}:{secs}
            </div>
          </div>
          <div className="bg-panel border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-cyan font-mono text-xs uppercase tracking-widest">
              <Keyboard className="w-4 h-4" />
              Typing speed
            </div>
            <div className="font-mono text-4xl mt-3">
              {telemetry.typingWpm}
              <span className="text-base text-muted ml-1">wpm</span>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-panel border border-border rounded-xl p-5">
          <div className="font-mono text-xs uppercase tracking-widest text-cyan mb-2">
            Scroll depth (live)
          </div>
          <ScrollMeter />
          <div className="mt-6 grid sm:grid-cols-[1fr_auto] gap-3 items-center">
            <input
              type="text"
              placeholder="Type anything — we'll guess your WPM"
              onChange={onChange}
              className="bg-bg border border-border rounded px-4 py-3 font-mono text-sm w-full focus:border-cyan focus:outline-none"
              aria-label="Type to measure WPM"
            />
            <div className="font-mono text-xs text-muted">
              Stays on your device. Promise.
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-fg/60 max-w-2xl">
          Real tools like Hotjar, FullStory and Microsoft Clarity record entire sessions —
          mouse trails, hesitation, rage-clicks, form abandonment. A 2017 Princeton study
          found session-replay scripts on most of the top 50,000 sites.
        </p>
      </div>
    </section>
  );
}
