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
    countryCode: geo?.countryCode ?? '',
    country: geo?.country ?? '',
    city: geo?.city ?? '',
    browser: `${device.browserName}${device.browserVersion ? ` ${device.browserVersion}` : ''}`,
    os: `${device.osName}${device.osVersion ? ` ${device.osVersion}` : ''}`,
    device: device.deviceType,
    screen: `${String(device.screenWidth)}×${String(device.screenHeight)}`,
    timezone: device.timezone,
    language: device.primaryLanguage,
    fingerprintHash: fp?.canvasHash ?? undefined,
    engagement: scores ? Math.round(scores.engagement) : undefined,
    behaviorType: scores?.behaviorType,
    inferredInterest: scores?.inferredInterest,
    uniquenessN: scores?.uniquenessN,
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
