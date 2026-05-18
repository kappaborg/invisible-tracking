import { create } from 'zustand';
import type { DeviceInfo, FingerprintInfo, GeoInfo, SectionId, Telemetry } from '@/types';

type TrailPoint = { x: number; y: number; t: number };

type State = {
  section: SectionId;
  consented: boolean;
  cookieAccepted: boolean;
  presenterMode: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  heatmapVisible: boolean;

  device: DeviceInfo | null;
  geo: GeoInfo | null;
  geoLoading: boolean;
  geoError: string | null;
  fingerprint: FingerprintInfo | null;

  telemetry: Telemetry;
  startedAt: number;
};

type Actions = {
  setSection: (s: SectionId) => void;
  advance: () => void;
  retreat: () => void;
  consent: () => void;
  acceptCookies: () => void;
  setDevice: (d: DeviceInfo) => void;
  setGeo: (g: GeoInfo | null) => void;
  setGeoLoading: (loading: boolean) => void;
  setGeoError: (msg: string | null) => void;
  setFingerprint: (f: FingerprintInfo) => void;
  setLocalIps: (ips: string[]) => void;
  togglePresenter: () => void;
  toggleSound: () => void;
  toggleHeatmap: () => void;
  bumpClick: () => void;
  addMouseMove: (x: number, y: number, dDist: number) => void;
  setScrollDepth: (pct: number) => void;
  setTypingWpm: (wpm: number) => void;
  tickTime: (now: number) => void;
  pruneTrail: (now: number, maxAgeMs: number) => void;
};

export const useStore = create<State & Actions>((set, get) => ({
  section: 0,
  consented: false,
  cookieAccepted: false,
  presenterMode: false,
  reducedMotion:
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  soundEnabled: false,
  heatmapVisible: true,

  device: null,
  geo: null,
  geoLoading: false,
  geoError: null,
  fingerprint: null,

  telemetry: {
    timeOnPageSec: 0,
    mouseDistancePx: 0,
    clickCount: 0,
    scrollDepthPct: 0,
    typingWpm: 0,
    mouseTrail: [],
  },
  startedAt: Date.now(),

  setSection: (s) => {
    set({ section: s });
  },
  advance: () => {
    const cur = get().section;
    if (cur < 7) {
      set({ section: (cur + 1) as SectionId });
    }
  },
  retreat: () => {
    const cur = get().section;
    if (cur > 0) {
      set({ section: (cur - 1) as SectionId });
    }
  },
  consent: () => {
    set({ consented: true, section: 1, startedAt: Date.now() });
  },
  acceptCookies: () => {
    set({ cookieAccepted: true });
  },
  setDevice: (d) => {
    set({ device: d });
  },
  setGeo: (g) => {
    set({ geo: g, geoLoading: false });
  },
  setGeoLoading: (loading) => {
    set({ geoLoading: loading });
  },
  setGeoError: (msg) => {
    set({ geoError: msg, geoLoading: false });
  },
  setFingerprint: (f) => {
    set({ fingerprint: f });
  },
  setLocalIps: (ips) => {
    const fp = get().fingerprint;
    if (fp) {
      set({ fingerprint: { ...fp, webrtcLocalIps: ips } });
    } else {
      set({
        fingerprint: {
          canvasHash: null,
          audioHash: null,
          webglVendor: null,
          webglRenderer: null,
          fontsDetected: [],
          webrtcLocalIps: ips,
        },
      });
    }
  },
  togglePresenter: () => {
    set((s) => ({ presenterMode: !s.presenterMode }));
  },
  toggleSound: () => {
    set((s) => ({ soundEnabled: !s.soundEnabled }));
  },
  toggleHeatmap: () => {
    set((s) => ({ heatmapVisible: !s.heatmapVisible }));
  },
  bumpClick: () => {
    set((s) => ({ telemetry: { ...s.telemetry, clickCount: s.telemetry.clickCount + 1 } }));
  },
  addMouseMove: (x, y, dDist) => {
    set((s) => {
      const trail: TrailPoint[] = [...s.telemetry.mouseTrail, { x, y, t: Date.now() }];
      return {
        telemetry: {
          ...s.telemetry,
          mouseDistancePx: s.telemetry.mouseDistancePx + dDist,
          mouseTrail: trail.length > 800 ? trail.slice(-800) : trail,
        },
      };
    });
  },
  setScrollDepth: (pct) => {
    set((s) => ({
      telemetry: {
        ...s.telemetry,
        scrollDepthPct: Math.max(s.telemetry.scrollDepthPct, pct),
      },
    }));
  },
  setTypingWpm: (wpm) => {
    set((s) => ({ telemetry: { ...s.telemetry, typingWpm: wpm } }));
  },
  tickTime: (now) => {
    const start = get().startedAt;
    set((s) => ({
      telemetry: {
        ...s.telemetry,
        timeOnPageSec: Math.floor((now - start) / 1000),
      },
    }));
  },
  pruneTrail: (now, maxAgeMs) => {
    set((s) => ({
      telemetry: {
        ...s.telemetry,
        mouseTrail: s.telemetry.mouseTrail.filter((p) => now - p.t < maxAgeMs),
      },
    }));
  },
}));
