import { useEffect, useRef } from 'react';
import type PartySocket from 'partysocket';
import { useStore } from '@/store';
import { connectToRoom } from '@/lib/party';
import { partykitHost, readRoomFromUrl } from '@/lib/room';
import { computeScores } from '@/lib/scoring';

function summarise(args: {
  device: ReturnType<typeof useStore.getState>['device'];
  geo: ReturnType<typeof useStore.getState>['geo'];
  fp: ReturnType<typeof useStore.getState>['fingerprint'];
  telemetry: ReturnType<typeof useStore.getState>['telemetry'];
}) {
  const { device, geo, fp, telemetry } = args;
  if (!device) return null;
  const scores = fp ? computeScores({ device, fp, geo, telemetry }) : null;
  return {
    // System
    browser: `${device.browserName}${device.browserVersion ? ` ${device.browserVersion}` : ''}`,
    os: `${device.osName}${device.osVersion ? ` ${device.osVersion}` : ''}`,
    device: device.deviceType,
    cpuArch: device.cpuArchitecture,
    cpuCores: device.hardwareConcurrency,
    deviceMemoryGb: device.deviceMemoryGb,
    maxTouchPoints: device.maxTouchPoints,

    // Display
    screen: `${String(device.screenWidth)}×${String(device.screenHeight)}`,
    pixelRatio: device.pixelRatio,
    colorDepth: device.colorDepth,
    language: device.primaryLanguage,
    languages: [...device.languages],
    timezone: device.timezone,
    utcOffsetMinutes: device.utcOffsetMinutes,
    platform: device.platform,

    // Network
    ip: geo?.ip,
    isp: geo?.isp,
    asn: geo?.asn,
    connectionType: device.connection.effectiveType,
    downlinkMbps: device.connection.downlink,
    rttMs: device.connection.rtt,

    // Geolocation
    countryCode: geo?.countryCode,
    country: geo?.country,
    region: geo?.region,
    city: geo?.city,
    postal: geo?.postal,
    latitude: geo?.latitude ?? null,
    longitude: geo?.longitude ?? null,
    geoSource: geo?.source,

    // Fingerprint
    fingerprintHash: fp?.canvasHash ?? undefined,
    audioHash: fp?.audioHash ?? undefined,
    webglVendor: fp?.webglVendor ?? undefined,
    webglRenderer: fp?.webglRenderer ?? undefined,
    fontsDetected: fp?.fontsDetected ?? [],
    webrtcLocalIps: fp?.webrtcLocalIps ?? [],

    // Derived
    engagement: scores ? Math.round(scores.engagement) : undefined,
    behaviorType: scores?.behaviorType,
    inferredInterest: scores?.inferredInterest,
    uniquenessN: scores?.uniquenessN,
    uniquenessBits: scores?.uniquenessBits,
    confidence: scores ? Math.round(scores.confidence) : undefined,

    // Telemetry
    timeOnPageSec: telemetry.timeOnPageSec,
    clickCount: telemetry.clickCount,
    scrollDepthPct: Math.round(telemetry.scrollDepthPct),
    typingWpm: telemetry.typingWpm,
  };
}

export function useAudienceBroadcast(): {
  enabled: boolean;
  room: string | null;
  hostConfigured: boolean;
} {
  const room = readRoomFromUrl();
  const host = partykitHost();
  const enabled = Boolean(room && host);
  const consented = useStore((s) => s.consented);
  const device = useStore((s) => s.device);
  const geo = useStore((s) => s.geo);
  const fingerprint = useStore((s) => s.fingerprint);
  const telemetry = useStore((s) => s.telemetry);
  const socketRef = useRef<PartySocket | null>(null);
  const lastSentRef = useRef<string>('');

  useEffect(() => {
    if (!enabled || !consented || !room) return;
    if (socketRef.current) return;
    const sock = connectToRoom(room, 'audience');
    socketRef.current = sock;
    return () => {
      sock?.close();
      socketRef.current = null;
    };
  }, [enabled, consented, room]);

  useEffect(() => {
    if (!enabled || !consented) return;
    const sock = socketRef.current;
    if (!sock) return;
    const summary = summarise({ device, geo, fp: fingerprint, telemetry });
    if (!summary) return;
    const payload = JSON.stringify({ type: 'profile', payload: summary });
    if (payload === lastSentRef.current) return;
    lastSentRef.current = payload;
    try {
      sock.send(payload);
    } catch {
      /* ignored */
    }
  }, [enabled, consented, device, geo, fingerprint, telemetry]);

  return { enabled, room, hostConfigured: Boolean(host) };
}
