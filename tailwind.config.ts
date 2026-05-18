import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E1A',
        fg: '#E6F1FF',
        muted: '#7A87A8',
        cyan: '#00F0FF',
        magenta: '#FF2BD6',
        green: '#4CFFB5',
        amber: '#FFC857',
        red: '#FF5C7A',
        panel: '#0F1426',
        border: '#1B2240',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 24px rgba(0, 240, 255, 0.35)',
        magenta: '0 0 24px rgba(255, 43, 214, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
