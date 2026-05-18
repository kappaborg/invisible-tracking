import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Cpu,
  Globe2,
  Wifi,
  MapPin,
  Fingerprint,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { SharedProfile } from '@/lib/party';
import { mapEmbedUrl } from '@/lib/geolocation';
import { VENUE } from '@/lib/venue';

function countryFlag(code?: string): string {
  if (!code || code.length !== 2) return '🌐';
  const A = 0x1f1e6;
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((c) => A + c.charCodeAt(0) - 'A'.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function fmtN(n?: number): string {
  if (typeof n !== 'number') return '—';
  return new Intl.NumberFormat('en-US').format(n);
}

function fmtUtc(min?: number): string {
  if (typeof min !== 'number') return '';
  const sign = min >= 0 ? '+' : '-';
  const abs = Math.abs(min);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}

type Row = { label: string; value: string };
function v(value: unknown, suffix = ''): string {
  if (value === null || value === undefined || value === '') return '—';
  return `${String(value)}${suffix}`;
}

function Panel({
  title,
  icon: Icon,
  rows,
  accent = 'cyan',
}: {
  title: string;
  icon: typeof Cpu;
  rows: Row[];
  accent?: 'cyan' | 'magenta' | 'green';
}) {
  const color = accent === 'cyan' ? 'text-cyan' : accent === 'magenta' ? 'text-magenta' : 'text-green';
  return (
    <div className="bg-bg border border-border rounded-lg overflow-hidden">
      <div className="px-3 py-1.5 border-b border-border flex items-center gap-2 bg-panel/40">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className={`font-mono text-[10px] uppercase tracking-widest ${color}`}>
          {title}
        </span>
      </div>
      <div className="divide-y divide-border">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 px-3 py-1.5 text-xs"
          >
            <span className="text-muted font-mono uppercase tracking-wider text-[10px] sm:shrink-0">
              {r.label}
            </span>
            <span className="font-mono text-fg/90 break-all sm:flex-1 sm:min-w-0 sm:text-right sm:break-words sm:whitespace-normal">
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileModal({
  profile,
  onClose,
  onPrev,
  onNext,
  position,
  total,
  venuePinned,
}: {
  profile: SharedProfile | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  position: number;
  total: number;
  venuePinned: boolean;
}) {
  useEffect(() => {
    if (!profile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [profile, onClose, onPrev, onNext]);

  const realLat = profile?.latitude ?? null;
  const realLng = profile?.longitude ?? null;
  const hasRealCoords = realLat !== null && realLng !== null;
  const mapLat = venuePinned ? VENUE.latitude : realLat;
  const mapLng = venuePinned ? VENUE.longitude : realLng;
  const showMap = venuePinned || hasRealCoords;

  return (
    <AnimatePresence>
      {profile ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur p-4 sm:p-6 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="bg-panel border border-border rounded-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-label="Full profile"
          >
            <div className="sticky top-0 z-10 bg-panel border-b border-border px-5 py-3 flex items-center gap-3">
              <span className="text-2xl">{countryFlag(profile.countryCode)}</span>
              <div className="min-w-0">
                <div className="font-mono text-sm text-fg truncate">
                  {profile.city ?? '—'}, {profile.country ?? '—'}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  IP {profile.ip ?? '—'} · {profile.isp ?? '—'}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="hidden sm:inline font-mono text-xs text-muted">
                  {position + 1} / {total}
                </span>
                <button
                  type="button"
                  onClick={onPrev}
                  className="text-fg/70 hover:text-cyan p-1.5 border border-border rounded"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onNext}
                  className="text-fg/70 hover:text-cyan p-1.5 border border-border rounded"
                  aria-label="Next"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-fg/70 hover:text-fg p-1.5 border border-border rounded"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 grid lg:grid-cols-2 gap-4">
              <Panel
                title="Device & System"
                icon={Cpu}
                rows={[
                  { label: 'Browser', value: v(profile.browser) },
                  { label: 'OS', value: v(profile.os) },
                  { label: 'Device', value: v(profile.device) },
                  { label: 'CPU arch', value: v(profile.cpuArch) },
                  { label: 'CPU cores', value: v(profile.cpuCores) },
                  {
                    label: 'Device memory',
                    value: profile.deviceMemoryGb ? `${String(profile.deviceMemoryGb)} GB` : '—',
                  },
                  { label: 'Touch points', value: v(profile.maxTouchPoints) },
                  {
                    label: 'Screen',
                    value:
                      profile.screen && profile.colorDepth && profile.pixelRatio
                        ? `${profile.screen} @ ${String(profile.colorDepth)}-bit (×${String(profile.pixelRatio)})`
                        : v(profile.screen),
                  },
                  { label: 'Language', value: v(profile.language) },
                  {
                    label: 'Timezone',
                    value: profile.timezone
                      ? `${profile.timezone} (${fmtUtc(profile.utcOffsetMinutes)})`
                      : '—',
                  },
                  { label: 'Platform', value: v(profile.platform) },
                ]}
              />

              <Panel
                title="Network"
                icon={Wifi}
                rows={[
                  { label: 'Public IP', value: v(profile.ip) },
                  { label: 'ISP', value: v(profile.isp) },
                  { label: 'ASN', value: v(profile.asn) },
                  { label: 'Effective type', value: v(profile.connectionType) },
                  {
                    label: 'Downlink',
                    value: profile.downlinkMbps
                      ? `${String(profile.downlinkMbps)} Mbps`
                      : '—',
                  },
                  {
                    label: 'RTT',
                    value: profile.rttMs ? `${String(profile.rttMs)} ms` : '—',
                  },
                  {
                    label: 'WebRTC local IPs',
                    value:
                      profile.webrtcLocalIps && profile.webrtcLocalIps.length > 0
                        ? profile.webrtcLocalIps.join(', ')
                        : '—',
                  },
                ]}
                accent="green"
              />

              <Panel
                title="Geolocation"
                icon={Globe2}
                rows={[
                  { label: 'City', value: v(profile.city) },
                  { label: 'Region', value: v(profile.region) },
                  {
                    label: 'Country',
                    value:
                      profile.country && profile.countryCode
                        ? `${profile.country} (${profile.countryCode})`
                        : v(profile.country),
                  },
                  { label: 'Postal', value: v(profile.postal) },
                  {
                    label: 'Coordinates (real)',
                    value:
                      hasRealCoords
                        ? `${realLat?.toFixed(3) ?? '—'}, ${realLng?.toFixed(3) ?? '—'}`
                        : '—',
                  },
                  { label: 'Source', value: v(profile.geoSource) },
                ]}
              />

              {showMap && mapLat !== null && mapLng !== null ? (
                <div className="bg-bg border border-border rounded-lg overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border flex items-center gap-2 bg-panel/40">
                    <MapPin className={`w-3.5 h-3.5 ${venuePinned ? 'text-magenta' : 'text-cyan'}`} />
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest ${
                        venuePinned ? 'text-magenta' : 'text-cyan'
                      }`}
                    >
                      {venuePinned
                        ? `Pinned to venue · ${VENUE.label}`
                        : 'Approximate location'}
                    </span>
                  </div>
                  <iframe
                    title={
                      venuePinned
                        ? `Map of ${VENUE.label}`
                        : `Map of ${profile.city ?? 'audience'}`
                    }
                    src={mapEmbedUrl(mapLat, mapLng, 14)}
                    loading="lazy"
                    className="w-full h-48 sm:h-64 border-0 block"
                  />
                  {venuePinned ? (
                    <div className="px-3 py-1.5 text-[10px] font-mono text-muted italic">
                      Override active · press <kbd className="text-fg">P</kbd> on the wall to
                      switch back to the attendee's real coordinates.
                    </div>
                  ) : null}
                </div>
              ) : null}

              <Panel
                title="Fingerprint Signals"
                icon={Fingerprint}
                rows={[
                  { label: 'Canvas hash', value: v(profile.fingerprintHash) },
                  { label: 'Audio hash', value: v(profile.audioHash) },
                  { label: 'WebGL vendor', value: v(profile.webglVendor) },
                  { label: 'WebGL renderer', value: v(profile.webglRenderer) },
                  {
                    label: 'Fonts detected',
                    value: profile.fontsDetected
                      ? `${String(profile.fontsDetected.length)} (${profile.fontsDetected.slice(0, 3).join(', ')}${profile.fontsDetected.length > 3 ? '…' : ''})`
                      : '—',
                  },
                ]}
                accent="magenta"
              />

              <Panel
                title="Derived Profile"
                icon={Activity}
                rows={[
                  {
                    label: 'Engagement',
                    value: typeof profile.engagement === 'number' ? `${String(profile.engagement)} / 100` : '—',
                  },
                  { label: 'Behavior type', value: v(profile.behaviorType) },
                  { label: 'Inferred interest', value: v(profile.inferredInterest) },
                  { label: 'Uniqueness', value: `1 in ${fmtN(profile.uniquenessN)}` },
                  {
                    label: 'Confidence',
                    value: typeof profile.confidence === 'number' ? `${String(profile.confidence)}%` : '—',
                  },
                  {
                    label: 'Time on page',
                    value: profile.timeOnPageSec ? `${String(profile.timeOnPageSec)}s` : '—',
                  },
                  { label: 'Clicks', value: v(profile.clickCount) },
                  {
                    label: 'Scroll',
                    value: typeof profile.scrollDepthPct === 'number' ? `${String(profile.scrollDepthPct)}%` : '—',
                  },
                  {
                    label: 'Typing speed',
                    value: profile.typingWpm ? `${String(profile.typingWpm)} wpm` : '—',
                  },
                ]}
                accent="green"
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
