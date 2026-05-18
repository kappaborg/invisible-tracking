import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldQuestion, Radio } from 'lucide-react';
import { useStore } from '@/store';
import { readRoomFromUrl, partykitHost } from '@/lib/room';

const DATA_POINTS = [
  'Browser, OS, screen size, pixel ratio, language, timezone, platform',
  'Hardware: logical CPU cores, device memory, max touch points',
  'Network type, downlink and round-trip estimate (when available)',
  'Public IP, city, region, country, ISP / ASN (via ipapi.co or ipwho.is)',
  'Approximate location → static map preview (via OpenStreetMap)',
  'Canvas, audio and WebGL fingerprint hashes (computed locally)',
  'Subset of installed fonts (via offsetWidth measurement)',
  'Local network IPs leaked through WebRTC',
  'Mouse trail, click count, scroll depth, typing speed, time on page',
];

export function ConsentScreen() {
  const consent = useStore((s) => s.consent);
  const [open, setOpen] = useState(false);
  const room = readRoomFromUrl();
  const broadcasting = Boolean(room && partykitHost());

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-grid">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center"
      >
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-cyan mb-4">
          Before we begin
        </div>
        <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
          This page will derive real data from your device and session.
        </h1>
        <p className="mt-6 text-fg/70 text-base sm:text-lg max-w-xl mx-auto">
          Nothing leaves your browser except one IP geolocation call and one map tile request.
          No analytics, no cookies, no database. Everything is destroyed when you close the tab.
        </p>

        {broadcasting ? (
          <div className="mt-6 max-w-xl mx-auto border border-magenta/40 bg-magenta/5 rounded-lg p-4 text-left">
            <div className="flex items-center gap-2 text-magenta font-mono text-xs uppercase tracking-widest mb-1">
              <Radio className="w-4 h-4" /> Presentation mode · room {room}
            </div>
            <p className="text-sm text-fg/80">
              For this talk, your full profile — including your <strong className="text-magenta">
              IP address, ISP, approximate city and lat/lng</strong>, device, OS, browser, screen,
              fingerprint hashes, and behaviour scores — will be visible on the presenter's wall
              for the duration of the session.
            </p>
            <p className="text-sm text-fg/70 mt-2">
              Nothing is stored. The relay holds everything in memory and forgets it the moment
              you close this tab. No raw user-agent or name is sent.
            </p>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={consent}
            className="inline-flex items-center gap-2 bg-cyan text-bg font-semibold px-6 py-3 rounded-md shadow-neon hover:brightness-110 transition"
          >
            <Eye className="w-4 h-4" />
            Start the demo
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 border border-border text-fg/80 px-6 py-3 rounded-md hover:border-cyan/60 hover:text-cyan transition"
          >
            <ShieldQuestion className="w-4 h-4" />
            What will you collect?
          </button>
        </div>

        <div className="mt-10 text-xs font-mono text-muted">
          Press <kbd className="px-1.5 py-0.5 bg-panel border border-border rounded">→</kbd> or{' '}
          <kbd className="px-1.5 py-0.5 bg-panel border border-border rounded">Space</kbd> at any
          time to advance ·{' '}
          <kbd className="px-1.5 py-0.5 bg-panel border border-border rounded">R</kbd> to reset
        </div>
      </motion.div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur p-6 flex items-center justify-center"
            onClick={() => {
              setOpen(false);
            }}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className="bg-panel border border-border rounded-xl max-w-2xl w-full p-6"
              onClick={(e) => {
                e.stopPropagation();
              }}
              role="dialog"
            >
              <h2 className="text-xl font-semibold mb-3">Everything this page will derive</h2>
              <ul className="space-y-2 text-sm text-fg/80 font-mono">
                {DATA_POINTS.map((d) => (
                  <li key={d}>· {d}</li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted italic">
                Most of this would be derived by any modern website without telling you.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                className="mt-6 bg-cyan/10 border border-cyan/40 text-cyan px-4 py-2 rounded font-mono text-sm"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
