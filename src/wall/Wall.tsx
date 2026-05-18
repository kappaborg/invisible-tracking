import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Radio,
  ScanLine,
  QrCode,
  AlertTriangle,
  ArrowDownAZ,
  Play,
  Pause,
  MapPin,
} from 'lucide-react';
import QRCode from 'qrcode';
import type PartySocket from 'partysocket';
import type { ServerMsg, SharedProfile } from '@/lib/party';
import { connectToRoom } from '@/lib/party';
import {
  audienceUrl,
  generateRoomId,
  partykitHost,
  readRoomFromUrl,
  wallUrl,
} from '@/lib/room';
import { ProfileTile } from '@/wall/ProfileTile';
import { ProfileModal } from '@/wall/ProfileModal';
import { VENUE } from '@/lib/venue';

function ensureRoomInUrl(): string {
  const current = readRoomFromUrl();
  if (current) return current;
  const generated = generateRoomId();
  const url = new URL(window.location.href);
  url.searchParams.set('room', generated);
  window.history.replaceState({}, '', url.toString());
  return generated;
}

type SortMode = 'recent' | 'engagement' | 'uniqueness' | 'country';
const SORT_LABEL: Record<SortMode, string> = {
  recent: 'Recent',
  engagement: 'Engagement',
  uniqueness: 'Uniqueness',
  country: 'Country',
};
const SORT_ORDER: SortMode[] = ['recent', 'engagement', 'uniqueness', 'country'];

function countTop<T extends string>(items: (T | undefined)[]): { label: string; count: number } | null {
  const tally = new Map<string, number>();
  for (const i of items) {
    if (!i) continue;
    tally.set(i, (tally.get(i) ?? 0) + 1);
  }
  let best: { label: string; count: number } | null = null;
  for (const [label, count] of tally.entries()) {
    if (!best || count > best.count) best = { label, count };
  }
  return best;
}

