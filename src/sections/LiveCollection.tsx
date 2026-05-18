import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Globe2, MapPin, Wifi } from 'lucide-react';
import { useStore } from '@/store';
import { collectDeviceInfo, formatUtcOffset } from '@/lib/deviceInfo';
import { fetchGeo, mapEmbedUrl } from '@/lib/geolocation';
import { ProfileCard } from '@/components/ProfileCard';

type Row = { label: string; value: string };

function row(label: string, value: string | number | null | undefined): Row {
  return { label, value: value === null || value === undefined || value === '' ? '—' : String(value) };
}

function PanelGroup({
  title,
  icon: Icon,
  rows,
}: {
  title: string;
  icon: typeof Cpu;
  rows: Row[];
}) {
  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-border flex items-center gap-2 bg-bg/40">
        <Icon className="w-4 h-4 text-cyan" />
        <span className="font-mono text-xs uppercase tracking-widest text-cyan">{title}</span>
      </div>
      <div className="divide-y divide-border">
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 px-4 py-1.5 text-sm"
          >
            <span className="text-muted font-mono uppercase tracking-wider text-[10px] sm:shrink-0">
              {r.label}
            </span>
            <span className="font-mono text-fg/90 break-all sm:flex-1 sm:min-w-0 sm:text-right sm:break-words sm:whitespace-normal">
              {r.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function LiveCollection() {
  const device = useStore((s) => s.device);
  const setDevice = useStore((s) => s.setDevice);
  const geo = useStore((s) => s.geo);
  const setGeo = useStore((s) => s.setGeo);
  const setGeoLoading = useStore((s) => s.setGeoLoading);
  const setGeoError = useStore((s) => s.setGeoError);
  const geoLoading = useStore((s) => s.geoLoading);
  const geoError = useStore((s) => s.geoError);

  useEffect(() => {
    if (!device) setDevice(collectDeviceInfo());
  }, [device, setDevice]);

  useEffect(() => {
    if (geo || geoLoading || geoError) return;
    setGeoLoading(true);
    void fetchGeo().then((g) => {
      if (g) setGeo(g);
      else setGeoError('Both ipapi.co and ipwho.is failed (or blocked).');
    });
  }, [geo, geoLoading, geoError, setGeo, setGeoLoading, setGeoError]);

  const deviceRows: Row[] = device
    ? [
        row('User-Agent', device.userAgent),
        row('Browser', `${device.browserName} ${device.browserVersion}`),
        row('OS', `${device.osName} ${device.osVersion}`),
        row('Device', device.deviceType),
        row('CPU arch', device.cpuArchitecture),
        row('CPU cores', device.hardwareConcurrency),
        row('Device memory', device.deviceMemoryGb ? `${String(device.deviceMemoryGb)} GB` : null),
        row('Touch points', device.maxTouchPoints),
        row('Screen', `${String(device.screenWidth)} × ${String(device.screenHeight)} @ ${String(device.colorDepth)}-bit (×${String(device.pixelRatio)})`),
        row('Language', device.languages.join(', ')),
        row('Timezone', `${device.timezone} (${formatUtcOffset(device.utcOffsetMinutes)})`),
        row('Platform', device.platform),
      ]
    : [];

  const netRows: Row[] = device
    ? [
        row('Effective type', device.connection.effectiveType),
        row('Downlink', device.connection.downlink ? `${String(device.connection.downlink)} Mbps` : null),
        row('RTT', device.connection.rtt ? `${String(device.connection.rtt)} ms` : null),
      ]
    : [];

  const geoRows: Row[] = geo
    ? [
        row('Public IP', geo.ip),
        row('City', geo.city),
        row('Region', geo.region),
        row('Country', `${geo.country} (${geo.countryCode})`),
        row('Postal', geo.postal),
        row('ISP', geo.isp),
        row('ASN', geo.asn),
        row('Coordinates', geo.latitude !== null && geo.longitude !== null ? `${geo.latitude.toFixed(3)}, ${geo.longitude.toFixed(3)}` : null),
        row('Source', geo.source),
      ]
    : [];

  return (
    <section className="min-h-screen px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-cyan">
            Section 2 · Live Collection
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold mt-1">
            Everything this site can read — without asking.
          </h2>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <PanelGroup title="Device & System" icon={Cpu} rows={deviceRows} />
            <PanelGroup title="Network" icon={Wifi} rows={netRows} />
            <PanelGroup title="IP Geolocation" icon={Globe2} rows={geoRows} />
            {geoLoading ? (
              <div className="text-xs font-mono text-muted">Resolving IP…</div>
            ) : null}
            {geoError ? (
              <div className="text-xs font-mono text-amber border border-amber/30 bg-amber/5 p-3 rounded">
                {geoError}
                <div className="mt-1 text-fg/60">
                  Even when this fails, your browser still gave up everything else.
                </div>
              </div>
            ) : null}
            {geo && geo.latitude !== null && geo.longitude !== null ? (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-border flex items-center gap-2 bg-bg/40">
                  <MapPin className="w-4 h-4 text-magenta" />
                  <span className="font-mono text-xs uppercase tracking-widest text-magenta">
                    Approximate location
                  </span>
                </div>
                <iframe
                  title={`Map of ${geo.city}`}
                  src={mapEmbedUrl(geo.latitude, geo.longitude, 11)}
                  loading="lazy"
                  className="w-full h-48 sm:h-64 border-0 block"
                />
                <div className="px-4 py-2 text-xs text-muted italic">
                  If you're using a VPN, this is what the site sees — not where you actually are.
                </div>
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-6 self-start">
            <ProfileCard />
            <div className="mt-4 text-xs font-mono text-muted">
              The card on the right updates in real time as each lookup resolves.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
