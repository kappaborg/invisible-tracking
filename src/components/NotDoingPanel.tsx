import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { partykitHost, readRoomFromUrl } from '@/lib/room';

const NOT_SENT = [
  'Mouse positions and trail',
  'Click count and behaviour score',
  'Scroll depth and time on page',
  'Typing speed',
  'Canvas / audio / WebGL fingerprints',
  'Detected fonts',
  'WebRTC-leaked local IP addresses',
  'Public IP and raw user-agent',
];

const ACTUALLY_CALLED = [
  {
    endpoint: 'ipapi.co',
    sees: 'Your public IP. Returns city / region / country / ISP.',
  },
  {
    endpoint: 'ipwho.is (fallback)',
    sees: 'Your public IP, only if ipapi.co fails.',
  },
  {
    endpoint: 'staticmap.openstreetmap.de',
    sees: 'The lat/lng we just received. Returns a small PNG map.',
  },
];

export function NotDoingPanel() {
  const [open, setOpen] = useState(false);
  const room = readRoomFromUrl();
  const broadcasting = Boolean(room && partykitHost());

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted hover:text-cyan border border-border hover:border-cyan/60 px-3 py-1.5 rounded transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        What we're NOT doing
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => {
              setOpen(false);
            }}
          >
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className="bg-panel border border-border rounded-xl max-w-2xl w-full p-6 shadow-neon"
              onClick={(e) => {
                e.stopPropagation();
              }}
              role="dialog"
              aria-label="What we are not doing"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-cyan">
                    Transparency
                  </div>
                  <h2 className="text-2xl font-semibold mt-1">What we are NOT doing</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="text-muted hover:text-fg"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-fg/80 mb-4">
                Everything below is computed in your browser and{' '}
                <strong className="text-green">never leaves it</strong>.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm font-mono text-fg/80 mb-6">
                {NOT_SENT.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>

              <p className="text-sm text-fg/80 mb-2">
                The <strong className="text-amber">two endpoints we do call</strong>:
              </p>
              <ul className="space-y-2 text-sm text-fg/80">
                {ACTUALLY_CALLED.map((c) => (
                  <li key={c.endpoint} className="border border-border rounded p-2">
                    <div className="font-mono text-cyan">{c.endpoint}</div>
                    <div className="opacity-80">{c.sees}</div>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs text-muted italic">
                Yes — those services see your IP. That's unavoidable when you ask anyone to
                turn an IP into a location. We do not store or log anything ourselves.
              </p>

              {broadcasting ? (
                <div className="mt-4 border border-magenta/40 bg-magenta/5 rounded p-3 text-sm text-fg/85">
                  <div className="font-mono text-xs uppercase tracking-widest text-magenta mb-1">
                    Presentation mode · room {room}
                  </div>
                  <p>
                    For this talk, your full profile — IP, ISP, approximate location, device,
                    browser, fingerprint hashes, behaviour scores — is being broadcast to the
                    presenter's wall via PartyKit.{' '}
                    <strong className="text-magenta">No raw user-agent, no name.</strong> Server
                    keeps everything in memory and forgets when you disconnect.
                  </p>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
