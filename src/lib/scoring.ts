import type { DeviceInfo, FingerprintInfo, GeoInfo, ScoreBreakdown, Telemetry } from '@/types';

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function engagementScore(t: Telemetry): number {
  const time = clamp(t.timeOnPageSec / 60, 0, 1) * 100;
  const scroll = clamp(t.scrollDepthPct, 0, 100);
  const clicks = clamp(t.clickCount / 10, 0, 1) * 100;
  const mouse = clamp(t.mouseDistancePx / 5000, 0, 1) * 100;
  return clamp(0.3 * time + 0.25 * scroll + 0.25 * clicks + 0.2 * mouse, 0, 100);
}

export function behaviorType(score: number): ScoreBreakdown['behaviorType'] {
  if (score < 30) return 'Passive Visitor';
  if (score < 60) return 'Curious Browser';
  if (score < 85) return 'High Interaction User';
  return 'Power Engager';
}

const EUROPEAN_TZ_PREFIXES = ['Europe/', 'Atlantic/Reykjavik', 'Atlantic/Madeira'];
const ASIAN_TZ_PREFIXES = ['Asia/', 'Indian/'];
const AMERICAS_TZ_PREFIXES = ['America/'];

export function inferredInterest(device: DeviceInfo): string {
  const lang = device.primaryLanguage.toLowerCase();
  const isEnglish = lang.startsWith('en');
  const tz = device.timezone;
  const inEurope = EUROPEAN_TZ_PREFIXES.some((p) => tz.startsWith(p));
  const inAsia = ASIAN_TZ_PREFIXES.some((p) => tz.startsWith(p));
  const inAmericas = AMERICAS_TZ_PREFIXES.some((p) => tz.startsWith(p));
  const isMac = /mac/i.test(device.osName);
  const isiOS = /ios/i.test(device.osName);
  const isWindows = /windows/i.test(device.osName);
  const isMobile = device.deviceType === 'mobile';

  if (isiOS && !isEnglish) return 'Premium Mobile';
  if (inEurope && isEnglish && isMac) return 'Tech / Design';
  if (inAmericas && isEnglish && isWindows) return 'Tech / Gaming';
  if (inAsia && !isEnglish && isMobile) return 'Mobile-first Consumer';
  return 'General Audience';
}

export function uniquenessBits(features: string[]): number {
  // Estimate entropy bits as a function of how many distinguishing features resolved.
  // Each substantial feature contributes ~3 bits, capped at 24 (~16.7M).
  const present = features.filter((f) => f && f.length > 0).length;
  return clamp(present * 3, 4, 24);
}

export function uniquenessOneInN(bits: number): number {
  return 2 ** bits;
}

export function buildFeatureString(
  device: DeviceInfo,
  fp: FingerprintInfo,
): string {
  return [
    device.userAgent,
    `${String(device.screenWidth)}x${String(device.screenHeight)}`,
    String(device.colorDepth),
    device.timezone,
    device.primaryLanguage,
    fp.fontsDetected.join(','),
    fp.canvasHash ?? '',
    fp.audioHash ?? '',
    fp.webglRenderer ?? '',
  ].join('|');
}

export function confidenceScore(args: {
  geo: GeoInfo | null;
  fp: FingerprintInfo;
  timeOnPageSec: number;
}): number {
  const { geo, fp, timeOnPageSec } = args;
  return clamp(
    (geo ? 25 : 0) +
      (fp.canvasHash ? 25 : 0) +
      (fp.audioHash ? 20 : 0) +
      (fp.fontsDetected.length >= 5 ? 15 : 5) +
      (timeOnPageSec > 10 ? 15 : 5),
    0,
    100,
  );
}

export function computeScores(args: {
  device: DeviceInfo;
  fp: FingerprintInfo;
  geo: GeoInfo | null;
  telemetry: Telemetry;
}): ScoreBreakdown {
  const { device, fp, geo, telemetry } = args;
  const engagement = engagementScore(telemetry);
  const bits = uniquenessBits([
    device.userAgent,
    `${String(device.screenWidth)}x${String(device.screenHeight)}`,
    device.timezone,
    device.primaryLanguage,
    fp.canvasHash ?? '',
    fp.audioHash ?? '',
    fp.webglRenderer ?? '',
    fp.fontsDetected.join(','),
  ]);
  return {
    engagement,
    behaviorType: behaviorType(engagement),
    inferredInterest: inferredInterest(device),
    uniquenessBits: bits,
    uniquenessN: uniquenessOneInN(bits),
    confidence: confidenceScore({ geo, fp, timeOnPageSec: telemetry.timeOnPageSec }),
  };
}
