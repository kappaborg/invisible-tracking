import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { toPng } from 'html-to-image';
import { useStore } from '@/store';
import { ProfileCard } from '@/components/ProfileCard';
import { ConfidenceMeter } from '@/components/ConfidenceMeter';
import { computeScores } from '@/lib/scoring';
import { WipeSessionButton } from '@/components/WipeSessionButton';

export function ProfileReveal() {
  const device = useStore((s) => s.device);
  const fingerprint = useStore((s) => s.fingerprint);
  const geo = useStore((s) => s.geo);
  const telemetry = useStore((s) => s.telemetry);
  const reducedMotion = useStore((s) => s.reducedMotion);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    void QRCode.toDataURL(window.location.href, {
      width: 280,
      margin: 1,
      color: { dark: '#00F0FF', light: '#0A0E1A' },
    }).then(setQr);
  }, []);

  const scores =
    device && fingerprint
      ? computeScores({ device, fp: fingerprint, geo, telemetry })
      : null;

  const exportPng = async () => {
    if (!cardRef.current) return;
    try {
      const url = await toPng(cardRef.current, {
        backgroundColor: '#0A0E1A',
        cacheBust: true,
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invisible-tracking-profile.png';
      a.click();
    } catch {
      /* swallow */
    }
  };

  return (
    <section className="min-h-screen px-6 py-16 flex items-center scanline">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-magenta">
            Section 5 · Profile Generated
          </div>
          <h2 className={`mt-3 text-4xl sm:text-6xl font-bold ${reducedMotion ? '' : 'glitch'}`}>
            USER PROFILE GENERATED
          </h2>
          <p className="mt-4 text-fg/70">
            All of this was derived in {telemetry.timeOnPageSec} seconds. You typed nothing
            personal.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
          <div ref={cardRef}>
            <ProfileCard dramatic />
          </div>
          <div className="flex flex-col items-center gap-4">
            {scores ? (
              <ConfidenceMeter value={scores.confidence} label="Data Confidence" />
            ) : null}
            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  void exportPng();
                }}
                className="inline-flex items-center justify-center gap-2 bg-cyan text-bg font-semibold px-4 py-2 rounded shadow-neon"
              >
                <Download className="w-4 h-4" />
                Export as PNG
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQr((v) => !v);
                }}
                className="inline-flex items-center justify-center gap-2 border border-border text-fg/80 px-4 py-2 rounded hover:border-cyan hover:text-cyan transition"
              >
                <QrCode className="w-4 h-4" />
                {showQr ? 'Hide QR' : 'Show QR to this page'}
              </button>
              <WipeSessionButton />
            </div>
            {showQr && qr ? (
              <div className="mt-2 bg-panel border border-border rounded-xl p-4">
                <img src={qr} alt="QR to this page" width={240} height={240} />
                <div className="mt-2 text-center text-xs font-mono text-muted">
                  Scan to load the same demo on your phone.
                </div>
              </div>
            ) : null}
            <div className="text-center text-xs text-fg/60 mt-4 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-magenta" />
              Your session is the only one tracked on this page.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
