import { Component } from 'react';
import type { ReactNode } from 'react';

type Props = { children: ReactNode; label?: string };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Surface to console without sending anywhere.
    // eslint-disable-next-line no-console
    console.error('[demo error]', this.props.label ?? 'section', error);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="p-6 rounded-lg border border-red/40 bg-red/5 text-red font-mono text-sm">
          <div className="font-semibold mb-1">{this.props.label ?? 'Section'} failed gracefully.</div>
          <div className="opacity-80">{this.state.error.message}</div>
          <div className="mt-2 opacity-60">
            (The rest of the demo is unaffected. Press <kbd>R</kbd> to reset.)
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
