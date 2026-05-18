import { motion } from 'framer-motion';
import type { SharedProfile } from '@/lib/party';

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

export function ProfileTile({ p }: { p: SharedProfile }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className="bg-panel border border-border rounded-xl p-4 min-h-[160px] flex flex-col gap-2 hover:border-cyan/60 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl leading-none">{countryFlag(p.countryCode)}</span>
          <div className="min-w-0">
            <div className="font-mono text-sm text-fg truncate">
              {p.city ?? '—'}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted truncate">
              {p.country ?? '—'}
            </div>
          </div>
        </div>
        {typeof p.engagement === 'number' ? (
          <div className="font-mono text-cyan text-sm">{p.engagement}%</div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-mono text-fg/80">
        <div className="text-muted">Browser</div>
        <div className="truncate text-right">{p.browser ?? '—'}</div>
        <div className="text-muted">OS</div>
        <div className="truncate text-right">{p.os ?? '—'}</div>
        <div className="text-muted">Device</div>
        <div className="truncate text-right">{p.device ?? '—'}</div>
        <div className="text-muted">Screen</div>
        <div className="truncate text-right">{p.screen ?? '—'}</div>
        <div className="text-muted">TZ</div>
        <div className="truncate text-right">{p.timezone ?? '—'}</div>
      </div>

      <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
        <div className="font-mono text-[10px] text-magenta truncate">
          {p.fingerprintHash ?? '…'}
        </div>
        <div className="font-mono text-[10px] text-muted">
          1 in {fmtN(p.uniquenessN)}
        </div>
      </div>
    </motion.div>
  );
}
