import { UAParser } from 'ua-parser-js';
import type { DeviceInfo } from '@/types';

type ConnectionLike = {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
};

type NavigatorExt = Navigator & {
  deviceMemory?: number;
  connection?: ConnectionLike;
  mozConnection?: ConnectionLike;
  webkitConnection?: ConnectionLike;
};

export function collectDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  const parser = new UAParser(ua);
  const result = parser.getResult();
  const nav = navigator as NavigatorExt;
  const connection = nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;

  const deviceTypeRaw = result.device.type;
  const deviceType: DeviceInfo['deviceType'] =
    deviceTypeRaw === 'mobile' ? 'mobile' : deviceTypeRaw === 'tablet' ? 'tablet' : 'desktop';

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcOffsetMinutes = -new Date().getTimezoneOffset();
  const languages = navigator.languages?.length
    ? (navigator.languages as readonly string[])
    : ([navigator.language] as readonly string[]);

  return {
    browserName: result.browser.name ?? 'Unknown',
    browserVersion: result.browser.version ?? '',
    osName: result.os.name ?? 'Unknown',
    osVersion: result.os.version ?? '',
    deviceType,
    cpuArchitecture: result.cpu.architecture ?? 'unknown',
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    connection: {
      effectiveType: connection?.effectiveType ?? null,
      downlink: connection?.downlink ?? null,
      rtt: connection?.rtt ?? null,
    },
    languages,
    primaryLanguage: languages[0] ?? 'en',
    timezone: tz,
    utcOffsetMinutes,
    platform: (navigator as Navigator & { platform?: string }).platform ?? 'unknown',
    userAgent: ua,
  };
}

export function formatUtcOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hh}:${mm}`;
}
