import type * as Party from 'partykit/server';

type Profile = {
  clientId: string;
  countryCode?: string;
  country?: string;
  city?: string;
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  timezone?: string;
  language?: string;
  fingerprintHash?: string;
  engagement?: number;
  behaviorType?: string;
  inferredInterest?: string;
  uniquenessN?: number;
  joinedAt: number;
  updatedAt: number;
};

type ClientMsg =
  | { type: 'profile'; payload: Omit<Profile, 'clientId' | 'joinedAt' | 'updatedAt'> };

type ServerMsg =
  | { type: 'snapshot'; profiles: Profile[]; viewers: number }
  | { type: 'upsert'; profile: Profile; viewers: number }
  | { type: 'remove'; clientId: string; viewers: number };

const MAX_PROFILES = 200;

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

    // Cap profiles to MAX_PROFILES, evicting oldest joiners first.
    if (!existing && this.profiles.size >= MAX_PROFILES) {
      const oldest = [...this.profiles.values()].sort((a, b) => a.joinedAt - b.joinedAt)[0];
      if (oldest) {
        this.profiles.delete(oldest.clientId);
        this.broadcast({ type: 'remove', clientId: oldest.clientId, viewers: this.countViewers() });
      }
    }

    this.profiles.set(sender.id, profile);
    this.broadcast({ type: 'upsert', profile, viewers: this.countViewers() });
  }

  onClose(conn: Party.Connection): void {
    if (this.profiles.has(conn.id)) {
      this.profiles.delete(conn.id);
    }
    this.broadcast({ type: 'remove', clientId: conn.id, viewers: this.countViewers() });
  }
}

TrackingRoom satisfies Party.Worker;
