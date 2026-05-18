import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { computeScores } from '@/lib/scoring';
import { formatUtcOffset } from '@/lib/deviceInfo';

type Row = { label: string; value: string };

function fmtNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function ProfileCard({ dramatic = false }: { dramatic?: boolean }) {
  const device = useStore((s) => s.device);
  const geo = useStore((s) => s.geo);
  const fingerprint = useStore((s) => s.fingerprint);
  const telemetry = useStore((s) => s.telemetry);

  const rows: Row[] = [];

  if (device) {
    rows.push(
      { label: 'Device', value: `${device.deviceType.toUpperCase()} · ${device.osName}` },
      { label: 'Browser', value: `${device.browserName} ${device.browserVersion}` },
      { label: 'OS', value: `${device.osName} ${device.osVersion}` },
      { label: 'CPU cores', value: String(device.hardwareConcurrency) },
      { label: 'Timezone', value: `${device.timezone} (${formatUtcOffset(device.utcOffsetMinutes)})` },
      { label: 'Language', value: device.primaryLanguage },
    );
  }
  if (geo) {
    rows.push(
      { label: 'IP', value: geo.ip },
      { label: 'Location', value: `${geo.city}, ${geo.country}` },
      { label: 'ISP / ASN', value: `${geo.isp}${geo.asn ? ` (${geo.asn})` : ''}` },
    );
  }

  const scores =
    device && fingerprint
      ? computeScores({ device, fp: fingerprint, geo, telemetry })
      : null;

  if (scores) {
    rows.push(
      { label: 'Engagement Score', value: `${String(Math.round(scores.engagement))} / 100` },
      { label: 'Behavior Type', value: scores.behaviorType },
      { label: 'Inferred Interest', value: scores.inferredInterest },
      { label: 'Uniqueness', value: `1 in ${fmtNumber(scores.uniquenessN)}` },
      { label: 'Confidence', value: `${String(Math.round(scores.confidence))}%` },
    );
  }

  return (
    <div
      className={`relative bg-panel border border-border rounded-xl overflow-hidden ${
        dramatic ? 'shadow-neon scanline' : ''
      }`}
    >
      <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-bg/40">
        <div className="font-mono text-xs uppercase tracking-widest text-cyan">
          User Profile {dramatic ? 'Generated' : '(live)'}
        </div>
        <div className="font-mono text-xs text-muted">{rows.length} fields</div>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25 }}
            className={`flex items-center justify-between gap-4 px-5 ${
              dramatic ? 'py-3 text-lg' : 'py-2 text-sm'
            }`}
          >
            <span className="text-muted font-mono uppercase tracking-wider text-xs">
              {row.label}
            </span>
            <span className="font-mono text-fg text-right truncate max-w-[60%]">
              {row.value}
            </span>
          </motion.div>
        ))}
        {rows.length === 0 ? (
          <div className="px-5 py-6 text-sm text-muted font-mono">
            Waiting for data…
          </div>
        ) : null}
      </div>
    </div>
  );
}
