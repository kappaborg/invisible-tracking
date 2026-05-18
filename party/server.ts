import type * as Party from 'partykit/server';

type Profile = {
  clientId: string;

  browser?: string;
  os?: string;
  device?: string;
  cpuArch?: string;
  cpuCores?: number;
  deviceMemoryGb?: number | null;
  maxTouchPoints?: number;

  screen?: string;
  pixelRatio?: number;
  colorDepth?: number;
  language?: string;
  languages?: string[];
  timezone?: string;
  utcOffsetMinutes?: number;
  platform?: string;

  ip?: string;
  isp?: string;
  asn?: string;
  connectionType?: string | null;
  downlinkMbps?: number | null;
  rttMs?: number | null;

  countryCode?: string;
  country?: string;
  region?: string;
  city?: string;
  postal?: string;
  latitude?: number | null;
  longitude?: number | null;
  geoSource?: string;

  fingerprintHash?: string;
  audioHash?: string;
  webglVendor?: string;
  webglRenderer?: string;
  fontsDetected?: string[];
  webrtcLocalIps?: string[];

  engagement?: number;
  behaviorType?: string;
  inferredInterest?: string;
  uniquenessN?: number;
  uniquenessBits?: number;
  confidence?: number;

  timeOnPageSec?: number;
  clickCount?: number;
  scrollDepthPct?: number;
  typingWpm?: number;

  joinedAt: number;
  updatedAt: number;
};

type ClientMsg =
  | { type: 'profile'; payload: Omit<Profile, 'clientId' | 'joinedAt' | 'updatedAt'> };

type ServerMsg =
  | { type: 'snapshot'; profiles: Profile[]; viewers: number; version: 2 }
  | { type: 'upsert'; profile: Profile; viewers: number; version: 2 }
  | { type: 'remove'; clientId: string; viewers: number; version: 2 };

const MAX_PROFILES = 200;
const VERSION = 2 as const;

export default class TrackingRoom implements Party.Server {
  profiles = new Map<string, Profile>();

  constructor(readonly room: Party.Room) {}

  countViewers(): number {
    let n = 0;
    for (const conn of this.room.getConnections()) {
      const tag = conn.state as { role?: string } | undefined;
      if (tag?.role === 'audience') n += 1;
    }
    return n;
  }

  broadcast(msg: ServerMsg): void {
    this.room.broadcast(JSON.stringify(msg));
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext): void | Promise<void> {
    const url = new URL(ctx.request.url);
    const role = url.searchParams.get('role') === 'wall' ? 'wall' : 'audience';
    conn.setState({ role });

    const msg: ServerMsg = {
      type: 'snapshot',
      profiles: [...this.profiles.values()],
      viewers: this.countViewers(),
      version: VERSION,
    };
    conn.send(JSON.stringify(msg));
  }

  onMessage(message: string, sender: Party.Connection): void {
    let parsed: ClientMsg;
    try {
      parsed = JSON.parse(message) as ClientMsg;
    } catch {
      return;
    }
    if (parsed.type !== 'profile') return;

    const existing = this.profiles.get(sender.id);
    const now = Date.now();
    const profile: Profile = {
      ...parsed.payload,
      clientId: sender.id,
      joinedAt: existing?.joinedAt ?? now,
      updatedAt: now,
    };

    if (!existing && this.profiles.size >= MAX_PROFILES) {
      const oldest = [...this.profiles.values()].sort((a, b) => a.joinedAt - b.joinedAt)[0];
      if (oldest) {
        this.profiles.delete(oldest.clientId);
        this.broadcast({
          type: 'remove',
          clientId: oldest.clientId,
          viewers: this.countViewers(),
          version: VERSION,
        });
      }
    }

    this.profiles.set(sender.id, profile);
    this.broadcast({ type: 'upsert', profile, viewers: this.countViewers(), version: VERSION });
  }

  onClose(conn: Party.Connection): void {
    if (this.profiles.has(conn.id)) {
      this.profiles.delete(conn.id);
    }
    this.broadcast({
      type: 'remove',
      clientId: conn.id,
      viewers: this.countViewers(),
      version: VERSION,
    });
  }
}

TrackingRoom satisfies Party.Worker;
