import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type Props = {
  children: ReactNode;
  className?: string;
  active?: boolean;
};

export function GlitchText({ children, className, active = true }: Props) {
  return (
    <span className={clsx(active && 'glitch', className)} aria-live="polite">
      {children}
    </span>
  );
}
