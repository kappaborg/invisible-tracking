import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, RotateCcw, Shield } from 'lucide-react';
import QRCode from 'qrcode';
import { useStore } from '@/store';
import { WipeSessionButton } from '@/components/WipeSessionButton';

const DEFENSES = [
  ['Brave / Firefox strict mode', 'Randomises canvas, blocks third-party storage by default.'],
  ['uBlock Origin', 'Blocks tracker scripts before they execute. Strongest single add-on.'],
  ['NoScript', 'Disable JS by default; allow per site. Breaks a lot, but breaks trackers more.'],
  ['Tor Browser', 'Routes traffic and uniformises fingerprint. Strong, slow.'],
  ['Mobile VPN', 'Hides IP. Does not hide fingerprint.'],
  ['OS-level DNS blocking', 'NextDNS, AdGuard DNS, Pi-hole. Stops trackers at the network layer.'],
];

const TAKEAWAYS = [
  'You are uniquely identifiable without cookies, without logging in, without typing anything.',
  'Opting out takes deliberate effort. The auto-accept banner is the industry default.',
  'Privacy is a stack of small defenses, not a single switch.',
];

export function WrapUp() {
  const [qr, setQr] = useState<string | null>(null);
  const setSection = useStore((s) => s.setSection);

  useEffect(() => {
    void QRCode.toDataURL(window.location.href, {
      width: 280,
      margin: 1,
      color: { dark: '#00F0FF', light: '#0A0E1A' },
    }).then(setQr);
  }, []);

  return (
    <section className="min-h-screen px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-cyan">
            Section 7 · Wrap-up
          </div>
          <h2 className="mt-2 text-4xl sm:text-5xl font-semibold">Privacy isn't a default.</h2>
          <p className="mt-2 text-2xl sm:text-3xl text-magenta font-semibold">It's a decision.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-panel border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-cyan mb-3">
              <Shield className="w-5 h-5" />
              <h3 className="font-semibold">Defenses</h3>
            </div>
            <ul className="space-y-2">
              {DEFENSES.map(([name, body]) => (
                <li key={name}>
                  <div className="font-mono text-sm text-cyan">{name}</div>
                  <div className="text-sm text-fg/70">{body}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-panel border border-border rounded-xl p-5">
            <h3 className="text-magenta font-semibold mb-3">Three things to remember</h3>
            <ol className="space-y-3 list-decimal pl-5">
              {TAKEAWAYS.map((t, i) => (
                <motion.li
                  key={t}
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-fg/85"
                >
                  {t}
                </motion.li>
              ))}
            </ol>

            <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSection(0);
                }}
                className="inline-flex items-center gap-2 bg-cyan text-bg font-semibold px-4 py-2 rounded shadow-neon"
              >
                <RotateCcw className="w-4 h-4" />
                Restart from the top
              </button>
              <WipeSessionButton />
            </div>
          </div>
        </div>

        {qr ? (
          <div className="mt-10 flex flex-col items-center">
            <div className="font-mono text-xs uppercase tracking-widest text-muted mb-2 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" /> Share this demo
            </div>
            <img src={qr} alt="QR code" width={200} height={200} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
