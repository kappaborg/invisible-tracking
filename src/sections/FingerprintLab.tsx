import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Music, Cpu, Type, Network } from 'lucide-react';
import { useStore } from '@/store';
import { collectFingerprint } from '@/lib/fingerprint';
import { detectLocalIps } from '@/lib/webrtc';
import { buildFeatureString, uniquenessBits, uniquenessOneInN } from '@/lib/scoring';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Cpu;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-panel border border-border rounded-xl p-5"
    >
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan mb-3">
        <Icon className="w-4 h-4" />
        {title}
      </div>
      {children}
    </motion.div>
  );
}

export function FingerprintLab() {
  const device = useStore((s) => s.device);
  const fingerprint = useStore((s) => s.fingerprint);
  const setFingerprint = useStore((s) => s.setFingerprint);
  const setLocalIps = useStore((s) => s.setLocalIps);

  useEffect(() => {
    if (fingerprint && fingerprint.canvasHash !== null) return;
    void collectFingerprint().then((f) => {
      setFingerprint(f);
    });
  }, [fingerprint, setFingerprint]);

  useEffect(() => {
    if (fingerprint && fingerprint.webrtcLocalIps.length > 0) return;
    void detectLocalIps().then((ips) => {
      setLocalIps(ips);
    });
  }, [fingerprint, setLocalIps]);

  const bits =
    device && fingerprint
      ? uniquenessBits([
          device.userAgent,
          `${String(device.screenWidth)}x${String(device.screenHeight)}`,
          device.timezone,
          device.primaryLanguage,
          fingerprint.canvasHash ?? '',
          fingerprint.audioHash ?? '',
          fingerprint.webglRenderer ?? '',
          fingerprint.fontsDetected.join(','),
        ])
      : 0;
  const oneInN = uniquenessOneInN(bits);
  const featureString =
    device && fingerprint ? buildFeatureString(device, fingerprint) : '';

  return (
    <section className="min-h-screen px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-cyan">
            Section 4 · Fingerprint Lab
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-1">
            Stable signals that survive incognito.
          </h2>
          <p className="mt-3 text-fg/60 text-sm">
            Cookies are blockable. These signals are not.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card title="Canvas fingerprint" icon={Fingerprint}>
            <div className="font-mono text-2xl text-magenta break-all">
              {fingerprint?.canvasHash ?? '…'}
            </div>
            <div className="mt-2 text-xs text-muted">
              SHA-256, first 16 hex chars of a rendered canvas.
            </div>
          </Card>

          <Card title="Audio fingerprint" icon={Music}>
            <div className="font-mono text-2xl text-magenta break-all">
              {fingerprint?.audioHash ?? '…'}
            </div>
            <div className="mt-2 text-xs text-muted">
              OfflineAudioContext → oscillator → compressor, hashed.
            </div>
          </Card>

          <Card title="WebGL renderer" icon={Cpu}>
            <div className="font-mono text-sm text-fg/90 break-words">
              {fingerprint?.webglRenderer ?? '…'}
            </div>
            <div className="font-mono text-xs text-muted mt-1 break-words">
              {fingerprint?.webglVendor ?? ''}
            </div>
            <div className="mt-2 text-xs text-muted">
              The exact GPU model. Survives incognito.
            </div>
          </Card>

          <Card title="Detected fonts" icon={Type}>
            <div className="flex flex-wrap gap-1.5">
              {(fingerprint?.fontsDetected ?? []).map((f) => (
                <span
                  key={f}
                  className="font-mono text-[11px] bg-cyan/10 border border-cyan/30 text-cyan rounded px-1.5 py-0.5"
                >
                  {f}
                </span>
              ))}
              {fingerprint && fingerprint.fontsDetected.length === 0 ? (
                <span className="text-xs text-muted">No matches — this browser may be hardened.</span>
              ) : null}
            </div>
            <div className="mt-3 text-xs text-muted">
              Measured via offsetWidth fallback trick on {24} candidates.
            </div>
          </Card>

          <Card title="WebRTC local IPs" icon={Network}>
            {(fingerprint?.webrtcLocalIps ?? []).length > 0 ? (
              <div className="space-y-1">
                {fingerprint!.webrtcLocalIps.map((ip) => (
                  <div key={ip} className="font-mono text-fg text-sm">
                    {ip}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted">
                None leaked, or the browser blocked the probe (Brave / Firefox strict).
              </div>
            )}
            <div className="mt-2 text-xs text-muted">
              Your router sees this. Until 2019, every website could too.
            </div>
          </Card>

          <Card title="Uniqueness" icon={Fingerprint}>
            <div className="font-mono text-3xl text-cyan">1 in {fmt(oneInN)}</div>
            <div className="mt-2 text-xs text-muted">
              Estimated from {bits} bits of entropy across UA, screen, timezone, fonts,
              canvas, audio and GPU.
            </div>
            <details className="mt-2 text-xs text-fg/60">
              <summary className="cursor-pointer hover:text-cyan">Show feature string</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all bg-bg border border-border rounded p-2 text-[10px]">
                {featureString}
              </pre>
            </details>
          </Card>
        </div>
      </div>
    </section>
  );
}
