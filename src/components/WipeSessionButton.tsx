import { Trash2 } from 'lucide-react';

export function WipeSessionButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => {
        location.reload();
      }}
      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted hover:text-red border border-border hover:border-red/60 px-2 sm:px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0"
      title="Press R to reset"
      aria-label={compact ? 'Wipe session' : 'Wipe my session'}
    >
      <Trash2 className="w-3.5 h-3.5" />
      <span className={compact ? 'hidden sm:inline' : 'inline'}>
        {compact ? 'Wipe' : 'Wipe my session'}
      </span>
    </button>
  );
}
