import { motion } from 'framer-motion';
import { Cookie, Fingerprint, Globe, Activity, BrainCircuit, ShieldOff } from 'lucide-react';

type Card = {
  title: string;
  icon: typeof Cookie;
  body: string;
  reference: string;
};

const CARDS: Card[] = [
  {
    title: 'Cookies',
    icon: Cookie,
    body: 'First-party vs third-party cookies, and the "auto-accept" dark pattern designed to maximise consent rates while minimising real consent.',
    reference: 'EU 2022 ruling: "consent-or-pay" walls violate GDPR; Meta fined €390M (DPC Ireland, Jan 2023).',
  },
  {
    title: 'Browser fingerprinting',
    icon: Fingerprint,
    body: 'Stable signals from canvas, audio, WebGL, and fonts let sites identify you across visits even in incognito and even with ad blockers.',
    reference: "EFF's Cover Your Tracks / Panopticlick — Eckersley 2010 study showed 84% of browsers were uniquely identifiable.",
  },
  {
    title: 'IP geolocation',
    icon: Globe,
    body: 'A public IP reveals city, ISP and ASN. VPNs mask the IP but not the rest of your fingerprint, so the same person becomes re-identifiable.',
    reference: 'MaxMind GeoIP2 is the commercial dataset most sites use. Accuracy: ~80% at city level for IPv4.',
  },
  {
    title: 'Behavioural analytics',
    icon: Activity,
    body: 'Session-replay tools record mouse, scroll, dwell time, hesitation and form abandonment — sometimes redacting passwords, often not.',
    reference: 'Princeton 2017: session-replay scripts found on top 50,000 sites (Hotjar, FullStory, Yandex, Clarity).',
  },
  {
    title: 'Inference & ad targeting',
    icon: BrainCircuit,
    body: 'Thin behavioural signals + demographic priors produce ad categories like "tech enthusiast" or "expecting parent". The model never sees you — but it acts on you.',
    reference: 'Cambridge Analytica (2018); Meta tracking pixel reach (~2/3 of top sites); Apple ATT disclosures, 2021.',
  },
];

const PERMISSIONS_WE_DIDNT_ASK_FOR = [
  '`navigator.geolocation` (precise GPS)',
  'Camera (`getUserMedia` video)',
  'Microphone (`getUserMedia` audio)',
  'Notifications',
  'Clipboard read',
  'Bluetooth, USB, MIDI',
  'Persistent storage / cookies',
];

export function EducationalPanel() {
  return (
    <section className="min-h-screen px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-cyan">
            Section 6 · How this works
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-1">
            Every uncomfortable signal, explained.
          </h2>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-panel border border-border rounded-xl p-5"
              >
                <div className="flex items-center gap-2 text-cyan mb-2">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-semibold">{c.title}</h3>
                </div>
                <p className="text-sm text-fg/80">{c.body}</p>
                <p className="mt-2 text-xs text-muted italic">{c.reference}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <div className="bg-magenta/5 border border-magenta/30 rounded-xl p-5">
            <div className="flex items-center gap-2 text-magenta mb-2">
              <ShieldOff className="w-5 h-5" />
              <h3 className="font-semibold">What we never asked you for</h3>
            </div>
            <ul className="space-y-1 text-sm text-fg/80 font-mono">
              {PERMISSIONS_WE_DIDNT_ASK_FOR.map((p) => (
                <li key={p}>❌ {p}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-fg/60">
              Everything you've seen was derived without a single permission prompt.
            </p>
          </div>

          <div className="bg-green/5 border border-green/30 rounded-xl p-5">
            <h3 className="font-semibold text-green mb-2">What we are NOT doing</h3>
            <p className="text-sm text-fg/80">
              Real trackers persist all of this and sell it. This demo destroys everything
              when you close the tab. No analytics, no database, no logs. The only network
              calls are <span className="font-mono text-fg">ipapi.co</span> and{' '}
              <span className="font-mono text-fg">staticmap.openstreetmap.de</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