export function Wall() {
  const [room] = useState(() => ensureRoomInUrl());
  const [profiles, setProfiles] = useState<Map<string, SharedProfile>>(new Map());
  const [viewers, setViewers] = useState(0);
  const [connected, setConnected] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(true);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortMode>('recent');
  const [autoRotate, setAutoRotate] = useState(false);
  const [venuePinned, setVenuePinned] = useState(true);
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
        setOpenClientId((cur) => (cur === msg.clientId ? null : cur));
      }
    });

    return () => {
      sock.close();
      socketRef.current = null;
    };
  }, [host, room]);

  const ordered = useMemo(() => {
    const list = [...profiles.values()];
    switch (sort) {
      case 'recent':
        return list.sort((a, b) => b.joinedAt - a.joinedAt);
      case 'engagement':
        return list.sort((a, b) => (b.engagement ?? 0) - (a.engagement ?? 0));
      case 'uniqueness':
        return list.sort((a, b) => (b.uniquenessN ?? 0) - (a.uniquenessN ?? 0));
      case 'country':
        return list.sort((a, b) =>
          (a.country ?? '').localeCompare(b.country ?? ''),
        );
      default:
        return list;
    }
  }, [profiles, sort]);

  const aggregates = useMemo(() => {
    const list = [...profiles.values()];
    const countries = new Set(list.map((p) => p.countryCode ?? '').filter(Boolean));
    const cities = new Set(list.map((p) => p.city ?? '').filter(Boolean));
    const fps = new Set(list.map((p) => p.fingerprintHash ?? '').filter(Boolean));
    return {
      profiles: list.length,
      countries: countries.size,
      cities: cities.size,
      fingerprints: fps.size,
      topOs: countTop(list.map((p) => p.os)),
      topBrowser: countTop(list.map((p) => p.browser)),
      topAsn: countTop(list.map((p) => p.asn)),
    };
  }, [profiles]);

  // Keyboard shortcuts for the wall view.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (editing) return;
      if (openClientId) return; // modal handles its own keys
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSort((cur) => {
          const idx = SORT_ORDER.indexOf(cur);
          return SORT_ORDER[(idx + 1) % SORT_ORDER.length] ?? 'recent';
        });
      } else if (e.key === ' ') {
        e.preventDefault();
        setAutoRotate((v) => !v);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const first = ordered[0];
        if (first) setOpenClientId(first.clientId);
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        setShowQr((v) => !v);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setVenuePinned((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [openClientId, ordered]);

  // Auto-rotate the open modal across attendees.
  useEffect(() => {
    if (!autoRotate || ordered.length === 0) return;
    if (!openClientId) {
      const first = ordered[0];
      if (first) setOpenClientId(first.clientId);
      return;
    }
    const timer = setInterval(() => {
      setOpenClientId((cur) => {
        if (!cur) return ordered[0]?.clientId ?? null;
        const idx = ordered.findIndex((p) => p.clientId === cur);
        const next = ordered[(idx + 1) % ordered.length];
        return next?.clientId ?? cur;
      });
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [autoRotate, openClientId, ordered]);

  const openProfile = openClientId ? profiles.get(openClientId) ?? null : null;
  const openIndex = openClientId
    ? Math.max(0, ordered.findIndex((p) => p.clientId === openClientId))
    : 0;

  const cycle = (delta: number) => {
    if (ordered.length === 0) return;
    const idx = openClientId ? ordered.findIndex((p) => p.clientId === openClientId) : -1;
    const nextIdx = (idx + delta + ordered.length) % ordered.length;
    setOpenClientId(ordered[nextIdx]?.clientId ?? null);
  };

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
              connected
                ? 'text-green border border-green/40 bg-green/5'
                : 'text-amber border border-amber/40 bg-amber/5'
            }`}
          >
            {host ? (connected ? 'connected' : 'connecting…') : 'no host'}
          </div>

          <Stat label="Viewers" value={viewers} accent="cyan" />
          <Stat label="Profiles" value={aggregates.profiles} accent="cyan" />
          <Stat label="Countries" value={aggregates.countries} accent="magenta" />
          <Stat label="Cities" value={aggregates.cities} accent="magenta" />
          <Stat label="Fingerprints" value={aggregates.fingerprints} accent="green" />

          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSort((cur) => {
                  const idx = SORT_ORDER.indexOf(cur);
                  return SORT_ORDER[(idx + 1) % SORT_ORDER.length] ?? 'recent';
                });
              }}
              className="inline-flex items-center gap-1 border border-border hover:border-cyan/60 hover:text-cyan text-[10px] sm:text-xs font-mono uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded transition-colors"
              title="Press S to cycle"
            >
              <ArrowDownAZ className="w-3.5 h-3.5" />
              <span>Sort: {SORT_LABEL[sort]}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoRotate((v) => !v);
              }}
              className={`inline-flex items-center gap-1 border text-[10px] sm:text-xs font-mono uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded transition-colors ${
                autoRotate
                  ? 'border-magenta text-magenta'
                  : 'border-border hover:border-magenta/60 hover:text-magenta'
              }`}
              title="Press Space to toggle"
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{autoRotate ? 'Stop rotate' : 'Auto-rotate'}</span>
              <span className="sm:hidden">Rot</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVenuePinned((v) => !v);
              }}
              className={`inline-flex items-center gap-1 border text-[10px] sm:text-xs font-mono uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded transition-colors ${
                venuePinned
                  ? 'border-magenta text-magenta'
                  : 'border-border hover:border-magenta/60 hover:text-magenta'
              }`}
              title="Press P to toggle venue pin"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {venuePinned ? `Pinned · ${VENUE.shortLabel}` : 'Real maps'}
              </span>
              <span className="sm:hidden">{venuePinned ? '📍' : 'Real'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowQr((v) => !v);
              }}
              className="inline-flex items-center gap-1 border border-border hover:border-cyan/60 hover:text-cyan text-[10px] sm:text-xs font-mono uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded transition-colors"
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
              className="inline-flex items-center gap-1 border border-border hover:border-magenta/60 hover:text-magenta text-[10px] sm:text-xs font-mono uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded transition-colors"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New room</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>

        {aggregates.profiles > 0 ? (
          <div className="border-t border-border bg-panel/30">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-1.5 flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] font-mono text-fg/80">
              {aggregates.topOs ? (
                <span>
                  Most OS: <span className="text-cyan">{aggregates.topOs.label}</span> ×
                  {aggregates.topOs.count}
                </span>
              ) : null}
              {aggregates.topBrowser ? (
                <span>
                  Most browser: <span className="text-cyan">{aggregates.topBrowser.label}</span> ×
                  {aggregates.topBrowser.count}
                </span>
              ) : null}
              {aggregates.topAsn ? (
                <span>
                  Most ASN: <span className="text-magenta">{aggregates.topAsn.label}</span> ×
                  {aggregates.topAsn.count}
                </span>
              ) : null}
              <span className="text-muted ml-auto">
                S sort · Space auto-rotate · Enter expand · P venue pin · Q QR
              </span>
            </div>
          </div>
        ) : null}
      </header>

      {!host ? (
        <div className="max-w-3xl mx-auto mt-12 border border-amber/40 bg-amber/5 rounded-xl p-6 flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-amber shrink-0" />
          <div>
            <h2 className="font-semibold text-amber mb-1">PartyKit host not configured</h2>
            <p className="text-sm text-fg/80">
              The wall view needs <span className="font-mono">VITE_PARTYKIT_HOST</span> to be set
              at build time. Deploy the PartyKit worker, then set the env var in Vercel project
              settings.
            </p>
          </div>
        </div>
      ) : null}

      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6 grid gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div>
          {ordered.length === 0 ? (
            <div className="text-center py-24 text-muted font-mono text-sm">
              Waiting for the audience to scan in…
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3"
            >
              <AnimatePresence>
                {ordered.map((p) => (
                  <ProfileTile
                    key={p.clientId}
                    p={p}
                    onClick={() => {
                      setOpenClientId(p.clientId);
                    }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-32 self-start">
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
              <strong className="text-fg">Shown:</strong> IP, ISP / ASN, country, city, region,
              postal, lat / lng, browser, OS, device, screen, CPU + memory, network type,
              timezone, language, canvas / audio / WebGL fingerprints, detected fonts, WebRTC
              local IPs, behaviour scores, uniqueness.
            </p>
            <p className="text-fg/80">
              <strong className="text-fg">Not shown:</strong> raw user-agent, mouse trail,
              keystrokes, anything tying a tile to a real name.
            </p>
            <p className="text-fg/60 text-xs italic">
              Server holds everything in memory. Disconnect = forgotten.
            </p>
          </div>

          <div className="bg-panel border border-border rounded-xl p-4 text-xs font-mono text-fg/70 space-y-1">
            <div className="text-cyan uppercase tracking-widest mb-1">Shortcuts</div>
            <div>
              <kbd className="text-fg">S</kbd> cycle sort
            </div>
            <div>
              <kbd className="text-fg">Space</kbd> auto-rotate modal
            </div>
            <div>
              <kbd className="text-fg">Enter</kbd> expand first tile
            </div>
            <div>
              <kbd className="text-fg">←/→</kbd> previous / next attendee (in modal)
            </div>
            <div>
              <kbd className="text-fg">Esc</kbd> close modal
            </div>
            <div>
              <kbd className="text-fg">Q</kbd> toggle QR
            </div>
            <div>
              <kbd className="text-fg">P</kbd> toggle venue pin
            </div>
          </div>
        </aside>
      </main>

      <ProfileModal
        profile={openProfile}
        onClose={() => {
          setOpenClientId(null);
          setAutoRotate(false);
        }}
        onPrev={() => {
          cycle(-1);
        }}
        onNext={() => {
          cycle(1);
        }}
        position={openIndex}
        total={ordered.length}
        venuePinned={venuePinned}
      />
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
