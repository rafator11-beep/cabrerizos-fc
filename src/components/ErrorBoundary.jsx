import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[CABRERIZOS ERROR BOUNDARY]', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString(),
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-bg p-6">
        <div className="max-w-lg w-full bg-surface-2 border-2 border-red-500/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-red-500 px-6 py-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white shrink-0" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-white font-black text-lg tracking-tight">Error de Componente</h1>
          </div>
          <div className="p-6">
            <p className="text-muted text-sm mb-4">
              Un componente ha fallado. El resto de la app sigue activa.
            </p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-5">
              <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">
                Mensaje del error
              </p>
              <code className="text-sm text-red-300 font-mono break-words leading-relaxed">
                {this.state.error?.message ?? 'Error desconocido'}
              </code>
            </div>
            <details className="mb-5">
              <summary className="cursor-pointer text-xs text-muted hover:text-text font-semibold select-none">
                Stack trace
              </summary>
              <pre className="whitespace-pre-wrap break-words bg-bg rounded-xl p-3 text-xs leading-relaxed max-h-40 overflow-y-auto border border-border text-muted mt-2">
                {this.state.error?.stack}
              </pre>
            </details>
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black text-sm py-2.5 rounded-xl transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-bg hover:bg-surface-2 text-text font-black text-sm py-2.5 rounded-xl transition-colors border border-border"
              >
                Recargar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
