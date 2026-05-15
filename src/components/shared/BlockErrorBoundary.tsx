import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { captureException } from '@/lib/sentry';

interface Props {
  blockName: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class BlockErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : String(err);
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException(error, { block: this.props.blockName, componentStack: info.componentStack });
    if (import.meta.env.DEV) {
      console.error(`[BlockErrorBoundary:${this.props.blockName}]`, error, info);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        role="alert"
        className="card-escala border-danger/40 bg-danger/5 flex flex-col gap-3"
      >
        <div className="flex items-start gap-3">
          <span className="text-danger mt-0.5" aria-hidden="true">
            <AlertTriangle size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="section-tag text-danger">{this.props.blockName} · falhou</div>
            <p className="text-sm text-gray-200 mt-2">
              Este bloco encontrou um erro e não pôde ser renderizado. Os demais blocos seguem ativos.
            </p>
            {this.state.errorMessage && (
              <p className="text-[11px] font-mono text-gray-500 mt-2 truncate" title={this.state.errorMessage}>
                {this.state.errorMessage}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={this.handleRetry}
          className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider rounded border border-danger/40 text-danger hover:bg-danger/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/60"
        >
          <RotateCw size={12} aria-hidden="true" />
          Tentar renderizar de novo
        </button>
      </div>
    );
  }
}
