import React, { useRef, useEffect } from 'react';

const PlayerCard = ({ jugador, onClick, onLongPress }) => {
  const timerRef = useRef(null);

  const handlePointerDown = (e) => {
    timerRef.current = setTimeout(() => {
      if (onLongPress) onLongPress(jugador);
    }, 500);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const statusColor = {
    ok: '#00ff87',
    duda: '#ffb800',
    lesion: '#ff3d3d'
  }[jugador.estado] || '#888';

  return (
    <div 
      className="relative bg-surface rounded-2xl p-4 flex flex-col items-center gap-2 border border-white/5 active:scale-95 transition-transform"
      style={{ backgroundColor: 'var(--c-surface)' }}
      onClick={() => onClick && onClick(jugador)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/10">
        <img 
          src={jugador.foto || 'https://via.placeholder.com/80?text=FC'} 
          alt={jugador.nombre}
          loading="lazy"
          className="w-full h-full object-cover"
          onLoad={(e) => e.target.style.opacity = 1}
          style={{ opacity: 0, transition: 'opacity 0.3s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      
      <div className="absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-black" style={{ backgroundColor: statusColor }} />
      
      <span className="text-4xl font-display leading-none" style={{ fontFamily: 'var(--font-display)' }}>{jugador.dorsal}</span>
      <div className="text-center">
        <p className="font-bold text-sm truncate w-24">{jugador.nombre}</p>
        <p className="text-[10px] text-muted uppercase tracking-wider">{jugador.posicion}</p>
      </div>
    </div>
  );
};

export default PlayerCard;
