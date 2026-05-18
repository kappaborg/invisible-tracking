import PartySocket from 'partysocket';
import { getClientId, partykitHost } from '@/lib/room';

export type SharedProfile = {
  clientId: string;

  // System
  browser?: string;
  os?: string;
  device?: string;
  cpuArch?: string;
  cpuCores?: number;
  deviceMemoryGb?: number | null;
  maxTouchPoints?: number;

  // Display
  screen?: string;
  pixelRatio?: number;
  colorDepth?: number;
  language?: string;
  languages?: string[];
  timezone?: string;
  utcOffsetMinutes?: number;
  platform?: string;

  // Network
  ip?: string;
  isp?: string;
  asn?: string;
  connectionType?: string | null;
  downlinkMbps?: number | null;
  rttMs?: number | null;

  // Geolocation
  countryCode?: string;
  country?: string;
  region?: string;
  city?: string;
  postal?: string;
  latitude?: number | null;
  longitude?: number | null;
  geoSource?: string;

  // Fingerprint
  fingerprintHash?: string;
  audioHash?: string;
  webglVendor?: string;
  webglRenderer?: string;
  fontsDetected?: string[];
  webrtcLocalIps?: string[];

  // Derived profile
  engagement?: number;
  behaviorType?: string;
  inferredInterest?: string;
  uniquenessN?: number;
  uniquenessBits?: number;
  confidence?: number;

  // Telemetry summary
  timeOnPageSec?: number;
  clickCount?: number;
  scrollDepthPct?: number;
  typingWpm?: number;

  joinedAt: number;
  updatedAt: number;
};

export type ServerMsg =
  | { type: 'snapshot'; profiles: SharedProfile[]; viewers: number; version: 2 }
  | { type: 'upsert'; profile: SharedProfile; viewers: number; version: 2 }
  | { type: 'remove'; clientId: string; viewers: number; version: 2 };

export type Role = 'audience' | 'wall';

export function connectToRoom(room: string, role: Role): PartySocket | null {
  const host = partykitHost();
  if (!host) return null;
  return new PartySocket({
    host,
    room,
    id: getClientId(),
    query: { role },
  });
}
