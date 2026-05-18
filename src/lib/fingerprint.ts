import type { FingerprintInfo } from '@/types';

const FONT_TEST_STRING = 'mmmmmmmmmlli';
const FONT_TEST_SIZE = '72px';
const BASE_FONTS = ['monospace', 'sans-serif', 'serif'] as const;

const FONT_LIST = [
  'Arial',
  'Verdana',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Trebuchet MS',
  'Tahoma',
  'Comic Sans MS',
  'Impact',
  'Palatino',
  'Garamond',
  'Bookman',
  'Avant Garde',
  'Helvetica',
  'Calibri',
  'Cambria',
  'Consolas',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Monaco',
  'Menlo',
  'San Francisco',
  'Segoe UI',
  'Roboto',
];

async function sha256Hex(input: ArrayBuffer | string): Promise<string> {
  const data =
    typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function canvasFingerprint(): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.textBaseline = 'top';
    ctx.font = "16px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Invisible Tracking Demo \u{1F441}', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Invisible Tracking Demo \u{1F441}', 4, 17);
    const dataUrl = canvas.toDataURL();
    return (await sha256Hex(dataUrl)).slice(0, 16);
  } catch {
    return null;
  }
}

type OfflineAudioContextCtor = typeof OfflineAudioContext;
type WebkitWindow = Window & { webkitOfflineAudioContext?: OfflineAudioContextCtor };

export async function audioFingerprint(): Promise<string | null> {
  try {
    const w = window as WebkitWindow;
    const Ctor: OfflineAudioContextCtor | undefined =
      typeof OfflineAudioContext !== 'undefined' ? OfflineAudioContext : w.webkitOfflineAudioContext;
    if (!Ctor) return null;
    const ctx = new Ctor(1, 44100, 44100);
    const oscillator = ctx.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, ctx.currentTime);
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-50, ctx.currentTime);
    compressor.knee.setValueAtTime(40, ctx.currentTime);
    compressor.ratio.setValueAtTime(12, ctx.currentTime);
    compressor.attack.setValueAtTime(0, ctx.currentTime);
    compressor.release.setValueAtTime(0.25, ctx.currentTime);
    oscillator.connect(compressor);
    compressor.connect(ctx.destination);
    oscillator.start(0);
    const buffer = await ctx.startRendering();
    const channel = buffer.getChannelData(0);
    // Hash the rendered sample, summarised so identical hardware produces stable values.
    const samples = new Float32Array(channel.subarray(4500, 5000));
    return (await sha256Hex(samples.buffer)).slice(0, 16);
  } catch {
    return null;
  }
}

type WebGLDebugInfo = {
  UNMASKED_VENDOR_WEBGL: number;
  UNMASKED_RENDERER_WEBGL: number;
};

export function webglInfo(): { vendor: string | null; renderer: string | null } {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return { vendor: null, renderer: null };
    const ext = gl.getExtension('WEBGL_debug_renderer_info') as WebGLDebugInfo | null;
    if (!ext) return { vendor: null, renderer: null };
    const vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) as string | null;
    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string | null;
    return { vendor, renderer };
  } catch {
    return { vendor: null, renderer: null };
  }
}

export function detectFonts(): string[] {
  try {
    const span = document.createElement('span');
    span.style.fontSize = FONT_TEST_SIZE;
    span.style.position = 'absolute';
    span.style.left = '-9999px';
    span.style.top = '-9999px';
    span.style.visibility = 'hidden';
    span.textContent = FONT_TEST_STRING;
    document.body.appendChild(span);

    const baseDims: Record<string, { w: number; h: number }> = {};
    for (const base of BASE_FONTS) {
      span.style.fontFamily = base;
      baseDims[base] = { w: span.offsetWidth, h: span.offsetHeight };
    }

    const detected: string[] = [];
    for (const font of FONT_LIST) {
      let found = false;
      for (const base of BASE_FONTS) {
        span.style.fontFamily = `'${font}', ${base}`;
        const w = span.offsetWidth;
        const h = span.offsetHeight;
        const baseEntry = baseDims[base];
        if (baseEntry && (w !== baseEntry.w || h !== baseEntry.h)) {
          found = true;
          break;
        }
      }
      if (found) detected.push(font);
    }

    document.body.removeChild(span);
    return detected;
  } catch {
    return [];
  }
}

export async function collectFingerprint(): Promise<FingerprintInfo> {
  const [canvasHash, audioHash, gl] = await Promise.all([
    canvasFingerprint(),
    audioFingerprint(),
    Promise.resolve(webglInfo()),
  ]);
  const fontsDetected = detectFonts();
  return {
    canvasHash,
    audioHash,
    webglVendor: gl.vendor,
    webglRenderer: gl.renderer,
    fontsDetected,
    webrtcLocalIps: [],
  };
}
