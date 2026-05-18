import { Trash2 } from 'lucide-react';

export function WipeSessionButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => {
        location.reload();
      }}
      className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted hover:text-red border border-border hover:border-red/60 px-3 py-1.5 rounded transition-colors"
      title="Press R to reset"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {compact ? 'Wipe' : 'Wipe my session'}
    </button>
  );
}
