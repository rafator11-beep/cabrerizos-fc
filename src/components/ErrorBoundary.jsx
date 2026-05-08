import { Component } from 'react';
import { AlertTriangle, RefreshCw, Copy, Bug } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error(
      `[CRITICAL UI ERROR] ${this.props.boundary || 'App'}:`,
      error.message,
      '\nStack:', errorInfo.componentStack
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleCopy = () => {
    const text = `[${this.props.boundary || 'App'}] ${this.state.error?.message}\n${this.state.error?.stack || ''}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-6 min-h-[200px] animate-fade-in">
          <div className="w-full max-w-lg bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 shadow-[0_0_40px_rgba(244,63,94,0.08)]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                <Bug size={20} className="text-rose-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider">Error de Renderizado</h3>
                <p className="text-[9px] font-bold text-rose-400/60 uppercase tracking-widest">
                  Módulo: {this.props.boundary || 'General'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-black/30 rounded-xl p-4 mb-4 border border-rose-500/10">
              <code className="text-xs text-rose-300 font-mono leading-relaxed break-all block">
                {this.state.error?.message || 'Error desconocido'}
              </code>
            </div>

            {/* Component Stack (collapsed) */}
            {this.state.errorInfo?.componentStack && (
              <details className="mb-4">
                <summary className="text-[9px] font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
                  ▸ Stack de componentes
                </summary>
                <pre className="mt-2 bg-black/20 rounded-lg p-3 text-[10px] text-muted font-mono overflow-x-auto max-h-[150px] overflow-y-auto no-scrollbar border border-white/5">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500/10 text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all active:scale-95"
              >
                <RefreshCw size={12} />
                Reintentar
              </button>
              <button
                onClick={this.handleCopy}
                className="px-4 py-3 bg-white/5 text-muted rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 border border-white/5"
              >
                <Copy size={12} />
              </button>
            </div>

            {/* Hint */}
            <p className="mt-3 text-[8px] font-medium text-muted/40 text-center">
              Si el error persiste, recarga la página (F5) o contacta con el administrador.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
