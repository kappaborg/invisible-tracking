const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomId(): string {
  let out = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) {
    out += CHARS[b % CHARS.length];
  }
  return out;
}

export function readRoomFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const r = params.get('room');
  if (!r) return null;
  const normalised = r.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return normalised.length >= 4 ? normalised.slice(0, 12) : null;
}

export function audienceUrl(room: string): string {
  const url = new URL(window.location.origin + '/');
  url.searchParams.set('room', room);
  return url.toString();
}

export function wallUrl(room: string): string {
  const url = new URL(window.location.origin + '/wall');
  url.searchParams.set('room', room);
  return url.toString();
}

export function getClientId(): string {
  const KEY = 'invisible-tracking-client-id';
  try {
    const existing = window.sessionStorage.getItem(KEY);
    if (existing) return existing;
  } catch {
    /* ignored */
  }
  const id = crypto.randomUUID();
  try {
    window.sessionStorage.setItem(KEY, id);
  } catch {
    /* ignored */
  }
  return id;
}

export function partykitHost(): string | null {
  const env = import.meta.env.VITE_PARTYKIT_HOST as string | undefined;
  return env && env.length > 0 ? env : null;
}
