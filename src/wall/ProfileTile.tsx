import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
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

function tileState(p: SharedProfile): 'partial' | 'complete' {
  return p.fingerprintHash ? 'complete' : 'partial';
}

function isActive(p: SharedProfile): boolean {
  return Date.now() - p.updatedAt < 10_000;
}

export function ProfileTile({ p, onClick }: { p: SharedProfile; onClick?: () => void }) {
  const state = tileState(p);
  const active = isActive(p);

  return (
    <motion.button
      layout
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      className={`text-left bg-panel border ${
        active ? 'border-cyan/60 shadow-neon' : 'border-border'
      } rounded-xl p-4 min-h-[200px] flex flex-col gap-2 hover:border-cyan/80 transition-colors w-full`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl leading-none">{countryFlag(p.countryCode)}</span>
          <div className="min-w-0">
            <div className="font-mono text-sm text-fg truncate">{p.city ?? '—'}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted truncate">
              {p.country ?? '—'}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          {typeof p.engagement === 'number' ? (
            <div className="font-mono text-cyan text-sm">{p.engagement}%</div>
          ) : null}
          <div
            className={`font-mono text-[10px] uppercase tracking-widest ${
              state === 'complete' ? 'text-green' : 'text-amber'
            }`}
          >
            {state}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] font-mono text-fg/85">
        <div className="text-muted">IP</div>
        <div className="truncate">{p.ip ?? '—'}</div>
        <div className="text-muted">ISP</div>
        <div className="truncate">{p.isp ?? '—'}</div>
        <div className="text-muted">Browser</div>
        <div className="truncate">{p.browser ?? '—'}</div>
        <div className="text-muted">OS</div>
        <div className="truncate">{p.os ?? '—'}</div>
        <div className="text-muted">Screen</div>
        <div className="truncate">{p.screen ?? '—'}</div>
        <div className="text-muted">TZ</div>
        <div className="truncate">{p.timezone ?? '—'}</div>
      </div>

      <div className="mt-auto pt-2 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1 font-mono text-[10px] text-magenta truncate">
          <Fingerprint className="w-3 h-3 shrink-0" />
          {p.fingerprintHash ?? '…'}
        </div>
        <div className="font-mono text-[10px] text-muted">1 in {fmtN(p.uniquenessN)}</div>
      </div>
    </motion.button>
  );
}
