import { useState } from 'react';
import { Tv, X, Maximize2 } from 'lucide-react';

export default function TVModeButton({ children }) {
  const [isTVMode, setIsTVMode] = useState(false);

  const enterTVMode = () => {
    setIsTVMode(true);
    // Intentar entrar en fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log('Fullscreen not available:', err);
      });
    }
  };

  const exitTVMode = () => {
    setIsTVMode(false);
    // Salir de fullscreen
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  // Escuchar cambios de fullscreen
  useState(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isTVMode) {
        setIsTVMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isTVMode]);

  if (isTVMode) {
    return (
      <div className="fixed inset-0 z-[200] bg-bg flex flex-col">
        {/* Exit Button */}
        <button
          onClick={exitTVMode}
          className="absolute top-4 right-4 z-10 w-12 h-12 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white rounded-full flex items-center justify-center transition-all shadow-2xl"
          title="Salir del modo TV"
        >
          <X size={24} />
        </button>

        {/* Content in TV Mode */}
        <div className="flex-1 overflow-hidden p-8">
          {children}
        </div>

        {/* TV Mode Indicator */}
        <div className="absolute bottom-4 left-4 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full border border-accent/40">
          <div className="flex items-center gap-2">
            <Tv size={16} className="text-accent" />
            <span className="text-xs font-black text-accent uppercase tracking-wider">
              Modo Presentación
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={enterTVMode}
      className="w-9 h-9 bg-white/5 hover:bg-accent/20 text-white/60 hover:text-accent rounded-xl flex items-center justify-center transition-all group"
      title="Modo TV / Presentación"
    >
      <Tv size={18} />
    </button>
  );
}
