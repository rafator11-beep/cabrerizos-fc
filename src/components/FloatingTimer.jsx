import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function FloatingTimer() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' | 'countdown'
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [countdownStart, setCountdownStart] = useState(300); // 5 min default
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => {
          if (mode === 'countdown' && prev >= countdownStart) {
            setRunning(false);
            // Vibrate if available
            if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
            return countdownStart;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, countdownStart]);

  const displayTime = () => {
    const t = mode === 'countdown' ? Math.max(0, countdownStart - elapsed) : elapsed;
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const reset = () => { setRunning(false); setElapsed(0); };
  const adjustCountdown = (delta) => { if (!running) setCountdownStart(prev => Math.max(30, prev + delta)); };

  const isFinished = mode === 'countdown' && elapsed >= countdownStart;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className={`fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[80] w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 ${running ? 'bg-accent text-bg animate-pulse shadow-accent/30' : 'bg-surface-2 text-accent border border-white/10'}`}>
        <Timer size={22} />
        {running && <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-[80] w-[200px] bg-surface border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex gap-1">
          <button onClick={() => { setMode('stopwatch'); reset(); }} className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${mode === 'stopwatch' ? 'bg-accent/20 text-accent' : 'text-muted'}`}>Crono</button>
          <button onClick={() => { setMode('countdown'); reset(); }} className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${mode === 'countdown' ? 'bg-accent/20 text-accent' : 'text-muted'}`}>Cuenta Atrás</button>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted"><X size={14} /></button>
      </div>

      {/* Display */}
      <div className="p-4 text-center">
        {mode === 'countdown' && !running && elapsed === 0 && (
          <div className="flex items-center justify-center gap-3 mb-2">
            <button onClick={() => adjustCountdown(-30)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-muted"><ChevronDown size={14}/></button>
            <span className="text-[10px] font-bold text-muted">{Math.floor(countdownStart/60)}min</span>
            <button onClick={() => adjustCountdown(30)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-muted"><ChevronUp size={14}/></button>
          </div>
        )}
        <div className={`text-4xl font-black tracking-tight mb-3 ${isFinished ? 'text-rose-500 animate-pulse' : running ? 'text-accent' : 'text-white'}`}>
          {displayTime()}
        </div>
        <div className="flex gap-2 justify-center">
          <button onClick={() => setRunning(!running)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${running ? 'bg-amber-500 text-bg' : 'bg-accent text-bg'}`}>
            {running ? <Pause size={20}/> : <Play size={20} className="ml-0.5"/>}
          </button>
          <button onClick={reset} className="w-12 h-12 rounded-2xl bg-white/5 text-muted flex items-center justify-center active:scale-90">
            <RotateCcw size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}
