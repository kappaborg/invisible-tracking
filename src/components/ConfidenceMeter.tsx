import { useEffect, useState } from 'react';

type Props = { value: number; label?: string; size?: number };

export function ConfidenceMeter({ value, label = 'Confidence', size = 140 }: Props) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setAnimated(value);
    });
    return () => {
      cancelAnimationFrame(id);
    };
  }, [value]);

  const dashOffset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1B2240"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#confGrad)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 800ms cubic-bezier(0.22,0.61,0.36,1)' }}
        />
        <defs>
          <linearGradient id="confGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#FF2BD6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="-mt-[calc(50%+24px)] text-center">
        <div className="font-mono text-2xl text-fg">{Math.round(animated)}%</div>
        <div className="text-xs uppercase tracking-widest text-muted">{label}</div>
      </div>
      <div style={{ height: size / 2 - 12 }} />
    </div>
  );
}
