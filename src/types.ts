export type DeviceInfo = {
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  cpuArchitecture: string;
  screenWidth: number;
  screenHeight: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelRatio: number;
  hardwareConcurrency: number;
  deviceMemoryGb: number | null;
  maxTouchPoints: number;
  connection: {
    effectiveType: string | null;
    downlink: number | null;
    rtt: number | null;
  };
  languages: readonly string[];
  primaryLanguage: string;
  timezone: string;
  utcOffsetMinutes: number;
  platform: string;
  userAgent: string;
};

export type GeoInfo = {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  postal: string;
  isp: string;
  asn: string;
  latitude: number | null;
  longitude: number | null;
  source: 'ipapi.co' | 'ipwho.is';
};

export type FingerprintInfo = {
  canvasHash: string | null;
  audioHash: string | null;
  webglVendor: string | null;
  webglRenderer: string | null;
  fontsDetected: string[];
  webrtcLocalIps: string[];
};

export type Telemetry = {
  timeOnPageSec: number;
  mouseDistancePx: number;
  clickCount: number;
  scrollDepthPct: number;
  typingWpm: number;
  mouseTrail: { x: number; y: number; t: number }[];
};

export type ScoreBreakdown = {
  engagement: number;
  behaviorType: 'Passive Visitor' | 'Curious Browser' | 'High Interaction User' | 'Power Engager';
  inferredInterest: string;
  uniquenessN: number;
  uniquenessBits: number;
  confidence: number;
};

export type SectionId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const SECTION_TITLES: Record<SectionId, string> = {
  0: 'Consent',
  1: 'Landing',
  2: 'Live Collection',
  3: 'Behavioral Tracking',
  4: 'Fingerprint Lab',
  5: 'Profile Reveal',
  6: 'Educational Panel',
  7: 'Wrap-Up',
};
