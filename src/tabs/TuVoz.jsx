import React, { useState } from 'react';
import { SwipeCard, StatBadge } from '../components';
import { useToast } from '../hooks/useToast';

const TuVoz = () => {
  const { showToast } = useToast();
  const [voted, setVoted] = useState(false);
  const [sessionToday] = useState({
    id: 123,
    titulo: 'Peto Naranja',
    hora: '18:00h',
    lugar: 'Campo 1'
  });

  const handleVote = (type) => {
    setVoted(true);
    navigator.vibrate && navigator.vibrate(40);
    
    const msgs = {
      right: '¡Voto guardado! 🔥',
      left: 'Feedback enviado ❄️',
      up: '¡A tope! 💪'
    };
    
    showToast(msgs[type], 'success');
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto no-scrollbar">
      {/* Today Alert */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent to-blue-500 p-6 rounded-3xl shadow-xl animate-pulse-slow">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-bg/60 mb-1">🔥 Próximo Entrenamiento</p>
          <h3 className="font-display text-3xl text-bg leading-none mb-2">HOY VAS CON EL EQUIPO</h3>
          <div className="flex items-center gap-2 text-bg font-bold">
            <span className="px-2 py-1 bg-bg/20 rounded-lg">{sessionToday.titulo}</span>
            <span>·</span>
            <span>{sessionToday.hora}</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 text-bg opacity-10 rotate-12">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
        </div>
      </div>

      {/* Swipe Voting Section */}
      <div className="flex-1 flex flex-col gap-4">
        <h4 className="font-display text-xl">¿QUÉ TE PARECIÓ EL ENTRENAMIENTO?</h4>
        
        <div className="flex-1 min-h-[300px] relative">
          {!voted ? (
            <SwipeCard 
              onSwipeRight={() => handleVote('right')}
              onSwipeLeft={() => handleVote('left')}
              onSwipeUp={() => handleVote('up')}
            >
              <div className="w-full h-full bg-surface2 rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center text-center gap-4 shadow-2xl">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-4xl">⚽</div>
                <h2 className="font-display text-3xl">{sessionToday.titulo}</h2>
                <p className="text-muted text-sm">Desliza para valorar tu esfuerzo y sensaciones de hoy</p>
                
                <div className="flex justify-between w-full mt-8 opacity-50">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">❄️</span>
                    <span className="text-[10px] font-bold uppercase">Pesado</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">💪</span>
                    <span className="text-[10px] font-bold uppercase">Exigente</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🔥</span>
                    <span className="text-[10px] font-bold uppercase">Genial</span>
                  </div>
                </div>
              </div>
            </SwipeCard>
          ) : (
            <div className="w-full h-full bg-surface2/50 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in duration-500">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="font-display text-3xl text-accent">¡GRACIAS POR TU VOZ!</h2>
              <p className="text-muted text-sm">Tu feedback ayuda al equipo a mejorar cada día.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge label="Partidos" value="12" tipo="info" />
        <StatBadge label="Goles" value="4" tipo="success" />
        <StatBadge label="Asists" value="7" tipo="warning" />
      </div>
    </div>
  );
};

export default TuVoz;
