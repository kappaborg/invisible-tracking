import PartySocket from 'partysocket';
import { getClientId, partykitHost } from '@/lib/room';

export type SharedProfile = {
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

export type ServerMsg =
  | { type: 'snapshot'; profiles: SharedProfile[]; viewers: number }
  | { type: 'upsert'; profile: SharedProfile; viewers: number }
  | { type: 'remove'; clientId: string; viewers: number };

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
