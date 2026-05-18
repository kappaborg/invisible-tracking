import type { GeoInfo } from '@/types';

type IpapiResponse = {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  postal?: string;
  org?: string;
  asn?: string;
  latitude?: number;
  longitude?: number;
  error?: boolean;
  reason?: string;
};

type IpwhoResponse = {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  postal?: string;
  connection?: { isp?: string; asn?: number };
  latitude?: number;
  longitude?: number;
  success?: boolean;
};

async function tryIpapi(signal: AbortSignal): Promise<GeoInfo | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal });
    if (!res.ok) return null;
    const data = (await res.json()) as IpapiResponse;
    if (data.error || !data.ip) return null;
    return {
      ip: data.ip,
      city: data.city ?? '—',
      region: data.region ?? '—',
      country: data.country_name ?? '—',
      countryCode: data.country_code ?? '',
      postal: data.postal ?? '—',
      isp: data.org ?? '—',
      asn: data.asn ?? '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      source: 'ipapi.co',
    };
  } catch {
    return null;
  }
}

async function tryIpwho(signal: AbortSignal): Promise<GeoInfo | null> {
  try {
    const res = await fetch('https://ipwho.is/', { signal });
    if (!res.ok) return null;
    const data = (await res.json()) as IpwhoResponse;
    if (data.success === false || !data.ip) return null;
    return {
      ip: data.ip,
      city: data.city ?? '—',
      region: data.region ?? '—',
      country: data.country ?? '—',
      countryCode: data.country_code ?? '',
      postal: data.postal ?? '—',
      isp: data.connection?.isp ?? '—',
      asn: data.connection?.asn ? `AS${String(data.connection.asn)}` : '',
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      source: 'ipwho.is',
    };
  } catch {
    return null;
  }
}

export async function fetchGeo(timeoutMs = 6000): Promise<GeoInfo | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  try {
    const primary = await tryIpapi(controller.signal);
    if (primary) return primary;
    return await tryIpwho(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

export function staticMapUrl(lat: number, lon: number, zoom = 10, w = 400, h = 200): string {
  const url = new URL('https://staticmap.openstreetmap.de/staticmap.php');
  url.searchParams.set('center', `${String(lat)},${String(lon)}`);
  url.searchParams.set('zoom', String(zoom));
  url.searchParams.set('size', `${String(w)}x${String(h)}`);
  url.searchParams.set('maptype', 'mapnik');
  url.searchParams.set('markers', `${String(lat)},${String(lon)},red-pushpin`);
  return url.toString();
}
