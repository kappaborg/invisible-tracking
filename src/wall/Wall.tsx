import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Radio, ScanLine, QrCode, AlertTriangle } from 'lucide-react';
import QRCode from 'qrcode';
import type PartySocket from 'partysocket';
import type { ServerMsg, SharedProfile } from '@/lib/party';
import { connectToRoom } from '@/lib/party';
import { audienceUrl, generateRoomId, partykitHost, readRoomFromUrl, wallUrl } from '@/lib/room';
import { ProfileTile } from '@/wall/ProfileTile';

function ensureRoomInUrl(): string {
  const current = readRoomFromUrl();
  if (current) return current;
  const generated = generateRoomId();
  const url = new URL(window.location.href);
  url.searchParams.set('room', generated);
  window.history.replaceState({}, '', url.toString());
  return generated;
}

export function Wall() {
  const [room] = useState(() => ensureRoomInUrl());
  const [profiles, setProfiles] = useState<Map<string, SharedProfile>>(new Map());
  const [viewers, setViewers] = useState(0);
  const [connected, setConnected] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(true);
  const socketRef = useRef<PartySocket | null>(null);
  const host = partykitHost();
  const joinUrl = audienceUrl(room);

  useEffect(() => {
    void QRCode.toDataURL(joinUrl, {
      width: 320,
      margin: 1,
      color: { dark: '#00F0FF', light: '#0A0E1A' },
    }).then(setQr);
  }, [joinUrl]);

  useEffect(() => {
    if (!host) return;
    const sock = connectToRoom(room, 'wall');
    if (!sock) return;
    socketRef.current = sock;

    sock.addEventListener('open', () => {
      setConnected(true);
    });
    sock.addEventListener('close', () => {
      setConnected(false);
    });
    sock.addEventListener('message', (event: MessageEvent<string>) => {
      let msg: ServerMsg;
      try {
        msg = JSON.parse(event.data) as ServerMsg;
      } catch {
        return;
      }
      setViewers(msg.viewers);
      if (msg.type === 'snapshot') {
        const next = new Map<string, SharedProfile>();
        for (const p of msg.profiles) next.set(p.clientId, p);
        setProfiles(next);
      } else if (msg.type === 'upsert') {
        setProfiles((m) => {
          const next = new Map(m);
          next.set(msg.profile.clientId, msg.profile);
          return next;
        });
      } else if (msg.type === 'remove') {
        setProfiles((m) => {
          if (!m.has(msg.clientId)) return m;
          const next = new Map(m);
          next.delete(msg.clientId);
          return next;
        });
      }
    });

    return () => {
      sock.close();
      socketRef.current = null;
    };
  }, [host, room]);

  const aggregates = useMemo(() => {
    const list = [...profiles.values()];
    const countries = new Set(list.map((p) => p.countryCode ?? '').filter(Boolean));
    const cities = new Set(list.map((p) => p.city ?? '').filter(Boolean));
    const fps = new Set(list.map((p) => p.fingerprintHash ?? '').filter(Boolean));
    const browsers = new Set(list.map((p) => p.browser ?? '').filter(Boolean));
    return {
      profiles: list.length,
      countries: countries.size,
      cities: cities.size,
      fingerprints: fps.size,
      browsers: browsers.size,
    };
  }, [profiles]);

  const orderedProfiles = useMemo(
    () => [...profiles.values()].sort((a, b) => b.joinedAt - a.joinedAt),
    [profiles],
  );

  return (
    <div className="min-h-screen relative">
      <header className="sticky top-0 z-20 backdrop-blur bg-bg/70 border-b border-border">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 flex items-center flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center gap-2 text-cyan font-mono text-xs sm:text-sm uppercase tracking-widest">
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">Audience Wall · room {room}</span>
            <span className="sm:hidden">room {room}</span>
          </div>
          <div
            className={`font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded ${
              connected ? 'text-green border border-green/40 bg-green/5' : 'text-amber border border-amber/40 bg-amber/5'
            }`}
          >
            {host ? (connected ? 'connected' : 'connecting…') : 'no host'}
          </div>

          <Stat label="Viewers" value={viewers} accent="cyan" />
          <Stat label="Profiles" value={aggregates.profiles} accent="cyan" />
          <Stat label="Countries" value={aggregates.countries} accent="magenta" />
          <Stat label="Cities" value={aggregates.cities} accent="magenta" />
          <Stat label="Fingerprints" value={aggregates.fingerprints} accent="green" />

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowQr((v) => !v);
              }}
              className="inline-flex items-center gap-2 border border-border hover:border-cyan/60 hover:text-cyan text-[10px] sm:text-xs font-mono uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showQr ? 'Hide QR' : 'Show QR'}</span>
              <span className="sm:hidden">QR</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const newRoom = generateRoomId();
                window.location.href = wallUrl(newRoom);
              }}
              className="inline-flex items-center gap-2 border border-border hover:border-magenta/60 hover:text-magenta text-[10px] sm:text-xs font-mono uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded transition-colors"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New room</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {!host ? (
        <div className="max-w-3xl mx-auto mt-12 border border-amber/40 bg-amber/5 rounded-xl p-6 flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-amber shrink-0" />
          <div>
            <h2 className="font-semibold text-amber mb-1">PartyKit host not configured</h2>
            <p className="text-sm text-fg/80">
              The wall view needs <span className="font-mono">VITE_PARTYKIT_HOST</span> to be set
              at build time (e.g. <span className="font-mono">invisible-tracking-demo.your-user.partykit.dev</span>).
              Deploy the PartyKit worker first, then set the env var locally in{' '}
              <span className="font-mono">.env.local</span> or in Vercel project settings.
            </p>
            <p className="text-sm text-fg/70 mt-2">
              See the README for the one-command deploy.
            </p>
          </div>
        </div>
      ) : null}

      <main className="max-w-[1800px] mx-auto px-6 py-6 grid gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div>
          {orderedProfiles.length === 0 ? (
            <div className="text-center py-24 text-muted font-mono text-sm">
              Waiting for the audience to scan in…
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3"
            >
              <AnimatePresence>
                {orderedProfiles.map((p) => (
                  <ProfileTile key={p.clientId} p={p} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 self-start">
          {showQr && qr ? (
            <div className="bg-panel border border-border rounded-xl p-4">
              <div className="font-mono text-xs uppercase tracking-widest text-cyan mb-2">
                Scan to join
              </div>
              <img src={qr} alt={`QR code to join room ${room}`} className="w-full h-auto" />
              <div className="mt-3 font-mono text-xs text-fg/80 break-all">{joinUrl}</div>
            </div>
          ) : null}

          <div className="bg-panel border border-border rounded-xl p-4 text-sm space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest text-magenta">
              What is and isn't on this wall
            </div>
            <p className="text-fg/80">
              <strong className="text-fg">Shown:</strong> country, city, browser, OS, screen,
              timezone, fingerprint hash, behaviour scores.
            </p>
            <p className="text-fg/80">
              <strong className="text-fg">Not shown:</strong> IP, raw user-agent, mouse trail,
              keystrokes, anything tying a tile to a real person.
            </p>
            <p className="text-fg/60 text-xs italic">
              Server holds everything in memory. Disconnect = forgotten.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'cyan' | 'magenta' | 'green';
}) {
  const color =
    accent === 'cyan' ? 'text-cyan' : accent === 'magenta' ? 'text-magenta' : 'text-green';
  return (
    <div className="hidden sm:flex flex-col leading-tight">
      <span className={`font-mono text-2xl ${color}`}>{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</span>
    </div>
  );
}
